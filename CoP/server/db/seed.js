import bcrypt from 'bcryptjs';
import pool from './db.js';

async function seed() {
  try {
    console.log('Starting database seeding...');
    
    // Create default users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Admin user
    await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, organization)
      VALUES 
        ('admin@databricks.com', $1, 'Admin', 'User', 'admin', 'Databricks'),
        ('ae@databricks.com', $1, 'Account', 'Executive', 'databricks_ae', 'Databricks'),
        ('csm@databricks.com', $1, 'Customer', 'Success Manager', 'databricks_csm', 'Databricks'),
        ('sa@databricks.com', $1, 'Solutions', 'Architect', 'databricks_sa', 'Databricks'),
        ('customer_exec@takeda.com', $1, 'John', 'Executive', 'customer_executive', 'Takeda'),
        ('cop_lead@takeda.com', $1, 'Sarah', 'Leader', 'customer_lead', 'Takeda'),
        ('member@takeda.com', $1, 'Mike', 'Member', 'customer_member', 'Takeda')
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);
    
    console.log('✓ Users seeded');
    
    // Get user IDs
    const adminResult = await pool.query(`SELECT id FROM users WHERE email = 'admin@databricks.com'`);
    const aeResult = await pool.query(`SELECT id FROM users WHERE email = 'ae@databricks.com'`);
    const execResult = await pool.query(`SELECT id FROM users WHERE email = 'customer_exec@takeda.com'`);
    const leadResult = await pool.query(`SELECT id FROM users WHERE email = 'cop_lead@takeda.com'`);
    
    const adminId = adminResult.rows[0]?.id;
    const aeId = aeResult.rows[0]?.id;
    const execId = execResult.rows[0]?.id;
    const leadId = leadResult.rows[0]?.id;
    
    // Create sample CoP
    const copResult = await pool.query(`
      INSERT INTO cop_communities (
        name, customer_name, vertical, region, phase, status,
        mission, vision, executive_sponsor_id, cop_lead_id, databricks_owner_id
      )
      VALUES (
        'Takeda Data & AI Community of Practice',
        'Takeda Pharmaceutical',
        'HLS',
        'North America',
        'growth',
        'active',
        'To foster collaboration, drive innovation, and accelerate data & AI adoption across Takeda',
        'Become the leading pharmaceutical company in data-driven innovation',
        $1, $2, $3
      )
      RETURNING id
    `, [execId, leadId, aeId]);
    
    const copId = copResult.rows[0].id;
    console.log('✓ CoP community seeded');
    
    // Create sample content assets
    await pool.query(`
      INSERT INTO content_assets (
        title, description, type, category, audience_level, personas, url, tags, is_global, created_by
      )
      VALUES 
        ('Databricks 101: Getting Started', 'Introduction to Databricks platform', 'course', 'DB101', 'beginner', 
         ARRAY['DE', 'DA', 'DS', 'Business'], 'https://academy.databricks.com/db101', 
         ARRAY['getting-started', 'fundamentals'], true, $1),
        ('Unity Catalog Deep Dive', 'Comprehensive guide to governance with Unity Catalog', 'course', 'Governance', 'intermediate',
         ARRAY['DE', 'DA'], 'https://academy.databricks.com/uc', 
         ARRAY['governance', 'unity-catalog'], true, $1),
        ('Generative AI Fundamentals', 'Introduction to GenAI on Databricks', 'course', 'GenAI', 'beginner',
         ARRAY['DS', 'DE', 'Business'], 'https://academy.databricks.com/genai', 
         ARRAY['ai', 'genai', 'ml'], true, $1),
        ('CoP Charter Template', 'Template for creating your CoP charter', 'template', 'DB101', 'beginner',
         ARRAY['Business'], '/templates/charter.docx', 
         ARRAY['template', 'charter'], true, $1),
        ('Brickster of the Month Template', 'Recognition template', 'template', 'DB101', 'beginner',
         ARRAY['Business'], '/templates/brickster.pptx', 
         ARRAY['template', 'recognition'], true, $1)
    `, [adminId]);
    
    console.log('✓ Content assets seeded');
    
    // Create sample events
    await pool.query(`
      INSERT INTO events (
        cop_id, title, description, event_type, event_date, duration_minutes, 
        location, speakers, status, created_by
      )
      VALUES 
        ($1, 'Databricks 101: Platform Overview', 'Introduction to Databricks for new users', 
         'session', NOW() + INTERVAL '7 days', 60, 
         'https://zoom.us/meeting1', ARRAY['John SA', 'Sarah PM'], 'scheduled', $2),
        ($1, 'Unity Catalog Best Practices', 'Deep dive into governance', 
         'deep_dive', NOW() + INTERVAL '14 days', 90, 
         'https://zoom.us/meeting2', ARRAY['Mike Architect'], 'scheduled', $2),
        ($1, 'Office Hours: Ask Me Anything', 'Open Q&A session', 
         'office_hours', NOW() + INTERVAL '21 days', 60, 
         'https://zoom.us/meeting3', ARRAY['Solutions Team'], 'scheduled', $2)
    `, [copId, aeId]);
    
    console.log('✓ Events seeded');
    
    // Create sample readiness assessment
    await pool.query(`
      INSERT INTO readiness_assessments (
        cop_id, conducted_by, 
        platform_adoption_score, user_maturity_score, leadership_buyin_score, 
        champions_score, enablement_momentum_score, governance_pain_score,
        collaboration_tools_score, innovation_mindset_score,
        total_score, readiness_level, recommendations
      )
      VALUES (
        $1, $2, 
        5, 4, 5, 
        4, 5, 4,
        5, 4,
        36, 'highly_ready', 'Customer is highly ready for CoP launch. Proceed with planning and charter development.'
      )
    `, [copId, aeId]);
    
    console.log('✓ Readiness assessment seeded');
    
    // Create sample KPI metrics
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const metricDate = new Date(currentDate);
      metricDate.setMonth(metricDate.getMonth() - i);
      
      await pool.query(`
        INSERT INTO kpi_metrics (
          cop_id, metric_date, monthly_active_users, dbu_consumption,
          monthly_active_participants, num_sessions, num_certifications,
          num_use_cases, avg_nps, avg_session_satisfaction,
          knowledge_assets_count, knowledge_assets_views
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        )
      `, [
        copId,
        metricDate.toISOString().split('T')[0],
        50 + (i * 10),
        1000 + (i * 200),
        30 + (i * 5),
        2 + i,
        3 + i,
        2 + Math.floor(i / 2),
        7.5 + (i * 0.3),
        8.0 + (i * 0.2),
        10 + i,
        100 + (i * 50)
      ]);
    }
    
    console.log('✓ KPI metrics seeded');
    
    // Create phase roadmap
    const foundationTasks = [
      ['Identify key stakeholders', 'Map executive sponsor, CoP lead, and champions across BUs', 1],
      ['Define objectives and goals', 'Establish clear business, technical, and cultural goals', 2],
      ['Develop CoP charter', 'Create mission, vision, scope, and governance framework', 3],
      ['Define roles and responsibilities', 'Document stakeholder roles and expectations', 4],
      ['Set up collaboration channels', 'Create Slack/Teams channels and communication tools', 5]
    ];
    
    for (const [task_name, description, sequence_order] of foundationTasks) {
      await pool.query(`
        INSERT INTO phase_roadmap (cop_id, phase, task_name, description, owner_id, sequence_order, status)
        VALUES ($1, 'foundation', $2, $3, $4, $5, 'completed')
      `, [copId, task_name, description, leadId, sequence_order]);
    }
    
    const launchTasks = [
      ['Launch CoP portal/space', 'Set up central hub for content and resources', 1],
      ['Run kickoff session', 'Host initial CoP meeting with all stakeholders', 2],
      ['Establish feedback loop', 'Implement surveys and feedback mechanisms', 3],
      ['Create content calendar', 'Plan first 90 days of sessions and events', 4]
    ];
    
    for (const [task_name, description, sequence_order] of launchTasks) {
      await pool.query(`
        INSERT INTO phase_roadmap (cop_id, phase, task_name, description, owner_id, sequence_order, status)
        VALUES ($1, 'launch', $2, $3, $4, $5, 'completed')
      `, [copId, task_name, description, leadId, sequence_order]);
    }
    
    const growthTasks = [
      ['Expand membership across BUs', 'Drive awareness and enrollment', 1, 'in_progress'],
      ['Launch advanced topic tracks', 'GenAI, ML, governance deep dives', 2, 'in_progress'],
      ['Start mentorship program', 'Pair experienced users with newcomers', 3, 'pending'],
      ['Implement champion program', 'Brickster of the Month recognition', 4, 'in_progress']
    ];
    
    for (const [task_name, description, sequence_order, status] of growthTasks) {
      await pool.query(`
        INSERT INTO phase_roadmap (cop_id, phase, task_name, description, owner_id, sequence_order, status)
        VALUES ($1, 'growth', $2, $3, $4, $5, $6)
      `, [copId, task_name, description, leadId, sequence_order, status]);
    }
    
    console.log('✓ Phase roadmap seeded');
    
    // Create templates
    await pool.query(`
      INSERT INTO templates (name, description, type, content, version, is_active, created_by)
      VALUES 
        ('CoP Charter Template', 'Standard charter template with mission, vision, scope, and governance', 
         'charter', 'Mission: [Define purpose]\nVision: [Future state]\nScope: [What is included]\nGovernance: [How decisions are made]', 
         '1.0', true, $1),
        ('Monthly Newsletter Template', 'Template for monthly CoP updates', 
         'newsletter', '# CoP Monthly Update\n\n## This Month Highlights\n\n## Upcoming Events\n\n## Success Stories\n\n## Champions Corner', 
         '1.0', true, $1),
        ('Session Feedback Survey', 'Standard post-session survey', 
         'survey', '{"questions": [{"id": 1, "text": "Content quality", "type": "rating"}, {"id": 2, "text": "Presenter quality", "type": "rating"}, {"id": 3, "text": "NPS", "type": "nps"}]}', 
         '1.0', true, $1)
    `, [adminId]);
    
    console.log('✓ Templates seeded');
    
    console.log('\n✓ Database seeded successfully!');
    console.log('\nDefault login credentials:');
    console.log('Admin: admin@databricks.com / password123');
    console.log('AE: ae@databricks.com / password123');
    console.log('Customer: cop_lead@takeda.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();


