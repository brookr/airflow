import { NextRequest, NextResponse } from 'next/server';
import { removeWebflowConnection } from '@/lib/db/queries';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const connectionId = parseInt(params.id, 10);
  await removeWebflowConnection(connectionId);
  return NextResponse.json({ success: 'Webflow integration removed successfully.' });
}
