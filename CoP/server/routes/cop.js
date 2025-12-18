import express from 'express';
import pool from '../db/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all CoPs (with filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { phase, status, vertical, region } = req.query;
    
    let query = `
      SELECT c.*, 
             u1.first_name || ' ' || u1.last_name as executive_sponsor_name,
             u2.first_name || ' ' || u2.last_name as cop_lead_name,
             u3.first_name || ' ' || u3.last_name as databricks_owner_name
      FROM cop_communities c
      LEFT JOIN users u1 ON c.executive_sponsor_id = u1.id
      LEFT JOIN users u2 ON c.cop_lead_id = u2.id
      LEFT JOIN users u3 ON c.databricks_owner_id = u3.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (phase) {
      query += ` AND c.phase = $${paramIndex}`;
      params.push(phase);
      paramIndex++;
    }
    if (status) {
      query += ` AND c.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (vertical) {
      query += ` AND c.vertical = $${paramIndex}`;
      params.push(vertical);
      paramIndex++;
    }
    if (region) {
      query += ` AND c.region = $${paramIndex}`;
      params.push(region);
      paramIndex++;
    }
    
    query += ' ORDER BY c.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ cops: result.rows });
  } catch (error) {
    console.error('Get CoPs error:', error);
    res.status(500).json({ error: 'Failed to get CoPs' });
  }
});

// Get single CoP by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT c.*, 
             u1.first_name || ' ' || u1.last_name as executive_sponsor_name,
             u1.email as executive_sponsor_email,
             u2.first_name || ' ' || u2.last_name as cop_lead_name,
             u2.email as cop_lead_email,
             u3.first_name || ' ' || u3.last_name as databricks_owner_name,
             u3.email as databricks_owner_email
      FROM cop_communities c
      LEFT JOIN users u1 ON c.executive_sponsor_id = u1.id
      LEFT JOIN users u2 ON c.cop_lead_id = u2.id
      LEFT JOIN users u3 ON c.databricks_owner_id = u3.id
      WHERE c.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'CoP not found' });
    }
    
    // Get stakeholders
    const stakeholders = await pool.query(`
      SELECT s.*, u.first_name, u.last_name, u.email
      FROM stakeholders s
      JOIN users u ON s.user_id = u.id
      WHERE s.cop_id = $1 AND s.active = true
      ORDER BY s.created_at
    `, [id]);
    
    res.json({ 
      cop: result.rows[0],
      stakeholders: stakeholders.rows
    });
  } catch (error) {
    console.error('Get CoP error:', error);
    res.status(500).json({ error: 'Failed to get CoP' });
  }
});

// Create new CoP
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name, customer_name, vertical, region, mission, vision, charter,
      executive_sponsor_id, cop_lead_id, databricks_owner_id
    } = req.body;
    
    const result = await pool.query(`
      INSERT INTO cop_communities (
        name, customer_name, vertical, region, mission, vision, charter,
        executive_sponsor_id, cop_lead_id, databricks_owner_id, phase, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'foundation', 'active')
      RETURNING *
    `, [name, customer_name, vertical, region, mission, vision, charter,
        executive_sponsor_id, cop_lead_id, databricks_owner_id]);
    
    res.status(201).json({ cop: result.rows[0] });
  } catch (error) {
    console.error('Create CoP error:', error);
    res.status(500).json({ error: 'Failed to create CoP' });
  }
});

// Update CoP
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, customer_name, vertical, region, phase, status, mission, vision, charter,
      executive_sponsor_id, cop_lead_id, databricks_owner_id
    } = req.body;
    
    const result = await pool.query(`
      UPDATE cop_communities
      SET name = $1, customer_name = $2, vertical = $3, region = $4, 
          phase = $5, status = $6, mission = $7, vision = $8, charter = $9,
          executive_sponsor_id = $10, cop_lead_id = $11, databricks_owner_id = $12,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *
    `, [name, customer_name, vertical, region, phase, status, mission, vision, charter,
        executive_sponsor_id, cop_lead_id, databricks_owner_id, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'CoP not found' });
    }
    
    res.json({ cop: result.rows[0] });
  } catch (error) {
    console.error('Update CoP error:', error);
    res.status(500).json({ error: 'Failed to update CoP' });
  }
});

// Get CoP phase roadmap
router.get('/:id/roadmap', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { phase } = req.query;
    
    let query = `
      SELECT pr.*, u.first_name || ' ' || u.last_name as owner_name
      FROM phase_roadmap pr
      LEFT JOIN users u ON pr.owner_id = u.id
      WHERE pr.cop_id = $1
    `;
    
    const params = [id];
    
    if (phase) {
      query += ' AND pr.phase = $2';
      params.push(phase);
    }
    
    query += ' ORDER BY pr.phase, pr.sequence_order';
    
    const result = await pool.query(query, params);
    res.json({ roadmap: result.rows });
  } catch (error) {
    console.error('Get roadmap error:', error);
    res.status(500).json({ error: 'Failed to get roadmap' });
  }
});

// Update roadmap task
router.put('/:copId/roadmap/:taskId', authenticateToken, async (req, res) => {
  try {
    const { copId, taskId } = req.params;
    const { status, owner_id, due_date } = req.body;
    
    const completed_at = status === 'completed' ? 'CURRENT_TIMESTAMP' : null;
    
    const result = await pool.query(`
      UPDATE phase_roadmap
      SET status = $1, owner_id = $2, due_date = $3, 
          completed_at = ${completed_at ? completed_at : 'completed_at'}
      WHERE id = $4 AND cop_id = $5
      RETURNING *
    `, [status, owner_id, due_date, taskId, copId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Roadmap task not found' });
    }
    
    res.json({ task: result.rows[0] });
  } catch (error) {
    console.error('Update roadmap task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Add stakeholder to CoP
router.post('/:id/stakeholders', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, role, business_unit, influence_level } = req.body;
    
    const result = await pool.query(`
      INSERT INTO stakeholders (cop_id, user_id, role, business_unit, influence_level)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [id, user_id, role, business_unit, influence_level]);
    
    res.status(201).json({ stakeholder: result.rows[0] });
  } catch (error) {
    console.error('Add stakeholder error:', error);
    res.status(500).json({ error: 'Failed to add stakeholder' });
  }
});

export default router;


