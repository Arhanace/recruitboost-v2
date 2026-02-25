import { relations } from "drizzle-orm";
import {
  users,
  accounts,
  sessions,
  coaches,
  savedCoaches,
  emailTemplates,
  emails,
  tasks,
  activities,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  savedCoaches: many(savedCoaches),
  emailTemplates: many(emailTemplates),
  emails: many(emails),
  tasks: many(tasks),
  activities: many(activities),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const coachesRelations = relations(coaches, ({ many }) => ({
  savedBy: many(savedCoaches),
  emails: many(emails),
  tasks: many(tasks),
  activities: many(activities),
}));

export const savedCoachesRelations = relations(savedCoaches, ({ one }) => ({
  user: one(users, { fields: [savedCoaches.userId], references: [users.id] }),
  coach: one(coaches, { fields: [savedCoaches.coachId], references: [coaches.id] }),
}));

export const emailTemplatesRelations = relations(emailTemplates, ({ one }) => ({
  user: one(users, { fields: [emailTemplates.userId], references: [users.id] }),
}));

export const emailsRelations = relations(emails, ({ one }) => ({
  user: one(users, { fields: [emails.userId], references: [users.id] }),
  coach: one(coaches, { fields: [emails.coachId], references: [coaches.id] }),
  template: one(emailTemplates, { fields: [emails.templateId], references: [emailTemplates.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, { fields: [tasks.userId], references: [users.id] }),
  coach: one(coaches, { fields: [tasks.coachId], references: [coaches.id] }),
  email: one(emails, { fields: [tasks.emailId], references: [emails.id] }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, { fields: [activities.userId], references: [users.id] }),
  coach: one(coaches, { fields: [activities.coachId], references: [coaches.id] }),
}));
