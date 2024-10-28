import { NextRequest, NextResponse } from 'next/server';
import { addWebflowConnection, getWebflowConnectionsByTeam, getUser } from '@/lib/db/queries';

// POST method to add connection
export async function POST(req: NextRequest) {
  const { teamId, webflowToken, collectionId, name } = await req.json();
  
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  
  await addWebflowConnection(teamId, webflowToken, collectionId, name);
  return NextResponse.json({ success: 'Webflow integration added successfully.' });
}

// GET method to retrieve connections
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const teamIdParam = searchParams.get('teamId');
  const teamId = teamIdParam ? parseInt(teamIdParam, 10) : null;

  const user = await getUser(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!teamId) {
    return NextResponse.json({ error: 'teamId is required' }, { status: 400 });
  }

  const connections = await getWebflowConnectionsByTeam(teamId);
  return NextResponse.json({ connections });
}
