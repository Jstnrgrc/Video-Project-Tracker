"use client";

import { useMemo, useState } from "react";
import { Link, NotebookTabs, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CURRENCIES, PAYMENT_STATUSES, PRIORITIES, PROJECT_STATUSES, paymentMeta, priorityMeta, statusMeta } from "@/lib/project-options";

function toDateInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

const emptyProject = {
  title: "",
  clientName: "",
  clientId: "",
  status: "PENDING",
  projectLink: "",
  dateCreated: new Date().toISOString().slice(0, 10),
  deadline: "",
  notes: "",
  priority: "MEDIUM",
  paymentStatus: "UNPAID",
  rate: "",
  currency: "PHP",
};

export function ProjectForm({ project, clients = [], defaultClientId = "", onSubmit, onCancel, isSubmitting }) {
  const initialProject = useMemo(() => {
    if (!project) return { ...emptyProject, clientId: defaultClientId ? String(defaultClientId) : "" };
    return {
      ...project,
      clientId: project.clientId ? String(project.clientId) : "",
      dateCreated: toDateInput(project.dateCreated),
      deadline: toDateInput(project.deadline),
      rate: String(project.rate ?? ""),
      projectLink: project.projectLink || "",
      notes: project.notes || "",
    };
  }, [defaultClientId, project]);

  const [form, setForm] = useState(initialProject);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      rate: Number(form.rate || 0),
      clientId: form.clientId ? Number(form.clientId) : undefined,
    });
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <section className="grid gap-4 rounded-lg border p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <NotebookTabs className="size-4" />
          Basic Info
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="title">Project title</Label>
            <Input id="title" value={form.title} onChange={(event) => updateField("title", event.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label>Client</Label>
            <Select value={form.clientId || "NEW"} onValueChange={(value) => updateField("clientId", value === "NEW" ? "" : value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW">New client</SelectItem>
                {clients.map((client) => <SelectItem key={client.id} value={String(client.id)}>{client.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {!form.clientId && (
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="clientName">New client name</Label>
            <Input id="clientName" value={form.clientName} onChange={(event) => updateField("clientName", event.target.value)} required={!form.clientId} />
          </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Link className="size-4" />
          Project Details
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(value) => updateField("status", value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map((status) => <SelectItem key={status} value={status}>{statusMeta[status].label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Priority</Label>
            <Select value={form.priority} onValueChange={(value) => updateField("priority", value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((priority) => <SelectItem key={priority} value={priority}>{priorityMeta[priority].label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input id="deadline" type="date" value={form.deadline} onChange={(event) => updateField("deadline", event.target.value)} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="dateCreated">Date created</Label>
          <Input id="dateCreated" type="date" value={form.dateCreated} onChange={(event) => updateField("dateCreated", event.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="projectLink">Google Drive or project link</Label>
          <Input id="projectLink" type="url" placeholder="https://drive.google.com/..." value={form.projectLink} onChange={(event) => updateField("projectLink", event.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" value={form.notes} onChange={(event) => updateField("notes", event.target.value)} />
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <WalletCards className="size-4" />
          Payment Info
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <Label>Payment</Label>
            <Select value={form.paymentStatus} onValueChange={(value) => updateField("paymentStatus", value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_STATUSES.map((status) => <SelectItem key={status} value={status}>{paymentMeta[status].label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rate">Project rate</Label>
            <Input id="rate" type="number" min="0" step="0.01" value={form.rate} onChange={(event) => updateField("rate", event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Currency</Label>
            <Select value={form.currency} onValueChange={(value) => updateField("currency", value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => <SelectItem key={currency} value={currency}>{currency}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save project"}</Button>
      </div>
    </form>
  );
}
