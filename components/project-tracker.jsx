"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, CalendarDays, Clock, FileText, FolderKanban, Menu, Plus, Search, WalletCards } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { GeneralOverview } from "@/components/dashboard";
import { InvoiceView } from "@/components/invoice-view";
import { LoginScreen } from "@/components/login-screen";
import { ProjectDetailsDrawer } from "@/components/project-details-drawer";
import { ProjectForm } from "@/components/project-form";
import { ProjectRow } from "@/components/project-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { CURRENCIES, PAYMENT_STATUSES, PROJECT_STATUSES, paymentMeta, statusMeta } from "@/lib/project-options";
import { formatCurrency, formatDate, monthKeyFromDate, monthLabelFromKey } from "@/lib/utils";

const allValue = "ALL";

function currentMonthKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getDefaultMonths() {
  const now = new Date();
  return Array.from({ length: 8 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() + index - 2, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  });
}

function sumByCurrency(projects, predicate = () => true) {
  return projects.reduce((sum, project) => {
    if (!predicate(project)) return sum;
    sum[project.currency] = (sum[project.currency] || 0) + Number(project.rate || 0);
    return sum;
  }, { PHP: 0, USD: 0 });
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-lg border border-dashed bg-background p-8 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function MiniList({ title, icon: Icon, projects, onOpen }) {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Icon className="size-4" />{title}</CardTitle></CardHeader>
      <CardContent className="grid gap-2">
        {projects.length ? projects.slice(0, 5).map((project) => (
          <button key={project.id} type="button" onClick={() => onOpen(project)} className="flex items-center justify-between gap-3 rounded-md border p-3 text-left hover:bg-accent">
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{project.title}</span>
              <span className="block truncate text-xs text-muted-foreground">{project.clientName}</span>
            </span>
            <span className="text-sm font-semibold">{formatCurrency(project.rate, project.currency)}</span>
          </button>
        )) : <EmptyState title="Nothing here yet" description="New work will appear in this section." />}
      </CardContent>
    </Card>
  );
}

function ClientForm({ client, onSubmit, onCancel }) {
  const [form, setForm] = useState(client || { name: "", email: "", notes: "" });
  return (
    <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
      <div className="grid gap-2">
        <Label htmlFor="client-name">Client name</Label>
        <Input id="client-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="client-email">Email</Label>
        <Input id="client-email" type="email" value={form.email || ""} onChange={(event) => setForm({ ...form, email: event.target.value })} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="client-notes">Notes</Label>
        <Textarea id="client-notes" value={form.notes || ""} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save client</Button>
      </div>
    </form>
  );
}

function BatchProjectForm({ clients, defaultClientId, onSubmit, onCancel }) {
  const blankRow = { title: "", projectLink: "", dateCreated: new Date().toISOString().slice(0, 10), deadline: "", status: "PENDING", paymentStatus: "UNPAID", rate: "", currency: "PHP", notes: "" };
  const [clientId, setClientId] = useState(defaultClientId ? String(defaultClientId) : "");
  const [rows, setRows] = useState([blankRow]);

  function updateRow(index, field, value) {
    setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row));
  }

  return (
    <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); onSubmit({ clientId: Number(clientId), projects: rows }); }}>
      <div className="grid gap-2">
        <Label>Client</Label>
        <Select value={clientId} onValueChange={setClientId}>
          <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
          <SelectContent>{clients.map((client) => <SelectItem key={client.id} value={String(client.id)}>{client.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid gap-3">
        {rows.map((row, index) => (
          <div key={index} className="grid gap-3 rounded-lg border p-3 md:grid-cols-2">
            <Input placeholder="Project title" value={row.title} onChange={(event) => updateRow(index, "title", event.target.value)} required />
            <Input placeholder="Project link" value={row.projectLink} onChange={(event) => updateRow(index, "projectLink", event.target.value)} />
            <Input type="date" value={row.dateCreated} onChange={(event) => updateRow(index, "dateCreated", event.target.value)} />
            <Input type="date" value={row.deadline} onChange={(event) => updateRow(index, "deadline", event.target.value)} />
            <Select value={row.status} onValueChange={(value) => updateRow(index, "status", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PROJECT_STATUSES.map((status) => <SelectItem key={status} value={status}>{statusMeta[status].label}</SelectItem>)}</SelectContent></Select>
            <Select value={row.paymentStatus} onValueChange={(value) => updateRow(index, "paymentStatus", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PAYMENT_STATUSES.map((status) => <SelectItem key={status} value={status}>{paymentMeta[status].label}</SelectItem>)}</SelectContent></Select>
            <Input type="number" placeholder="Rate" value={row.rate} onChange={(event) => updateRow(index, "rate", event.target.value)} />
            <Select value={row.currency} onValueChange={(value) => updateRow(index, "currency", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CURRENCIES.map((currency) => <SelectItem key={currency} value={currency}>{currency}</SelectItem>)}</SelectContent></Select>
            <Textarea className="md:col-span-2" placeholder="Notes" value={row.notes} onChange={(event) => updateRow(index, "notes", event.target.value)} />
            <div className="flex gap-2 md:col-span-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index))}>Remove Row</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setRows((current) => [...current.slice(0, index + 1), { ...row }, ...current.slice(index + 1)])}>Duplicate Row</Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={() => setRows((current) => [...current, blankRow])}>Add Row</Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={!clientId}>Save All Projects</Button>
        </div>
      </div>
    </form>
  );
}

export function ProjectTracker() {
  const [user, setUser] = useState(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState(allValue);
  const [statusFilter, setStatusFilter] = useState(allValue);
  const [paymentFilter, setPaymentFilter] = useState(allValue);
  const [currencyFilter, setCurrencyFilter] = useState(allValue);
  const [invoiceClientId, setInvoiceClientId] = useState("ALL");
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  async function loadAuth() {
    const response = await fetch("/api/auth/me", { cache: "no-store" });
    const data = await response.json();
    setUser(data.user);
    setNeedsSetup(data.needsSetup);
    setAuthLoading(false);
  }

  async function loadData() {
    setIsLoading(true);
    const [projectResponse, clientResponse] = await Promise.all([
      fetch("/api/projects", { cache: "no-store" }),
      fetch("/api/clients", { cache: "no-store" }),
    ]);
    setProjects(await projectResponse.json());
    setClients(await clientResponse.json());
    setIsLoading(false);
  }

  useEffect(() => {
    loadAuth();
    loadData();
  }, []);

  const monthOptions = useMemo(() => {
    const keys = new Set(getDefaultMonths());
    projects.forEach((project) => keys.add(monthKeyFromDate(project.dateCreated)));
    return Array.from(keys).sort().reverse();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((project) => {
      return (!query || project.title.toLowerCase().includes(query) || project.clientName.toLowerCase().includes(query))
        && (clientFilter === allValue || String(project.clientId) === clientFilter)
        && (statusFilter === allValue || project.status === statusFilter)
        && (paymentFilter === allValue || project.paymentStatus === paymentFilter)
        && (currencyFilter === allValue || project.currency === currencyFilter);
    });
  }, [clientFilter, currencyFilter, paymentFilter, projects, search, statusFilter]);

  const selectedMonthProjects = useMemo(() => filteredProjects.filter((project) => monthKeyFromDate(project.dateCreated) === selectedMonth), [filteredProjects, selectedMonth]);

  function clientProjects(client) {
    return projects.filter((project) => project.clientId === client.id || project.clientName === client.name);
  }

  function clientSummary(client) {
    const items = clientProjects(client);
    return {
      items,
      total: sumByCurrency(items),
      unpaid: sumByCurrency(items, (project) => project.paymentStatus !== "PAID"),
      paid: sumByCurrency(items, (project) => project.paymentStatus === "PAID"),
    };
  }

  async function saveProject(payload) {
    const url = editingProject?.id ? `/api/projects/${editingProject.id}` : "/api/projects";
    const method = editingProject?.id ? "PATCH" : "POST";
    const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (response.ok) {
      await loadData();
      setIsProjectFormOpen(false);
      setEditingProject(null);
    }
  }

  async function saveClient(payload) {
    const url = editingClient ? `/api/clients/${editingClient.id}` : "/api/clients";
    const method = editingClient ? "PATCH" : "POST";
    const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (response.ok) {
      await loadData();
      setIsClientFormOpen(false);
      setEditingClient(null);
    }
  }

  async function deleteProject(project) {
    if (!window.confirm(`Delete "${project.title}"?`)) return;
    await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    await loadData();
  }

  async function deleteClient(client) {
    if (!window.confirm(`Delete ${client.name} and all projects under this client?`)) return;
    await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
    setSelectedClient(null);
    await loadData();
  }

  async function inlineUpdate(project, patch) {
    setProjects((current) => current.map((item) => item.id === project.id ? { ...item, ...patch } : item));
    await fetch(`/api/projects/${project.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ inlineUpdate: true, ...patch }) });
    await loadData();
  }

  async function markProjectPayment(project, paymentStatus) {
    await inlineUpdate(project, { paymentStatus });
  }

  async function batchAdd(payload) {
    const response = await fetch("/api/projects/batch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (response.ok) {
      await loadData();
      setIsBatchOpen(false);
    }
  }

  async function bulkMarkPaid(clientId = null) {
    const target = clientId ? `${clients.find((client) => client.id === clientId)?.name} in ${monthLabelFromKey(selectedMonth)}` : `all projects in ${monthLabelFromKey(selectedMonth)}`;
    if (!window.confirm(`Mark ${target} as paid?`)) return;
    await fetch("/api/projects/bulk-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month: selectedMonth, clientId }),
    });
    await loadData();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  function renderRows(items) {
    if (isLoading) return <EmptyState title="Loading projects..." description="Pulling project and client data together." />;
    if (!items.length) return <EmptyState title="No projects found" description="Add a project or adjust the filters." />;
    return <div className="grid gap-3">{items.map((project) => <ProjectRow key={project.id} project={project} onOpen={setSelectedProject} onEdit={(item) => { setEditingProject(item); setIsProjectFormOpen(true); }} onDelete={deleteProject} onInlineUpdate={inlineUpdate} />)}</div>;
  }

  if (authLoading) return <main className="flex min-h-screen items-center justify-center bg-secondary/40 text-sm text-muted-foreground">Loading tracker...</main>;
  if (!user) return <LoginScreen needsSetup={needsSetup} onLogin={setUser} />;

  const sidebar = <AppSidebar activeView={activeView} onViewChange={(view) => { setActiveView(view); setMobileSidebarOpen(false); }} user={user} onLogout={logout} />;

  return (
    <main className="min-h-screen bg-secondary/30 text-foreground">
      <div className="lg:grid lg:grid-cols-[272px_1fr]">
        <div className="hidden lg:block">{sidebar}</div>
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}><SheetContent side="left" className="max-w-80 p-0">{sidebar}</SheetContent></Sheet>
        <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setMobileSidebarOpen(true)}><Menu className="size-4" /></Button>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Authentication → Dashboard → Clients → Projects → Monthly View → Invoices → Profile</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-normal md:text-3xl">
                  {activeView === "dashboard" && "Dashboard"}
                  {activeView === "clients" && "Clients"}
                  {activeView === "projects" && "Projects"}
                  {activeView === "monthly" && "Monthly View"}
                  {activeView === "invoices" && "Invoices"}
                  {activeView === "profile" && "Profile"}
                </h1>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => { setEditingClient(null); setIsClientFormOpen(true); }}><Building2 className="size-4" />Add Client</Button>
              <Button onClick={() => { setEditingProject(null); setIsProjectFormOpen(true); }}><Plus className="size-4" />Add Project</Button>
            </div>
          </header>

          <div className="grid gap-6">
            {activeView === "dashboard" && <>
              <GeneralOverview projects={projects} />
              <div className="grid gap-4 xl:grid-cols-2">
                <MiniList title="Recent Projects" icon={FolderKanban} projects={projects.slice(0, 5)} onOpen={setSelectedProject} />
                <MiniList title="Upcoming Deadlines" icon={Clock} projects={projects.filter((project) => project.deadline).sort((a, b) => new Date(a.deadline) - new Date(b.deadline))} onOpen={setSelectedProject} />
                <MiniList title="Unpaid Projects" icon={WalletCards} projects={projects.filter((project) => project.paymentStatus !== "PAID")} onOpen={setSelectedProject} />
                <MiniList title="This Month Summary" icon={CalendarDays} projects={projects.filter((project) => monthKeyFromDate(project.dateCreated) === currentMonthKey())} onOpen={setSelectedProject} />
              </div>
            </>}

            {activeView === "clients" && <ClientsView clients={clients} clientSummary={clientSummary} onView={setSelectedClient} onEdit={(client) => { setEditingClient(client); setIsClientFormOpen(true); }} onDelete={deleteClient} onAddProject={(client) => { setEditingProject({ clientId: client.id, clientName: client.name }); setIsProjectFormOpen(true); }} onBatch={(client) => { setSelectedClient(client); setIsBatchOpen(true); }} />}

            {(activeView === "projects" || activeView === "monthly") && <>
              <Filters search={search} setSearch={setSearch} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} monthOptions={monthOptions} clients={clients} clientFilter={clientFilter} setClientFilter={setClientFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter} paymentFilter={paymentFilter} setPaymentFilter={setPaymentFilter} currencyFilter={currencyFilter} setCurrencyFilter={setCurrencyFilter} />
              {activeView === "projects" ? <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><FolderKanban className="size-4" />Project Table</CardTitle></CardHeader><CardContent>{renderRows(filteredProjects)}</CardContent></Card> : <MonthlyView clients={clients} projects={selectedMonthProjects} month={selectedMonth} renderRows={renderRows} onBulkMonth={() => bulkMarkPaid()} onBulkClient={bulkMarkPaid} />}
            </>}

            {activeView === "invoices" && <>
              <Card className="print:hidden"><CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">Generate Invoice</p><p className="text-sm text-muted-foreground">Select a month and one client or all clients.</p></div><Select value={selectedMonth} onValueChange={setSelectedMonth}><SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger><SelectContent>{monthOptions.map((month) => <SelectItem key={month} value={month}>{monthLabelFromKey(month)}</SelectItem>)}</SelectContent></Select></CardContent></Card>
              <InvoiceView projects={selectedMonthProjects} clients={clients} selectedMonth={selectedMonth} invoiceClientId={invoiceClientId} setInvoiceClientId={setInvoiceClientId} />
            </>}

            {activeView === "profile" && <Card className="max-w-2xl"><CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader><CardContent className="flex items-center gap-4">{user.profileImage ? <img src={user.profileImage} alt="" className="size-16 rounded-full object-cover" /> : <div className="flex size-16 items-center justify-center rounded-full bg-secondary text-xl font-semibold">{user.name?.[0]}</div>}<div><p className="text-lg font-semibold">{user.name}</p><p className="text-sm text-muted-foreground">{user.email}</p></div></CardContent></Card>}
          </div>
        </section>
      </div>

      <Dialog open={isProjectFormOpen} onOpenChange={setIsProjectFormOpen}><DialogContent><DialogHeader><DialogTitle>{editingProject?.id ? "Edit Project" : "Add Project"}</DialogTitle><DialogDescription>Client-first project entry, grouped for billing later.</DialogDescription></DialogHeader><ProjectForm project={editingProject} clients={clients} defaultClientId={editingProject?.clientId} onSubmit={saveProject} onCancel={() => setIsProjectFormOpen(false)} /></DialogContent></Dialog>
      <Dialog open={isClientFormOpen} onOpenChange={setIsClientFormOpen}><DialogContent><DialogHeader><DialogTitle>{editingClient ? "Edit Client" : "Add Client"}</DialogTitle><DialogDescription>Clients organize projects and invoices.</DialogDescription></DialogHeader><ClientForm client={editingClient} onSubmit={saveClient} onCancel={() => setIsClientFormOpen(false)} /></DialogContent></Dialog>
      <Dialog open={isBatchOpen} onOpenChange={setIsBatchOpen}><DialogContent className="max-w-5xl"><DialogHeader><DialogTitle>Batch Add Projects</DialogTitle><DialogDescription>Add multiple projects for one selected client.</DialogDescription></DialogHeader><BatchProjectForm clients={clients} defaultClientId={selectedClient?.id} onSubmit={batchAdd} onCancel={() => setIsBatchOpen(false)} /></DialogContent></Dialog>
      <ProjectDetailsDrawer project={selectedProject} open={Boolean(selectedProject)} onOpenChange={(open) => !open && setSelectedProject(null)} onEdit={(project) => { setEditingProject(project); setIsProjectFormOpen(true); }} onDelete={deleteProject} onMarkPayment={markProjectPayment} />
      <ClientDrawer client={selectedClient} projects={selectedClient ? clientProjects(selectedClient) : []} open={Boolean(selectedClient)} onOpenChange={(open) => !open && setSelectedClient(null)} onAddProject={(client) => { setEditingProject({ clientId: client.id, clientName: client.name }); setIsProjectFormOpen(true); }} onBatch={(client) => { setSelectedClient(client); setIsBatchOpen(true); }} onInvoice={(client) => { setInvoiceClientId(String(client.id)); setActiveView("invoices"); }} renderRows={renderRows} />
    </main>
  );
}

function Filters({ search, setSearch, selectedMonth, setSelectedMonth, monthOptions, clients, clientFilter, setClientFilter, statusFilter, setStatusFilter, paymentFilter, setPaymentFilter, currencyFilter, setCurrencyFilter }) {
  return (
    <Card><CardContent className="grid gap-3 pt-5 md:grid-cols-[1.2fr_repeat(5,minmax(130px,1fr))]"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search project or client" value={search} onChange={(event) => setSearch(event.target.value)} /></div><Select value={selectedMonth} onValueChange={setSelectedMonth}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{monthOptions.map((month) => <SelectItem key={month} value={month}>{monthLabelFromKey(month)}</SelectItem>)}</SelectContent></Select><Select value={clientFilter} onValueChange={setClientFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value={allValue}>All clients</SelectItem>{clients.map((client) => <SelectItem key={client.id} value={String(client.id)}>{client.name}</SelectItem>)}</SelectContent></Select><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value={allValue}>All statuses</SelectItem>{PROJECT_STATUSES.map((status) => <SelectItem key={status} value={status}>{statusMeta[status].label}</SelectItem>)}</SelectContent></Select><Select value={paymentFilter} onValueChange={setPaymentFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value={allValue}>All payments</SelectItem>{PAYMENT_STATUSES.map((status) => <SelectItem key={status} value={status}>{paymentMeta[status].label}</SelectItem>)}</SelectContent></Select><Select value={currencyFilter} onValueChange={setCurrencyFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value={allValue}>All currencies</SelectItem>{CURRENCIES.map((currency) => <SelectItem key={currency} value={currency}>{currency}</SelectItem>)}</SelectContent></Select></CardContent></Card>
  );
}

function ClientsView({ clients, clientSummary, onView, onEdit, onDelete, onAddProject, onBatch }) {
  return <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Building2 className="size-4" />Client Management</CardTitle></CardHeader><CardContent className="grid gap-3">{clients.length ? clients.map((client) => { const summary = clientSummary(client); return <div key={client.id} className="grid gap-3 rounded-lg border p-4 lg:grid-cols-[1.2fr_auto_auto_auto_auto] lg:items-center"><button className="text-left" onClick={() => onView(client)}><p className="font-semibold">{client.name}</p><p className="text-sm text-muted-foreground">{summary.items.length} projects · Unpaid {formatCurrency(summary.unpaid.PHP, "PHP")} / {formatCurrency(summary.unpaid.USD, "USD")}</p></button><p className="text-sm font-semibold">PHP {formatCurrency(summary.total.PHP, "PHP")}</p><p className="text-sm font-semibold">USD {formatCurrency(summary.total.USD, "USD")}</p><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => onView(client)}>View</Button><Button size="sm" variant="outline" onClick={() => onEdit(client)}>Edit</Button><Button size="sm" variant="outline" onClick={() => onAddProject(client)}>Add project</Button><Button size="sm" variant="outline" onClick={() => onBatch(client)}>Batch add</Button><Button size="sm" variant="destructive" onClick={() => onDelete(client)}>Delete</Button></div></div>; }) : <EmptyState title="No clients yet" description="Create a client before building projects and invoices." />}</CardContent></Card>;
}

function MonthlyView({ clients, projects, month, renderRows, onBulkMonth, onBulkClient }) {
  return <div className="grid gap-4"><Card><CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{monthLabelFromKey(month)}</p><p className="text-sm text-muted-foreground">Grouped as Month → Client → Projects.</p></div><Button onClick={onBulkMonth}><WalletCards className="size-4" />Mark all month paid</Button></CardContent></Card>{clients.map((client) => { const items = projects.filter((project) => project.clientId === client.id || project.clientName === client.name); if (!items.length) return null; return <Card key={client.id}><CardHeader><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><CardTitle className="text-base">Client: {client.name}</CardTitle><Button variant="outline" size="sm" onClick={() => onBulkClient(client.id)}>Mark this client/month paid</Button></div></CardHeader><CardContent>{renderRows(items)}</CardContent></Card>; })}</div>;
}

function ClientDrawer({ client, projects, open, onOpenChange, onAddProject, onBatch, onInvoice, renderRows }) {
  const total = sumByCurrency(projects);
  const paid = sumByCurrency(projects, (project) => project.paymentStatus === "PAID");
  const unpaid = sumByCurrency(projects, (project) => project.paymentStatus !== "PAID");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col">
        <DialogHeader>
          <DialogTitle>{client?.name}</DialogTitle>
          <DialogDescription>Client overview — projects, billing, and invoices.</DialogDescription>
        </DialogHeader>
        {client && (
          <div className="grid gap-5 overflow-y-auto pr-1">
            <div className="grid gap-3 sm:grid-cols-3">
              <Summary label="Projects" value={projects.length} />
              <Summary label="Paid" value={`${formatCurrency(paid.PHP, "PHP")} / ${formatCurrency(paid.USD, "USD")}`} />
              <Summary label="Unpaid" value={`${formatCurrency(unpaid.PHP, "PHP")} / ${formatCurrency(unpaid.USD, "USD")}`} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Summary label="Pending" value={projects.filter((project) => project.status === "PENDING").length} />
              <Summary label="Doing" value={projects.filter((project) => project.status === "DOING").length} />
              <Summary label="Completed" value={projects.filter((project) => project.status === "COMPLETED").length} />
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-semibold">Totals</p>
              <p className="mt-2 text-sm text-muted-foreground">PHP {formatCurrency(total.PHP, "PHP")} · USD {formatCurrency(total.USD, "USD")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => onAddProject(client)}><Plus className="size-4" />Add Project</Button>
              <Button variant="outline" onClick={() => onBatch(client)}>Batch Add Projects</Button>
              <Button variant="outline" onClick={() => onInvoice(client)}><FileText className="size-4" />Generate Client Invoice</Button>
            </div>
            <div>{renderRows(projects)}</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Summary({ label, value }) {
  return <div className="rounded-lg border p-3"><p className="text-xs font-medium uppercase text-muted-foreground">{label}</p><p className="mt-2 text-lg font-semibold">{value}</p></div>;
}
