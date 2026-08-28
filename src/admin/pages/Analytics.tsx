import { useMemo, useState } from "react";
import { Calendar, Download, TrendingUp } from "lucide-react";
import { PageCard } from "@/admin/components/PageCard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup,
  DropdownMenuRadioItem, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { revenueSeries, userGrowth, categoryBreakdown } from "@/lib/mock-data";
import { moneyInNaira } from "@/lib/utils";
import { useAdminStore } from "@/admin/store/adminStore";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { toast } from "react-toastify";

const RANGES = [
  { key: "7d", label: "Last 7 Days", count: 1 },
  { key: "30d", label: "Last 30 Days", count: 3 },
  { key: "3m", label: "Last 3 Months", count: 4 },
  { key: "6m", label: "Last 6 Months", count: 6 },
  { key: "1y", label: "Last Year", count: 12 },
] as const;

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--info))", "hsl(var(--warning))", "hsl(var(--muted))"];

export default function Analytics() {
  const orders = useAdminStore((s) => s.orders);
  const payouts = useAdminStore((s) => s.payouts);
  const users = useAdminStore((s) => s.users);
  const [range, setRange] = useState<typeof RANGES[number]["key"]>("30d");
  const cfg = RANGES.find((r) => r.key === range)!;

  const revenue = useMemo(() => revenueSeries.slice(-cfg.count), [cfg]);
  const totalRevenue = revenue.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = revenue.reduce((s, d) => s + d.orders, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Marketplace performance, growth and conversion.</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 gap-2 rounded-xl">
                <Calendar className="h-4 w-4" /> {cfg.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-[10px] uppercase">Date range</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={range} onValueChange={(v) => setRange(v as typeof range)}>
                {RANGES.map((r) => <DropdownMenuRadioItem key={r.key} value={r.key}>{r.label}</DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="h-10 gap-1.5 rounded-xl" onClick={() => toast("Export queued")}>
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Revenue" value={`₦${totalRevenue.toLocaleString()}`} delta="+18.9%" />
        <Stat label="Orders" value={totalOrders.toLocaleString()} delta="+22.3%" />
        <Stat label="Active sellers" value={users.filter((u) => u.role === "Seller").length.toString()} delta="+8.1%" />
        <Stat label="Payouts" value={`₦${moneyInNaira(payouts.reduce((s, p) => s + p.amount, 0)).toLocaleString()}`} delta="+12.4%" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PageCard title="Revenue" description={`Marketplace revenue · ${cfg.label}`} className="lg:col-span-2">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`₦${v.toLocaleString()}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </PageCard>

        <PageCard title="Categories" description="Listing breakdown">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {categoryBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </PageCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PageCard title="User growth" description="Users vs sellers" action={<TrendingUp className="h-4 w-4 text-success" />}>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowth} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="sellers" stroke="hsl(var(--secondary))" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </PageCard>

        <PageCard title="Orders" description="Order volume over time">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PageCard>
      </div>
    </div>
  );
}

function Stat({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs font-semibold text-success">{delta} vs prev</p>
    </div>
  );
}
