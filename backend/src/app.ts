import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();

app.disable('x-powered-by');

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

app.use(errorHandler);

export default app;
