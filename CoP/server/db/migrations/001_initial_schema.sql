-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL, -- 'admin', 'databricks_ae', 'databricks_csm', 'databricks_sa', 'databricks_dsa', 'databricks_partner', 'databricks_leadership', 'customer_executive', 'customer_lead', 'customer_champion', 'customer_member', 'customer_trainer'
  organization VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- CoP Communities table
CREATE TABLE IF NOT EXISTS cop_communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  vertical VARCHAR(100), -- 'HLS', 'FSI', 'Retail', 'Manufacturing', etc.
  region VARCHAR(100),
  phase VARCHAR(50) DEFAULT 'foundation', -- 'foundation', 'launch', 'growth', 'optimization'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'archived'
  mission TEXT,
  vision TEXT,
  charter TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  executive_sponsor_id UUID REFERENCES users(id),
  cop_lead_id UUID REFERENCES users(id),
  databricks_owner_id UUID REFERENCES users(id)
);

-- Readiness Assessments table
CREATE TABLE IF NOT EXISTS readiness_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cop_id UUID REFERENCES cop_communities(id) ON DELETE CASCADE,
  conducted_by UUID REFERENCES users(id),
  platform_adoption_score INT CHECK (platform_adoption_score BETWEEN 1 AND 5),
  user_maturity_score INT CHECK (user_maturity_score BETWEEN 1 AND 5),
  leadership_buyin_score INT CHECK (leadership_buyin_score BETWEEN 1 AND 5),
  champions_score INT CHECK (champions_score BETWEEN 1 AND 5),
  enablement_momentum_score INT CHECK (enablement_momentum_score BETWEEN 1 AND 5),
  governance_pain_score INT CHECK (governance_pain_score BETWEEN 1 AND 5),
  collaboration_tools_score INT CHECK (collaboration_tools_score BETWEEN 1 AND 5),
  innovation_mindset_score INT CHECK (innovation_mindset_score BETWEEN 1 AND 5),
  total_score INT,
  readiness_level VARCHAR(50), -- 'highly_ready', 'partially_ready', 'not_ready'
  recommendations TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stakeholders table
CREATE TABLE IF NOT EXISTS stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cop_id UUID REFERENCES cop_communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  role VARCHAR(100), -- 'executive_sponsor', 'cop_lead', 'champion', 'steering_committee', 'member'
  business_unit VARCHAR(255),
  influence_level VARCHAR(50), -- 'high', 'medium', 'low'
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Assets table
CREATE TABLE IF NOT EXISTS content_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50), -- 'course', 'video', 'document', 'template', 'presentation', 'recording'
  category VARCHAR(100), -- 'DB101', 'Governance', 'DE', 'DBSQL', 'GenAI', 'ML', 'Cost_Optimization'
  audience_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
  personas TEXT[], -- array of personas: 'DE', 'DA', 'DS', 'Business'
  url TEXT,
  file_path TEXT,
  tags TEXT[],
  views INT DEFAULT 0,
  downloads INT DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_global BOOLEAN DEFAULT true -- true for Databricks global content, false for customer-specific
);

-- CoP Content (mapping content to specific CoPs)
CREATE TABLE IF NOT EXISTS cop_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cop_id UUID REFERENCES cop_communities(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content_assets(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT false,
  sequence_order INT,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cop_id UUID REFERENCES cop_communities(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50), -- 'session', 'office_hours', 'deep_dive', 'roadmap', 'workshop'
  event_date TIMESTAMP NOT NULL,
  duration_minutes INT,
  location VARCHAR(255), -- virtual link or physical location
  speakers TEXT[], -- array of speaker names
  max_attendees INT,
  agenda TEXT,
  materials TEXT[], -- links to materials
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event Attendance table
CREATE TABLE IF NOT EXISTS event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  business_unit VARCHAR(255),
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  attended BOOLEAN DEFAULT false,
  feedback_submitted BOOLEAN DEFAULT false
);

-- Discussion Threads table
CREATE TABLE IF NOT EXISTS discussion_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cop_id UUID REFERENCES cop_communities(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_by UUID REFERENCES users(id),
  product_area VARCHAR(100),
  tags TEXT[],
  is_resolved BOOLEAN DEFAULT false,
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Discussion Replies table
CREATE TABLE IF NOT EXISTS discussion_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES discussion_threads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  is_accepted_answer BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Champions/Recognition table
CREATE TABLE IF NOT EXISTS champions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cop_id UUID REFERENCES cop_communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  recognition_type VARCHAR(50), -- 'brickster_of_month', 'speaker', 'top_contributor', 'new_cert'
  month DATE,
  reason TEXT,
  badge_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Use Cases table
CREATE TABLE IF NOT EXISTS use_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cop_id UUID REFERENCES cop_communities(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  problem_statement TEXT,
  solution TEXT,
  databricks_features TEXT[],
  outcomes TEXT,
  architecture_diagram_url TEXT,
  vertical VARCHAR(100),
  domain VARCHAR(100),
  created_by UUID REFERENCES users(id),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Surveys table
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cop_id UUID REFERENCES cop_communities(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  survey_type VARCHAR(50), -- 'session_feedback', 'cop_health', 'executive_pulse'
  questions JSONB, -- array of question objects
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'closed'
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closes_at TIMESTAMP
);

-- Survey Responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  respondent_id UUID REFERENCES users(id),
  responses JSONB, -- object with question_id: answer pairs
  nps_score INT CHECK (nps_score BETWEEN 0 AND 10),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- KPI Metrics table
CREATE TABLE IF NOT EXISTS kpi_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cop_id UUID REFERENCES cop_communities(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  monthly_active_users INT,
  dbu_consumption DECIMAL(15,2),
  monthly_active_participants INT,
  num_sessions INT,
  num_certifications INT,
  num_use_cases INT,
  avg_nps DECIMAL(3,2),
  avg_session_satisfaction DECIMAL(3,2),
  knowledge_assets_count INT,
  knowledge_assets_views INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certifications table
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  cop_id UUID REFERENCES cop_communities(id) ON DELETE CASCADE,
  certification_name VARCHAR(255) NOT NULL,
  certification_type VARCHAR(100), -- 'Associate', 'Professional', 'Specialist'
  certification_area VARCHAR(100), -- 'GenAI', 'Data Engineering', 'ML', etc.
  earned_date DATE,
  certificate_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Phase Roadmap table
CREATE TABLE IF NOT EXISTS phase_roadmap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cop_id UUID REFERENCES cop_communities(id) ON DELETE CASCADE,
  phase VARCHAR(50), -- 'foundation', 'launch', 'growth', 'optimization'
  task_name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id),
  due_date DATE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'blocked'
  sequence_order INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50), -- 'pitch_deck', 'charter', 'agenda', 'newsletter', 'email', 'survey'
  content TEXT,
  file_url TEXT,
  version VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_cop_communities_phase ON cop_communities(phase);
CREATE INDEX idx_cop_communities_status ON cop_communities(status);
CREATE INDEX idx_stakeholders_cop_id ON stakeholders(cop_id);
CREATE INDEX idx_content_assets_category ON content_assets(category);
CREATE INDEX idx_events_cop_id ON events(cop_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_discussion_threads_cop_id ON discussion_threads(cop_id);
CREATE INDEX idx_kpi_metrics_cop_date ON kpi_metrics(cop_id, metric_date);


