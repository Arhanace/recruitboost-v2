import { pgTable, text, serial, boolean, timestamp, bigint, integer, uniqueIndex, jsonb } from "drizzle-orm/pg-core";

// ============================================================
// USERS
// ============================================================
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  passwordHash: text("password_hash"),
  image: text("image"),

  // Google OAuth
  googleId: text("google_id").unique(),

  // Gmail API tokens (separate from login OAuth)
  gmailAccessToken: text("gmail_access_token"),
  gmailRefreshToken: text("gmail_refresh_token"),
  gmailTokenExpiry: bigint("gmail_token_expiry", { mode: "number" }),

  // Athletic profile
  sport: text("sport"),
  position: text("position"),
  height: text("height"),
  graduationYear: integer("graduation_year"),
  gender: text("gender"),
  keyStats: text("key_stats"),
  highlights: text("highlights"),
  stats: jsonb("stats").$type<Record<string, string>>(),
  bio: text("bio"),

  // Academic profile
  gpa: text("gpa"),
  testScores: text("test_scores"),
  academicHonors: text("academic_honors"),
  intendedMajor: text("intended_major"),

  // School preferences
  preferredLocation: text("preferred_location"),
  preferredSchoolSize: text("preferred_school_size"),
  preferredProgramLevel: text("preferred_program_level"),

  // Settings
  notificationsEnabled: boolean("notifications_enabled").default(true),
  theme: text("theme").default("system"),

  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// ============================================================
// NEXTAUTH ACCOUNTS
// ============================================================
export const accounts = pgTable("account", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  access_token: text("access_token"),
  refresh_token: text("refresh_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

// ============================================================
// NEXTAUTH SESSIONS
// ============================================================
export const sessions = pgTable("session", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionToken: text("sessionToken").notNull().unique(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: text("expires").notNull(),
});

// ============================================================
// NEXTAUTH VERIFICATION TOKENS
// ============================================================
export const verificationTokens = pgTable("verificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull().unique(),
  expires: text("expires").notNull(),
});

// ============================================================
// COACHES
// ============================================================
export const coaches = pgTable("coaches", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  school: text("school").notNull(),
  sport: text("sport").notNull(),
  division: text("division"),
  conference: text("conference"),
  role: text("role"),
  state: text("state"),
  region: text("region"),
});

// ============================================================
// SAVED COACHES
// ============================================================
export const savedCoaches = pgTable("saved_coaches", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  coachId: integer("coach_id").notNull().references(() => coaches.id, { onDelete: "cascade" }),
  notes: text("notes"),
  status: text("status").default("not_contacted"),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  uniqueIndex("saved_coaches_user_coach_idx").on(table.userId, table.coachId),
]);

// ============================================================
// EMAIL TEMPLATES
// ============================================================
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// ============================================================
// EMAILS
// ============================================================
export const emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  coachId: integer("coach_id").notNull().references(() => coaches.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  direction: text("direction").notNull().default("outbound"),
  status: text("status").notNull().default("sent"),
  templateId: integer("template_id").references(() => emailTemplates.id),
  isFollowUp: boolean("is_follow_up").default(false),
  parentEmailId: integer("parent_email_id"),
  scheduledFor: text("scheduled_for"),
  hasResponded: boolean("has_responded").default(false),
  gmailMessageId: text("gmail_message_id"),
  gmailThreadId: text("gmail_thread_id"),
  sentAt: text("sent_at"),
  receivedAt: text("received_at"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// ============================================================
// TASKS
// ============================================================
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  coachId: integer("coach_id").references(() => coaches.id),
  emailId: integer("email_id").references(() => emails.id),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: text("due_date").notNull(),
  completed: boolean("completed").default(false),
  priority: text("priority").notNull().default("medium"),
  type: text("type").notNull().default("other"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// ============================================================
// ACTIVITIES
// ============================================================
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  coachId: integer("coach_id").references(() => coaches.id),
  type: text("type").notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});
