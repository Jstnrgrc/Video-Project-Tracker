import { NextResponse } from "next/server";
import { hashPassword, setSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const name = String(body.name || "").trim();
    const profileImage = body.profileImage ? String(body.profileImage).trim() : null;

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }

    const userCount = await prisma.user.count();
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user && userCount === 0) {
      if (!name) {
        return NextResponse.json({ message: "Name is required for first-time setup." }, { status: 400 });
      }

      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashPassword(password),
          profileImage,
          updatedAt: new Date(),
        },
      });
    }

    if (!user || user.password !== hashPassword(password)) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    await setSession(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Unable to sign in." }, { status: 500 });
  }
}
