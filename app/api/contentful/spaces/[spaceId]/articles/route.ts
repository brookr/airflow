import { NextResponse } from "next/server";
import { getContentfulConnectionsByTeam } from "@/lib/db/queries";
import { getUser } from "@/lib/db/queries";

export async function GET(request: Request, props: { params: Promise<{ spaceId: string }> }) {
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

    // First, get the content type ID for 'article'
    const contentTypesResponse = await fetch(
      `https://api.contentful.com/spaces/${params.spaceId}/environments/master/content_types`,
      {
        headers: {
          Authorization: `Bearer ${connection.accessToken}`,
          'Content-Type': 'application/vnd.contentful.management.v1+json'
        },
      }
    );

    if (!contentTypesResponse.ok) {
      const error = await contentTypesResponse.json();
      throw new Error(`Failed to fetch content types: ${error.message}`);
    }

    const contentTypes = await contentTypesResponse.json();
    const articleContentType = contentTypes.items.find((ct: any) => 
      ct.name.toLowerCase() === 'article' || 
      ct.name.toLowerCase() === 'post' || 
      ct.name.toLowerCase() === 'blog post'
    );

    if (!articleContentType) {
      return NextResponse.json({ articles: [] }); // Return empty if no article content type found
    }

    // Then fetch entries of that content type
    const response = await fetch(
      `https://api.contentful.com/spaces/${params.spaceId}/environments/master/entries?content_type=${articleContentType.sys.id}`,
      {
        headers: {
          Authorization: `Bearer ${connection.accessToken}`,
          'Content-Type': 'application/vnd.contentful.management.v1+json'
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to fetch articles: ${error.message}`);
    }

    const data = await response.json();
    return NextResponse.json({ articles: data.items });
  } catch (error) {
    console.error('Contentful API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, props: { params: Promise<{ spaceId: string }> }) {
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

    // First, get the content type ID for 'article'
    const contentTypesResponse = await fetch(
      `https://api.contentful.com/spaces/${params.spaceId}/environments/master/content_types`,
      {
        headers: {
          Authorization: `Bearer ${connection.accessToken}`,
          'Content-Type': 'application/vnd.contentful.management.v1+json'
        },
      }
    );

    if (!contentTypesResponse.ok) {
      throw new Error('Failed to fetch content types');
    }

    const contentTypes = await contentTypesResponse.json();
    const articleContentType = contentTypes.items.find((ct: any) => 
      ct.name.toLowerCase() === 'article' || 
      ct.name.toLowerCase() === 'post' || 
      ct.name.toLowerCase() === 'blog post'
    );

    if (!articleContentType) {
      throw new Error('Article content type not found in space');
    }

    const articleData = await request.json();

    const response = await fetch(
      `https://api.contentful.com/spaces/${params.spaceId}/environments/master/entries`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${connection.accessToken}`,
          'Content-Type': 'application/vnd.contentful.management.v1+json',
          'X-Contentful-Content-Type': articleContentType.sys.id
        },
        body: JSON.stringify(articleData)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create article: ${error.message}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Contentful API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create article" },
      { status: 500 }
    );
  }
}
