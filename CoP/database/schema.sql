-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- 1. Customers table (multi-tenant)
CREATE TABLE customers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    industry        TEXT,
    region          TEXT,
    account_owner   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_region ON customers(region);
CREATE INDEX idx_customers_industry ON customers(industry);

-- 2. Users table (both Databricks + customer side)
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           CITEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    full_name       TEXT,
    company         TEXT,
    role            TEXT NOT NULL,  -- 'databricks_internal', 'customer_exec', 'customer_member', etc.
    persona         TEXT,  -- 'AE', 'CSM', 'DE', 'DA', 'DS', 'Business', etc.
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_company ON users(company);

-- 3. CoPs (Community of Practice per customer)
CREATE TABLE cops (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    mission         TEXT,
    vision          TEXT,
    charter_url     TEXT,
    phase           TEXT CHECK (phase IN ('foundation','launch','growth','optimization')) DEFAULT 'foundation',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    start_date      DATE,
    end_date        DATE,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cops_customer ON cops(customer_id);
CREATE INDEX idx_cops_phase ON cops(phase);
CREATE INDEX idx_cops_is_active ON cops(is_active);

-- 4. CoP memberships
CREATE TABLE cop_memberships (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cop_id          UUID NOT NULL REFERENCES cops(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    membership_role TEXT DEFAULT 'member',  -- 'member','champion','cop_lead','exec_sponsor'
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (cop_id, user_id)
);

CREATE INDEX idx_cop_memberships_cop ON cop_memberships(cop_id);
CREATE INDEX idx_cop_memberships_user ON cop_memberships(user_id);

-- 5. Events (sessions, office hours, etc.)
CREATE TABLE events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cop_id          UUID NOT NULL REFERENCES cops(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    event_type      TEXT,  -- 'training','office_hours','deep_dive','roadmap','community_meet'
    starts_at       TIMESTAMPTZ NOT NULL,
    ends_at         TIMESTAMPTZ,
    location        TEXT,
    speakers        TEXT[],
    max_attendees   INT,
    agenda          TEXT,
    materials       TEXT[],
    status          TEXT DEFAULT 'scheduled',  -- 'scheduled','completed','cancelled'
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_cop ON events(cop_id);
CREATE INDEX idx_events_starts_at ON events(starts_at);
CREATE INDEX idx_events_status ON events(status);

-- 6. Event registrations
CREATE TABLE event_registrations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_unit   TEXT,
    registered_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (event_id, user_id)
);

CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user ON event_registrations(user_id);

-- 7. Event attendance
CREATE TABLE event_attendance (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attended        BOOLEAN NOT NULL DEFAULT FALSE,
    joined_at       TIMESTAMPTZ,
    left_at         TIMESTAMPTZ,
    UNIQUE (event_id, user_id)
);

CREATE INDEX idx_event_attendance_event ON event_attendance(event_id);

-- 8. Content assets (knowledge / training hub)
CREATE TABLE content_assets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cop_id          UUID REFERENCES cops(id) ON DELETE CASCADE, -- nullable if global asset
    title           TEXT NOT NULL,
    description     TEXT,
    url             TEXT NOT NULL,
    asset_type      TEXT,  -- 'video','deck','doc','notebook','dashboard','course'
    skill_level     TEXT,  -- 'beginner','intermediate','advanced'
    persona_tag     TEXT,  -- 'DE','DA','DS','Exec','Analyst'
    tags            TEXT[],
    view_count      INT DEFAULT 0,
    download_count  INT DEFAULT 0,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_assets_cop ON content_assets(cop_id);
CREATE INDEX idx_content_assets_tags ON content_assets USING GIN(tags);
CREATE INDEX idx_content_assets_asset_type ON content_assets(asset_type);

-- 9. Content engagement
CREATE TABLE content_engagement (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID NOT NULL REFERENCES content_assets(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    engagement_type TEXT NOT NULL,  -- 'view','download','like','share'
    engaged_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_engagement_asset ON content_engagement(asset_id);
CREATE INDEX idx_content_engagement_user ON content_engagement(user_id);

-- 10. Surveys
CREATE TABLE surveys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cop_id          UUID REFERENCES cops(id) ON DELETE CASCADE,
    event_id        UUID REFERENCES events(id) ON DELETE SET NULL,
    survey_type     TEXT,  -- 'session_feedback','cop_health','exec_pulse'
    title           TEXT NOT NULL,
    description     TEXT,
    status          TEXT DEFAULT 'active',  -- 'active','closed'
    closes_at       TIMESTAMPTZ,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_surveys_cop ON surveys(cop_id);
CREATE INDEX idx_surveys_event ON surveys(event_id);

-- 11. Survey questions
CREATE TABLE survey_questions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id       UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    question_text   TEXT NOT NULL,
    question_type   TEXT NOT NULL,  -- 'rating','nps','free_text','multi_choice','boolean'
    options         JSONB,  -- for multi_choice questions
    position        INT NOT NULL,
    is_required     BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_survey_questions_survey ON survey_questions(survey_id);

-- 12. Survey responses
CREATE TABLE survey_responses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id       UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_survey_responses_survey ON survey_responses(survey_id);

-- 13. Survey answers
CREATE TABLE survey_answers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id     UUID NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
    question_id     UUID NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
    answer_value    TEXT,
    answer_numeric  NUMERIC,
    UNIQUE (response_id, question_id)
);

CREATE INDEX idx_survey_answers_response ON survey_answers(response_id);

-- 14. KPI metrics
CREATE TABLE kpi_metrics (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cop_id          UUID NOT NULL REFERENCES cops(id) ON DELETE CASCADE,
    metric_name     TEXT NOT NULL,   -- 'MAP','MAU','NPS','DBU','certifications','sessions_count'
    metric_value    NUMERIC NOT NULL,
    metric_date     DATE NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (cop_id, metric_name, metric_date)
);

CREATE INDEX idx_kpi_metrics_cop_date ON kpi_metrics(cop_id, metric_date);
CREATE INDEX idx_kpi_metrics_name ON kpi_metrics(metric_name);

-- 15. Use cases & success stories
CREATE TABLE use_cases (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cop_id          UUID NOT NULL REFERENCES cops(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    problem         TEXT,
    solution        TEXT,
    architecture_url TEXT,
    products_used   TEXT[],
    outcomes        TEXT,
    business_impact JSONB,  -- {"time_saved_pct":30, "cost_savings":100000}
    is_approved     BOOLEAN DEFAULT FALSE,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_use_cases_cop ON use_cases(cop_id);
CREATE INDEX idx_use_cases_products_used ON use_cases USING GIN(products_used);

-- 16. Champions / recognition
CREATE TABLE champions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cop_id          UUID NOT NULL REFERENCES cops(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month           DATE NOT NULL,
    award_type      TEXT NOT NULL,  -- 'brickster_of_the_month','top_speaker','top_contributor'
    citation        TEXT,
    badge_url       TEXT,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (cop_id, user_id, month, award_type)
);

CREATE INDEX idx_champions_cop ON champions(cop_id);
CREATE INDEX idx_champions_user ON champions(user_id);
CREATE INDEX idx_champions_month ON champions(month);

-- 17. Discussion threads
CREATE TABLE discussion_threads (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cop_id          UUID NOT NULL REFERENCES cops(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    content         TEXT,
    product_area    TEXT,
    tags            TEXT[],
    is_resolved     BOOLEAN DEFAULT FALSE,
    view_count      INT DEFAULT 0,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_discussion_threads_cop ON discussion_threads(cop_id);
CREATE INDEX idx_discussion_threads_resolved ON discussion_threads(is_resolved);

-- 18. Discussion replies
CREATE TABLE discussion_replies (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id           UUID NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
    content             TEXT NOT NULL,
    is_accepted_answer  BOOLEAN DEFAULT FALSE,
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_discussion_replies_thread ON discussion_replies(thread_id);

-- 19. Certifications
CREATE TABLE certifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cop_id              UUID REFERENCES cops(id) ON DELETE SET NULL,
    certification_name  TEXT NOT NULL,
    certification_type  TEXT,  -- 'Associate', 'Professional', 'Specialist'
    certification_area  TEXT,  -- 'GenAI', 'Data Engineering', 'ML', etc.
    earned_date         DATE,
    certificate_url     TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_certifications_user ON certifications(user_id);
CREATE INDEX idx_certifications_cop ON certifications(cop_id);

-- 20. Phase roadmap
CREATE TABLE phase_roadmap (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cop_id          UUID NOT NULL REFERENCES cops(id) ON DELETE CASCADE,
    phase           TEXT NOT NULL CHECK (phase IN ('foundation','launch','growth','optimization')),
    task_name       TEXT NOT NULL,
    description     TEXT,
    owner_id        UUID REFERENCES users(id),
    due_date        DATE,
    status          TEXT DEFAULT 'pending',  -- 'pending','in_progress','completed','blocked'
    sequence_order  INT,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_phase_roadmap_cop ON phase_roadmap(cop_id);
CREATE INDEX idx_phase_roadmap_phase ON phase_roadmap(phase);

-- 21. Readiness assessments
CREATE TABLE readiness_assessments (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cop_id                      UUID REFERENCES cops(id) ON DELETE CASCADE,
    customer_id                 UUID REFERENCES customers(id) ON DELETE CASCADE,
    conducted_by                UUID REFERENCES users(id),
    platform_adoption_score     INT CHECK (platform_adoption_score BETWEEN 1 AND 5),
    user_maturity_score         INT CHECK (user_maturity_score BETWEEN 1 AND 5),
    leadership_buyin_score      INT CHECK (leadership_buyin_score BETWEEN 1 AND 5),
    champions_score             INT CHECK (champions_score BETWEEN 1 AND 5),
    enablement_momentum_score   INT CHECK (enablement_momentum_score BETWEEN 1 AND 5),
    governance_pain_score       INT CHECK (governance_pain_score BETWEEN 1 AND 5),
    collaboration_tools_score   INT CHECK (collaboration_tools_score BETWEEN 1 AND 5),
    innovation_mindset_score    INT CHECK (innovation_mindset_score BETWEEN 1 AND 5),
    total_score                 INT,
    readiness_level             TEXT,  -- 'highly_ready','partially_ready','not_ready'
    recommendations             TEXT,
    notes                       TEXT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_readiness_assessments_cop ON readiness_assessments(cop_id);
CREATE INDEX idx_readiness_assessments_customer ON readiness_assessments(customer_id);

-- 22. Templates
CREATE TABLE templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    description     TEXT,
    type            TEXT NOT NULL,  -- 'charter','newsletter','agenda','survey','email'
    content         TEXT,
    file_url        TEXT,
    version         TEXT DEFAULT '1.0',
    is_active       BOOLEAN DEFAULT TRUE,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_templates_type ON templates(type);
CREATE INDEX idx_templates_active ON templates(is_active);

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to relevant tables
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cops_updated_at BEFORE UPDATE ON cops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_assets_updated_at BEFORE UPDATE ON content_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON surveys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_use_cases_updated_at BEFORE UPDATE ON use_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discussion_threads_updated_at BEFORE UPDATE ON discussion_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discussion_replies_updated_at BEFORE UPDATE ON discussion_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


