import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import './config/env.js';
import authRoutes from './routes/authRoutes.js';
import emailRoutes from './routes/accountRoutes.js';
import { errorHandler, notFound } from './middleware/errors.js';

const app = express();
const origins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((item) => item.trim());

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: origins, credentials: false }));
app.use(express.json({ limit: '20kb', strict: true }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false }), authRoutes);
app.use('/api/emails', emailRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
