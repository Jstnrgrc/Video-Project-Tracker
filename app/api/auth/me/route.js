import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [user, userCount] = await Promise.all([getCurrentUser(), prisma.user.count()]);

  return NextResponse.json({
    user,
    needsSetup: userCount === 0,
  });
}
