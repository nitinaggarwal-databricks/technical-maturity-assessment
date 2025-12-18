import express from 'express';
import pool from '../db/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get surveys
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { cop_id, survey_type, status } = req.query;
    
    let query = `
      SELECT s.*, c.name as cop_name,
             u.first_name || ' ' || u.last_name as created_by_name,
             (SELECT COUNT(*) FROM survey_responses WHERE survey_id = s.id) as response_count
      FROM surveys s
      LEFT JOIN cop_communities c ON s.cop_id = c.id
      LEFT JOIN users u ON s.created_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (cop_id) {
      query += ` AND s.cop_id = $${paramIndex}`;
      params.push(cop_id);
      paramIndex++;
    }
    if (survey_type) {
      query += ` AND s.survey_type = $${paramIndex}`;
      params.push(survey_type);
      paramIndex++;
    }
    if (status) {
      query += ` AND s.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    query += ' ORDER BY s.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ surveys: result.rows });
  } catch (error) {
    console.error('Get surveys error:', error);
    res.status(500).json({ error: 'Failed to get surveys' });
  }
});

// Get single survey
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT s.*, c.name as cop_name, c.customer_name,
             u.first_name || ' ' || u.last_name as created_by_name,
             (SELECT COUNT(*) FROM survey_responses WHERE survey_id = s.id) as response_count
      FROM surveys s
      LEFT JOIN cop_communities c ON s.cop_id = c.id
      LEFT JOIN users u ON s.created_by = u.id
      WHERE s.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    res.json({ survey: result.rows[0] });
  } catch (error) {
    console.error('Get survey error:', error);
    res.status(500).json({ error: 'Failed to get survey' });
  }
});

// Create survey
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { cop_id, event_id, title, description, survey_type, questions, closes_at } = req.body;
    
    const result = await pool.query(`
      INSERT INTO surveys (cop_id, event_id, title, description, survey_type, questions, closes_at, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [cop_id, event_id, title, description, survey_type, questions, closes_at, req.user.id]);
    
    res.status(201).json({ survey: result.rows[0] });
  } catch (error) {
    console.error('Create survey error:', error);
    res.status(500).json({ error: 'Failed to create survey' });
  }
});

// Submit survey response
router.post('/:id/responses', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { responses, nps_score } = req.body;
    
    // Check if already responded
    const existing = await pool.query(
      'SELECT * FROM survey_responses WHERE survey_id = $1 AND respondent_id = $2',
      [id, req.user.id]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already responded to this survey' });
    }
    
    const result = await pool.query(`
      INSERT INTO survey_responses (survey_id, respondent_id, responses, nps_score)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [id, req.user.id, responses, nps_score]);
    
    // Update event feedback_submitted if this is a session feedback survey
    const surveyResult = await pool.query('SELECT event_id FROM surveys WHERE id = $1', [id]);
    if (surveyResult.rows[0]?.event_id) {
      await pool.query(`
        UPDATE event_attendance
        SET feedback_submitted = true
        WHERE event_id = $1 AND user_id = $2
      `, [surveyResult.rows[0].event_id, req.user.id]);
    }
    
    res.status(201).json({ response: result.rows[0] });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({ error: 'Failed to submit response' });
  }
});

// Get survey responses (aggregated)
router.get('/:id/responses', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const responses = await pool.query(`
      SELECT sr.*, u.first_name || ' ' || u.last_name as respondent_name
      FROM survey_responses sr
      LEFT JOIN users u ON sr.respondent_id = u.id
      WHERE sr.survey_id = $1
      ORDER BY sr.submitted_at DESC
    `, [id]);
    
    // Calculate NPS
    const npsResult = await pool.query(`
      SELECT AVG(nps_score) as avg_nps
      FROM survey_responses
      WHERE survey_id = $1 AND nps_score IS NOT NULL
    `, [id]);
    
    res.json({ 
      responses: responses.rows,
      avgNps: npsResult.rows[0]?.avg_nps || null
    });
  } catch (error) {
    console.error('Get responses error:', error);
    res.status(500).json({ error: 'Failed to get responses' });
  }
});

// Close survey
router.put('/:id/close', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      UPDATE surveys
      SET status = 'closed', closes_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    res.json({ survey: result.rows[0] });
  } catch (error) {
    console.error('Close survey error:', error);
    res.status(500).json({ error: 'Failed to close survey' });
  }
});

export default router;


