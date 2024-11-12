import { NextRequest, NextResponse } from "next/server";
import {
  getContentfulConnectionsByTeam,
  getUser,
  getUserWithTeam,
} from "@/lib/db/queries";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ spaceId: string; articleId: string }> }
) {
  const params = await props.params;
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userWithTeam = await getUserWithTeam(user.id);

  if (!userWithTeam || !userWithTeam.teamId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connections = await getContentfulConnectionsByTeam(userWithTeam.teamId);
  const connection = connections.find(
    (conn) => conn.spaceId === params.spaceId
  );

  if (!connection) {
    return NextResponse.json(
      { error: "Connection not found" },
      { status: 404 }
    );
  }

  try {
    const response = await fetch(
      `https://api.contentful.com/spaces/${params.spaceId}/environments/master/entries/${params.articleId}`,
      {
        headers: {
          Authorization: `Bearer ${connection.accessToken}`,
          "Content-Type": "application/vnd.contentful.management.v1+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch article from Contentful");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Contentful API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch article",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ spaceId: string; articleId: string }> }
) {
  const params = await props.params;
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userWithTeam = await getUserWithTeam(user.id);
  if (!userWithTeam || !userWithTeam.teamId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connections = await getContentfulConnectionsByTeam(userWithTeam.teamId);
  const connection = connections.find(
    (conn) => conn.spaceId === params.spaceId
  );

  if (!connection) {
    return NextResponse.json(
      { error: "Connection not found" },
      { status: 404 }
    );
  }

  try {
    const articleData = await req.json();
    const version = req.headers.get("X-Contentful-Version");

    const response = await fetch(
      `https://api.contentful.com/spaces/${params.spaceId}/environments/master/entries/${params.articleId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${connection.accessToken}`,
          "Content-Type": "application/vnd.contentful.management.v1+json",
          ...(version && { "X-Contentful-Version": version }),
        },
        body: JSON.stringify(articleData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Contentful API error details:", {
        status: response.status,
        statusText: response.statusText,
        error: JSON.stringify(error, null, 2),
        details: error.details?.errors,
        validationErrors: error.details?.errors?.map((e: any) => ({
          field: e.path?.join("."),
          details: e.details,
          name: e.name,
        })),
        requestData: JSON.stringify(articleData, null, 2),
      });
      throw new Error(
        `Contentful validation error: ${JSON.stringify(
          error.details?.errors,
          null,
          2
        )}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update article",
      },
      { status: 500 }
    );
  }
}
