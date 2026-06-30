import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import { eq, and, ilike, or, sql } from 'drizzle-orm';
import {
  users,
  churches,
  churchMembers,
  churchAffirmations,
  churchInvites,
  type User,
  type Church,
  type ChurchMember,
  type InsertChurch,
} from '../shared/schema.js';
import { env } from './_core/env.js';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool);

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return result[0];
}

export async function getUserById(id: number): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

// ─── Churches ─────────────────────────────────────────────────────────────────

export async function getChurchByOwnerId(userId: number): Promise<Church | undefined> {
  const result = await db
    .select()
    .from(churches)
    .where(eq(churches.ownerId, userId))
    .limit(1);
  return result[0];
}

export async function getChurchById(id: number): Promise<Church | undefined> {
  const result = await db.select().from(churches).where(eq(churches.id, id)).limit(1);
  return result[0];
}

export async function getChurchBySlug(slug: string): Promise<Church | undefined> {
  const result = await db
    .select()
    .from(churches)
    .where(eq(churches.slug, slug))
    .limit(1);
  return result[0];
}

export async function createChurch(data: InsertChurch): Promise<Church> {
  const result = await db.insert(churches).values(data).returning();
  if (!result[0]) throw new Error('Failed to create church');
  return result[0];
}

export async function updateChurch(
  churchId: number,
  data: Partial<InsertChurch>
): Promise<Church> {
  const result = await db
    .update(churches)
    .set(data)
    .where(eq(churches.id, churchId))
    .returning();
  if (!result[0]) throw new Error('Failed to update church');
  return result[0];
}

export async function searchChurches(query: string): Promise<Church[]> {
  const term = `%${query}%`;
  return db
    .select()
    .from(churches)
    .where(
      and(
        eq(churches.approvalStatus, 'approved'),
        eq(churches.isActive, true),
        or(
          ilike(churches.name, term),
          ilike(churches.city, term),
          ilike(churches.state, term)
        )
      )
    )
    .limit(50);
}

// ─── Church Members ───────────────────────────────────────────────────────────

export async function getChurchMembers(churchId: number): Promise<
  (ChurchMember & { user: Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'> })[]
> {
  const rows = await db
    .select({
      id: churchMembers.id,
      churchId: churchMembers.churchId,
      userId: churchMembers.userId,
      role: churchMembers.role,
      status: churchMembers.status,
      invitedBy: churchMembers.invitedBy,
      joinedAt: churchMembers.joinedAt,
      user: {
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(churchMembers)
    .innerJoin(users, eq(churchMembers.userId, users.id))
    .where(
      and(eq(churchMembers.churchId, churchId), eq(churchMembers.status, 'active'))
    );
  return rows;
}

export async function addChurchMember(
  churchId: number,
  userId: number,
  role: 'member' | 'group_leader' | 'pastor' | 'owner' = 'member',
  invitedBy?: number
): Promise<ChurchMember> {
  const result = await db
    .insert(churchMembers)
    .values({ churchId, userId, role, invitedBy })
    .returning();
  if (!result[0]) throw new Error('Failed to add church member');
  return result[0];
}

export async function removeChurchMember(
  churchId: number,
  memberId: number
): Promise<void> {
  await db
    .delete(churchMembers)
    .where(and(eq(churchMembers.churchId, churchId), eq(churchMembers.id, memberId)));
}

export async function updateChurchMember(
  churchId: number,
  memberId: number,
  data: Partial<Pick<ChurchMember, 'role' | 'status'>>
): Promise<ChurchMember> {
  const result = await db
    .update(churchMembers)
    .set(data)
    .where(and(eq(churchMembers.churchId, churchId), eq(churchMembers.id, memberId)))
    .returning();
  if (!result[0]) throw new Error('Failed to update church member');
  return result[0];
}

// ─── Church Affirmations ──────────────────────────────────────────────────────

export async function recordAffirmation(
  churchId: number,
  affirmedBy: number,
  ipAddress: string | null
): Promise<void> {
  await db
    .insert(churchAffirmations)
    .values({ churchId, affirmedBy, ipAddress: ipAddress ?? undefined });
}

// ─── Church Invites ───────────────────────────────────────────────────────────

export async function getActiveInviteByChurchId(
  churchId: number
) {
  const result = await db
    .select()
    .from(churchInvites)
    .where(and(eq(churchInvites.churchId, churchId), eq(churchInvites.isActive, true)))
    .limit(1);
  return result[0];
}

export async function getInviteByCode(code: string) {
  const result = await db
    .select()
    .from(churchInvites)
    .where(and(eq(churchInvites.code, code), eq(churchInvites.isActive, true)))
    .limit(1);
  return result[0];
}

export async function createInvite(churchId: number, createdBy: number) {
  // Deactivate all existing invites for this church first
  await db
    .update(churchInvites)
    .set({ isActive: false })
    .where(eq(churchInvites.churchId, churchId));

  const code = generateInviteCode();
  const result = await db
    .insert(churchInvites)
    .values({ churchId, code, createdBy })
    .returning();
  if (!result[0]) throw new Error('Failed to create invite');
  return result[0];
}

export async function incrementInviteUsedCount(code: string): Promise<void> {
  await db
    .update(churchInvites)
    .set({ usedCount: sql`${churchInvites.usedCount} + 1` })
    .where(eq(churchInvites.code, code));
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export { users, churches, churchMembers, churchAffirmations, churchInvites };
