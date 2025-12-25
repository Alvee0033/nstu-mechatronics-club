import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import membersRouter from './routes/members';
import eventsRouter from './routes/events';
import projectsRouter from './routes/projects';
import achievementsRouter from './routes/achievements';
import meetingsRouter from './routes/meetings'; // New import

dotenv.config();

// Ensure admin initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const app: Express = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Routes
app.use('/api/members', membersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/achievements', achievementsRouter);
app.use('/api/meetings', meetingsRouter);

// Export as Cloud Function
export const api = functions.https.onRequest(app);
