import { NextResponse } from "next/server";
import { removeContentfulConnection } from "@/lib/db/queries";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const connectionId = parseInt(params.id);
    await removeContentfulConnection(connectionId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to remove connection" },
      { status: 500 }
    );
  }
} 
