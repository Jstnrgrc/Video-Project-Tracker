import { CURRENCIES, PAYMENT_STATUSES, PRIORITIES, PROJECT_STATUSES } from "@/lib/project-options";
import { prisma } from "@/lib/prisma";

export function parseDate(value, fallback = null) {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

async function resolveClient(body) {
  const rawClientId = Number(body.clientId || 0);
  if (rawClientId) {
    const client = await prisma.client.findUnique({ where: { id: rawClientId } });
    if (!client) throw new Error("Selected client does not exist.");
    return client;
  }

  const clientName = String(body.clientName || "").trim();
  if (!clientName) throw new Error("Client is required.");

  return prisma.client.upsert({
    where: { name: clientName },
    update: { updatedAt: new Date() },
    create: { name: clientName, updatedAt: new Date() },
  });
}

export async function normalizeProjectPayload(body) {
  const title = String(body.title || "").trim();
  if (!title) throw new Error("Project title is required.");

  const client = await resolveClient(body);
  const rate = Number(body.rate || 0);

  return {
    clientId: client.id,
    clientName: client.name,
    title,
    status: PROJECT_STATUSES.includes(body.status) ? body.status : "PENDING",
    projectLink: body.projectLink ? String(body.projectLink).trim() : null,
    dateCreated: parseDate(body.dateCreated, new Date()),
    deadline: parseDate(body.deadline),
    notes: body.notes ? String(body.notes).trim() : null,
    priority: PRIORITIES.includes(body.priority) ? body.priority : "MEDIUM",
    paymentStatus: PAYMENT_STATUSES.includes(body.paymentStatus) ? body.paymentStatus : "UNPAID",
    rate: Number.isFinite(rate) ? rate : 0,
    currency: CURRENCIES.includes(body.currency) ? body.currency : "PHP",
  };
}

export function projectInclude() {
  return { client: true };
}
