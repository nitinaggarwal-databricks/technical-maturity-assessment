import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import copRoutes from './routes/cop.js';
import readinessRoutes from './routes/readiness.js';
import contentRoutes from './routes/content.js';
import eventsRoutes from './routes/events.js';
import communityRoutes from './routes/community.js';
import surveysRoutes from './routes/surveys.js';
import kpiRoutes from './routes/kpi.js';
import adminRoutes from './routes/admin.js';
import usersRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cops', copRoutes);
app.use('/api/readiness', readinessRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/surveys', surveysRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CoP Portal API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;


