import express from 'express';
import pool from '../db/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all content (with filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, type, audience_level, persona, is_global, search } = req.query;
    
    let query = `
      SELECT ca.*, u.first_name || ' ' || u.last_name as created_by_name
      FROM content_assets ca
      LEFT JOIN users u ON ca.created_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (category) {
      query += ` AND ca.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    if (type) {
      query += ` AND ca.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    if (audience_level) {
      query += ` AND ca.audience_level = $${paramIndex}`;
      params.push(audience_level);
      paramIndex++;
    }
    if (persona) {
      query += ` AND $${paramIndex} = ANY(ca.personas)`;
      params.push(persona);
      paramIndex++;
    }
    if (is_global !== undefined) {
      query += ` AND ca.is_global = $${paramIndex}`;
      params.push(is_global === 'true');
      paramIndex++;
    }
    if (search) {
      query += ` AND (ca.title ILIKE $${paramIndex} OR ca.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    query += ' ORDER BY ca.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ content: result.rows });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to get content' });
  }
});

// Get content by CoP
router.get('/cop/:copId', authenticateToken, async (req, res) => {
  try {
    const { copId } = req.params;
    
    const result = await pool.query(`
      SELECT ca.*, cc.is_required, cc.sequence_order, cc.added_at,
             u.first_name || ' ' || u.last_name as created_by_name
      FROM cop_content cc
      JOIN content_assets ca ON cc.content_id = ca.id
      LEFT JOIN users u ON ca.created_by = u.id
      WHERE cc.cop_id = $1
      ORDER BY cc.sequence_order, cc.added_at
    `, [copId]);
    
    res.json({ content: result.rows });
  } catch (error) {
    console.error('Get CoP content error:', error);
    res.status(500).json({ error: 'Failed to get CoP content' });
  }
});

// Create content asset
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title, description, type, category, audience_level, personas,
      url, file_path, tags, is_global
    } = req.body;
    
    const result = await pool.query(`
      INSERT INTO content_assets (
        title, description, type, category, audience_level, personas,
        url, file_path, tags, is_global, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [title, description, type, category, audience_level, personas,
        url, file_path, tags, is_global, req.user.id]);
    
    res.status(201).json({ content: result.rows[0] });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ error: 'Failed to create content' });
  }
});

// Add content to CoP
router.post('/cop/:copId/add/:contentId', authenticateToken, async (req, res) => {
  try {
    const { copId, contentId } = req.params;
    const { is_required, sequence_order } = req.body;
    
    const result = await pool.query(`
      INSERT INTO cop_content (cop_id, content_id, is_required, sequence_order)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [copId, contentId, is_required, sequence_order]);
    
    res.status(201).json({ copContent: result.rows[0] });
  } catch (error) {
    console.error('Add content to CoP error:', error);
    res.status(500).json({ error: 'Failed to add content to CoP' });
  }
});

// Track content view
router.post('/:id/view', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(`
      UPDATE content_assets
      SET views = views + 1
      WHERE id = $1
    `, [id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({ error: 'Failed to track view' });
  }
});

// Track content download
router.post('/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(`
      UPDATE content_assets
      SET downloads = downloads + 1
      WHERE id = $1
    `, [id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Track download error:', error);
    res.status(500).json({ error: 'Failed to track download' });
  }
});

export default router;


