const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const genAIFramework = require('../data/genai-readiness-framework');

// Get the framework structure
router.get('/framework', (req, res) => {
  res.json(genAIFramework);
});

// Save a new assessment
router.post('/assessments', async (req, res) => {
  try {
    const { customerName, responses, scores, totalScore, maxScore, maturityLevel, completedAt } = req.body;
    
    const result = await db.query(
      `INSERT INTO genai_assessments 
       (customer_name, responses, scores, total_score, max_score, maturity_level, completed_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id`,
      [
        customerName,
        JSON.stringify(responses),
        JSON.stringify(scores),
        totalScore,
        maxScore,
        maturityLevel,
        completedAt
      ]
    );

    res.json({ id: result.rows[0].id, message: 'Assessment saved successfully' });
  } catch (error) {
    console.error('Error saving assessment:', error);
    res.status(500).json({ error: 'Failed to save assessment' });
  }
});

// Get a specific assessment
router.get('/assessments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'SELECT * FROM genai_assessments WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const assessment = result.rows[0];
    res.json({
      id: assessment.id,
      customerName: assessment.customer_name,
      responses: assessment.responses,
      scores: assessment.scores,
      totalScore: assessment.total_score,
      maxScore: assessment.max_score,
      maturityLevel: assessment.maturity_level,
      completedAt: assessment.completed_at,
      createdAt: assessment.created_at
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

// Get all assessments (for dashboard/list view)
router.get('/assessments', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, customer_name, total_score, max_score, maturity_level, completed_at, created_at FROM genai_assessments ORDER BY created_at DESC'
    );

    const assessments = result.rows.map(row => ({
      id: row.id,
      customerName: row.customer_name,
      totalScore: row.total_score,
      maxScore: row.max_score,
      maturityLevel: row.maturity_level,
      completedAt: row.completed_at,
      createdAt: row.created_at
    }));

    res.json(assessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// Delete an assessment
router.delete('/assessments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query('DELETE FROM genai_assessments WHERE id = $1', [id]);
    
    res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    res.status(500).json({ error: 'Failed to delete assessment' });
  }
});

module.exports = router;

