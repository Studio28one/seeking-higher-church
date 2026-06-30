function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  DATABASE_URL: requireEnv('DATABASE_URL'),
  SESSION_SECRET: requireEnv('SESSION_SECRET'),
  APP_URL: requireEnv('APP_URL', 'http://localhost:3001'),
  RESEND_API_KEY: requireEnv('RESEND_API_KEY'),
  FROM_EMAIL: requireEnv('FROM_EMAIL', 'noreply@seekinghigher.church'),
  STRIPE_SECRET_KEY: process.env['STRIPE_SECRET_KEY'] ?? '',
  STRIPE_WEBHOOK_SECRET: process.env['STRIPE_WEBHOOK_SECRET'] ?? '',
  PORT: parseInt(process.env['PORT'] ?? '3001', 10),
  NODE_ENV: process.env['NODE_ENV'] ?? 'development',
} as const;
