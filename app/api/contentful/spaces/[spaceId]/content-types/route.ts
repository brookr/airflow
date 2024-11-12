import { NextResponse } from "next/server";
import { getContentfulConnectionsByTeam } from "@/lib/db/queries";
import { getUser } from "@/lib/db/queries";

export async function GET(
  request: Request,
  props: { params: Promise<{ spaceId: string }> }
) {
  const params = await props.params;
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
      `https://api.contentful.com/spaces/${params.spaceId}/environments/master/content_types`,
      {
        headers: {
          Authorization: `Bearer ${connection.accessToken}`,
          "Content-Type": "application/vnd.contentful.management.v1+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch content types");
    }

    const data = await response.json();
    const articleContentType = data.items.find(
      (ct: any) =>
        ct.name.toLowerCase() === "article" ||
        ct.name.toLowerCase() === "post" ||
        ct.name.toLowerCase() === "blog post"
    );

    if (!articleContentType) {
      throw new Error("Article content type not found");
    }

    return NextResponse.json({ contentType: articleContentType });
  } catch (error) {
    console.error("Contentful API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch content type",
      },
      { status: 500 }
    );
  }
}
