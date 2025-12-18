import express from 'express';
import pool from '../db/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Discussion threads
router.get('/discussions', authenticateToken, async (req, res) => {
  try {
    const { cop_id, product_area, is_resolved } = req.query;
    
    let query = `
      SELECT dt.*, u.first_name || ' ' || u.last_name as author_name,
             (SELECT COUNT(*) FROM discussion_replies WHERE thread_id = dt.id) as reply_count
      FROM discussion_threads dt
      LEFT JOIN users u ON dt.created_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (cop_id) {
      query += ` AND dt.cop_id = $${paramIndex}`;
      params.push(cop_id);
      paramIndex++;
    }
    if (product_area) {
      query += ` AND dt.product_area = $${paramIndex}`;
      params.push(product_area);
      paramIndex++;
    }
    if (is_resolved !== undefined) {
      query += ` AND dt.is_resolved = $${paramIndex}`;
      params.push(is_resolved === 'true');
      paramIndex++;
    }
    
    query += ' ORDER BY dt.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ threads: result.rows });
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({ error: 'Failed to get threads' });
  }
});

// Get single thread with replies
router.get('/discussions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const threadResult = await pool.query(`
      SELECT dt.*, u.first_name || ' ' || u.last_name as author_name, u.email as author_email
      FROM discussion_threads dt
      LEFT JOIN users u ON dt.created_by = u.id
      WHERE dt.id = $1
    `, [id]);
    
    if (threadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    
    // Update views
    await pool.query('UPDATE discussion_threads SET views = views + 1 WHERE id = $1', [id]);
    
    const repliesResult = await pool.query(`
      SELECT dr.*, u.first_name || ' ' || u.last_name as author_name, u.email as author_email
      FROM discussion_replies dr
      LEFT JOIN users u ON dr.created_by = u.id
      WHERE dr.thread_id = $1
      ORDER BY dr.is_accepted_answer DESC, dr.created_at ASC
    `, [id]);
    
    res.json({ 
      thread: threadResult.rows[0],
      replies: repliesResult.rows
    });
  } catch (error) {
    console.error('Get thread error:', error);
    res.status(500).json({ error: 'Failed to get thread' });
  }
});

// Create discussion thread
router.post('/discussions', authenticateToken, async (req, res) => {
  try {
    const { cop_id, title, content, product_area, tags } = req.body;
    
    const result = await pool.query(`
      INSERT INTO discussion_threads (cop_id, title, content, product_area, tags, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [cop_id, title, content, product_area, tags, req.user.id]);
    
    res.status(201).json({ thread: result.rows[0] });
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({ error: 'Failed to create thread' });
  }
});

// Reply to thread
router.post('/discussions/:id/replies', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    const result = await pool.query(`
      INSERT INTO discussion_replies (thread_id, content, created_by)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [id, content, req.user.id]);
    
    // Update thread's updated_at
    await pool.query('UPDATE discussion_threads SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    
    res.status(201).json({ reply: result.rows[0] });
  } catch (error) {
    console.error('Create reply error:', error);
    res.status(500).json({ error: 'Failed to create reply' });
  }
});

// Mark reply as accepted answer
router.put('/replies/:id/accept', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get thread_id first
    const replyResult = await pool.query('SELECT thread_id FROM discussion_replies WHERE id = $1', [id]);
    if (replyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Reply not found' });
    }
    
    const threadId = replyResult.rows[0].thread_id;
    
    // Unmark all other replies
    await pool.query('UPDATE discussion_replies SET is_accepted_answer = false WHERE thread_id = $1', [threadId]);
    
    // Mark this reply as accepted
    const result = await pool.query(`
      UPDATE discussion_replies
      SET is_accepted_answer = true
      WHERE id = $1
      RETURNING *
    `, [id]);
    
    // Mark thread as resolved
    await pool.query('UPDATE discussion_threads SET is_resolved = true WHERE id = $1', [threadId]);
    
    res.json({ reply: result.rows[0] });
  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({ error: 'Failed to accept answer' });
  }
});

// Get champions
router.get('/champions', authenticateToken, async (req, res) => {
  try {
    const { cop_id, recognition_type, month } = req.query;
    
    let query = `
      SELECT ch.*, u.first_name, u.last_name, u.email, u.organization
      FROM champions ch
      JOIN users u ON ch.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (cop_id) {
      query += ` AND ch.cop_id = $${paramIndex}`;
      params.push(cop_id);
      paramIndex++;
    }
    if (recognition_type) {
      query += ` AND ch.recognition_type = $${paramIndex}`;
      params.push(recognition_type);
      paramIndex++;
    }
    if (month) {
      query += ` AND ch.month = $${paramIndex}`;
      params.push(month);
      paramIndex++;
    }
    
    query += ' ORDER BY ch.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ champions: result.rows });
  } catch (error) {
    console.error('Get champions error:', error);
    res.status(500).json({ error: 'Failed to get champions' });
  }
});

// Create champion recognition
router.post('/champions', authenticateToken, async (req, res) => {
  try {
    const { cop_id, user_id, recognition_type, month, reason, badge_url } = req.body;
    
    const result = await pool.query(`
      INSERT INTO champions (cop_id, user_id, recognition_type, month, reason, badge_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [cop_id, user_id, recognition_type, month, reason, badge_url]);
    
    res.status(201).json({ champion: result.rows[0] });
  } catch (error) {
    console.error('Create champion error:', error);
    res.status(500).json({ error: 'Failed to create champion' });
  }
});

// Get use cases
router.get('/use-cases', authenticateToken, async (req, res) => {
  try {
    const { cop_id, vertical, domain, is_approved } = req.query;
    
    let query = `
      SELECT uc.*, u.first_name || ' ' || u.last_name as created_by_name,
             c.name as cop_name, c.customer_name
      FROM use_cases uc
      LEFT JOIN users u ON uc.created_by = u.id
      LEFT JOIN cop_communities c ON uc.cop_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (cop_id) {
      query += ` AND uc.cop_id = $${paramIndex}`;
      params.push(cop_id);
      paramIndex++;
    }
    if (vertical) {
      query += ` AND uc.vertical = $${paramIndex}`;
      params.push(vertical);
      paramIndex++;
    }
    if (domain) {
      query += ` AND uc.domain = $${paramIndex}`;
      params.push(domain);
      paramIndex++;
    }
    if (is_approved !== undefined) {
      query += ` AND uc.is_approved = $${paramIndex}`;
      params.push(is_approved === 'true');
      paramIndex++;
    }
    
    query += ' ORDER BY uc.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ useCases: result.rows });
  } catch (error) {
    console.error('Get use cases error:', error);
    res.status(500).json({ error: 'Failed to get use cases' });
  }
});

// Create use case
router.post('/use-cases', authenticateToken, async (req, res) => {
  try {
    const {
      cop_id, title, description, problem_statement, solution,
      databricks_features, outcomes, architecture_diagram_url, vertical, domain
    } = req.body;
    
    const result = await pool.query(`
      INSERT INTO use_cases (
        cop_id, title, description, problem_statement, solution,
        databricks_features, outcomes, architecture_diagram_url, vertical, domain, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [cop_id, title, description, problem_statement, solution,
        databricks_features, outcomes, architecture_diagram_url, vertical, domain, req.user.id]);
    
    res.status(201).json({ useCase: result.rows[0] });
  } catch (error) {
    console.error('Create use case error:', error);
    res.status(500).json({ error: 'Failed to create use case' });
  }
});

// Approve use case
router.put('/use-cases/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      UPDATE use_cases
      SET is_approved = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Use case not found' });
    }
    
    res.json({ useCase: result.rows[0] });
  } catch (error) {
    console.error('Approve use case error:', error);
    res.status(500).json({ error: 'Failed to approve use case' });
  }
});

export default router;


