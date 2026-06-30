import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  numeric,
} from "drizzle-orm/pg-core";

export type UserStatus = "pending" | "active" | "suspended";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["user", "contributor", "elder", "admin"]);
export const subscriptionTierEnum = pgEnum("subscription_tier", ["free", "plus", "pro", "church"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "canceled", "past_due", "trialing", "incomplete"]);
export const partnerStatusEnum = pgEnum("partner_status", ["pending", "active", "suspended"]);
export const courseStatusEnum = pgEnum("course_status", ["draft", "published", "archived"]);
export const groupRoleEnum = pgEnum("group_role", ["owner", "leader", "member"]);
export const productTypeEnum = pgEnum("product_type", ["pdf", "ebook", "workbook", "art", "merch", "course", "plan"]);
export const churchTierEnum = pgEnum("church_tier", ["small", "growth", "ministry"]);
export const churchMemberRoleEnum = pgEnum("church_member_role", ["owner", "pastor", "group_leader", "member"]);
export const churchMemberStatusEnum = pgEnum("church_member_status", ["active", "pending", "suspended"]);
export const churchApprovalStatusEnum = pgEnum("church_approval_status", ["pending", "approved", "rejected"]);
export const userStatusEnum = pgEnum("user_status", ["pending", "active", "suspended"]);
export const contentStatusEnum = pgEnum("content_status", ["draft", "pending_review", "published", "rejected"]);
export const articleCategoryEnum = pgEnum("article_category", ["theology", "apologetics", "commentary", "testimony", "christian_living", "church_history", "opinion"]);
export const experienceLevelEnum = pgEnum("experience_level", ["beginner", "growing", "mature"]);
export const studyModeEnum = pgEnum("study_mode", ["beginner", "deeper", "teacher", "apologetics"]);
export const testamentEnum = pgEnum("testament", ["OT", "NT"]);
export const journalTypeEnum = pgEnum("journal_type", ["free_write", "scripture_reflection", "prayer", "gratitude", "sermon_notes", "question", "testimony"]);
export const prayerCategoryEnum = pgEnum("prayer_category", ["worship", "gratitude", "repentance", "wisdom", "healing", "family", "anxiety", "purpose", "forgiveness", "intercession", "surrender"]);
export const devotionalCategoryEnum = pgEnum("devotional_category", ["faith", "prayer", "anxiety", "forgiveness", "purpose", "identity_in_christ", "healing", "wisdom", "worship", "family", "spiritual_growth", "apologetics", "life_of_jesus", "kingdom_mindset"]);
export const studyDifficultyEnum = pgEnum("study_difficulty", ["beginner", "intermediate", "advanced"]);
export const contextModeEnum = pgEnum("context_mode", ["passage_explanation", "prayer_prompt", "apologetics", "word_study", "teaching_outline", "general"]);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: text("name"),
  role: userRoleEnum("role").default("user").notNull(),
  status: userStatusEnum("status").default("active").notNull(),
  mustChangePassword: boolean("mustChangePassword").default(false).notNull(),
  contributorRequestPending: boolean("contributorRequestPending").default(false).notNull(),
  contributorRequestNote: text("contributorRequestNote"),
  avatarUrl: text("avatarUrl"),
  tier: subscriptionTierEnum("tier").default("free").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  subscriptionStatus: subscriptionStatusEnum("subscriptionStatus"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  trialEndsAt: timestamp("trialEndsAt"),
  bonusCredits: integer("bonusCredits").default(0).notNull(),
  bonusCreditsExpiry: timestamp("bonusCreditsExpiry"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── User Profiles ────────────────────────────────────────────────────────────

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  experienceLevel: experienceLevelEnum("experienceLevel").default("beginner").notNull(),
  preferredStudyMode: studyModeEnum("preferredStudyMode").default("beginner").notNull(),
  devotionalGoal: varchar("devotionalGoal", { length: 255 }),
  readingStreakDays: integer("readingStreakDays").default(0).notNull(),
  lastActiveDate: timestamp("lastActiveDate"),
  activeTranslation: varchar("activeTranslation", { length: 50 }).default("BSB").notNull(),
  premiumTranslations: text("premiumTranslations").array().default([]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

// ─── Bible Books ──────────────────────────────────────────────────────────────

export const bibleBooks = pgTable("bible_books", {
  id: serial("id").primaryKey(),
  bookNumber: integer("bookNumber").notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  abbreviation: varchar("abbreviation", { length: 10 }).notNull(),
  testament: testamentEnum("testament").notNull(),
  totalChapters: integer("totalChapters").notNull(),
});

export type BibleBook = typeof bibleBooks.$inferSelect;

// ─── Bible Chapters ───────────────────────────────────────────────────────────

export const bibleChapters = pgTable("bible_chapters", {
  id: serial("id").primaryKey(),
  bookId: integer("bookId").notNull(),
  chapterNumber: integer("chapterNumber").notNull(),
  totalVerses: integer("totalVerses").notNull(),
});

export type BibleChapter = typeof bibleChapters.$inferSelect;

// ─── Bible Verses ─────────────────────────────────────────────────────────────

export const bibleVerses = pgTable("bible_verses", {
  id: serial("id").primaryKey(),
  bookId: integer("bookId").notNull(),
  chapterNumber: integer("chapterNumber").notNull(),
  verseNumber: integer("verseNumber").notNull(),
  text: text("text").notNull(),
  translation: varchar("translation", { length: 20 }).default("KJV").notNull(),
});

export type BibleVerse = typeof bibleVerses.$inferSelect;

// ─── Highlights ───────────────────────────────────────────────────────────────

export const highlights = pgTable("highlights", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  verseRef: varchar("verseRef", { length: 32 }).notNull(), // e.g. "JHN.3.16"
  color: varchar("color", { length: 20 }).default("yellow").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  index("highlights_userId_idx").on(t.userId),
]);

export type Highlight = typeof highlights.$inferSelect;
export type InsertHighlight = typeof highlights.$inferInsert;

// ─── Notes ────────────────────────────────────────────────────────────────────

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  verseRef: varchar("verseRef", { length: 32 }), // e.g. "JHN.3.16" (optional)
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  tags: text("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index("notes_userId_idx").on(t.userId),
]);

export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;

// ─── Journals ─────────────────────────────────────────────────────────────────

export const journals = pgTable("journals", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  type: journalTypeEnum("type").default("free_write").notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  relatedScripture: varchar("relatedScripture", { length: 100 }),
  tags: text("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index("journals_userId_idx").on(t.userId),
]);

export type Journal = typeof journals.$inferSelect;
export type InsertJournal = typeof journals.$inferInsert;

// ─── Prayers ──────────────────────────────────────────────────────────────────

export const prayers = pgTable("prayers", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  category: prayerCategoryEnum("category").default("worship").notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  isAnswered: boolean("isAnswered").default(false).notNull(),
  answeredNote: text("answeredNote"),
  reminderEnabled: boolean("reminderEnabled").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index("prayers_userId_idx").on(t.userId),
]);

export type Prayer = typeof prayers.$inferSelect;
export type InsertPrayer = typeof prayers.$inferInsert;

// ─── Devotionals ──────────────────────────────────────────────────────────────

export const devotionals = pgTable("devotionals", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  category: devotionalCategoryEnum("category").notNull(),
  scriptureReference: varchar("scriptureReference", { length: 100 }).notNull(),
  scriptureText: text("scriptureText").notNull(),
  reflection: text("reflection").notNull(),
  todaysTruth: text("todaysTruth").notNull(),
  application: text("application").notNull(),
  prayerPrompt: text("prayerPrompt").notNull(),
  journalPrompt: text("journalPrompt").notNull(),
  goDeeperText: text("goDeeperText"),
  relatedVerses: text("relatedVerses"),
  publishedDate: timestamp("publishedDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  authorId: integer("authorId"),
  status: contentStatusEnum("status").default("published").notNull(),
  reviewNote: text("reviewNote"),
  reviewedBy: integer("reviewedBy"),
});

export type Devotional = typeof devotionals.$inferSelect;
export type InsertDevotional = typeof devotionals.$inferInsert;

// ─── Study Plans ──────────────────────────────────────────────────────────────

export const studyPlans = pgTable("study_plans", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  totalDays: integer("totalDays").notNull(),
  difficulty: studyDifficultyEnum("difficulty").default("beginner").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudyPlan = typeof studyPlans.$inferSelect;

// ─── Study Plan Days ──────────────────────────────────────────────────────────

export const studyPlanDays = pgTable("study_plan_days", {
  id: serial("id").primaryKey(),
  planId: integer("planId").notNull(),
  dayNumber: integer("dayNumber").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  scriptureReference: varchar("scriptureReference", { length: 100 }).notNull(),
  devotionalText: text("devotionalText").notNull(),
  prayerPrompt: text("prayerPrompt").notNull(),
  journalPrompt: text("journalPrompt").notNull(),
  deeperStudy: text("deeperStudy"),
});

export type StudyPlanDay = typeof studyPlanDays.$inferSelect;

// ─── Apologetics Topics ───────────────────────────────────────────────────────

export const apologeticsTopics = pgTable("apologetics_topics", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  simpleAnswer: text("simpleAnswer").notNull(),
  deeperAnswer: text("deeperAnswer").notNull(),
  keyScriptures: text("keyScriptures").notNull(),
  commonObjection: text("commonObjection").notNull(),
  thoughtfulResponse: text("thoughtfulResponse").notNull(),
  recommendedStudyPath: text("recommendedStudyPath"),
  discussionQuestions: text("discussionQuestions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApologeticsTopic = typeof apologeticsTopics.$inferSelect;

// ─── AI Conversations ─────────────────────────────────────────────────────────

export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  title: varchar("title", { length: 255 }),
  contextMode: contextModeEnum("contextMode").default("general").notNull(),
  messages: text("messages").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index("ai_conversations_userId_idx").on(t.userId),
]);

export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = typeof aiConversations.$inferInsert;

// ─── Saved Responses ──────────────────────────────────────────────────────────

export const savedResponses = pgTable("saved_responses", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  conversationId: integer("conversationId"),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  index("saved_responses_userId_idx").on(t.userId),
]);

export type SavedResponse = typeof savedResponses.$inferSelect;

// ─── User Progress ────────────────────────────────────────────────────────────

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  planId: integer("planId").notNull(),
  dayNumber: integer("dayNumber").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
}, (t) => [
  uniqueIndex("user_progress_user_plan_day_idx").on(t.userId, t.planId, t.dayNumber),
]);

export type UserProgress = typeof userProgress.$inferSelect;

// ─── Saved Devotionals ────────────────────────────────────────────────────────

export const savedDevotionals = pgTable("saved_devotionals", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  devotionalId: integer("devotionalId").notNull(),
  savedAt: timestamp("savedAt").defaultNow().notNull(),
}, (t) => [
  uniqueIndex("saved_devotionals_user_devotional_idx").on(t.userId, t.devotionalId),
]);

export type SavedDevotional = typeof savedDevotionals.$inferSelect;

// ─── Password Reset Tokens ────────────────────────────────────────────────────

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  otpCode: varchar("otpCode", { length: 6 }),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// ─── Articles ─────────────────────────────────────────────────────────────────

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  authorId: integer("authorId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  category: articleCategoryEnum("category").notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  status: contentStatusEnum("status").default("draft").notNull(),
  reviewNote: text("reviewNote"),
  reviewedBy: integer("reviewedBy"),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index("articles_authorId_idx").on(t.authorId),
  index("articles_status_idx").on(t.status),
]);

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).notNull(),
  stripePriceId: varchar("stripePriceId", { length: 255 }).notNull(),
  tier: subscriptionTierEnum("tier").notNull(),
  status: subscriptionStatusEnum("status").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false).notNull(),
  trialEnd: timestamp("trialEnd"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index("subscriptions_userId_idx").on(t.userId),
  index("subscriptions_stripeId_idx").on(t.stripeSubscriptionId),
]);

export type Subscription = typeof subscriptions.$inferSelect;

// ─── AI Usage ─────────────────────────────────────────────────────────────────

export const aiUsage = pgTable("ai_usage", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM
  dailyCount: integer("dailyCount").default(0).notNull(),
  monthlyCount: integer("monthlyCount").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  uniqueIndex("ai_usage_user_date_idx").on(t.userId, t.date),
  index("ai_usage_userId_idx").on(t.userId),
]);

export type AiUsage = typeof aiUsage.$inferSelect;

// ─── Partners ─────────────────────────────────────────────────────────────────

export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  displayName: varchar("displayName", { length: 255 }).notNull(),
  bio: text("bio"),
  websiteUrl: varchar("websiteUrl", { length: 500 }),
  avatarUrl: text("avatarUrl"),
  status: partnerStatusEnum("status").default("pending").notNull(),
  revenueSharePct: numeric("revenueSharePct", { precision: 5, scale: 2 }).default("70").notNull(),
  stripeConnectId: varchar("stripeConnectId", { length: 255 }),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  index("partners_userId_idx").on(t.userId),
]);

export type Partner = typeof partners.$inferSelect;

// ─── Study Plans (extended) ───────────────────────────────────────────────────

export const studyPlansMeta = pgTable("study_plans_meta", {
  id: serial("id").primaryKey(),
  planId: integer("planId").notNull().unique(),
  isPremium: boolean("isPremium").default(false).notNull(),
  price: numeric("price", { precision: 8, scale: 2 }),
  partnerId: integer("partnerId"),
  category: varchar("category", { length: 100 }),
  thumbnailUrl: text("thumbnailUrl"),
  salesCount: integer("salesCount").default(0).notNull(),
  publishedAt: timestamp("publishedAt"),
}, (t) => [
  index("study_plans_meta_planId_idx").on(t.planId),
]);

export type StudyPlanMeta = typeof studyPlansMeta.$inferSelect;

// ─── Courses ──────────────────────────────────────────────────────────────────

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  partnerId: integer("partnerId"),
  authorId: integer("authorId").notNull(),
  status: courseStatusEnum("status").default("draft").notNull(),
  isPremium: boolean("isPremium").default(false).notNull(),
  price: numeric("price", { precision: 8, scale: 2 }),
  totalLessons: integer("totalLessons").default(0).notNull(),
  estimatedMinutes: integer("estimatedMinutes").default(0).notNull(),
  certificateEnabled: boolean("certificateEnabled").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
  publishedAt: timestamp("publishedAt"),
}, (t) => [
  index("courses_status_idx").on(t.status),
  index("courses_authorId_idx").on(t.authorId),
]);

export type Course = typeof courses.$inferSelect;

// ─── Course Lessons ───────────────────────────────────────────────────────────

export const courseLessons = pgTable("course_lessons", {
  id: serial("id").primaryKey(),
  courseId: integer("courseId").notNull(),
  orderIndex: integer("orderIndex").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  videoUrl: text("videoUrl"),
  durationMinutes: integer("durationMinutes").default(0).notNull(),
  isFreePreview: boolean("isFreePreview").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  index("course_lessons_courseId_idx").on(t.courseId),
]);

export type CourseLesson = typeof courseLessons.$inferSelect;

// ─── Course Progress ──────────────────────────────────────────────────────────

export const courseProgress = pgTable("course_progress", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  courseId: integer("courseId").notNull(),
  lessonId: integer("lessonId").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
}, (t) => [
  uniqueIndex("course_progress_user_lesson_idx").on(t.userId, t.lessonId),
  index("course_progress_userId_idx").on(t.userId),
]);

export type CourseProgress = typeof courseProgress.$inferSelect;

// ─── Groups ───────────────────────────────────────────────────────────────────

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  avatarUrl: text("avatarUrl"),
  ownerId: integer("ownerId").notNull(),
  isChurch: boolean("isChurch").default(false).notNull(),
  maxMembers: integer("maxMembers").default(50).notNull(),
  inviteCode: varchar("inviteCode", { length: 12 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index("groups_ownerId_idx").on(t.ownerId),
]);

export type Group = typeof groups.$inferSelect;

// ─── Group Members ────────────────────────────────────────────────────────────

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("groupId").notNull(),
  userId: integer("userId").notNull(),
  role: groupRoleEnum("role").default("member").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
}, (t) => [
  uniqueIndex("group_members_group_user_idx").on(t.groupId, t.userId),
  index("group_members_userId_idx").on(t.userId),
]);

export type GroupMember = typeof groupMembers.$inferSelect;

// ─── Store Products ───────────────────────────────────────────────────────────

export const storeProducts = pgTable("store_products", {
  id: serial("id").primaryKey(),
  partnerId: integer("partnerId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: productTypeEnum("type").notNull(),
  price: numeric("price", { precision: 8, scale: 2 }).notNull(),
  stripePriceId: varchar("stripePriceId", { length: 255 }),
  stripeProductId: varchar("stripeProductId", { length: 255 }),
  fileUrl: text("fileUrl"),
  thumbnailUrl: text("thumbnailUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  salesCount: integer("salesCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index("store_products_partnerId_idx").on(t.partnerId),
  index("store_products_type_idx").on(t.type),
]);

export type StoreProduct = typeof storeProducts.$inferSelect;

// ─── Purchases ────────────────────────────────────────────────────────────────

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  productId: integer("productId"),
  courseId: integer("courseId"),
  planId: integer("planId"),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  amountCents: integer("amountCents").notNull(),
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  purchasedAt: timestamp("purchasedAt").defaultNow().notNull(),
}, (t) => [
  index("purchases_userId_idx").on(t.userId),
]);

// ─── Churches ─────────────────────────────────────────────────────────────────

export const churches = pgTable("churches", {
  id: serial("id").primaryKey(),
  ownerId: integer("ownerId").notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  tier: churchTierEnum("tier").default("small").notNull(),
  maxMembers: integer("maxMembers").default(100).notNull(),
  logoUrl: text("logoUrl"),
  coverImageUrl: text("coverImageUrl"),
  description: text("description"),
  pastorName: varchar("pastorName", { length: 255 }),
  pastorTitle: varchar("pastorTitle", { length: 100 }),
  serviceTimes: text("serviceTimes"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  zip: varchar("zip", { length: 20 }),
  country: varchar("country", { length: 100 }).default("US"),
  websiteUrl: text("websiteUrl"),
  givingUrl: text("givingUrl"),
  givingDescription: text("givingDescription"),
  facebookUrl: text("facebookUrl"),
  instagramUrl: text("instagramUrl"),
  youtubeUrl: text("youtubeUrl"),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 30 }),
  isActive: boolean("isActive").default(true).notNull(),
  approvalStatus: churchApprovalStatusEnum("approvalStatus").default("pending").notNull(),
  approvedAt: timestamp("approvedAt"),
  approvedBy: integer("approvedBy"),
  rejectionReason: text("rejectionReason"),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
});

export type Church = typeof churches.$inferSelect;
export type InsertChurch = typeof churches.$inferInsert;

// Statement of Faith affirmation — recorded when a church signs up
export const churchAffirmations = pgTable("church_affirmations", {
  id: serial("id").primaryKey(),
  churchId: integer("churchId").notNull().unique(),
  affirmedBy: integer("affirmedBy").notNull(),
  affirmedAt: timestamp("affirmedAt").defaultNow().notNull(),
  ipAddress: varchar("ipAddress", { length: 100 }),
  statementVersion: varchar("statementVersion", { length: 20 }).default("1.0").notNull(),
});
export type ChurchAffirmation = typeof churchAffirmations.$inferSelect;

// ─── Church Members ───────────────────────────────────────────────────────────

export const churchMembers = pgTable("church_members", {
  id: serial("id").primaryKey(),
  churchId: integer("churchId").notNull(),
  userId: integer("userId").notNull(),
  role: churchMemberRoleEnum("role").default("member").notNull(),
  status: churchMemberStatusEnum("status").default("active").notNull(),
  invitedBy: integer("invitedBy"),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
}, (t) => [
  uniqueIndex("church_members_church_user_idx").on(t.churchId, t.userId),
  index("church_members_userId_idx").on(t.userId),
  index("church_members_churchId_idx").on(t.churchId),
]);

export type ChurchMember = typeof churchMembers.$inferSelect;

// ─── Church Invites ───────────────────────────────────────────────────────────

export const churchInvites = pgTable("church_invites", {
  id: serial("id").primaryKey(),
  churchId: integer("churchId").notNull(),
  code: varchar("code", { length: 12 }).notNull().unique(),
  createdBy: integer("createdBy").notNull(),
  maxUses: integer("maxUses"),
  usedCount: integer("usedCount").default(0).notNull(),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  index("church_invites_churchId_idx").on(t.churchId),
  index("church_invites_code_idx").on(t.code),
]);

export type ChurchInvite = typeof churchInvites.$inferSelect;

// ─── Church Phase 2: Discipleship ─────────────────────────────────────────────

export const churchGroupTypeEnum = pgEnum("church_group_type", ["general", "bible_study", "youth", "womens", "mens", "prayer", "outreach"]);
export const churchPrayerStatusEnum = pgEnum("church_prayer_status", ["open", "answered", "archived"]);

// Sermon Notes (pastor-posted)
export const sermonNotes = pgTable("sermon_notes", {
  id: serial("id").primaryKey(),
  churchId: integer("churchId").notNull(),
  authorId: integer("authorId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  speaker: varchar("speaker", { length: 255 }),
  sermonDate: timestamp("sermonDate"),
  scripture: varchar("scripture", { length: 255 }),
  series: varchar("series", { length: 255 }),
  summary: text("summary"),
  content: text("content"),
  videoUrl: text("videoUrl"),
  audioUrl: text("audioUrl"),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index("sermon_notes_churchId_idx").on(t.churchId),
]);
export type SermonNote = typeof sermonNotes.$inferSelect;

// Member personal notes on a sermon
export const memberSermonNotes = pgTable("member_sermon_notes", {
  id: serial("id").primaryKey(),
  sermonId: integer("sermonId").notNull(),
  userId: integer("userId").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  uniqueIndex("member_sermon_notes_sermon_user_idx").on(t.sermonId, t.userId),
]);
export type MemberSermonNote = typeof memberSermonNotes.$inferSelect;

// Church-wide prayer board
export const churchPrayerRequests = pgTable("church_prayer_requests", {
  id: serial("id").primaryKey(),
  churchId: integer("churchId").notNull(),
  userId: integer("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  status: churchPrayerStatusEnum("status").default("open").notNull(),
  prayerCount: integer("prayerCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index("church_prayer_requests_churchId_idx").on(t.churchId),
]);
export type ChurchPrayerRequest = typeof churchPrayerRequests.$inferSelect;

// Prayer reactions (praying for this)
export const churchPrayerReactions = pgTable("church_prayer_reactions", {
  id: serial("id").primaryKey(),
  requestId: integer("requestId").notNull(),
  userId: integer("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  uniqueIndex("church_prayer_reactions_req_user_idx").on(t.requestId, t.userId),
]);

// Church groups (linked to a church)
export const churchGroups = pgTable("church_groups", {
  id: serial("id").primaryKey(),
  churchId: integer("churchId").notNull(),
  leaderId: integer("leaderId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: churchGroupTypeEnum("type").default("general").notNull(),
  maxMembers: integer("maxMembers").default(50),
  isOpen: boolean("isOpen").default(true).notNull(),
  meetingTime: varchar("meetingTime", { length: 255 }),
  location: varchar("location", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  index("church_groups_churchId_idx").on(t.churchId),
]);
export type ChurchGroup = typeof churchGroups.$inferSelect;

export const churchGroupMembers = pgTable("church_group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("groupId").notNull(),
  userId: integer("userId").notNull(),
  role: groupRoleEnum("role").default("member").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
}, (t) => [
  uniqueIndex("church_group_members_group_user_idx").on(t.groupId, t.userId),
  index("church_group_members_userId_idx").on(t.userId),
]);

// ─── Church Phase 3: Communication ────────────────────────────────────────────

export const churchEventRsvpEnum = pgEnum("church_event_rsvp", ["going", "maybe", "not_going"]);
export const churchResourceTypeEnum = pgEnum("church_resource_type", ["link", "pdf", "video", "audio", "document", "other"]);

// Events
export const churchEvents = pgTable("church_events", {
  id: serial("id").primaryKey(),
  churchId: integer("churchId").notNull(),
  authorId: integer("authorId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 500 }),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime"),
  isAllDay: boolean("isAllDay").default(false).notNull(),
  imageUrl: text("imageUrl"),
  rsvpEnabled: boolean("rsvpEnabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  index("church_events_churchId_idx").on(t.churchId),
]);
export type ChurchEvent = typeof churchEvents.$inferSelect;

export const churchEventRsvps = pgTable("church_event_rsvps", {
  id: serial("id").primaryKey(),
  eventId: integer("eventId").notNull(),
  userId: integer("userId").notNull(),
  status: churchEventRsvpEnum("status").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  uniqueIndex("church_event_rsvps_event_user_idx").on(t.eventId, t.userId),
]);

// Announcements
export const churchAnnouncements = pgTable("church_announcements", {
  id: serial("id").primaryKey(),
  churchId: integer("churchId").notNull(),
  authorId: integer("authorId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  isPinned: boolean("isPinned").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index("church_announcements_churchId_idx").on(t.churchId),
]);
export type ChurchAnnouncement = typeof churchAnnouncements.$inferSelect;

// Resource Library
export const churchResources = pgTable("church_resources", {
  id: serial("id").primaryKey(),
  churchId: integer("churchId").notNull(),
  authorId: integer("authorId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: churchResourceTypeEnum("type").default("link").notNull(),
  url: text("url").notNull(),
  category: varchar("category", { length: 100 }),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  index("church_resources_churchId_idx").on(t.churchId),
]);
export type ChurchResource = typeof churchResources.$inferSelect;

// ─── Church Phase 4: Analytics ────────────────────────────────────────────────

export const churchActivityTypeEnum = pgEnum("church_activity_type", [
  "sermon_view", "sermon_note", "prayer_post", "prayer_reaction",
  "event_rsvp", "group_join", "announcement_view", "resource_view", "login",
]);

export const churchMemberActivity = pgTable("church_member_activity", {
  id: serial("id").primaryKey(),
  churchId: integer("churchId").notNull(),
  userId: integer("userId").notNull(),
  type: churchActivityTypeEnum("type").notNull(),
  refId: integer("refId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  index("church_member_activity_church_idx").on(t.churchId),
  index("church_member_activity_user_idx").on(t.userId),
  index("church_member_activity_created_idx").on(t.createdAt),
]);
