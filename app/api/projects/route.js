import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeProjectPayload, projectInclude } from "@/lib/project-data";

export async function GET() {
  const projects = await prisma.project.findMany({
    include: projectInclude(),
    orderBy: [{ dateCreated: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(projects);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const project = await prisma.project.create({
      data: await normalizeProjectPayload(body),
      include: projectInclude(),
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Unable to create project." }, { status: 400 });
  }
}
