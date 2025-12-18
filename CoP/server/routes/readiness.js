import express from 'express';
import pool from '../db/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create readiness assessment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      cop_id,
      platform_adoption_score,
      user_maturity_score,
      leadership_buyin_score,
      champions_score,
      enablement_momentum_score,
      governance_pain_score,
      collaboration_tools_score,
      innovation_mindset_score,
      notes
    } = req.body;
    
    // Calculate total score
    const total_score = 
      platform_adoption_score +
      user_maturity_score +
      leadership_buyin_score +
      champions_score +
      enablement_momentum_score +
      governance_pain_score +
      collaboration_tools_score +
      innovation_mindset_score;
    
    // Determine readiness level
    let readiness_level, recommendations;
    if (total_score >= 35) {
      readiness_level = 'highly_ready';
      recommendations = 'Customer is highly ready for CoP launch. Proceed with planning and charter development. Focus on quick wins and establish regular cadence.';
    } else if (total_score >= 25) {
      readiness_level = 'partially_ready';
      recommendations = 'Customer is partially ready. Address gaps in lower-scoring areas before full launch. Consider a pilot CoP with core champions first.';
    } else {
      readiness_level = 'not_ready';
      recommendations = 'Customer is not ready for CoP at this time. Focus on foundational adoption, enablement, and building champion network first.';
    }
    
    const result = await pool.query(`
      INSERT INTO readiness_assessments (
        cop_id, conducted_by,
        platform_adoption_score, user_maturity_score, leadership_buyin_score,
        champions_score, enablement_momentum_score, governance_pain_score,
        collaboration_tools_score, innovation_mindset_score,
        total_score, readiness_level, recommendations, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      cop_id, req.user.id,
      platform_adoption_score, user_maturity_score, leadership_buyin_score,
      champions_score, enablement_momentum_score, governance_pain_score,
      collaboration_tools_score, innovation_mindset_score,
      total_score, readiness_level, recommendations, notes
    ]);
    
    res.status(201).json({ assessment: result.rows[0] });
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

// Get readiness assessment by CoP ID
router.get('/cop/:copId', authenticateToken, async (req, res) => {
  try {
    const { copId } = req.params;
    
    const result = await pool.query(`
      SELECT ra.*, u.first_name || ' ' || u.last_name as conducted_by_name
      FROM readiness_assessments ra
      LEFT JOIN users u ON ra.conducted_by = u.id
      WHERE ra.cop_id = $1
      ORDER BY ra.created_at DESC
    `, [copId]);
    
    res.json({ assessments: result.rows });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ error: 'Failed to get assessments' });
  }
});

// Get single assessment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT ra.*, 
             u.first_name || ' ' || u.last_name as conducted_by_name,
             c.name as cop_name, c.customer_name
      FROM readiness_assessments ra
      LEFT JOIN users u ON ra.conducted_by = u.id
      LEFT JOIN cop_communities c ON ra.cop_id = c.id
      WHERE ra.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    res.json({ assessment: result.rows[0] });
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({ error: 'Failed to get assessment' });
  }
});

export default router;


