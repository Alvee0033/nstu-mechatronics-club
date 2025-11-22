import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import membersRouter from './routes/members';
import eventsRouter from './routes/events';
import projectsRouter from './routes/projects';
import achievementsRouter from './routes/achievements';
import emailRouter from './routes/email';
import doctorsRouter from './routes/doctors';
console.log('Doctors router imported:', !!doctorsRouter);

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// NOTE: API routes are mounted under `/api/*`.
// Removing the root (`/`) JSON response to avoid confusion with the frontend site
// (frontend runs on a different port: 3000). Keep API routes under `/api`.

app.use('/api/members', membersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/achievements', achievementsRouter);
app.use('/api/email', emailRouter);
app.use('/api/doctors', doctorsRouter);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
