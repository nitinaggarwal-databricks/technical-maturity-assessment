import express from 'express';
import pool from '../db/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all events (with filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { cop_id, event_type, status, from_date, to_date } = req.query;
    
    let query = `
      SELECT e.*, c.name as cop_name, c.customer_name,
             u.first_name || ' ' || u.last_name as created_by_name,
             (SELECT COUNT(*) FROM event_attendance WHERE event_id = e.id) as registered_count,
             (SELECT COUNT(*) FROM event_attendance WHERE event_id = e.id AND attended = true) as attended_count
      FROM events e
      LEFT JOIN cop_communities c ON e.cop_id = c.id
      LEFT JOIN users u ON e.created_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (cop_id) {
      query += ` AND e.cop_id = $${paramIndex}`;
      params.push(cop_id);
      paramIndex++;
    }
    if (event_type) {
      query += ` AND e.event_type = $${paramIndex}`;
      params.push(event_type);
      paramIndex++;
    }
    if (status) {
      query += ` AND e.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (from_date) {
      query += ` AND e.event_date >= $${paramIndex}`;
      params.push(from_date);
      paramIndex++;
    }
    if (to_date) {
      query += ` AND e.event_date <= $${paramIndex}`;
      params.push(to_date);
      paramIndex++;
    }
    
    query += ' ORDER BY e.event_date ASC';
    
    const result = await pool.query(query, params);
    res.json({ events: result.rows });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

// Get single event
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT e.*, c.name as cop_name, c.customer_name,
             u.first_name || ' ' || u.last_name as created_by_name,
             (SELECT COUNT(*) FROM event_attendance WHERE event_id = e.id) as registered_count,
             (SELECT COUNT(*) FROM event_attendance WHERE event_id = e.id AND attended = true) as attended_count
      FROM events e
      LEFT JOIN cop_communities c ON e.cop_id = c.id
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Get attendees
    const attendees = await pool.query(`
      SELECT ea.*, u.first_name, u.last_name, u.email, u.organization
      FROM event_attendance ea
      JOIN users u ON ea.user_id = u.id
      WHERE ea.event_id = $1
      ORDER BY ea.registered_at
    `, [id]);
    
    res.json({ 
      event: result.rows[0],
      attendees: attendees.rows
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to get event' });
  }
});

// Create event
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      cop_id, title, description, event_type, event_date, duration_minutes,
      location, speakers, max_attendees, agenda, materials
    } = req.body;
    
    const result = await pool.query(`
      INSERT INTO events (
        cop_id, title, description, event_type, event_date, duration_minutes,
        location, speakers, max_attendees, agenda, materials, created_by, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'scheduled')
      RETURNING *
    `, [cop_id, title, description, event_type, event_date, duration_minutes,
        location, speakers, max_attendees, agenda, materials, req.user.id]);
    
    res.status(201).json({ event: result.rows[0] });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, event_type, event_date, duration_minutes,
      location, speakers, max_attendees, agenda, materials, status
    } = req.body;
    
    const result = await pool.query(`
      UPDATE events
      SET title = $1, description = $2, event_type = $3, event_date = $4,
          duration_minutes = $5, location = $6, speakers = $7, max_attendees = $8,
          agenda = $9, materials = $10, status = $11, updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *
    `, [title, description, event_type, event_date, duration_minutes,
        location, speakers, max_attendees, agenda, materials, status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ event: result.rows[0] });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Register for event
router.post('/:id/register', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { business_unit } = req.body;
    
    // Check if already registered
    const existing = await pool.query(
      'SELECT * FROM event_attendance WHERE event_id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }
    
    const result = await pool.query(`
      INSERT INTO event_attendance (event_id, user_id, business_unit)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [id, req.user.id, business_unit]);
    
    res.status(201).json({ attendance: result.rows[0] });
  } catch (error) {
    console.error('Register event error:', error);
    res.status(500).json({ error: 'Failed to register for event' });
  }
});

// Mark attendance
router.put('/:eventId/attendance/:userId', authenticateToken, async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    const { attended } = req.body;
    
    const result = await pool.query(`
      UPDATE event_attendance
      SET attended = $1
      WHERE event_id = $2 AND user_id = $3
      RETURNING *
    `, [attended, eventId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    res.json({ attendance: result.rows[0] });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

export default router;


