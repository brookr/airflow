import { NextResponse } from "next/server";
import { getContentfulConnectionsByTeam } from "@/lib/db/queries";
import { getUser } from "@/lib/db/queries";

export async function GET(
  request: Request,
  { params }: { params: { spaceId: string } }
) {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connections = await getContentfulConnectionsByTeam(user.teamId);
    const connection = connections.find((c) => c.spaceId === params.spaceId);

    if (!connection) {
      return NextResponse.json(
        { error: "Contentful connection not found" },
        { status: 404 }
      );
    }

    const response = await fetch(
      `https://cdn.contentful.com/spaces/${params.spaceId}/entries?content_type=article`,
      {
        headers: {
          Authorization: `Bearer ${connection.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch articles from Contentful");
    }

    const data = await response.json();
    return NextResponse.json({ articles: data.items });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
} 
