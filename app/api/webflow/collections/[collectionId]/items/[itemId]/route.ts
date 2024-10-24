import { NextResponse } from "next/server";
import { getWebflowConnectionsByTeam, getUserWithTeam, getUser } from '@/lib/db/queries';
import { updateItem } from '@/lib/db/queries';

export async function GET(request: Request, { params }: { params: { collectionId: string; itemId: string } }) {
  const { collectionId, itemId } = params;
  const user = await getUser();
  const userWithTeam = await getUserWithTeam(user.id);

  if (!userWithTeam || !userWithTeam.teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const connections = await getWebflowConnectionsByTeam(userWithTeam.teamId);
  const connection = connections.find(conn => conn.collectionId === collectionId);

  if (!connection) {
    return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
  }

  const response = await fetch(`https://api.webflow.com/v2/collections/${collectionId}/items/${itemId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${connection.webflowToken}`,
      'accept-version': '1.0.0',
    },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: response.status });
  }

  const data = await response.json();

  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: { params: { collectionId: string; itemId: string } }) {
  const { collectionId, itemId } = params;
  const body = await request.json();

  const user = await getUser();
  const userWithTeam = await getUserWithTeam(user.id);

  if (!userWithTeam || !userWithTeam.teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const connections = await getWebflowConnectionsByTeam(userWithTeam.teamId);
  const connection = connections.find(conn => conn.collectionId === collectionId);

  if (!connection) {
    return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
  }

  const response = await fetch(`https://api.webflow.com/v2/collections/${collectionId}/items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${connection.webflowToken}`,
      'Content-Type': 'application/json',
      'accept-version': '1.0.0',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to update item' }, { status: response.status });
  }

  const data = await response.json();

  // Update local database
  await updateItem(collectionId, itemId, body);

  return NextResponse.json({ message: 'Item updated successfully', data });
}
