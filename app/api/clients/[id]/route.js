import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const { id: rawId } = await params;
    const body = await request.json();
    const name = String(body.name || "").trim();
    if (!name) throw new Error("Client name is required.");

    const previous = await prisma.client.findUnique({ where: { id: Number(rawId) } });
    const client = await prisma.client.update({
      where: { id: Number(rawId) },
      data: {
        name,
        email: body.email ? String(body.email).trim() : null,
        notes: body.notes ? String(body.notes).trim() : null,
      },
    });

    if (previous && previous.name !== client.name) {
      await prisma.project.updateMany({
        where: { clientId: client.id },
        data: { clientName: client.name },
      });
    }

    return NextResponse.json(client);
  } catch (error) {
    return NextResponse.json({ message: error.message || "Unable to update client." }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);
    await prisma.project.deleteMany({ where: { clientId: id } });
    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Unable to delete client." }, { status: 400 });
  }
}
