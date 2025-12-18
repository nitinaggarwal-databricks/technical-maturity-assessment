import express from 'express';
import pool from '../db/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all users (for dropdowns, stakeholder selection, etc.)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { role, organization, search } = req.query;
    
    let query = `
      SELECT id, email, first_name, last_name, role, organization
      FROM users
      WHERE 1=1
    `;
    
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
    if (search) {
      query += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    query += ' ORDER BY first_name, last_name LIMIT 100';
    
    const result = await pool.query(query, params);
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get single user
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT id, email, first_name, last_name, role, organization, created_at, last_login
      FROM users
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;


