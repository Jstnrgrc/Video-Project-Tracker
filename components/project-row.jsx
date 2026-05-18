"use client";

import { CalendarClock, CreditCard, ExternalLink, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PAYMENT_STATUSES, PROJECT_STATUSES, paymentMeta, statusMeta } from "@/lib/project-options";
import { formatCurrency, formatDate, monthLabelFromKey, monthKeyFromDate } from "@/lib/utils";

export function ProjectRow({ project, onOpen, onEdit, onDelete, onInlineUpdate }) {
  return (
    <div className="grid gap-3 rounded-lg border bg-card p-4 shadow-sm transition hover:border-primary/30 xl:grid-cols-[1.3fr_1fr_auto_1fr_1fr_auto_auto_auto] xl:items-center">
      <button type="button" className="min-w-0 text-left" onClick={() => onOpen(project)}>
        <p className="truncate text-sm font-semibold">{project.title}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{project.clientName}</p>
      </button>
      <div className="flex items-center gap-2 text-sm">
        {project.projectLink ? (
          <a href={project.projectLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ExternalLink className="size-4" />
            Open
          </a>
        ) : <span className="text-muted-foreground">No link</span>}
      </div>
      <div className="text-sm text-muted-foreground">{monthLabelFromKey(monthKeyFromDate(project.dateCreated))}</div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
        <Select value={project.status} onValueChange={(status) => onInlineUpdate(project, { status })}>
          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PROJECT_STATUSES.map((status) => <SelectItem key={status} value={status}>{statusMeta[status].label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
        <Select value={project.paymentStatus} onValueChange={(paymentStatus) => onInlineUpdate(project, { paymentStatus })}>
          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PAYMENT_STATUSES.map((status) => <SelectItem key={status} value={status}>{paymentMeta[status].label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap">
        <CreditCard className="size-4 text-muted-foreground" />
        {formatCurrency(project.rate, project.currency)}
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarClock className="size-4" />
        {formatDate(project.deadline)}
      </div>
      <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" title="View project" aria-label="View project" onClick={() => onOpen(project)}>
        <Eye className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" title="Edit project" aria-label="Edit project" onClick={() => onEdit(project)}>
        <Pencil className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" title="Delete project" aria-label="Delete project" onClick={() => onDelete(project)}>
        <Trash2 className="size-4 text-destructive" />
      </Button>
      </div>
    </div>
  );
}
