import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from '../routers.js';
import { createContext } from './trpc.js';
import { env } from './env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: env.APP_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// ─── tRPC ─────────────────────────────────────────────────────────────────────

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// ─── Static / Vite ────────────────────────────────────────────────────────────

// __dirname at runtime: dist/server/server/_core/
// Vite output:          dist/public/
const distPath = path.resolve(__dirname, '../../../public');
const indexHtml = path.join(distPath, 'index.html');

app.use(express.static(distPath, { index: false }));
app.get('*', (_req, res) => {
  res.sendFile(indexHtml);
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(env.PORT, () => {
  console.log(`Seeking Higher Church server running on http://localhost:${env.PORT}`);
});

export type { AppRouter } from '../routers.js';
