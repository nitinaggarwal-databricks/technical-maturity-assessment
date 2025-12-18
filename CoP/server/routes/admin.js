import express from 'express';
import pool from '../db/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require admin role
router.use(authenticateToken, authorizeRoles('admin'));

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { role, organization } = req.query;
    
    let query = 'SELECT id, email, first_name, last_name, role, organization, created_at, last_login FROM users WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (role) {
      query += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }
    if (organization) {
      query += ` AND organization ILIKE $${paramIndex}`;
      params.push(`%${organization}%`);
      paramIndex++;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const result = await pool.query(`
      UPDATE users
      SET role = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email, first_name, last_name, role, organization
    `, [role, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Get templates
router.get('/templates', async (req, res) => {
  try {
    const { type, is_active } = req.query;
    
    let query = `
      SELECT t.*, u.first_name || ' ' || u.last_name as created_by_name
      FROM templates t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (type) {
      query += ` AND t.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    if (is_active !== undefined) {
      query += ` AND t.is_active = $${paramIndex}`;
      params.push(is_active === 'true');
      paramIndex++;
    }
    
    query += ' ORDER BY t.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ templates: result.rows });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

// Create template
router.post('/templates', async (req, res) => {
  try {
    const { name, description, type, content, file_url, version } = req.body;
    
    const result = await pool.query(`
      INSERT INTO templates (name, description, type, content, file_url, version, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [name, description, type, content, file_url, version, req.user.id]);
    
    res.status(201).json({ template: result.rows[0] });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update template
router.put('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type, content, file_url, version, is_active } = req.body;
    
    const result = await pool.query(`
      UPDATE templates
      SET name = $1, description = $2, type = $3, content = $4, 
          file_url = $5, version = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [name, description, type, content, file_url, version, is_active, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json({ template: result.rows[0] });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM cop_communities WHERE status = 'active') as active_cops,
        (SELECT COUNT(*) FROM events WHERE event_date > NOW()) as upcoming_events,
        (SELECT COUNT(*) FROM content_assets WHERE is_global = true) as global_content_count,
        (SELECT SUM(monthly_active_users) FROM (
          SELECT DISTINCT ON (cop_id) monthly_active_users
          FROM kpi_metrics
          ORDER BY cop_id, metric_date DESC
        ) as latest_mau) as total_mau,
        (SELECT AVG(avg_nps) FROM (
          SELECT DISTINCT ON (cop_id) avg_nps
          FROM kpi_metrics
          WHERE avg_nps IS NOT NULL
          ORDER BY cop_id, metric_date DESC
        ) as latest_nps) as overall_avg_nps
    `);
    
    res.json({ stats: stats.rows[0] });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Get certifications
router.get('/certifications', async (req, res) => {
  try {
    const { cop_id, certification_type } = req.query;
    
    let query = `
      SELECT cert.*, u.first_name, u.last_name, u.email,
             c.name as cop_name, c.customer_name
      FROM certifications cert
      JOIN users u ON cert.user_id = u.id
      LEFT JOIN cop_communities c ON cert.cop_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (cop_id) {
      query += ` AND cert.cop_id = $${paramIndex}`;
      params.push(cop_id);
      paramIndex++;
    }
    if (certification_type) {
      query += ` AND cert.certification_type = $${paramIndex}`;
      params.push(certification_type);
      paramIndex++;
    }
    
    query += ' ORDER BY cert.earned_date DESC';
    
    const result = await pool.query(query, params);
    res.json({ certifications: result.rows });
  } catch (error) {
    console.error('Get certifications error:', error);
    res.status(500).json({ error: 'Failed to get certifications' });
  }
});

// Add certification
router.post('/certifications', async (req, res) => {
  try {
    const {
      user_id, cop_id, certification_name, certification_type,
      certification_area, earned_date, certificate_url
    } = req.body;
    
    const result = await pool.query(`
      INSERT INTO certifications (
        user_id, cop_id, certification_name, certification_type,
        certification_area, earned_date, certificate_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [user_id, cop_id, certification_name, certification_type,
        certification_area, earned_date, certificate_url]);
    
    res.status(201).json({ certification: result.rows[0] });
  } catch (error) {
    console.error('Add certification error:', error);
    res.status(500).json({ error: 'Failed to add certification' });
  }
});

export default router;


