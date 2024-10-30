import { desc, asc, and, eq, isNull } from "drizzle-orm";
import { db } from "./drizzle";
import {
  activityLogs,
  teamMembers,
  teams,
  users,
  webflowConnections,
  User,
  webflowItems,
} from "./schema";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/session";

export async function getUser() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== "number"
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0] as User;
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser(userId: number) {
  const result = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      teamMembers: {
        with: {
          team: {
            with: {
              webflowConnections: true,
              teamMembers: {
                with: {
                  user: {
                    columns: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return result?.teamMembers[0]?.team || null;
}

export const getWebflowConnectionsByTeam = (teamId: number) => {
  return db
    .select()
    .from(webflowConnections)
    .where(eq(webflowConnections.teamId, teamId));
};

export const addWebflowConnection = (
  teamId: number,
  webflowToken: string,
  collectionId: string,
  name: string
) => {
  return db.insert(webflowConnections).values({
    teamId,
    webflowToken,
    collectionId,
    name,
  });
};

export const removeWebflowConnection = (connectionId: number) => {
  return db
    .delete(webflowConnections)
    .where(eq(webflowConnections.id, connectionId));
};

export async function getCollectionItems(collectionId: string, filterDraft: string, sortOrder: string) {
  const cid = Number(collectionId);
  const conditions = [eq(webflowItems.collectionId, cid)];
  
  if (filterDraft !== '') {
    conditions.push(eq(webflowItems.isDraft, filterDraft === 'true'));
  }

  return db
    .select()
    .from(webflowItems)
    .where(and(...conditions))
    .orderBy(sortOrder === 'asc' ? asc(webflowItems.createdOn) : desc(webflowItems.createdOn));
}

export async function updateItem(
  collectionId: string,
  itemId: string,
  data: Partial<typeof webflowItems.$inferSelect>
) {
  const cid = Number(collectionId);
  const iid = Number(itemId);
  return db
    .update(webflowItems)
    .set({
      name: data.name,
      isDraft: data.isDraft,
      fieldData: data.fieldData,
    })
    .where(
      and(
        eq(webflowItems.collectionId, cid),
        eq(webflowItems._id, iid)
      )
    );
}

export async function getWebflowConnectionByCollectionId(collectionId: string) {
  const connections = await db
    .select()
    .from(webflowConnections)
    .where(eq(webflowConnections.collectionId, collectionId));
  
  return connections.length > 0 ? connections[0] : null;
}

export async function getWebflowItem(collectionId: string, itemId: string) {
  const connection = await getWebflowConnectionByCollectionId(collectionId);
  if (!connection) {
    throw new Error('Webflow connection not found');
  }

  const response = await fetch(`https://api.webflow.com/v2/collections/${collectionId}/items/${itemId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${connection.webflowToken}`,
      'accept-version': '1.0.0',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch item from Webflow');
  }

  return await response.json();
}

export async function updateWebflowItem(collectionId: string, itemId: string, data: any) {
  const connection = await getWebflowConnectionByCollectionId(collectionId);
  if (!connection) {
    throw new Error('Webflow connection not found');
  }

  const response = await fetch(`https://api.webflow.com/v2/collections/${collectionId}/items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${connection.webflowToken}`,
      'Content-Type': 'application/json',
      'accept-version': '1.0.0',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update item in Webflow');
  }

  return await response.json();
}
