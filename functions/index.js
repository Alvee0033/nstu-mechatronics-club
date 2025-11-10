const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const membersRouter = require('./src/routes/members');
const eventsRouter = require('./src/routes/events');
const projectsRouter = require('./src/routes/projects');
const achievementsRouter = require('./src/routes/achievements');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/members', membersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/achievements', achievementsRouter);

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);