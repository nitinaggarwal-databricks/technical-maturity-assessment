const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { v4: uuidv4 } = require('uuid');

// Helper function to check if PostgreSQL is available
async function isPostgresAvailable() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
}

// Get or create conversation for a user session
router.post('/conversation/start', async (req, res) => {
  try {
    const { userEmail, sessionId, assessmentId } = req.body;

    if (!await isPostgresAvailable()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    // Check if there's an existing active conversation
    let conversation = await pool.query(
      `SELECT * FROM chat_conversations 
       WHERE session_id = $1 
       AND last_message_at > NOW() - INTERVAL '24 hours'
       ORDER BY last_message_at DESC 
       LIMIT 1`,
      [sessionId]
    );

    if (conversation.rows.length > 0) {
      return res.json({ conversation: conversation.rows[0] });
    }

    // Create new conversation
    const newConversation = await pool.query(
      `INSERT INTO chat_conversations (user_email, session_id, assessment_id, context_type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userEmail, sessionId, assessmentId, assessmentId ? 'assessment' : 'general']
    );

    res.json({ conversation: newConversation.rows[0] });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ error: 'Failed to start conversation' });
  }
});

// Send a message and get AI response
router.post('/message', async (req, res) => {
  try {
    const { conversationId, message, sessionId, userEmail, context } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!await isPostgresAvailable()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    let convId = conversationId;

    // Create conversation if it doesn't exist
    if (!convId) {
      const newConv = await pool.query(
        `INSERT INTO chat_conversations (user_email, session_id, context_type)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userEmail, sessionId, context?.pageType || 'general']
      );
      convId = newConv.rows[0].id;
    }

    // Save user message
    await pool.query(
      `INSERT INTO chat_messages (conversation_id, role, content)
       VALUES ($1, $2, $3)`,
      [convId, 'user', message]
    );

    // Update last_message_at
    await pool.query(
      `UPDATE chat_conversations 
       SET last_message_at = NOW() 
       WHERE id = $1`,
      [convId]
    );

    // Get conversation context (last 10 messages)
    const contextMessages = await pool.query(
      `SELECT role, content FROM chat_messages 
       WHERE conversation_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [convId]
    );

    // Get assessment data if available
    let assessmentData = null;
    if (context?.pageData?.assessmentId) {
      try {
        const assessmentResult = await pool.query(
          `SELECT * FROM assessments WHERE id = $1`,
          [context.pageData.assessmentId]
        );
        if (assessmentResult.rows.length > 0) {
          assessmentData = assessmentResult.rows[0];
        }
      } catch (err) {
        console.error('Error fetching assessment data:', err);
      }
    }

    // Generate AI response with full context
    const { response: aiResponse, suggestedQuestions } = await generateSmartAIResponse(
      message, 
      contextMessages.rows.reverse(), 
      context,
      assessmentData,
      pool
    );

    // Save AI response
    await pool.query(
      `INSERT INTO chat_messages (conversation_id, role, content)
       VALUES ($1, $2, $3)`,
      [convId, 'assistant', aiResponse]
    );

    // Update last_message_at again
    await pool.query(
      `UPDATE chat_conversations 
       SET last_message_at = NOW() 
       WHERE id = $1`,
      [convId]
    );

    res.json({
      conversationId: convId,
      response: aiResponse,
      suggestedQuestions: suggestedQuestions || []
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get conversation history
router.get('/conversation/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!await isPostgresAvailable()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const messages = await pool.query(
      `SELECT id, role, content, created_at 
       FROM chat_messages 
       WHERE conversation_id = $1 
       ORDER BY created_at ASC`,
      [conversationId]
    );

    res.json({ messages: messages.rows });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get user's conversations
router.get('/conversations', async (req, res) => {
  try {
    const { sessionId, userEmail } = req.query;

    if (!await isPostgresAvailable()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    let query = `SELECT * FROM chat_conversations WHERE `;
    let params = [];

    if (sessionId) {
      query += `session_id = $1 `;
      params.push(sessionId);
    } else if (userEmail) {
      query += `user_email = $1 `;
      params.push(userEmail);
    } else {
      return res.status(400).json({ error: 'sessionId or userEmail required' });
    }

    query += `ORDER BY last_message_at DESC LIMIT 10`;

    const conversations = await pool.query(query, params);

    res.json({ conversations: conversations.rows });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Helper function to get follow-up questions based on topic and context
function getSuggestedFollowUpQuestions(messageLower, pageType, hasAssessmentData) {
  // Questions about starting/getting started
  if (messageLower.includes('start') || messageLower.includes('begin')) {
    return [
      "What are the 6 pillars?",
      "How long does it take?",
      "Can I save and resume later?",
      "What information do I need?"
    ];
  }
  
  // Questions about pillars
  if (messageLower.includes('pillar') || messageLower.includes('categories')) {
    return [
      "Tell me about Data Engineering",
      "What is Platform Governance?",
      "Explain the maturity levels",
      "How are pillars scored?"
    ];
  }
  
  // Questions about maturity levels/scores
  if (messageLower.includes('maturity') || messageLower.includes('level') || messageLower.includes('score')) {
    if (hasAssessmentData) {
      return [
        "How can I improve my scores?",
        "What are my biggest gaps?",
        "Show me recommendations",
        "What should I prioritize?"
      ];
    }
    return [
      "How do I rate maturity?",
      "What's the difference between levels?",
      "What's a good score?",
      "How are scores calculated?"
    ];
  }
  
  // Questions about reports/results
  if (messageLower.includes('report') || messageLower.includes('result') || messageLower.includes('recommendation')) {
    return [
      "Can I edit the report?",
      "How do I export to PDF?",
      "Can I customize the content?",
      "How do I share this?"
    ];
  }
  
  // Questions about Databricks features
  if (messageLower.includes('databricks') || messageLower.includes('feature') || messageLower.includes('product')) {
    return [
      "Tell me about Delta Lake",
      "What is Unity Catalog?",
      "Explain MLflow",
      "What's Delta Live Tables?"
    ];
  }
  
  // Questions about editing/customization
  if (messageLower.includes('edit') || messageLower.includes('customize') || messageLower.includes('change')) {
    return [
      "What can I edit?",
      "Can I change colors?",
      "How do I add content?",
      "Can I delete sections?"
    ];
  }
  
  // Questions about slideshow/presentation
  if (messageLower.includes('slideshow') || messageLower.includes('present') || messageLower.includes('print')) {
    return [
      "How do I navigate slides?",
      "Can I print to PDF?",
      "Which pages have slideshow?",
      "How do I exit slideshow?"
    ];
  }
  
  // Questions about Excel/export
  if (messageLower.includes('excel') || messageLower.includes('export') || messageLower.includes('download')) {
    return [
      "What's in the Excel file?",
      "Can I edit and re-upload?",
      "How do I import changes?",
      "What format is the export?"
    ];
  }
  
  // Questions about collaboration
  if (messageLower.includes('assign') || messageLower.includes('team') || messageLower.includes('collaborate')) {
    return [
      "How do I assign to users?",
      "Can I assign specific questions?",
      "How do I track progress?",
      "Can I send reminders?"
    ];
  }
  
  // Page-specific follow-ups
  const pageFollowUps = {
    home: [
      "How do I start an assessment?",
      "What can I do here?",
      "Show me a demo",
      "Where's the user guide?"
    ],
    assessment: [
      "How do I rate maturity?",
      "What are pain points?",
      "Can I skip questions?",
      "How do I save progress?"
    ],
    maturity_report: [
      "How can I improve?",
      "Show me recommendations",
      "Can I edit this?",
      "How do I export this?"
    ],
    executive_dashboard: [
      "Explain Strategic Imperatives",
      "Show me the roadmap",
      "What are success metrics?",
      "How do I present this?"
    ],
    insights_dashboard: [
      "What metrics are shown?",
      "How do I track trends?",
      "Can I compare assessments?",
      "How do I export data?"
    ],
    industry_benchmarks: [
      "What's my percentile?",
      "How do I compare?",
      "What's a good ranking?",
      "How can I improve?"
    ],
    deep_dive: [
      "Explain the pillars",
      "What's the framework?",
      "How is it scored?",
      "What do you assess?"
    ],
    user_guide: [
      "Show me key features",
      "How do I get started?",
      "Where's troubleshooting?",
      "Show me workflows"
    ],
    dashboard: [
      "How do I start new assessment?",
      "Can I export to Excel?",
      "How do I view results?",
      "Can I share assessments?"
    ],
    admin: [
      "How do I manage users?",
      "How do I assign assessments?",
      "Can I add custom questions?",
      "How do I view feedback?"
    ]
  };
  
  return pageFollowUps[pageType] || pageFollowUps.home;
}

// Super Smart Context-Aware AI Response Generator
async function generateSmartAIResponse(userMessage, conversationHistory, context, assessmentData, pool) {
  const messageLower = userMessage.toLowerCase();
  const pageType = context?.pageType || 'home';
  const hasAssessmentData = !!assessmentData;
  
  // Helper to return response with suggested questions
  const respond = (text) => {
    const suggestedQuestions = getSuggestedFollowUpQuestions(messageLower, pageType, hasAssessmentData);
    return { response: text, suggestedQuestions };
  };
  
  // ===== PAGE-SPECIFIC CONTEXT RESPONSES =====
  
  // HOME PAGE
  if (pageType === 'home') {
    if (messageLower.includes('what') || messageLower.includes('this page') || messageLower.includes('here')) {
      return respond("You're on the **Home Page** of the Databricks Maturity Assessment tool.\n\nFrom here you can:\n• **Start a new assessment** - Click 'Start Assessment'\n• **Try a sample** - See a demo assessment\n• **View your dashboard** - See all your assessments\n• **Learn more** - Check out the Deep Dive, User Guide, or Pitch Deck\n\nWhat would you like to do?");
    }
  }
  
  // ASSESSMENT IN PROGRESS
  if (pageType === 'assessment') {
    if (messageLower.includes('what') || messageLower.includes('this page') || messageLower.includes('here')) {
      const progress = context.pageData?.progress || 0;
      return `You're currently taking an assessment (${progress}% complete).\n\n**How to proceed:**\n• Rate your **current maturity** (where you are today)\n• Rate your **target maturity** (where you want to be)\n• Add **technical and business pain points**\n• Add **notes** for context\n• Click **Next** to continue\n\nYour progress is auto-saved. You can resume anytime!`;
    }
    
    if (messageLower.includes('score') || messageLower.includes('rate') || messageLower.includes('maturity')) {
      return respond("**Maturity Levels Explained:**\n\n**Level 1 - Explore**: Ad-hoc, manual processes. Just starting.\n\n**Level 2 - Experiment**: Pilot projects, learning phase. Some automation.\n\n**Level 3 - Formalize**: Standardized processes, documented workflows.\n\n**Level 4 - Optimize**: Advanced automation, measurable ROI, best practices.\n\n**Level 5 - Transform**: Industry-leading, innovation driver, fully optimized.\n\nRate honestly based on your current capabilities!";
    }
    
    if (messageLower.includes('pain point') || messageLower.includes('challenge')) {
      return respond("**Pain Points help us give better recommendations!**\n\n**Technical Pain Points**: Infrastructure issues, performance problems, integration challenges, technical debt.\n\n**Business Pain Points**: Cost concerns, time delays, resource constraints, compliance issues, skill gaps.\n\nBe specific - the more detail you provide, the more tailored your recommendations will be!";
    }
  }
  
  // MATURITY REPORT
  if (pageType === 'maturity_report' && assessmentData) {
    if (messageLower.includes('what') || messageLower.includes('this page') || messageLower.includes('report')) {
      const org = assessmentData.organization || 'your organization';
      return `You're viewing the **Maturity Report** for ${org}.\n\nThis report shows:\n• **Overall maturity scores** across 6 pillars\n• **Current vs Target** maturity levels\n• **Gap analysis** for each pillar\n• **Databricks Recommendations** - specific features to adopt\n• **Next Steps** - actionable roadmap\n\n**Actions you can take:**\n• Edit any section (hover to see edit icons)\n• Start slideshow mode\n• Print the report\n• Customize colors and content`;
    }
    
    if (messageLower.includes('score') || messageLower.includes('maturity') || messageLower.includes('level')) {
      try {
        const results = assessmentData.results || {};
        const categoryDetails = results.categoryDetails || {};
        
        let response = "**Your Maturity Scores:**\n\n";
        const pillars = [
          { id: 'platform_governance', name: 'Platform & Governance' },
          { id: 'data_engineering', name: 'Data Engineering' },
          { id: 'analytics_bi', name: 'Analytics & BI' },
          { id: 'machine_learning', name: 'Machine Learning' },
          { id: 'generative_ai', name: 'Generative AI' },
          { id: 'operational_excellence', name: 'Operational Excellence' }
        ];
        
        pillars.forEach(pillar => {
          const data = categoryDetails[pillar.id];
          if (data) {
            const current = data.score || 0;
            const target = data.targetScore || 0;
            const gap = (target - current).toFixed(1);
            response += `• **${pillar.name}**: ${current.toFixed(1)} → ${target.toFixed(1)} (Gap: ${gap})\n`;
          }
        });
        
        response += "\nFocus on the pillars with the largest gaps for maximum impact!";
        return response;
      } catch (err) {
        return respond("I can see your maturity report. Each pillar shows your current score, target score, and the gap between them. The larger the gap, the more opportunity for improvement!";
      }
    }
    
    if (messageLower.includes('recommendation') || messageLower.includes('databricks') || messageLower.includes('feature')) {
      return respond("**Databricks Recommendations** are tailored to your assessment!\n\nEach pillar shows specific Databricks features and capabilities that match your maturity level and goals:\n\n• **Delta Lake** - For data reliability\n• **Unity Catalog** - For governance\n• **MLflow** - For ML lifecycle\n• **Delta Live Tables** - For data pipelines\n• **Model Serving** - For ML deployment\n• **AI Gateway** - For GenAI apps\n\nScroll down to see recommendations for each pillar. You can edit them too!";
    }
    
    if (messageLower.includes('edit') || messageLower.includes('change') || messageLower.includes('customize')) {
      return respond("**You can edit almost everything!**\n\n• **Hover over any card** to see edit icons\n• **Click edit** to modify text\n• **Click color palette** to change colors\n• **Add/delete items** in lists\n• **Regenerate content** if needed\n\nAll changes are saved automatically. Make this report yours!";
    }
  }
  
  // EXECUTIVE COMMAND CENTER
  if (pageType === 'executive_dashboard') {
    if (messageLower.includes('what') || messageLower.includes('this page') || messageLower.includes('dashboard')) {
      return respond("You're viewing the **Executive Command Center** - a C-level dashboard.\n\nThis page provides:\n• **Strategic Imperatives** - Top 3 priorities\n• **Investment Roadmap** - Phased approach\n• **Risk Assessment** - Key risks and mitigation\n• **Success Metrics** - KPIs to track\n• **Executive Summary** - High-level overview\n\n**Perfect for:**\n• Board presentations\n• Executive briefings\n• Strategic planning sessions\n\nUse slideshow mode for presentations!";
    }
    
    if (messageLower.includes('strategic') || messageLower.includes('imperative') || messageLower.includes('priority')) {
      return respond("**Strategic Imperatives** are your top 3 priorities based on:\n\n• **Largest maturity gaps**\n• **Business impact potential**\n• **Quick wins vs long-term value**\n• **Resource requirements**\n• **Risk factors**\n\nThese are derived from your assessment responses and represent the highest-value initiatives for your organization.";
    }
    
    if (messageLower.includes('roadmap') || messageLower.includes('timeline') || messageLower.includes('phase')) {
      return respond("**Investment Roadmap** breaks down your journey into phases:\n\n**Phase 1 (0-6 months)**: Quick wins, foundation building\n**Phase 2 (6-12 months)**: Core capabilities, process improvements\n**Phase 3 (12-18 months)**: Advanced features, optimization\n\nEach phase includes specific initiatives, expected outcomes, and resource needs.";
    }
  }
  
  // INSIGHTS DASHBOARD
  if (pageType === 'insights_dashboard') {
    if (messageLower.includes('what') || messageLower.includes('this page') || messageLower.includes('insights')) {
      return respond("You're on the **Insights Dashboard** - your analytics hub.\n\nThis dashboard shows:\n• **Key metrics** across all assessments\n• **Trend analysis** over time\n• **Comparative views** across pillars\n• **Progress tracking**\n• **Actionable insights**\n\n**Use this to:**\n• Track improvement over time\n• Identify patterns\n• Make data-driven decisions\n• Report to stakeholders";
    }
  }
  
  // INDUSTRY BENCHMARKS
  if (pageType === 'industry_benchmarks') {
    if (messageLower.includes('what') || messageLower.includes('this page') || messageLower.includes('benchmark')) {
      return respond("You're viewing **Industry Benchmarks** - see how you compare!\n\nThis report includes:\n• **Percentile rankings** for each pillar\n• **Industry averages** vs your scores\n• **Competitive positioning**\n• **Gap analysis** vs industry leaders\n• **Strategic recommendations** based on benchmarks\n\n**Why benchmarks matter:**\n• Validate your assessment\n• Identify competitive advantages\n• Find improvement opportunities\n• Justify investments to leadership";
    }
    
    if (messageLower.includes('percentile') || messageLower.includes('rank') || messageLower.includes('compare')) {
      return respond("**Percentile Rankings** show where you stand:\n\n• **90th+ percentile**: Industry leader\n• **75-90th**: Above average\n• **50-75th**: Average\n• **25-50th**: Below average\n• **<25th**: Needs attention\n\nHigher percentiles mean you're outperforming most organizations in that pillar. Use this to prioritize improvements!";
    }
  }
  
  // DEEP DIVE
  if (pageType === 'deep_dive') {
    if (messageLower.includes('what') || messageLower.includes('this page') || messageLower.includes('deep dive')) {
      return respond("You're on the **Deep Dive** page - comprehensive assessment details.\n\nThis page explains:\n• **What we assess** - All 6 pillars in detail\n• **Why it matters** - Business value and impact\n• **Assessment methodology** - How we calculate scores\n• **Key capabilities** - What we measure in each area\n• **Maturity framework** - The 5-level model\n\nThis is your reference guide for understanding the assessment!";
    }
  }
  
  // USER GUIDE
  if (pageType === 'user_guide') {
    if (messageLower.includes('what') || messageLower.includes('this page') || messageLower.includes('guide')) {
      return respond("You're on the **User Guide** - your complete reference!\n\nThis guide covers:\n• **Getting Started** - How to begin\n• **Key Features** - What the tool offers\n• **Workflows** - Step-by-step processes\n• **Reports** - Understanding your results\n• **FAQs** - Common questions\n• **Troubleshooting** - Solving issues\n\nEverything you need to master the assessment tool!";
    }
  }
  
  // DASHBOARD (All Assessments)
  if (pageType === 'dashboard') {
    if (messageLower.includes('what') || messageLower.includes('this page') || messageLower.includes('dashboard')) {
      return respond("You're on your **Assessments Dashboard** - your control center.\n\nHere you can:\n• **View all assessments** - Past and present\n• **Start new assessments**\n• **Continue in-progress** assessments\n• **View results** and reports\n• **Compare assessments** over time\n• **Export data** to Excel\n• **Manage assignments** (for admins)\n\nYour one-stop shop for all assessment activities!";
    }
  }
  
  // ADMIN
  if (pageType === 'admin') {
    if (messageLower.includes('what') || messageLower.includes('this page') || messageLower.includes('admin')) {
      return respond("You're in the **Admin Section** - management tools.\n\nAdmin capabilities:\n• **Manage users** - Create, edit, assign roles\n• **Manage assessments** - View all, assign to users\n• **Custom questions** - Add organization-specific questions\n• **View feedback** - See user feedback and analytics\n• **Manage assignments** - Track who's doing what\n• **Role switching** - Test as different user types\n\nPowerful tools for assessment administrators!";
    }
  }
  
  // ===== GENERAL KNOWLEDGE RESPONSES =====
  
  if (messageLower.includes('pillar') || messageLower.includes('categories') || messageLower.includes('areas')) {
    return respond("**The 6 Assessment Pillars:**\n\n🏛️ **Platform & Governance** - Security, compliance, access control, Unity Catalog\n\n🔷 **Data Engineering** - Data pipelines, ETL, data quality, Delta Lake\n\n📊 **Analytics & BI** - Reporting, dashboards, SQL analytics, visualization\n\n🤖 **Machine Learning** - ML models, MLOps, MLflow, model deployment\n\n✨ **Generative AI** - LLMs, AI applications, AI Gateway, RAG\n\n⚙️ **Operational Excellence** - Monitoring, cost optimization, reliability\n\nEach pillar has 5-8 sub-dimensions for detailed assessment.";
  }
  
  if (messageLower.includes('databricks') && (messageLower.includes('feature') || messageLower.includes('product') || messageLower.includes('capability'))) {
    return respond("**Key Databricks Capabilities:**\n\n**Data Engineering:**\n• Delta Lake - ACID transactions, time travel\n• Delta Live Tables - Declarative pipelines\n• Auto Loader - Incremental data ingestion\n\n**Governance:**\n• Unity Catalog - Unified governance\n• Data lineage - Track data flow\n• Access controls - Fine-grained permissions\n\n**ML & AI:**\n• MLflow - ML lifecycle management\n• Model Serving - Deploy models at scale\n• AI Gateway - Secure GenAI development\n\n**Performance:**\n• Photon - High-speed query engine\n• Serverless - Auto-scaling compute\n\nWant details on any specific feature?";
  }
  
  if (messageLower.includes('how to start') || messageLower.includes('how do i start') || messageLower.includes('begin')) {
    return respond("**Starting Your Assessment:**\n\n1. Click **'Start Assessment'** in the navigation\n2. Enter your **organization details**\n3. Answer questions for each pillar:\n   • Rate **current maturity** (1-5)\n   • Rate **target maturity** (1-5)\n   • Add **pain points** (technical & business)\n   • Add **notes** for context\n4. Review and **submit**\n5. View your **Maturity Report**\n\n⏱️ Takes 15-20 minutes. Auto-saves progress!";
  }
  
  if (messageLower.includes('slideshow') || messageLower.includes('present') || messageLower.includes('print')) {
    return respond("**Presentation & Export Options:**\n\n**Slideshow Mode:**\n• Click the **Slideshow button** on any report page\n• Navigate with **arrow keys** or **on-screen arrows**\n• Press **ESC** to exit\n• **Print button** appears in slideshow for PDF export\n\n**Print/PDF:**\n• Click **Print** in slideshow mode\n• Use browser's **Print to PDF**\n• Each slide = one page\n• Perfect for sharing with stakeholders!\n\nAvailable on: Maturity Report, Executive Command Center, Insights Dashboard, Industry Benchmarks, Deep Dive, User Guide.";
  }
  
  if (messageLower.includes('edit') || messageLower.includes('customize') || messageLower.includes('change')) {
    return respond("**Customization Options:**\n\n**On Report Pages:**\n• **Hover over cards** to see edit icons\n• **Edit text** - Click pencil icon\n• **Change colors** - Click palette icon\n• **Add items** - Click + icon\n• **Delete items** - Click trash icon\n• **Reset** - Restore original content\n\n**All changes auto-save!**\n\nMake the report match your organization's language and priorities.";
  }
  
  if (messageLower.includes('excel') || messageLower.includes('export') || messageLower.includes('download')) {
    return respond("**Export to Excel:**\n\n1. Go to your **Dashboard**\n2. Find the assessment you want\n3. Click the **Excel icon** (📊)\n4. Download the file\n\n**Excel includes:**\n• All questions and responses\n• Current & target maturity levels\n• Pain points (technical & business)\n• Notes and context\n• Organized by pillar and dimension\n\n**You can also:**\n• Edit in Excel\n• Upload back to update the assessment\n• Share with team members";
  }
  
  if (messageLower.includes('assign') || messageLower.includes('collaborate') || messageLower.includes('team')) {
    return respond("**Collaboration Features:**\n\n**For Admins:**\n• **Assign assessments** to users\n• **Assign specific questions** to team members\n• **Track status** - See who's completed what\n• **Send reminders** - Follow up on pending items\n• **Approve responses** - Review before finalizing\n\n**For Users:**\n• **View assignments** - See what's assigned to you\n• **Complete questions** - Answer your assigned items\n• **Add follow-up notes** - Provide additional context\n\nGreat for distributed teams and large organizations!";
  }
  
  if (messageLower.includes('feedback') || messageLower.includes('survey') || messageLower.includes('improve')) {
    return respond("**Give Feedback:**\n\nWe value your input! Click **'Give Feedback'** in the user menu to:\n\n• Rate your experience\n• Answer quick survey questions\n• Share suggestions for improvement\n• Report issues\n\n**For Admins:**\nView all feedback in **'View All Feedback'** to see:\n• Response analytics\n• User satisfaction scores\n• Common themes\n• Individual feedback details\n\nHelp us make the tool better!";
  }
  
  if (messageLower.includes('thank') || messageLower.includes('thanks')) {
    return respond("You're welcome! 😊 I'm here anytime you need help. Feel free to ask about anything on this page or the assessment in general!";
  }
  
  if (messageLower.includes('bye') || messageLower.includes('goodbye')) {
    return respond("Goodbye! 👋 I'll be here whenever you need assistance. Good luck with your assessment!";
  }
  
  // ===== CONTEXT-AWARE DEFAULT =====
  const pageContext = {
    'home': "You're on the home page. Ask me about getting started, assessment features, or what you can do here!",
    'assessment': "You're taking an assessment. Ask me about maturity levels, pain points, or how to answer questions!",
    'maturity_report': "You're viewing a maturity report. Ask me about scores, recommendations, or how to customize the report!",
    'executive_dashboard': "You're on the Executive Command Center. Ask me about strategic imperatives, roadmaps, or how to present this!",
    'insights_dashboard': "You're on the Insights Dashboard. Ask me about metrics, trends, or how to interpret the data!",
    'industry_benchmarks': "You're viewing industry benchmarks. Ask me about percentiles, comparisons, or how you rank!",
    'deep_dive': "You're on the Deep Dive page. Ask me about the assessment methodology, pillars, or what we measure!",
    'user_guide': "You're on the User Guide. Ask me about features, workflows, or how to use the tool!",
    'dashboard': "You're on your assessments dashboard. Ask me about viewing, starting, or managing assessments!",
    'admin': "You're in the admin section. Ask me about user management, assignments, or admin features!",
    'pitch_deck': "You're viewing the pitch deck. Ask me about presenting this to customers or the value proposition!"
  };
  
  return `I'm your Databricks Maturity Assessment Assistant! 🤖\n\n${pageContext[pageType] || "I can help with any questions about the assessment!"}\n\nI can help you with:\n• **This page** - What you're looking at right now\n• **Assessment process** - How to complete assessments\n• **Reports & dashboards** - Understanding your results\n• **Databricks features** - Product capabilities\n• **Best practices** - How to use the tool effectively\n\nWhat would you like to know?`;
}

module.exports = router;

