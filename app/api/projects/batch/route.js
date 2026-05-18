import { NextResponse } from "next/server";
import { normalizeProjectPayload, projectInclude } from "@/lib/project-data";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const projects = Array.isArray(body.projects) ? body.projects : [];
    if (!projects.length) throw new Error("Add at least one project row.");

    const created = [];
    for (const row of projects) {
      const data = await normalizeProjectPayload({ ...row, clientId: body.clientId });
      created.push(await prisma.project.create({ data, include: projectInclude() }));
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Unable to batch add projects." }, { status: 400 });
  }
}
