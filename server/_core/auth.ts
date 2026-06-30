import jwt from 'jsonwebtoken';
import { env } from './env.js';

interface SessionPayload {
  userId: number;
  email: string;
}

export async function signSession(userId: number, email: string): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { userId, email } satisfies SessionPayload,
      env.SESSION_SECRET,
      { algorithm: 'HS256' },
      (err, token) => {
        if (err || !token) {
          reject(err ?? new Error('Failed to sign token'));
        } else {
          resolve(token);
        }
      }
    );
  });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const payload = jwt.verify(token, env.SESSION_SECRET, {
      algorithms: ['HS256'],
    });
    if (
      typeof payload === 'object' &&
      payload !== null &&
      typeof (payload as SessionPayload).userId === 'number' &&
      typeof (payload as SessionPayload).email === 'string'
    ) {
      return payload as SessionPayload;
    }
    return null;
  } catch {
    return null;
  }
}
