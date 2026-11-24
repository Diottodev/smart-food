import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RotateCcw, ChevronDown, Copy, Send, TrendingUp, Wand2 } from "lucide-react";
import { demoAIInsightsPremium } from "@/lib/demoData";
import { brl } from "@/lib/format";
import { toast } from "sonner";

const PRIORITY_STYLES: Record<string, string> = {
  ALTA: "bg-primary/10 text-primary border-primary/20",
  MÉDIA: "bg-accent text-accent-foreground border-border",
  OPORTUNIDADE: "bg-secondary text-secondary-foreground border-border",
};

export const Route = createFileRoute("/demo/ai-growth")({ component: Page });

function Page() {
  const totalPotencial = demoAIInsightsPremium.reduce((s, i) => s + i.impacto, 0);
  const [openId, setOpenId] = useState<string | null>(demoAIInsightsPremium[0]?.id ?? null);

  return (
    <div className="space-y-6">
      <PageHeader title="Reativação" description="Oportunidades calculadas a partir do histórico de pedidos" />

      <Card className="relative overflow-hidden border-0 bg-primary p-6 text-primary-foreground">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary-foreground/15">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground/70">Receita potencial recuperável</div>
              <div className="mt-1 font-display text-4xl tabular-nums">{brl(totalPotencial)}</div>
              <div className="mt-1 text-sm text-primary-foreground/80">{demoAIInsightsPremium.length} oportunidades · 38 clientes envolvidos</div>
            </div>
          </div>
          <Button variant="secondary" size="lg" onClick={() => toast.success("Disparando todas as campanhas pelo WhatsApp…")}>
            <Send className="mr-2 h-4 w-4" /> Executar todas
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        {demoAIInsightsPremium.map((i) => {
          const open = openId === i.id;
          return (
            <Collapsible key={i.id} open={open} onOpenChange={(v) => setOpenId(v ? i.id : null)}>
              <Card className="overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-muted/50">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground">
                      <RotateCcw className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_STYLES[i.priority]}`}>{i.priority}</span>
                        {i.count > 0 && <Badge variant="outline">{i.count} clientes</Badge>}
                      </div>
                      <h3 className="mt-1 font-semibold">{i.title}</h3>
                    </div>
                    <div className="hidden text-right sm:block">
                      <div className="text-xs text-muted-foreground">Impacto estimado</div>
                      <div className="flex items-center gap-1 font-display text-lg tabular-nums text-primary">
                        <TrendingUp className="h-4 w-4" />{brl(i.impacto)}
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-4 border-t bg-muted/30 p-5">
                    {i.clientes.length > 0 && (
                      <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clientes alvo</div>
                        <div className="flex flex-wrap gap-2">
                          {i.clientes.map((c, k) => <Badge key={k} variant="secondary">{c}</Badge>)}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mensagem pronta</div>
                      <blockquote className="rounded-r border-l-2 border-primary bg-card py-2 pl-4 text-sm italic">
                        "{i.mensagem}"
                      </blockquote>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(i.mensagem); toast.success("Mensagem copiada"); }}>
                        <Copy className="mr-1.5 h-3 w-3" /> Copiar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toast.success("Gerando nova variação…")}>
                        <Wand2 className="mr-1.5 h-3 w-3" /> Gerar variação
                      </Button>
                      <Button size="sm" className="ml-auto" onClick={() => toast.success(`Campanha disparada · ${i.count || "todos os"} clientes`)}>
                        <Send className="mr-1.5 h-3 w-3" /> Disparar campanha
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      <Card className="p-5 text-sm text-muted-foreground">
        As sugestões são calculadas a partir do histórico de pedidos, clientes e operação. Modo demonstração — o envio real pelo WhatsApp acontece na ativação.
      </Card>
    </div>
  );
}
