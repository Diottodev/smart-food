import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, ClipboardList, UtensilsCrossed, Truck, Users, DollarSign,
  BarChart3, RotateCcw, UserCog, Settings, LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const groups = [
  {
    label: "Principal",
    items: [
      { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/app/pedidos", label: "Pedidos", icon: ClipboardList },
      { to: "/app/cardapio", label: "Cardápio", icon: UtensilsCrossed },
      { to: "/app/entregas", label: "Entregas", icon: Truck },
      { to: "/app/clientes", label: "Clientes", icon: Users },
    ],
  },
  {
    label: "Operacional",
    items: [
      { to: "/app/financeiro", label: "Financeiro", icon: DollarSign },
      { to: "/app/relatorios", label: "Relatórios", icon: BarChart3 },
      { to: "/app/ai-growth", label: "Reativação", icon: RotateCcw },
    ],
  },
  {
    label: "Gestão",
    items: [
      { to: "/app/equipe", label: "Equipe", icon: UserCog },
      { to: "/app/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
] as const;

export function TenantSidebar({ companyName }: { companyName?: string }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { signOut, email } = useAuth();
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-5 py-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/40">Smart Food</div>
        <div className="mt-2 flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-primary text-[10px] font-semibold text-primary-foreground">SF</span>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">Restaurante</div>
            <div className="truncate text-sm font-semibold">{companyName ?? "Smart Food"}</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-4">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40">{g.label}</div>
            <div className="space-y-0.5">
              {g.items.map((it) => {
                const active = pathname === it.to || pathname.startsWith(it.to + "/");
                return (
                  <Link
                    key={it.to}
                    to={it.to}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                      active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                    }`}
                  >
                    <it.icon className="h-4 w-4" />
                    <span className="flex-1">{it.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-3 text-xs">
        <div className="truncate text-sidebar-foreground/70">{email}</div>
        <Button variant="ghost" size="sm" className="mt-2 w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50" onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />Sair
        </Button>
      </div>
    </aside>
  );
}
