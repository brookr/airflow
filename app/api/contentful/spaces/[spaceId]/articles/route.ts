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

    // First, get the content type ID and fields for 'article'
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

    // Create new article with all required fields
    const newArticleData = {
      fields: articleContentType.fields.reduce((acc: any, field: any) => {
        if (field.required) {
          switch (field.type) {
            case 'Symbol':
              acc[field.id] = { "en-US": field.id === 'title' ? "New Article" : `New ${field.name}` };
              break;
            case 'Text':
              acc[field.id] = { "en-US": `Enter ${field.name}` };
              break;
            case 'RichText':
              acc[field.id] = {
                "en-US": {
                  nodeType: "document",
                  data: {},
                  content: [
                    {
                      nodeType: "paragraph",
                      data: {},
                      content: [
                        {
                          nodeType: "text",
                          value: `Enter ${field.name}`,
                          marks: [],
                          data: {}
                        }
                      ]
                    }
                  ]
                }
              };
              break;
            case 'Date':
              acc[field.id] = { "en-US": new Date().toISOString() };
              break;
            case 'Boolean':
              acc[field.id] = { "en-US": false };
              break;
            case 'Integer':
            case 'Number':
              acc[field.id] = { "en-US": 0 };
              break;
            case 'Array':
              acc[field.id] = { "en-US": [] };
              break;
            case 'Object':
              acc[field.id] = { "en-US": {} };
              break;
            case 'Link':
              if (field.linkType === 'Asset') {
                acc[field.id] = { 
                  "en-US": {
                    sys: {
                      type: "Link",
                      linkType: "Asset",
                      id: "" // Will need to be updated with a real asset ID
                    }
                  }
                };
              } else {
                acc[field.id] = { 
                  "en-US": {
                    sys: {
                      type: "Link",
                      linkType: "Entry",
                      id: "" // Will need to be updated with a real entry ID
                    }
                  }
                };
              }
              break;
            default:
              acc[field.id] = { "en-US": "" };
          }
        }
        return acc;
      }, {})
    };

    // Create the article (but don't publish it)
    const response = await fetch(
      `https://api.contentful.com/spaces/${params.spaceId}/environments/master/entries`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${connection.accessToken}`,
          'Content-Type': 'application/vnd.contentful.management.v1+json',
          'X-Contentful-Content-Type': articleContentType.sys.id
        },
        body: JSON.stringify(newArticleData)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Contentful API error details:', {
        status: response.status,
        statusText: response.statusText,
        error: JSON.stringify(error, null, 2),
        details: error.details?.errors,
        validationErrors: error.details?.errors?.map((e: any) => ({
          field: e.path?.join('.'),
          details: e.details,
          name: e.name
        })),
        requestData: JSON.stringify(newArticleData, null, 2),
        contentType: JSON.stringify(articleContentType, null, 2)
      });
      throw new Error(`Contentful validation error: ${JSON.stringify(error.details?.errors, null, 2)}`);
    }

    const newArticle = await response.json();

    // Return the unpublished article
    return NextResponse.json(newArticle);
  } catch (error) {
    console.error('Full error details:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create article" },
      { status: 500 }
    );
  }
}
