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

if (env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '../../dist/public');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // In development, Vite runs on its own port (5173) and proxies /trpc to us.
  // We just log that the API is running.
  app.get('/', (_req, res) => {
    res.json({ status: 'Seeking Higher Church API', env: 'development' });
  });
}

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(env.PORT, () => {
  console.log(`Seeking Higher Church server running on http://localhost:${env.PORT}`);
});

export type { AppRouter } from '../routers.js';
