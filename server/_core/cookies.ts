import type { Request } from 'express';
import type { CookieOptions } from 'express';

export function getSessionCookieOptions(req: Request): CookieOptions {
  const isSecure =
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https' ||
    process.env['NODE_ENV'] === 'production';

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    // No maxAge — this is a session cookie (clears on browser close)
  };
}
