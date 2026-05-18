"use client";

import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { paymentMeta, priorityMeta, statusMeta } from "@/lib/project-options";
import { formatCurrency, formatDate } from "@/lib/utils";

function Detail({ label, value }) {
  return (
    <div className="grid gap-1 rounded-lg border p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <div className="text-sm">{value || "None"}</div>
    </div>
  );
}

export function ProjectDetailsDrawer({ project, open, onOpenChange, onEdit, onDelete, onMarkPayment }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        {project && (
          <div className="grid gap-6">
            <SheetHeader>
              <SheetTitle>{project.title}</SheetTitle>
              <SheetDescription>{project.clientName}</SheetDescription>
            </SheetHeader>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => onEdit?.(project)}>Edit Project</Button>
              <Button variant="outline" onClick={() => onMarkPayment?.(project, project.paymentStatus === "PAID" ? "UNPAID" : "PAID")}>
                {project.paymentStatus === "PAID" ? "Mark Unpaid" : "Mark Paid"}
              </Button>
              <Button variant="destructive" onClick={() => onDelete?.(project)}>Delete</Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={statusMeta[project.status]?.tone || "secondary"}>{statusMeta[project.status]?.label || project.status}</Badge>
              <Badge variant={priorityMeta[project.priority]?.tone || "secondary"}>{priorityMeta[project.priority]?.label || project.priority}</Badge>
              <Badge variant={paymentMeta[project.paymentStatus]?.tone || "secondary"}>{paymentMeta[project.paymentStatus]?.label || project.paymentStatus}</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="Rate" value={formatCurrency(project.rate, project.currency)} />
              <Detail label="Currency" value={project.currency} />
              <Detail label="Date created" value={formatDate(project.dateCreated)} />
              <Detail label="Deadline" value={formatDate(project.deadline)} />
            </div>

            <Detail
              label="Project link"
              value={
                project.projectLink ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={project.projectLink} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-4" />
                      Open link
                    </a>
                  </Button>
                ) : null
              }
            />
            <Detail label="Notes" value={<p className="whitespace-pre-wrap leading-6 text-muted-foreground">{project.notes || "None"}</p>} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
