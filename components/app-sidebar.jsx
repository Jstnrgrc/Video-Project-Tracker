"use client";

import { BarChart3, Building2, CalendarDays, FileText, FolderKanban, LogOut, UserRound, WalletCards } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "clients", label: "Clients", icon: Building2 },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "monthly", label: "Monthly View", icon: CalendarDays },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "profile", label: "Profile", icon: UserRound },
];

function initials(name) {
  return String(name || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AppSidebar({ activeView, onViewChange, user, onLogout }) {
  return (
    <aside className="flex h-full min-h-screen w-full flex-col border-r bg-background/95 px-3 py-4 lg:w-72">
      <div className="flex items-center gap-3 px-2">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <WalletCards className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Video Tracker</p>
          <p className="truncate text-xs text-muted-foreground">Project workspace</p>
        </div>
      </div>

      <nav className="mt-8 grid gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground",
                activeView === item.id && "bg-accent text-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto grid gap-3 rounded-lg border bg-card p-3">
        <div className="flex items-center gap-3">
          {user?.profileImage ? (
            <img src={user.profileImage} alt="" className="size-10 rounded-full object-cover" />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
              {initials(user?.name)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user?.name || "Profile"}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" className="flex-1" onClick={onLogout}>
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
