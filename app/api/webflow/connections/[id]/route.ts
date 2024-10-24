import { NextRequest, NextResponse } from 'next/server';
import { removeWebflowConnection } from '@/lib/db/queries';

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const connectionId = parseInt(params.id, 10);
  await removeWebflowConnection(connectionId);
  return NextResponse.json({ success: 'Webflow integration removed successfully.' });
}
