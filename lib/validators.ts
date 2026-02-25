import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must include uppercase, lowercase, and a number"
    ),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const coachFilterSchema = z.object({
  search: z.string().optional(),
  sport: z.string().optional(),
  division: z.string().optional(),
  conference: z.string().optional(),
  region: z.string().optional(),
  state: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.enum(["low", "medium", "high"]),
  type: z.enum(["follow-up", "research", "outreach", "other"]),
  coachId: z.number().int().optional(),
  emailId: z.number().int().optional(),
});

export const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  isDefault: z.boolean().optional(),
});

export const emailSchema = z.object({
  coachId: z.number().int(),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  templateId: z.number().int().optional(),
  followUpDays: z.number().int().min(1).optional(),
});

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sport: z.string().optional(),
  position: z.string().optional(),
  height: z.string().optional(),
  graduationYear: z.coerce.number().int().min(2020).max(2035).optional().nullable(),
  gender: z.string().optional(),
  keyStats: z.string().optional(),
  highlights: z.string().optional(),
  bio: z.string().optional(),
  gpa: z.string().optional(),
  testScores: z.string().optional(),
  academicHonors: z.string().optional(),
  intendedMajor: z.string().optional(),
  preferredLocation: z.string().optional(),
  preferredSchoolSize: z.enum(["small", "medium", "large", ""]).optional(),
  preferredProgramLevel: z.enum(["D1", "D2", "D3", "NAIA", "NJCAA", ""]).optional(),
});

export const settingsSchema = z.object({
  notificationsEnabled: z.boolean().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
});

export const aiEmailSchema = z.object({
  coachId: z.number().int(),
  tone: z.enum(["professional", "casual", "enthusiastic", "follow-up"]),
  additionalContext: z.string().max(500, "Additional context must be 500 characters or less").optional(),
});
