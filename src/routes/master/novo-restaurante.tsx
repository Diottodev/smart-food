import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { slugify } from "@/lib/format";

export const Route = createFileRoute("/master/novo-restaurante")({ component: Page });

function Page() {
  const [name, setName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [plano, setPlano] = useState<"starter" | "pro" | "enterprise">("starter");
  const [loading, setLoading] = useState(false);

  const tempPass = () => Math.random().toString(36).slice(-10);

  const create = async () => {
    setLoading(true);
    const slug = slugify(name) || `restaurante-${Date.now()}`;
    const valor = plano === "starter" ? 97 : plano === "pro" ? 197 : 397;
    const { error } = await supabase.from("company").insert({ name, slug, plano, valor_mensal: valor });
    setLoading(false);
    if (error) return toast.error(error.message);

    const senha = tempPass();
    toast.success(`Restaurante criado! Email enviado para ${ownerEmail} com senha temporária: ${senha} (mock — integrar serviço de e-mail)`);
    setName(""); setOwnerEmail("");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Novo restaurante" description="Cadastre um cliente e envie credenciais" />
      <Card className="p-5 space-y-3 max-w-md">
        <div><Label>Nome do restaurante*</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label>E-mail do dono*</Label><Input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="dono@restaurante.com" /></div>
        <div>
          <Label>Plano</Label>
          <select value={plano} onChange={(e) => setPlano(e.target.value as typeof plano)} className="w-full h-10 rounded-md border bg-background px-3 text-sm">
            <option value="starter">Starter — R$ 97/mês</option>
            <option value="pro">Profissional — R$ 197/mês</option>
            <option value="enterprise">Enterprise — R$ 397/mês</option>
          </select>
        </div>
        <Button disabled={!name || !ownerEmail || loading} onClick={create}>{loading ? "Criando…" : "Criar e enviar credenciais"}</Button>
        <p className="text-xs text-muted-foreground">O envio de e-mail será integrado ao serviço de e-mail na implantação. Por enquanto a senha temporária é exibida na confirmação.</p>
      </Card>
    </div>
  );
}
