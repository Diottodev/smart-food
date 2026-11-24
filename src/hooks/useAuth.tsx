import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "admin" | "garcom" | "cozinha" | "entregador" | "caixa" | "demo";

export type CompanyMembership = {
  company_id: string;
  role: AppRole;
  ativo: boolean;
  company: {
    id: string;
    name: string;
    slug: string;
    cor_primaria: string;
    status: "trial" | "active" | "inadimplente" | "suspended" | "inactive";
    plano: "starter" | "pro" | "enterprise";
    trial_ate: string;
    valor_mensal: number;
  } | null;
};

type AuthCtx = {
  user: User | null;
  session: Session | null;
  email: string | null;
  membership: CompanyMembership | null;
  companyId: string | null;
  isSuperAdmin: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [membership, setMembership] = useState<CompanyMembership | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadContext = async (u: User) => {
    // Membership
    const { data: cu } = await supabase
      .from("company_user")
      .select("company_id, role, ativo, company:company(id,name,slug,cor_primaria,status,plano,trial_ate,valor_mensal)")
      .eq("user_id", u.id)
      .eq("ativo", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    setMembership((cu as unknown as CompanyMembership) ?? null);

    // Super admin: email present in app_config.super_admin_emails
    const { data: cfg } = await supabase.from("app_config").select("super_admin_emails").maybeSingle();
    const emails = (cfg?.super_admin_emails as string[] | null) ?? [];
    setIsSuperAdmin(!!u.email && emails.map((e) => e.toLowerCase()).includes(u.email.toLowerCase()));
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) setTimeout(() => loadContext(s.user), 0);
      else { setMembership(null); setIsSuperAdmin(false); }
    });
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) await loadContext(data.session.user);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <Ctx.Provider
      value={{
        user: session?.user ?? null,
        session,
        email: session?.user?.email ?? null,
        membership,
        companyId: membership?.company_id ?? null,
        isSuperAdmin,
        loading,
        refresh: async () => { if (session?.user) await loadContext(session.user); },
        signOut: async () => { await supabase.auth.signOut(); },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
}
