import dotenv from 'dotenv';
dotenv.config();

console.log('--- DATABASE DIAGNOSTICS ---');
console.log('DATABASE_URL starts with:', (process.env.DATABASE_URL || '').substring(0, 20));
console.log('-----------------------------');

import express from 'express';
import cors from 'cors';
import passport from './config/passport';
import authRoutes from './api/routes/auth.routes';
import questionRoutes from './api/routes/question.routes';
import sessionRoutes from './api/routes/session.routes';
import analyticsRoutes from './api/routes/analytics.routes';
import userRoutes from './api/routes/user.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[SIS-Backend] Server running on port ${PORT}`);
});
