import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw, Send } from "lucide-react";

type Msg = { role: "user" | "ai"; text: string };

const SUGGESTIONS = [
  "Pizza Margherita está 30% abaixo da média semanal — destaque no cardápio com cupom.",
  "Aumente o ticket médio oferecendo combo Hambúrguer + Refri + Batata por R$ 39,90.",
  "Clientes que pediram Açaí não voltaram em 30 dias — envie WhatsApp com cupom de 15%.",
  "Sábados 19h-21h têm fila no kanban. Considere abrir 1 entregador extra.",
];

function fakeReply(input: string): string {
  if (/cupom|desconto/i.test(input)) return "Sugiro um cupom de 15% para clientes inativos há 30+ dias. Quer que eu gere o copy?";
  if (/cardápio|item|prato/i.test(input)) return "Posso destacar até 3 itens. Quais quer promover esta semana?";
  if (/faturamento|venda/i.test(input)) return "Seu faturamento dos últimos 7 dias está estável. Pico aos sábados.";
  return "Posso ajudar com sugestões de promoções, análise de cardápio, retenção de clientes e otimização de entregas.";
}

export const Route = createFileRoute("/app/ai-growth")({ component: Page });

function Page() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "Olá! Vejo oportunidades a partir do histórico de pedidos. Escolha uma sugestão ou pergunte sobre clientes, cardápio e faturamento." },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const u = input;
    setMsgs((m) => [...m, { role: "user", text: u }]);
    setInput("");
    setTimeout(() => setMsgs((m) => [...m, { role: "ai", text: fakeReply(u) }]), 500);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reativação" description="Oportunidades a partir do histórico de clientes e pedidos" />

      <div className="grid gap-3 md:grid-cols-2">
        {SUGGESTIONS.map((s, i) => (
          <Card key={i} className="p-4">
            <div className="flex gap-3">
              <div className="h-8 w-8 shrink-0 rounded border bg-surface flex items-center justify-center"><RotateCcw className="h-4 w-4 text-primary" /></div>
              <p className="text-sm">{s}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-3">Assistente Smart Food</h3>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{m.text}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Pergunte sobre cupons, cardápio, faturamento…" />
          <Button onClick={send}><Send className="h-4 w-4" /></Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Modo demonstração. As respostas são geradas localmente a partir de regras simples, sem envio de dados para serviços externos.</p>
      </Card>
    </div>
  );
}
