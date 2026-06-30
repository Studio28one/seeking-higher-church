import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { eq, sql } from 'drizzle-orm';
import {
  router,
  publicProcedure,
  protectedProcedure,
  churchAdminProcedure,
  adminProcedure,
} from './_core/trpc.js';
import { signSession } from './_core/auth.js';
import { getSessionCookieOptions } from './_core/cookies.js';
import { COOKIE_NAME } from '../shared/const.js';
import {
  db,
  getUserByEmail,
  getChurchByOwnerId,
  getChurchBySlug,
  createChurch,
  updateChurch,
  getChurchMembers,
  addChurchMember,
  removeChurchMember,
  updateChurchMember,
  recordAffirmation,
  searchChurches,
  getActiveInviteByChurchId,
  createInvite,
  getInviteByCode,
  users,
  churches,
  churchMembers,
  churchInvites,
} from './db.js';
import { env } from './_core/env.js';

// ─── Auth Router ──────────────────────────────────────────────────────────────

const authRouter = router({
  me: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return { user: null, church: null };
    const { passwordHash: _ph, ...safeUser } = ctx.user;
    const church = ctx.church;
    return { user: safeUser, church };
  }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password.',
        });
      }

      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password.',
        });
      }

      // Update last signed in
      await db
        .update(users)
        .set({ lastSignedIn: new Date() })
        .where(eq(users.id, user.id));

      const token = await signSession(user.id, user.email);
      ctx.res.cookie(COOKIE_NAME, token, getSessionCookieOptions(ctx.req));

      const { passwordHash: _ph, ...safeUser } = user;
      const church = await getChurchByOwnerId(user.id).catch(() => undefined);
      return { user: safeUser, church: church ?? null };
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie(COOKIE_NAME, { path: '/' });
    return { ok: true };
  }),
});

// ─── Church Router ────────────────────────────────────────────────────────────

const affirmationSchema = z.object({
  scripture: z.literal(true, {
    errorMap: () => ({ message: 'You must affirm the authority of Scripture.' }),
  }),
  trinity: z.literal(true, {
    errorMap: () => ({ message: 'You must affirm the doctrine of the Trinity.' }),
  }),
  christology: z.literal(true, {
    errorMap: () => ({ message: 'You must affirm the full deity and humanity of Christ.' }),
  }),
  salvation: z.literal(true, {
    errorMap: () => ({ message: 'You must affirm salvation by grace through faith.' }),
  }),
  atonement: z.literal(true, {
    errorMap: () => ({ message: 'You must affirm the atoning death and resurrection of Christ.' }),
  }),
  discipleship: z.literal(true, {
    errorMap: () => ({ message: 'You must affirm the call to faithful discipleship.' }),
  }),
});

const churchRouter = router({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).max(255),
        slug: z
          .string()
          .min(2)
          .max(120)
          .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens.'),
        pastorName: z.string().min(1).max(255),
        pastorTitle: z.string().max(100).optional(),
        denomination: z.string().max(255).optional(),
        address: z.string().min(1),
        city: z.string().min(1).max(100),
        state: z.string().min(1).max(100),
        zip: z.string().min(1).max(20),
        contactEmail: z.string().email(),
        contactPhone: z.string().max(30).optional(),
        description: z.string().max(2000).optional(),
        websiteUrl: z.string().url().optional().or(z.literal('')),
        // Account
        ownerEmail: z.string().email(),
        ownerPassword: z.string().min(8).optional(),
        ownerName: z.string().min(1).optional(),
        // Affirmation
        affirmation: affirmationSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Validate all affirmations are true
      const aff = input.affirmation;
      if (
        !aff.scripture ||
        !aff.trinity ||
        !aff.christology ||
        !aff.salvation ||
        !aff.atonement ||
        !aff.discipleship
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'All six doctrinal affirmations must be confirmed.',
        });
      }

      // Check slug uniqueness
      const existingBySlug = await getChurchBySlug(input.slug);
      if (existingBySlug) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A church with that URL slug already exists. Please choose another.',
        });
      }

      // Find or create the owner user
      let owner = await getUserByEmail(input.ownerEmail);
      if (!owner) {
        if (!input.ownerPassword || input.ownerPassword.length < 8) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'A password of at least 8 characters is required for new accounts.',
          });
        }
        const hash = await bcrypt.hash(input.ownerPassword, 12);
        const created = await db
          .insert(users)
          .values({
            email: input.ownerEmail.toLowerCase(),
            passwordHash: hash,
            name: input.ownerName ?? input.pastorName,
          })
          .returning();
        if (!created[0]) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create user account.' });
        }
        owner = created[0];
      } else {
        // Check they don't already own a church
        const existing = await getChurchByOwnerId(owner.id);
        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'This email is already associated with a church.',
          });
        }
      }

      // Create church
      const church = await createChurch({
        ownerId: owner.id,
        name: input.name,
        slug: input.slug,
        pastorName: input.pastorName,
        pastorTitle: input.pastorTitle,
        address: input.address,
        city: input.city,
        state: input.state,
        zip: input.zip,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        description: input.description,
        websiteUrl: input.websiteUrl || undefined,
        approvalStatus: 'pending',
      });

      // Record affirmation
      const ip = (ctx.req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim()
        ?? ctx.req.socket.remoteAddress
        ?? null;
      await recordAffirmation(church.id, owner.id, ip);

      // Also add owner as a church member with pastor role
      await addChurchMember(church.id, owner.id, 'pastor');

      // Sign them in
      const token = await signSession(owner.id, owner.email);
      ctx.res.cookie(COOKIE_NAME, token, getSessionCookieOptions(ctx.req));

      const { passwordHash: _ph, ...safeOwner } = owner;
      return { user: safeOwner, church };
    }),

  myChurch: protectedProcedure.query(async ({ ctx }) => {
    const church = await getChurchByOwnerId(ctx.user.id);
    return church ?? null;
  }),

  updateProfile: churchAdminProcedure
    .input(
      z.object({
        name: z.string().min(2).max(255).optional(),
        pastorName: z.string().max(255).optional(),
        pastorTitle: z.string().max(100).optional(),
        description: z.string().max(2000).optional(),
        address: z.string().optional(),
        city: z.string().max(100).optional(),
        state: z.string().max(100).optional(),
        zip: z.string().max(20).optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().max(30).optional(),
        websiteUrl: z.string().url().optional().or(z.literal('')),
        serviceTimes: z.string().max(500).optional(),
        facebookUrl: z.string().url().optional().or(z.literal('')),
        instagramUrl: z.string().url().optional().or(z.literal('')),
        youtubeUrl: z.string().url().optional().or(z.literal('')),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const updated = await updateChurch(ctx.church.id, input);
      return updated;
    }),

  members: churchAdminProcedure.query(async ({ ctx }) => {
    return getChurchMembers(ctx.church.id);
  }),

  inviteCode: churchAdminProcedure.query(async ({ ctx }) => {
    let invite = await getActiveInviteByChurchId(ctx.church.id);
    if (!invite) {
      invite = await createInvite(ctx.church.id, ctx.user.id);
    }
    const joinUrl = `${env.APP_URL}/join/${invite.code}`;
    return { code: invite.code, url: joinUrl, invite };
  }),

  regenerateInviteCode: churchAdminProcedure.mutation(async ({ ctx }) => {
    const invite = await createInvite(ctx.church.id, ctx.user.id);
    const joinUrl = `${env.APP_URL}/join/${invite.code}`;
    return { code: invite.code, url: joinUrl, invite };
  }),

  removeMember: churchAdminProcedure
    .input(z.object({ memberId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await removeChurchMember(ctx.church.id, input.memberId);
      return { ok: true };
    }),

  updateMemberRole: churchAdminProcedure
    .input(
      z.object({
        memberId: z.number(),
        role: z.enum(['member', 'group_leader', 'pastor', 'owner']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const updated = await updateChurchMember(ctx.church.id, input.memberId, {
        role: input.role,
      });
      return updated;
    }),

  join: protectedProcedure
    .input(z.object({ code: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const invite = await getInviteByCode(input.code.toUpperCase());
      if (!invite) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invite code not found or has expired.',
        });
      }

      if (invite.maxUses !== null && invite.usedCount >= invite.maxUses) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This invite code has reached its maximum number of uses.',
        });
      }

      // Check not already a member
      const existing = await db
        .select()
        .from(churchMembers)
        .where(
          eq(churchMembers.churchId, invite.churchId)
        )
        .limit(1);

      const alreadyMember = existing.some((m) => m.userId === ctx.user.id);
      if (alreadyMember) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You are already a member of this church.',
        });
      }

      await addChurchMember(invite.churchId, ctx.user.id, 'member', ctx.user.id);

      // Increment used count
      await db
        .update(churchInvites)
        .set({ usedCount: sql`${churchInvites.usedCount} + 1` })
        .where(eq(churchInvites.code, invite.code));

      return { ok: true, churchId: invite.churchId };
    }),

  publicProfile: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const church = await getChurchBySlug(input.slug);
      if (!church || church.approvalStatus !== 'approved' || !church.isActive) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Church not found.',
        });
      }
      // Return only public fields
      const {
        stripeSubscriptionId: _stripe,
        approvedBy: _approvedBy,
        rejectionReason: _rej,
        ...publicFields
      } = church;
      return publicFields;
    }),

  search: publicProcedure
    .input(z.object({ query: z.string().min(1).max(100) }))
    .query(async ({ input }) => {
      const results = await searchChurches(input.query);
      return results.map(({ stripeSubscriptionId: _s, approvedBy: _a, rejectionReason: _r, ...rest }) => rest);
    }),
});

// ─── Admin Router ─────────────────────────────────────────────────────────────

const adminRouter = router({
  stats: adminProcedure.query(async () => {
    const [total, pending, approved, rejected] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(churches),
      db.select({ count: sql<number>`count(*)::int` }).from(churches).where(eq(churches.approvalStatus, 'pending')),
      db.select({ count: sql<number>`count(*)::int` }).from(churches).where(eq(churches.approvalStatus, 'approved')),
      db.select({ count: sql<number>`count(*)::int` }).from(churches).where(eq(churches.approvalStatus, 'rejected')),
    ]);
    return {
      total: total[0]?.count ?? 0,
      pending: pending[0]?.count ?? 0,
      approved: approved[0]?.count ?? 0,
      rejected: rejected[0]?.count ?? 0,
    };
  }),

  allChurches: adminProcedure
    .input(z.object({ status: z.enum(['all', 'pending', 'approved', 'rejected']).default('all') }))
    .query(async ({ input }) => {
      const rows = await db
        .select({
          id: churches.id,
          name: churches.name,
          slug: churches.slug,
          pastorName: churches.pastorName,
          city: churches.city,
          state: churches.state,
          contactEmail: churches.contactEmail,
          approvalStatus: churches.approvalStatus,
          approvedAt: churches.approvedAt,
          rejectionReason: churches.rejectionReason,
          createdAt: churches.createdAt,
          isActive: churches.isActive,
          ownerEmail: users.email,
          ownerName: users.name,
        })
        .from(churches)
        .leftJoin(users, eq(churches.ownerId, users.id))
        .orderBy(churches.createdAt);

      if (input.status === 'all') return rows;
      return rows.filter((r) => r.approvalStatus === input.status);
    }),

  approveChurch: adminProcedure
    .input(z.object({ churchId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .update(churches)
        .set({
          approvalStatus: 'approved',
          approvedAt: new Date(),
          approvedBy: ctx.user.id,
          rejectionReason: null,
        })
        .where(eq(churches.id, input.churchId));
      return { ok: true };
    }),

  rejectChurch: adminProcedure
    .input(z.object({ churchId: z.number(), reason: z.string().min(1).max(500) }))
    .mutation(async ({ input, ctx }) => {
      await db
        .update(churches)
        .set({
          approvalStatus: 'rejected',
          approvedBy: ctx.user.id,
          rejectionReason: input.reason,
        })
        .where(eq(churches.id, input.churchId));
      return { ok: true };
    }),

  resetToPending: adminProcedure
    .input(z.object({ churchId: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(churches)
        .set({ approvalStatus: 'pending', approvedAt: null, rejectionReason: null })
        .where(eq(churches.id, input.churchId));
      return { ok: true };
    }),

  toggleActive: adminProcedure
    .input(z.object({ churchId: z.number(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      await db
        .update(churches)
        .set({ isActive: input.isActive })
        .where(eq(churches.id, input.churchId));
      return { ok: true };
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────

export const appRouter = router({
  auth: authRouter,
  church: churchRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
