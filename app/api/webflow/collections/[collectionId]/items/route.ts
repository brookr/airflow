import { NextRequest, NextResponse } from 'next/server';
import { getWebflowConnectionsByTeam, getUser, getUserWithTeam } from '@/lib/db/queries';

export async function GET(req: NextRequest, { params }: { params: { collectionId: string } }) {
  const collectionId = params.collectionId;
  const user = await getUser(req);
  const userWithTeam = await getUserWithTeam(user.id);
  
  if (!userWithTeam || !userWithTeam.teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const connections = await getWebflowConnectionsByTeam(user.teamId);
  const connection = connections.find(conn => conn.collectionId === collectionId);

  if (!connection) {
    return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
  }

  const response = await fetch(`https://api.webflow.com/collections/${collectionId}/items`, {
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
  return NextResponse.json(data.items);
}
