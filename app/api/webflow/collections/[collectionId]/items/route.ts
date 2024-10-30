import { NextRequest, NextResponse } from 'next/server';
import { getWebflowConnectionsByTeam, getUser, getUserWithTeam } from '@/lib/db/queries';

export async function GET(req: NextRequest, props: { params: Promise<{ collectionId: string }> }) {
  const params = await props.params;
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userWithTeam = await getUserWithTeam(user.id);

  if (!userWithTeam || !userWithTeam.teamId) {
    console.log('Unauthorized user', userWithTeam, userWithTeam.teamId);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const connections = await getWebflowConnectionsByTeam(user.teamId);
  const connection = connections.find(conn => conn.collectionId === params.collectionId);
  
  if (!connection) {
    return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
  }
  
  const response = await fetch(`https://api.webflow.com/v2/collections/${params.collectionId}/items`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${connection.webflowToken}`,
      'accept-version': '1.0.0',
    },
  });
  
  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch collection items' }, { status: response.status });
  }
  
  const data = await response.json();
  console.log('Found items:', data.items.length);
  return NextResponse.json(data.items);
}

export async function POST(req: NextRequest, props: { params: Promise<{ collectionId: string }> }) {
  const params = await props.params;
  const user = await getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userWithTeam = await getUserWithTeam(user.id);
  if (!userWithTeam || !userWithTeam.teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const connections = await getWebflowConnectionsByTeam(user.teamId);
  const connection = connections.find(conn => conn.collectionId === params.collectionId);
  
  if (!connection) {
    return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
  }

  const body = await req.json();
  
  const response = await fetch(`https://api.webflow.com/v2/collections/${params.collectionId}/items`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${connection.webflowToken}`,
      'accept-version': '1.0.0',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fieldData: body.fieldData,
      isDraft: body.isDraft
    })
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json({ error: error.message || 'Failed to create item' }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
