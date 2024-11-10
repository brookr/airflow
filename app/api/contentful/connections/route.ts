import { NextResponse } from "next/server";
import { 
  getContentfulConnectionsByTeam, 
  addContentfulConnection 
} from "@/lib/db/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");

  if (!teamId) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }

  const connections = await getContentfulConnectionsByTeam(parseInt(teamId));
  return NextResponse.json({ connections });
}

export async function POST(request: Request) {
  try {
    const { teamId, name, spaceId, accessToken } = await request.json();
    
    if (!teamId || !name || !spaceId || !accessToken) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await addContentfulConnection(teamId, spaceId, accessToken, name);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add connection" },
      { status: 500 }
    );
  }
} 
