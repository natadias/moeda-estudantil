import cors from 'cors';
import express from 'express';
import errorHandler from './middlewares/errorHandler.js';
import routes from './routes/index.js';

const app = express();

const origens = (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',').map((origem) => origem.trim());

app.use(cors({ origin: origens }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', routes);
app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
app.use(errorHandler);

export default app;
