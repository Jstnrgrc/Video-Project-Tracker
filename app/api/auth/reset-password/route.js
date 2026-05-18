import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!email || !password) throw new Error("Email and new password are required.");

    await prisma.user.update({
      where: { email },
      data: { password: hashPassword(password) },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Unable to reset password." }, { status: 400 });
  }
}
