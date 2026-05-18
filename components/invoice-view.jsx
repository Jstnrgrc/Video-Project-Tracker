"use client";

import { ExternalLink, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, monthLabelFromKey } from "@/lib/utils";

function totals(projects, predicate) {
  return projects.reduce(
    (sum, project) => {
      if (!predicate(project)) return sum;
      sum[project.currency] += Number(project.rate || 0);
      return sum;
    },
    { PHP: 0, USD: 0 },
  );
}

function groupByClient(projects) {
  return projects.reduce((groups, project) => {
    const key = project.clientName || project.client?.name || "Unassigned Client";
    groups[key] = groups[key] || [];
    groups[key].push(project);
    return groups;
  }, {});
}

export function InvoiceView({ projects, clients, selectedMonth, invoiceClientId, setInvoiceClientId }) {
  const invoiceProjects = invoiceClientId === "ALL" ? projects : projects.filter((project) => String(project.clientId) === invoiceClientId);
  const grouped = groupByClient(invoiceProjects);
  const monthly = totals(invoiceProjects, () => true);
  const paid = totals(invoiceProjects, (project) => project.paymentStatus === "PAID");
  const unpaid = totals(invoiceProjects, (project) => project.paymentStatus !== "PAID");

  return (
    <section className="grid gap-4">
      <div className="flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-normal">Client Invoice</h2>
          <p className="text-sm text-muted-foreground">{monthLabelFromKey(selectedMonth)} grouped by client.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={invoiceClientId} onValueChange={setInvoiceClientId}>
            <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All clients</SelectItem>
              {clients.map((client) => <SelectItem key={client.id} value={String(client.id)}>{client.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => window.print()}>
            <Printer className="size-4" />
            Print Invoice
          </Button>
        </div>
      </div>

      <Card className="print:border-none print:shadow-none">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl">Invoice - {monthLabelFromKey(selectedMonth)}</CardTitle>
          <p className="text-sm text-muted-foreground">PHP and USD are kept separate.</p>
        </CardHeader>
        <CardContent className="grid gap-6 pt-6">
          <div className="grid gap-3 sm:grid-cols-4">
            <Summary label="Monthly PHP" value={formatCurrency(monthly.PHP, "PHP")} />
            <Summary label="Monthly USD" value={formatCurrency(monthly.USD, "USD")} />
            <Summary label="Paid" value={`${formatCurrency(paid.PHP, "PHP")} / ${formatCurrency(paid.USD, "USD")}`} />
            <Summary label="Unpaid" value={`${formatCurrency(unpaid.PHP, "PHP")} / ${formatCurrency(unpaid.USD, "USD")}`} />
          </div>

          {Object.entries(grouped).length ? Object.entries(grouped).map(([clientName, items]) => {
            const clientTotal = totals(items, () => true);
            return (
              <section key={clientName} className="grid gap-3 rounded-lg border p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-semibold">{clientName}</h3>
                  <p className="text-sm text-muted-foreground">
                    PHP {formatCurrency(clientTotal.PHP, "PHP")} · USD {formatCurrency(clientTotal.USD, "USD")}
                  </p>
                </div>
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-secondary text-left">
                      <tr>
                        <th className="p-3 font-medium">Project</th>
                        <th className="p-3 font-medium">Link</th>
                        <th className="p-3 font-medium">Payment</th>
                        <th className="p-3 text-right font-medium">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((project) => (
                        <tr key={project.id} className="border-t">
                          <td className="p-3 font-medium">{project.title}</td>
                          <td className="p-3">
                            {project.projectLink ? <a className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" href={project.projectLink} target="_blank" rel="noreferrer"><ExternalLink className="size-4" />Open</a> : "None"}
                          </td>
                          <td className="p-3">{project.paymentStatus}</td>
                          <td className="p-3 text-right font-semibold">{formatCurrency(project.rate, project.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          }) : <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No projects match this invoice.</div>}
        </CardContent>
      </Card>
    </section>
  );
}

function Summary({ label, value }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}
