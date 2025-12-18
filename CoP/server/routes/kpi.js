import express from 'express';
import pool from '../db/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get KPI metrics
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { cop_id, from_date, to_date } = req.query;
    
    let query = `
      SELECT k.*, c.name as cop_name, c.customer_name
      FROM kpi_metrics k
      LEFT JOIN cop_communities c ON k.cop_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (cop_id) {
      query += ` AND k.cop_id = $${paramIndex}`;
      params.push(cop_id);
      paramIndex++;
    }
    if (from_date) {
      query += ` AND k.metric_date >= $${paramIndex}`;
      params.push(from_date);
      paramIndex++;
    }
    if (to_date) {
      query += ` AND k.metric_date <= $${paramIndex}`;
      params.push(to_date);
      paramIndex++;
    }
    
    query += ' ORDER BY k.cop_id, k.metric_date';
    
    const result = await pool.query(query, params);
    res.json({ metrics: result.rows });
  } catch (error) {
    console.error('Get KPI metrics error:', error);
    res.status(500).json({ error: 'Failed to get KPI metrics' });
  }
});

// Get latest KPI summary for CoP
router.get('/cop/:copId/summary', authenticateToken, async (req, res) => {
  try {
    const { copId } = req.params;
    
    // Get latest metrics
    const latest = await pool.query(`
      SELECT * FROM kpi_metrics
      WHERE cop_id = $1
      ORDER BY metric_date DESC
      LIMIT 1
    `, [copId]);
    
    // Get growth trends (compare to previous month)
    const previous = await pool.query(`
      SELECT * FROM kpi_metrics
      WHERE cop_id = $1
      ORDER BY metric_date DESC
      LIMIT 1 OFFSET 1
    `, [copId]);
    
    // Calculate growth percentages
    let trends = {};
    if (latest.rows[0] && previous.rows[0]) {
      const latestData = latest.rows[0];
      const previousData = previous.rows[0];
      
      trends = {
        mau: calculateGrowth(latestData.monthly_active_users, previousData.monthly_active_users),
        dbu: calculateGrowth(latestData.dbu_consumption, previousData.dbu_consumption),
        map: calculateGrowth(latestData.monthly_active_participants, previousData.monthly_active_participants),
        certifications: calculateGrowth(latestData.num_certifications, previousData.num_certifications),
        useCases: calculateGrowth(latestData.num_use_cases, previousData.num_use_cases)
      };
    }
    
    res.json({ 
      latest: latest.rows[0] || null,
      trends
    });
  } catch (error) {
    console.error('Get KPI summary error:', error);
    res.status(500).json({ error: 'Failed to get KPI summary' });
  }
});

// Create or update KPI metrics
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      cop_id, metric_date, monthly_active_users, dbu_consumption,
      monthly_active_participants, num_sessions, num_certifications,
      num_use_cases, avg_nps, avg_session_satisfaction,
      knowledge_assets_count, knowledge_assets_views
    } = req.body;
    
    // Check if metrics exist for this date
    const existing = await pool.query(
      'SELECT id FROM kpi_metrics WHERE cop_id = $1 AND metric_date = $2',
      [cop_id, metric_date]
    );
    
    let result;
    if (existing.rows.length > 0) {
      // Update existing
      result = await pool.query(`
        UPDATE kpi_metrics
        SET monthly_active_users = $1, dbu_consumption = $2,
            monthly_active_participants = $3, num_sessions = $4, num_certifications = $5,
            num_use_cases = $6, avg_nps = $7, avg_session_satisfaction = $8,
            knowledge_assets_count = $9, knowledge_assets_views = $10
        WHERE cop_id = $11 AND metric_date = $12
        RETURNING *
      `, [monthly_active_users, dbu_consumption, monthly_active_participants,
          num_sessions, num_certifications, num_use_cases, avg_nps, avg_session_satisfaction,
          knowledge_assets_count, knowledge_assets_views, cop_id, metric_date]);
    } else {
      // Insert new
      result = await pool.query(`
        INSERT INTO kpi_metrics (
          cop_id, metric_date, monthly_active_users, dbu_consumption,
          monthly_active_participants, num_sessions, num_certifications,
          num_use_cases, avg_nps, avg_session_satisfaction,
          knowledge_assets_count, knowledge_assets_views
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [cop_id, metric_date, monthly_active_users, dbu_consumption,
          monthly_active_participants, num_sessions, num_certifications,
          num_use_cases, avg_nps, avg_session_satisfaction,
          knowledge_assets_count, knowledge_assets_views]);
    }
    
    res.status(201).json({ metrics: result.rows[0] });
  } catch (error) {
    console.error('Create/update KPI metrics error:', error);
    res.status(500).json({ error: 'Failed to save KPI metrics' });
  }
});

// Get portfolio view (all CoPs aggregated)
router.get('/portfolio', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id, c.name, c.customer_name, c.vertical, c.region, c.phase, c.status,
        k.monthly_active_users, k.dbu_consumption, k.monthly_active_participants,
        k.avg_nps, k.metric_date,
        COUNT(DISTINCT e.id) as upcoming_events_count
      FROM cop_communities c
      LEFT JOIN LATERAL (
        SELECT * FROM kpi_metrics
        WHERE cop_id = c.id
        ORDER BY metric_date DESC
        LIMIT 1
      ) k ON true
      LEFT JOIN events e ON e.cop_id = c.id AND e.event_date > NOW() AND e.status = 'scheduled'
      WHERE c.status = 'active'
      GROUP BY c.id, c.name, c.customer_name, c.vertical, c.region, c.phase, c.status,
               k.monthly_active_users, k.dbu_consumption, k.monthly_active_participants,
               k.avg_nps, k.metric_date
      ORDER BY c.created_at DESC
    `);
    
    res.json({ portfolio: result.rows });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ error: 'Failed to get portfolio' });
  }
});

// Helper function
function calculateGrowth(current, previous) {
  if (!previous || previous === 0) return null;
  return ((current - previous) / previous * 100).toFixed(1);
}

export default router;


