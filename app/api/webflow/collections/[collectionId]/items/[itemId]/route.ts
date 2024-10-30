import { NextRequest, NextResponse } from "next/server";
import { getWebflowConnectionsByTeam, getUser, getUserWithTeam, getWebflowConnectionByCollectionId, updateItem } from '@/lib/db/queries';

export async function GET(
  request: Request,
  props: { params: Promise<{ collectionId: string; itemId: string }> }
) {
  const params = await props.params;
  try {
    const connection = await getWebflowConnectionByCollectionId(params.collectionId);
    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    const response = await fetch(
      `https://api.webflow.com/v2/collections/${params.collectionId}/items/${params.itemId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${connection.webflowToken}`,
          "accept-version": "1.0.0",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch item" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ collectionId: string; itemId: string }> }
) {
  const params = await props.params;
  const { collectionId, itemId } = params;
  const body = await request.json();

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userWithTeam = await getUserWithTeam(user.id);

  if (!userWithTeam || !userWithTeam.teamId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connections = await getWebflowConnectionsByTeam(userWithTeam.teamId as number);
  const connection = connections.find(
    (conn) => conn.collectionId === collectionId
  );

  if (!connection) {
    return NextResponse.json(
      { error: "Connection not found" },
      { status: 404 }
    );
  }

  const response = await fetch(
    `https://api.webflow.com/v2/collections/${collectionId}/items/${itemId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${connection.webflowToken}`,
        "Content-Type": "application/json",
        "accept-version": "1.0.0",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: response.status }
    );
  }

  const data = await response.json();

  // Update local database
  await updateItem(collectionId, itemId, body);

  return NextResponse.json({ message: "Item updated successfully", data });
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ collectionId: string; itemId: string }> }
) {
  const params = await props.params;
  try {
    const connection = await getWebflowConnectionByCollectionId(params.collectionId);
    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    const body = await req.json();

    const response = await fetch(
      `https://api.webflow.com/v2/collections/${params.collectionId}/items/${params.itemId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${connection.webflowToken}`,
          'Content-Type': 'application/json',
          'accept-version': '1.0.0'
        },
        body: JSON.stringify({
          fieldData: body,
          isDraft: true // Always save as draft first
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}
