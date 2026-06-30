import { initTRPC, TRPCError } from '@trpc/server';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { verifySession } from './auth.js';
import { getUserById, getChurchByOwnerId } from '../db.js';
import { COOKIE_NAME } from '../../shared/const.js';
import type { User, Church } from '../../shared/schema.js';

// ─── Context ──────────────────────────────────────────────────────────────────

export interface Context {
  user: User | null;
  church: Church | null;
  req: CreateExpressContextOptions['req'];
  res: CreateExpressContextOptions['res'];
}

export async function createContext({
  req,
  res,
}: CreateExpressContextOptions): Promise<Context> {
  const token = req.cookies?.[COOKIE_NAME] as string | undefined;

  if (!token) {
    return { user: null, church: null, req, res };
  }

  const payload = verifySession(token);
  if (!payload) {
    return { user: null, church: null, req, res };
  }

  const user = await getUserById(payload.userId).catch(() => undefined);
  if (!user) {
    return { user: null, church: null, req, res };
  }

  const church = await getChurchByOwnerId(user.id).catch(() => undefined);

  return { user, church: church ?? null, req, res };
}

// ─── tRPC Init ────────────────────────────────────────────────────────────────

const t = initTRPC.context<Context>().create();

export { t };
export const router = t.router;
export const publicProcedure = t.procedure;

// ─── Protected Procedure ──────────────────────────────────────────────────────

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in.' });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

// ─── Church Admin Procedure ───────────────────────────────────────────────────

export const churchAdminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in.' });
  }

  if (!ctx.church) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have a church associated with your account.',
    });
  }

  if (ctx.church.ownerId !== ctx.user.id) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You are not the owner of this church.',
    });
  }

  if (ctx.church.approvalStatus !== 'approved') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Your church has not been approved yet.',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      church: ctx.church,
    },
  });
});
