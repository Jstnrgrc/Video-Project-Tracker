"use client";

import { CalendarDays, CheckCircle2, CircleDollarSign, Clock3, ListTodo, WalletCards } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function moneyByCurrency(projects, predicate) {
  return projects.reduce((totals, project) => {
    if (!predicate(project)) return totals;
    totals[project.currency] = (totals[project.currency] || 0) + Number(project.rate || 0);
    return totals;
  }, {});
}

function MoneyLines({ totals }) {
  const entries = Object.entries(totals);
  if (!entries.length) return <span>{formatCurrency(0, "PHP")}</span>;
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-1">
      {entries.map(([currency, amount]) => <span key={currency}>{formatCurrency(amount, currency)}</span>)}
    </span>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-normal">{value}</div>
      </CardContent>
    </Card>
  );
}

export function Dashboard({ projects, title = "Overview" }) {
  const now = new Date();
  const overdue = projects.filter((project) => project.deadline && new Date(project.deadline) < now && project.status !== "COMPLETED").length;
  const totalEarnings = moneyByCurrency(projects, () => true);
  const paidEarnings = moneyByCurrency(projects, (project) => project.paymentStatus === "PAID");
  const unpaidEarnings = moneyByCurrency(projects, (project) => project.paymentStatus !== "PAID");

  return (
    <section className="grid gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-normal">{title}</h2>
        <p className="text-sm text-muted-foreground">A clean snapshot of project progress and earnings.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total projects" value={projects.length} icon={CalendarDays} />
        <StatCard label="Pending" value={projects.filter((project) => project.status === "PENDING").length} icon={ListTodo} />
        <StatCard label="Doing" value={projects.filter((project) => project.status === "DOING").length} icon={Clock3} />
        <StatCard label="Completed" value={projects.filter((project) => project.status === "COMPLETED").length} icon={CheckCircle2} />
        <StatCard label="Overdue" value={overdue} icon={Clock3} />
        <StatCard label="Total earnings" value={<MoneyLines totals={totalEarnings} />} icon={CircleDollarSign} />
        <StatCard label="Paid earnings" value={<MoneyLines totals={paidEarnings} />} icon={WalletCards} />
        <StatCard label="Unpaid remaining" value={<MoneyLines totals={unpaidEarnings} />} icon={CircleDollarSign} />
      </div>
    </section>
  );
}

export function GeneralOverview({ projects }) {
  const total = moneyByCurrency(projects, () => true);
  const paid = moneyByCurrency(projects, (project) => project.paymentStatus === "PAID");
  const unpaid = moneyByCurrency(projects, (project) => project.paymentStatus !== "PAID");

  return (
    <section className="grid gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-normal">General Overview</h2>
        <p className="text-sm text-muted-foreground">Overall status across every month.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total projects" value={projects.length} icon={CalendarDays} />
        <StatCard label="Pending projects" value={projects.filter((project) => project.status === "PENDING").length} icon={ListTodo} />
        <StatCard label="Doing projects" value={projects.filter((project) => project.status === "DOING").length} icon={Clock3} />
        <StatCard label="Completed projects" value={projects.filter((project) => project.status === "COMPLETED").length} icon={CheckCircle2} />
        <StatCard label="Total PHP" value={formatCurrency(total.PHP || 0, "PHP")} icon={CircleDollarSign} />
        <StatCard label="Total USD" value={formatCurrency(total.USD || 0, "USD")} icon={CircleDollarSign} />
        <StatCard label="Paid PHP" value={formatCurrency(paid.PHP || 0, "PHP")} icon={WalletCards} />
        <StatCard label="Paid USD" value={formatCurrency(paid.USD || 0, "USD")} icon={WalletCards} />
        <StatCard label="Unpaid PHP" value={formatCurrency(unpaid.PHP || 0, "PHP")} icon={CircleDollarSign} />
        <StatCard label="Unpaid USD" value={formatCurrency(unpaid.USD || 0, "USD")} icon={CircleDollarSign} />
      </div>
    </section>
  );
}
