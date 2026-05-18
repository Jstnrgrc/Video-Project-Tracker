import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const clients = await prisma.client.findMany({
    include: { projects: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(clients);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    if (!name) throw new Error("Client name is required.");

    const client = await prisma.client.create({
      data: {
        name,
        email: body.email ? String(body.email).trim() : null,
        notes: body.notes ? String(body.notes).trim() : null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Unable to create client." }, { status: 400 });
  }
}
