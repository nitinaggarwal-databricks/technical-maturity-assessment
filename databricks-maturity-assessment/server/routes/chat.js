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
    const { conversationId, message, sessionId, userEmail } = req.body;

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
        [userEmail, sessionId, 'general']
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

    // Generate AI response
    const aiResponse = generateAIResponse(message, contextMessages.rows.reverse());

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
      response: aiResponse
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

// AI Response Generator with assessment knowledge
function generateAIResponse(userMessage, conversationHistory) {
  const messageLower = userMessage.toLowerCase();

  // Assessment guidance responses
  if (messageLower.includes('how to start') || messageLower.includes('how do i start') || messageLower.includes('begin')) {
    return "To start your Databricks Maturity Assessment:\n\n1. Click 'Start Assessment' in the navigation\n2. Answer questions across 6 pillars: Data Engineering, Analytics & BI, Machine Learning, Generative AI, Platform Governance, and Operational Excellence\n3. Rate your current and target maturity levels\n4. Add notes for context\n\nThe assessment typically takes 15-20 minutes. You can save and resume anytime!";
  }

  if (messageLower.includes('pillar') || messageLower.includes('categories') || messageLower.includes('areas')) {
    return "The assessment covers 6 key pillars:\n\n🔷 **Data Engineering** - Data pipelines, quality, and integration\n📊 **Analytics & BI** - Reporting, dashboards, and insights\n🤖 **Machine Learning** - ML models, MLOps, and deployment\n✨ **Generative AI** - LLMs, AI applications, and governance\n🏛️ **Platform Governance** - Security, compliance, and access control\n⚙️ **Operational Excellence** - Monitoring, optimization, and reliability\n\nEach pillar has multiple sub-categories to assess in detail.";
  }

  if (messageLower.includes('maturity level') || messageLower.includes('maturity score')) {
    return "Maturity levels range from 1-5:\n\n**1. Explore** - Just beginning, ad-hoc processes\n**2. Experiment** - Pilot projects, learning phase\n**3. Formalize** - Standardized processes, documented\n**4. Optimize** - Advanced automation, measurable ROI\n**5. Transform** - Industry-leading, innovation driver\n\nYou'll rate both your **current state** and **target state** for each area.";
  }

  if (messageLower.includes('stuck') || messageLower.includes('help') || messageLower.includes('confused')) {
    return "I'm here to help! What are you stuck on?\n\n• **Starting the assessment** - Click 'Start Assessment'\n• **Understanding questions** - Each question has context and examples\n• **Rating maturity** - Use the 1-5 scale based on your current capabilities\n• **Viewing results** - Complete the assessment to see your maturity report\n• **Recommendations** - Get personalized guidance based on your responses\n\nFeel free to ask specific questions!";
  }

  if (messageLower.includes('report') || messageLower.includes('results') || messageLower.includes('recommendations')) {
    return "After completing the assessment, you'll get:\n\n📊 **Maturity Report** - Visual breakdown of your scores\n🎯 **Gap Analysis** - Difference between current and target state\n💡 **Recommendations** - Specific Databricks features and best practices\n📈 **Roadmap** - Step-by-step plan to improve maturity\n🏆 **Benchmarks** - Compare against industry standards\n\nYou can also generate an Executive Summary for stakeholders!";
  }

  if (messageLower.includes('save') || messageLower.includes('resume') || messageLower.includes('continue')) {
    return "Your progress is automatically saved! 💾\n\nYou can:\n• Close the browser and return anytime\n• Navigate between pillars freely\n• Update your responses before submitting\n• Access your assessments from 'My Assessments'\n\nYour session is preserved until you complete the assessment.";
  }

  if (messageLower.includes('databricks') && (messageLower.includes('feature') || messageLower.includes('product'))) {
    return "Key Databricks capabilities include:\n\n• **Delta Lake** - Reliable data lake with ACID transactions\n• **Unity Catalog** - Unified governance across data & AI\n• **MLflow** - End-to-end ML lifecycle management\n• **Photon** - High-performance query engine\n• **Delta Live Tables** - Declarative data pipelines\n• **Model Serving** - Deploy ML models at scale\n• **AI Gateway** - Secure GenAI application development\n\nWant details on any specific feature?";
  }

  if (messageLower.includes('time') || messageLower.includes('long') || messageLower.includes('duration')) {
    return "Assessment timing:\n\n⏱️ **Full Assessment**: 15-20 minutes\n⏱️ **Single Pillar**: 2-3 minutes\n⏱️ **Quick Sample**: Available for demo\n\nYou can save and resume anytime - no need to complete in one session!";
  }

  if (messageLower.includes('who') || messageLower.includes('audience') || messageLower.includes('suitable')) {
    return "This assessment is for:\n\n👥 **Data Leaders** - CTOs, CDOs, VPs of Data\n🏗️ **Platform Architects** - Technical decision makers\n📊 **Analytics Teams** - BI and data analytics leads\n🤖 **ML/AI Teams** - ML engineers and data scientists\n⚙️ **Platform Engineers** - DevOps and infrastructure teams\n\nIt helps organizations understand their data maturity and plan improvements.";
  }

  if (messageLower.includes('thank') || messageLower.includes('thanks')) {
    return "You're welcome! 😊 Feel free to ask if you have more questions. I'm here to help you get the most out of your Databricks Maturity Assessment!";
  }

  if (messageLower.includes('bye') || messageLower.includes('goodbye')) {
    return "Goodbye! Feel free to return anytime if you need assistance with your assessment. Good luck! 👋";
  }

  // Default response
  return "I'm the Databricks Maturity Assessment Assistant! I can help you with:\n\n• **Getting started** with the assessment\n• **Understanding** the 6 pillars and maturity levels\n• **Navigating** the assessment process\n• **Interpreting** your results and recommendations\n• **Learning** about Databricks features\n\nWhat would you like to know?";
}

module.exports = router;

