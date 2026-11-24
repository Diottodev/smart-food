import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { DemoSidebar, demoGroups } from "@/components/DemoSidebar";

export const Route = createFileRoute("/demo")({ component: Layout });

function MobileDemoNav() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <nav className="flex gap-1 overflow-x-auto border-b bg-surface px-4 py-2 md:hidden">
      {demoGroups.flatMap((g) => g.items).map((it) => {
        const active = pathname === it.to;
        return (
          <Link
            key={it.to}
            to={it.to}
            className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Layout() {
  return (
    <div className="flex min-h-screen bg-surface">
      <DemoSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between border-b bg-accent px-4 py-2 text-xs text-accent-foreground">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Demonstração com dados fictícios
          </span>
          <Link to="/entrar" className="font-medium underline underline-offset-2">Criar conta</Link>
        </div>
        <MobileDemoNav />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto"><Outlet /></main>
      </div>
    </div>
  );
}
