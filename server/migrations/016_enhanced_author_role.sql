-- Migration: Enhanced Author Role - Response Validation & Submission
-- Description: Add tables and columns to support Author response review and validation

-- 1. Response Validations Table
CREATE TABLE IF NOT EXISTS response_validations (
  id SERIAL PRIMARY KEY,
  assessment_id UUID NOT NULL,
  question_id TEXT NOT NULL,
  consumer_id UUID NOT NULL,
  author_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'needs_review', 'clarification_requested')),
  comments TEXT,
  validated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add submission tracking to assessments table
ALTER TABLE assessments 
  ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS submission_notes TEXT;

-- 3. Add validation tracking to question_assignments
ALTER TABLE question_assignments
  ADD COLUMN IF NOT EXISTS validation_status VARCHAR(20) DEFAULT 'not_validated' 
    CHECK (validation_status IN ('not_validated', 'approved', 'needs_review', 'clarification_requested')),
  ADD COLUMN IF NOT EXISTS validated_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS validated_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS validation_comments TEXT;

-- 4. Add author_id to assessments for assignment tracking
ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS assigned_author_id UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS author_assigned_at TIMESTAMP;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_response_validations_assessment ON response_validations(assessment_id);
CREATE INDEX IF NOT EXISTS idx_response_validations_author ON response_validations(author_id);
CREATE INDEX IF NOT EXISTS idx_assessments_author ON assessments(assigned_author_id);
CREATE INDEX IF NOT EXISTS idx_question_assignments_validation ON question_assignments(validation_status);

-- Comments for documentation
COMMENT ON TABLE response_validations IS 'Track Author validation of Consumer responses';
COMMENT ON COLUMN assessments.submitted_by IS 'Author who submitted the final assessment';
COMMENT ON COLUMN assessments.is_locked IS 'Prevents further edits after submission';
COMMENT ON COLUMN assessments.assigned_author_id IS 'Author assigned to coordinate this assessment';

