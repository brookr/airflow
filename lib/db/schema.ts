import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Table Definitions
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("member"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripeProductId: text("stripe_product_id"),
  planName: varchar("plan_name", { length: 50 }),
  subscriptionStatus: varchar("subscription_status", { length: 20 }),
});

const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  role: varchar("role", { length: 50 }).notNull(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  ipAddress: varchar("ip_address", { length: 45 }),
});

const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  invitedBy: integer("invited_by")
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp("invited_at").notNull().defaultNow(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
});

const webflowConnections = pgTable("webflow_connections", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  webflowToken: text("webflow_token").notNull(),
  collectionId: varchar("collection_id", { length: 100 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

const contentfulConnections = pgTable('contentful_connections', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  spaceId: text('space_id').notNull(),
  accessToken: text('access_token').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const webflowItems = pgTable("webflow_items", {
  _id: serial("id").primaryKey(),
  collectionId: integer("collection_id").notNull(),
  name: text("name").notNull(),
  createdOn: timestamp("created_on").defaultNow(),
  isDraft: boolean("is_draft").default(false),
  fieldData: jsonb("field_data").notNull(),
});

// Relations
export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  webflowConnections: many(webflowConnections),
  contentfulConnections: many(contentfulConnections),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations, { relationName: 'invitedBy' }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  inviter: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
    relationName: 'invitedBy',
  }),
}));

export const webflowConnectionsRelations = relations(webflowConnections, ({ one }) => ({
  team: one(teams, {
    fields: [webflowConnections.teamId],
    references: [teams.id],
  }),
}));

export const contentfulConnectionsRelations = relations(contentfulConnections, ({ one }) => ({
  team: one(teams, {
    fields: [contentfulConnections.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// Types
type User = typeof users.$inferSelect & { teamId: number };
type NewUser = {
  id?: number;
  teamId?: number;
  email: string;
  passwordHash: string;
  role: string;
};

type Team = typeof teams.$inferSelect;
type NewTeam = typeof teams.$inferInsert;
type TeamMember = typeof teamMembers.$inferSelect;
type NewTeamMember = typeof teamMembers.$inferInsert;
type ActivityLog = typeof activityLogs.$inferSelect;
type NewActivityLog = typeof activityLogs.$inferInsert;
type Invitation = typeof invitations.$inferSelect;
type NewInvitation = typeof invitations.$inferInsert;
type WebflowConnection = typeof webflowConnections.$inferSelect;
type NewWebflowConnection = typeof webflowConnections.$inferInsert;
type ContentfulConnection = typeof contentfulConnections.$inferSelect;
type NewContentfulConnection = typeof contentfulConnections.$inferInsert;

type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, "id" | "name" | "email">;
  })[];
  webflowConnections: WebflowConnection[];
  contentfulConnections: ContentfulConnection[];
};

enum ActivityType {
  SIGN_UP = "SIGN_UP",
  SIGN_IN = "SIGN_IN",
  SIGN_OUT = "SIGN_OUT",
  UPDATE_PASSWORD = "UPDATE_PASSWORD",
  DELETE_ACCOUNT = "DELETE_ACCOUNT",
  UPDATE_ACCOUNT = "UPDATE_ACCOUNT",
  CREATE_TEAM = "CREATE_TEAM",
  REMOVE_TEAM_MEMBER = "REMOVE_TEAM_MEMBER",
  INVITE_TEAM_MEMBER = "INVITE_TEAM_MEMBER",
  ACCEPT_INVITATION = "ACCEPT_INVITATION",
  CREATE_WEBFLOW_CONNECTION = "CREATE_WEBFLOW_CONNECTION",
  REMOVE_WEBFLOW_CONNECTION = "REMOVE_WEBFLOW_CONNECTION",
}

// Single export statement for all schema elements
export {
  users,
  teams,
  teamMembers,
  activityLogs,
  invitations,
  webflowConnections,
  contentfulConnections,
  webflowItems,
  type User,
  type NewUser,
  type Team,
  type NewTeam,
  type TeamMember,
  type NewTeamMember,
  type ActivityLog,
  type NewActivityLog,
  type Invitation,
  type NewInvitation,
  type WebflowConnection,
  type NewWebflowConnection,
  type ContentfulConnection,
  type NewContentfulConnection,
  type TeamDataWithMembers,
  ActivityType,
};
