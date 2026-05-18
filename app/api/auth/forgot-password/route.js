import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  const body = await request.json();
  const email = String(body.email || "").trim().toLowerCase();
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;

  return NextResponse.json({
    ok: true,
    canReset: Boolean(user),
    message: user ? "Account found. You can reset your password now." : "If that email exists, a reset option will be available.",
  });
}
