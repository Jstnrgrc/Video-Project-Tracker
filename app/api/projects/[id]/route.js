import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PAYMENT_STATUSES, PROJECT_STATUSES } from "@/lib/project-options";
import { normalizeProjectPayload, projectInclude, parseDate } from "@/lib/project-data";

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const { id: rawId } = await params;
    const id = Number(rawId);
    const project = await prisma.project.update({
      where: { id },
      data: body.inlineUpdate
        ? {
            ...(body.status ? { status: PROJECT_STATUSES.includes(body.status) ? body.status : "PENDING" } : {}),
            ...(body.paymentStatus ? { paymentStatus: PAYMENT_STATUSES.includes(body.paymentStatus) ? body.paymentStatus : "UNPAID" } : {}),
            ...(body.rate !== undefined ? { rate: Number(body.rate || 0) } : {}),
            ...(body.deadline !== undefined ? { deadline: parseDate(body.deadline) } : {}),
            ...(body.projectLink !== undefined ? { projectLink: body.projectLink ? String(body.projectLink).trim() : null } : {}),
          }
        : body.quickStatusUpdate
          ? { status: PROJECT_STATUSES.includes(body.status) ? body.status : "PENDING" }
          : await normalizeProjectPayload(body),
      include: projectInclude(),
    });

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ message: error.message || "Unable to update project." }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);
    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Unable to delete project." }, { status: 400 });
  }
}
