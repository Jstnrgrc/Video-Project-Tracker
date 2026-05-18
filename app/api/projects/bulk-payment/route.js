import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function monthBounds(monthKey) {
  const [year, month] = String(monthKey || "").split("-").map(Number);
  if (!year || !month) throw new Error("A valid month is required.");
  return {
    start: new Date(year, month - 1, 1),
    end: new Date(year, month, 1),
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { start, end } = monthBounds(body.month);
    const clientId = Number(body.clientId || 0);

    const result = await prisma.project.updateMany({
      where: {
        dateCreated: { gte: start, lt: end },
        ...(clientId ? { clientId } : {}),
      },
      data: { paymentStatus: "PAID" },
    });

    return NextResponse.json({ ok: true, count: result.count });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Unable to update payments." }, { status: 400 });
  }
}
