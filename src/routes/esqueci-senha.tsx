import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/esqueci-senha")({
  head: () => ({ meta: [{ title: "Esqueci minha senha — Smart Food" }] }),
  component: Page,
});

function Page() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-senha",
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setSent(true);
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-xl font-semibold">Esqueci minha senha</h1>
        {sent ? (
          <p className="mt-4 text-sm text-muted-foreground">Se o email existir, enviamos um link de recuperação. Verifique sua caixa de entrada.</p>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-3">
            <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Enviando…" : "Enviar link"}</Button>
          </form>
        )}
        <Link to="/entrar" className="mt-4 inline-block text-sm text-primary hover:underline">Voltar para entrar</Link>
      </Card>
    </div>
  );
}
