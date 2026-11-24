import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bar, BarChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import {
  demoKpisPremium, demoDashboardAlerts, demoTopProductsRich, demoWeeklyRevenue,
  demoCategoryDistribution, demoOrders, demoRiders,
} from "@/lib/demoData";
import { brl } from "@/lib/format";
import {
  ShoppingBag, TrendingUp, Receipt, Users, Flame, Clock, Bike, Star, AlertCircle,
  ChefHat, CheckCircle2, Truck, RotateCcw, ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

const ALERT_STYLES: Record<string, { bar: string; iconBg: string; icon: string }> = {
  red: { bar: "border-l-primary", iconBg: "bg-primary/10", icon: "text-primary" },
  amber: { bar: "border-l-chart-2", iconBg: "bg-accent", icon: "text-accent-foreground" },
  emerald: { bar: "border-l-chart-4", iconBg: "bg-secondary", icon: "text-secondary-foreground" },
  sky: { bar: "border-l-chart-3", iconBg: "bg-secondary", icon: "text-secondary-foreground" },
};
const ALERT_ICONS: Record<string, typeof Flame> = {
  red: Flame, amber: AlertCircle, emerald: TrendingUp, sky: RotateCcw,
};

const KPIS = [
  { label: "Pedidos hoje", value: demoKpisPremium.pedidosHoje, hint: `+${demoKpisPremium.pedidosHojeDelta} vs ontem`, icon: ShoppingBag },
  { label: "Receita do mês", value: brl(demoKpisPremium.receitaMes), hint: `+${demoKpisPremium.receitaMesDelta}% vs anterior`, icon: TrendingUp },
  { label: "Ticket médio", value: brl(demoKpisPremium.ticketMedio), hint: `+R$${demoKpisPremium.ticketMedioDelta}`, icon: Receipt },
  { label: "Clientes ativos", value: demoKpisPremium.clientesAtivos, hint: `+${demoKpisPremium.clientesAtivosDelta} novos`, icon: Users },
  { label: "Em preparo agora", value: demoKpisPremium.emPreparoAgora, hint: "Cozinha em ação", icon: ChefHat },
  { label: "Tempo médio preparo", value: `${demoKpisPremium.tempoMedioPreparo} min`, hint: "Dentro da meta", icon: Clock },
  { label: "Entregadores ativos", value: `${demoKpisPremium.entregadoresAtivos}/${demoKpisPremium.entregadoresTotal}`, hint: "Em rota", icon: Bike },
  { label: "Avaliação média", value: `${demoKpisPremium.avaliacaoMedia}★`, hint: "Últimos 30 dias", icon: Star },
];

const PIPELINE = [
  { key: "novo", label: "Recebido", color: "bg-chart-3" },
  { key: "preparo", label: "Em preparo", color: "bg-chart-2" },
  { key: "pronto", label: "Pronto", color: "bg-chart-4" },
  { key: "saiu", label: "Saiu para entrega", color: "bg-chart-5" },
  { key: "entregue", label: "Entregue", color: "bg-muted-foreground" },
];

export const Route = createFileRoute("/demo/dashboard")({ component: Page });

function Page() {
  const lastOrders = demoOrders.slice(0, 8);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Hamburgueria do Zé · visão geral de hoje" />

      {/* ALERT BANNERS */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {demoDashboardAlerts.map((a, i) => {
          const s = ALERT_STYLES[a.tone];
          const Icon = ALERT_ICONS[a.tone];
          return (
            <Card key={i} className={`p-4 border-l-4 ${s.bar}`}>
              <div className="flex items-start gap-3">
                <div className={`h-9 w-9 shrink-0 rounded-lg ${s.iconBg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${s.icon}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">{a.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{a.desc}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* KPI GRID */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((k) => (
          <Card key={k.label} className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border bg-surface text-primary">
                <k.icon className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-3 font-display text-2xl">{k.value}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{k.hint}</div>
          </Card>
        ))}
      </div>

      {/* CHART + PIPELINE */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <h3 className="font-semibold mb-3">Pedidos por dia da semana</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={demoWeeklyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" /><YAxis />
                <Tooltip formatter={(v: number) => brl(v)} />
                <Bar dataKey="revenue" fill="var(--chart-1)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold mb-3">Pipeline de pedidos · hoje</h3>
          <div className="space-y-2">
            {PIPELINE.map((p) => {
              const count = demoOrders.filter((o) => o.status === p.key).length;
              return (
                <div key={p.key} className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${p.color}`} />
                  <span className="flex-1 text-sm">{p.label}</span>
                  <span className="text-lg font-bold tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* TOP PRODUCTS + RIDERS */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4" />Top 5 produtos do mês</h3>
          <div className="space-y-3">
            {demoTopProductsRich.map((p) => (
              <div key={p.rank} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary text-sm font-semibold text-primary-foreground">
                  {p.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.qty} vendidos</div>
                </div>
                <div className="text-sm font-semibold tabular-nums">{brl(p.revenue)}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Bike className="h-4 w-4" />Entregadores hoje</h3>
          <div className="space-y-2">
            {demoRiders.filter((r) => r.active).slice(0, 4).map((r, i) => {
              const inRoute = i % 2 === 0;
              const entregas = [8, 6, 4, 5][i] ?? 3;
              return (
                <div key={r.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-accent text-sm font-semibold text-accent-foreground">
                    {r.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{r.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{r.vehicle_type} · {entregas} entregas</div>
                  </div>
                  <Badge variant={inRoute ? "default" : "secondary"} className={inRoute ? "bg-emerald-500 hover:bg-emerald-500" : ""}>
                    {inRoute ? "Em rota" : "Disponível"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* PIE + LAST ORDERS */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold mb-3">Distribuição por categoria</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={demoCategoryDistribution} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2} isAnimationActive={false}>
                  {demoCategoryDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-3">
          <h3 className="font-semibold mb-3">Últimos pedidos</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {lastOrders.map((o) => {
              const items = o.items.map((i) => `${i.qty}× ${i.name}`).join(", ");
              const Icon = o.status === "entregue" ? CheckCircle2 : o.status === "saiu" ? Truck : o.status === "pronto" ? CheckCircle2 : ChefHat;
              return (
                <div key={o.id} className="flex items-center gap-3 rounded border p-2.5 text-sm">
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">#{o.number} · {o.customer_name}</div>
                    <div className="text-xs text-muted-foreground truncate">{items}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold tabular-nums">{brl(o.total)}</div>
                    <div className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(o.created_at), { locale: ptBR, addSuffix: true })}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* REACTIVATION BANNER */}
      <Card className="relative overflow-hidden border-0 bg-sidebar p-6 text-sidebar-foreground">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-accent">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-xl">Há R$ 12.800 em receita recuperável</div>
              <div className="text-sm text-sidebar-foreground/70">5 oportunidades aguardando ação · clientes inativos, combos e horário ocioso</div>
            </div>
          </div>
          <Button asChild variant="secondary">
            <Link to="/demo/ai-growth">Ver oportunidades <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
