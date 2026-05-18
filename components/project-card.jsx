"use client";

import { CalendarClock, ExternalLink, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PROJECT_STATUSES, paymentMeta, priorityMeta, statusMeta } from "@/lib/project-options";
import { formatCurrency, formatDate } from "@/lib/utils";

export function ProjectCard({ project, onEdit, onDelete, onMove }) {
  const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== "COMPLETED";

  return (
    <article className="rounded-lg border bg-background p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{project.title}</h3>
          <p className="mt-1 truncate text-xs text-muted-foreground">{project.clientName}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 shrink-0" aria-label="Project actions" title="Project actions">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(project)}>Edit</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={project.status} onValueChange={(status) => onMove(project, status)}>
                  {PROJECT_STATUSES.map((status) => (
                    <DropdownMenuRadioItem key={status} value={status}>{statusMeta[status].label}</DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(project)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant={priorityMeta[project.priority].tone}>{priorityMeta[project.priority].label}</Badge>
        <Badge variant={paymentMeta[project.paymentStatus].tone}>{paymentMeta[project.paymentStatus].label}</Badge>
        {isOverdue && <Badge variant="danger">Overdue</Badge>}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-lg font-semibold">{formatCurrency(project.rate, project.currency)}</p>
        {project.projectLink && (
          <Button asChild variant="ghost" size="sm" className="h-8 px-2">
            <a href={project.projectLink} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />
              Link
            </a>
          </Button>
        )}
      </div>

      <div className="mt-4 grid gap-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarClock className="size-3.5" />
          <span>Created {formatDate(project.dateCreated)}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarClock className="size-3.5" />
          <span>Due {formatDate(project.deadline)}</span>
        </div>
      </div>

      {project.notes && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{project.notes}</p>}
    </article>
  );
}
