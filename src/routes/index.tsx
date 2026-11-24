import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ArrowRight, Check, Globe, Layers, Truck, Wallet, Users, BarChart3,
  ChefHat, Clock, MapPin, PackageCheck, UtensilsCrossed,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Food — gestão para restaurantes" },
      { name: "description", content: "Pedidos, cardápio, KDS, entregas e caixa no mesmo lugar. Um sistema para acompanhar o serviço em tempo real." },
      { property: "og:title", content: "Smart Food — gestão para restaurantes" },
      { property: "og:description", content: "Pedidos, cardápio, KDS, entregas e caixa no mesmo lugar." },
    ],
  }),
  component: Landing,
});

const DEMO_SLUG = "hamburgueria-ze";

const modules = [
  { icon: Globe, title: "Cardápio digital", desc: "Um link próprio, com sua marca. O cliente pede sem instalar aplicativo e sem criar conta." },
  { icon: Layers, title: "Pedidos e KDS", desc: "Recebido, preparo, pronto e entrega. A cozinha acompanha a fila em uma tela só." },
  { icon: Truck, title: "Entregas", desc: "Entregadores, zonas, taxas e comissões. Cada pedido sabe para onde vai e com quem." },
  { icon: Wallet, title: "Caixa e financeiro", desc: "Vendas, taxas e despesas no mesmo fechamento. O mês deixa de ser uma surpresa." },
  { icon: Users, title: "Clientes e reativação", desc: "Histórico, ticket e frequência. O sistema mostra quem está sumindo e sugere a abordagem." },
  { icon: BarChart3, title: "Relatórios", desc: "Produtos que saem, horários de pico, ticket médio e produtividade da entrega." },
];

const principles = [
  { title: "Uma fila", desc: "O pedido entra, avança e sai do mesmo lugar. Sem caderno paralelo." },
  { title: "Um cardápio", desc: "Preço, foto e disponibilidade mudam uma vez e valem em todo lugar." },
  { title: "Um caixa", desc: "Vendas, taxas e despesas fecham juntos, no fim do turno." },
];

const steps = [
  { n: "01", title: "Monte o cardápio", desc: "Categorias, produtos, extras e fotos. Leva menos tempo do que imprimir o cardápio." },
  { n: "02", title: "Abra o link público", desc: "Cada restaurante tem um endereço próprio. O cliente escolhe e envia o pedido." },
  { n: "03", title: "Acompanhe a cozinha", desc: "O KDS organiza a fila por status. A equipe sabe o que preparar e o que já saiu." },
  { n: "04", title: "Feche o dia", desc: "Vendas, entregas e despesas ficam registradas. O relatório já está pronto." },
];

const plans = [
  {
    name: "Essencial",
    desc: "Para uma unidade começando a organizar a operação.",
    bullets: ["Cardápio digital", "Pedidos e KDS", "Entregas e zonas", "Caixa e financeiro"],
  },
  {
    name: "Operação",
    desc: "Para quem já tem volume e precisa de previsibilidade.",
    featured: true,
    bullets: ["Tudo do Essencial", "Reativação de clientes", "Relatórios avançados", "Equipe e permissões"],
  },
  {
    name: "Rede",
    desc: "Para grupos com mais de uma unidade.",
    bullets: ["Tudo do Operação", "Multi-unidade", "API e webhooks", "Implantação dedicada"],
  },
];

const faqs = [
  { q: "A demonstração é completa?", a: "Sim. Você navega pelo painel, pela cozinha, pelas entregas e pelo cardápio público com dados fictícios. Nada é salvo e não é preciso criar conta." },
  { q: "Preciso instalar algo?", a: "Não. O cliente pede por um link no navegador. A equipe acessa o painel do mesmo jeito, no computador ou no celular." },
  { q: "Como o cliente acompanha o pedido?", a: "Cada pedido tem uma página de status. O cliente vê o andamento sem precisar ligar para o restaurante." },
  { q: "Aceita PIX e cartão?", a: "O checkout registra a forma de pagamento escolhida. A integração de pagamento online é configurada na implantação, conforme a operação." },
  { q: "Consigo usar minha marca?", a: "Sim. Nome, cor e logo aparecem no painel e na página pública. O cardápio não precisa parecer um sistema genérico." },
  { q: "Onde ficam os dados?", a: "No Supabase, com autenticação e políticas de acesso separadas por restaurante. A demonstração usa apenas dados locais fictícios." },
];

const board = [
  {
    title: "Recebidos",
    count: 3,
    orders: [
      { n: "#1042", name: "Marina S.", items: "1× Smash Duplo · 1× Batata", time: "2 min", total: "R$ 58" },
      { n: "#1043", name: "Carlos L.", items: "1× X-Bacon · 1× Coca", time: "4 min", total: "R$ 46" },
      { n: "#1044", name: "Beatriz R.", items: "2× Pizza Margherita", time: "6 min", total: "R$ 96" },
    ],
  },
  {
    title: "Em preparo",
    count: 2,
    orders: [
      { n: "#1040", name: "Felipe A.", items: "1× Picanha 300g · 1× Suco", time: "12 min", total: "R$ 107" },
      { n: "#1041", name: "Júlia M.", items: "1× Risoto · 1× Petit Gateau", time: "9 min", total: "R$ 80" },
    ],
  },
  {
    title: "Prontos",
    count: 1,
    orders: [
      { n: "#1039", name: "Pedro S.", items: "1× X-Tudo · 1× Cerveja", time: "18 min", total: "R$ 42" },
    ],
  },
];

function ProductPreview() {
  return (
    <div className="relative min-w-0">
      <div className="absolute -inset-3 -z-10 rounded-lg bg-accent/70" />
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b bg-surface px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-primary text-[9px] font-semibold text-primary-foreground">SF</span>
            <span className="text-xs font-medium">Smart Food · Serviço</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Ao vivo</span>
        </div>
        <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3">
          {board.map((col, idx) => (
            <div key={col.title} className={`min-w-0 bg-card p-3 ${idx === 2 ? "hidden sm:block" : ""}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{col.title}</span>
                <span className="text-xs font-semibold tabular-nums">{col.count}</span>
              </div>
              <div className="mt-3 space-y-2">
                {col.orders.map((o) => (
                  <div key={o.n} className="min-w-0 rounded-md border bg-background p-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold">{o.n}</span>
                      <span className="text-muted-foreground">{o.time}</span>
                    </div>
                    <div className="mt-1 truncate text-[11px] font-medium">{o.name}</div>
                    <div className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted-foreground">{o.items}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-medium">{o.total}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t px-4 py-3 text-[10px] text-muted-foreground">
          <span>Ticket médio hoje · R$ 53,30</span>
          <span>4 entregadores em rota</span>
        </div>
      </div>
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-primary text-xs font-semibold text-primary-foreground">SF</span>
            <span className="font-display text-lg leading-none">Smart Food</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#modulos" className="hover:text-foreground">Módulos</a>
            <a href="#operacao" className="hover:text-foreground">Operação</a>
            <a href="#planos" className="hover:text-foreground">Planos</a>
            <Link to="/demo/dashboard" className="hover:text-foreground">Demo</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/entrar">Entrar</Link></Button>
            <Button asChild size="sm"><Link to="/demo/dashboard">Abrir demo <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button>
          </div>
        </div>
      </header>

      <section className="border-b">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div className="min-w-0">
            <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <span className="h-px w-8 bg-primary" />
              Gestão para restaurantes
            </div>
            <h1 className="mt-6 text-balance font-display text-5xl leading-[1.02] md:text-6xl">
              Menos ruído na operação.<br />
              <span className="italic text-primary">Mais tempo para a cozinha.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Pedidos, cardápio, entregas e caixa no mesmo lugar. Um sistema para acompanhar o serviço em tempo real — sem planilha paralela e sem pedido perdido no WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/demo/dashboard">Abrir demonstração <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/pedir/$slug" params={{ slug: DEMO_SLUG }}>Ver cardápio público</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Demonstração sem cadastro. Os dados são fictícios.</p>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-6xl divide-y px-6 md:grid-cols-3 md:divide-x md:divide-y-0">
          {principles.map((p) => (
            <div key={p.title} className="px-0 py-6 md:px-8 md:py-8">
              <div className="font-display text-xl">{p.title}</div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="modulos" className="py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">O sistema</span>
            <h2 className="mt-3 text-4xl md:text-5xl">O serviço inteiro, sem módulo extra.</h2>
            <p className="mt-4 text-muted-foreground">
              Cada parte conversa com a outra. O pedido que entra no cardápio aparece na cozinha, na entrega e no caixa sem ser digitado de novo.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => (
              <Card key={m.title} className="border bg-card p-6 transition-colors hover:border-primary/40">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded border bg-surface text-primary">
                  <m.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl">{m.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="operacao" className="bg-sidebar py-20 text-sidebar-foreground md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-sidebar-primary">Operação</span>
            <h2 className="mt-3 text-4xl md:text-5xl">A cozinha vê o que precisa ver.</h2>
            <p className="mt-4 max-w-lg text-sidebar-foreground/70">
              O KDS não é um relatório: é a fila de trabalho. Cada pedido muda de coluna quando a equipe muda o status, e todo mundo enxerga a mesma verdade.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                { icon: ChefHat, text: "Fila por status, com tempo de espera visível." },
                { icon: Clock, text: "Atraso sinalizado antes de virar reclamação." },
                { icon: PackageCheck, text: "Pronto, saiu e entregue registrados no mesmo fluxo." },
                { icon: MapPin, text: "Entregador e zona definidos no pedido." },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-sidebar-border bg-sidebar-accent">
                    <item.icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sidebar-foreground/85">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-4">
            <div className="flex items-center justify-between border-b border-sidebar-border pb-3">
              <span className="text-xs font-medium">Cozinha · turno da noite</span>
              <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">18:42</span>
            </div>
            <div className="mt-3 space-y-2">
              {[
                { n: "#1040", item: "Picanha 300g", status: "Em preparo", time: "12 min", late: false },
                { n: "#1041", item: "Risoto de cogumelos", status: "Em preparo", time: "9 min", late: false },
                { n: "#1039", item: "X-Tudo", status: "Pronto", time: "18 min", late: false },
                { n: "#1038", item: "Pizza Margherita", status: "Atrasado", time: "31 min", late: true },
              ].map((o) => (
                <div key={o.n} className="flex items-center gap-3 rounded border border-sidebar-border bg-sidebar px-3 py-2.5">
                  <span className="text-xs font-semibold tabular-nums">{o.n}</span>
                  <span className="flex-1 truncate text-sm">{o.item}</span>
                  <span className={`text-[10px] ${o.late ? "text-destructive" : "text-sidebar-foreground/60"}`}>{o.status}</span>
                  <span className="w-12 text-right text-[10px] tabular-nums text-sidebar-foreground/60">{o.time}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-sidebar-border pt-3 text-[10px] text-sidebar-foreground/50">
              <span>3 em produção · 1 pronta</span>
              <span>Tempo médio: 18 min</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b py-20 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Reativação</span>
            <h2 className="mt-3 text-4xl md:text-5xl">Cliente que sumiu não precisa de um robô.</h2>
            <p className="mt-4 max-w-lg text-muted-foreground">
              O sistema cruza histórico, ticket e frequência para mostrar quem está deixando de pedir. Você revisa a sugestão, ajusta o texto e envia pelo WhatsApp.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Clientes inativos há 30, 60 ou 90 dias.",
                "Mensagem pronta, sem tom de cobrança.",
                "Histórico do que já foi enviado.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <Card className="border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Oportunidade</div>
                <div className="mt-1 font-display text-2xl">18 clientes inativos</div>
              </div>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">Alta</span>
            </div>
            <div className="mt-5 rounded border-l-2 border-primary bg-surface p-4">
              <div className="text-xs font-medium text-muted-foreground">Mensagem sugerida</div>
              <p className="mt-2 text-sm leading-relaxed">
                Oi, Marina. Faz um tempinho que você não pede aqui. Esta semana o Smash Duplo está saindo com batata por conta da casa. Quer que eu separe?
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild size="sm"><Link to="/demo/ai-growth">Ver oportunidades <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button>
              <Button asChild size="sm" variant="outline"><Link to="/demo/clientes">Ver clientes</Link></Button>
            </div>
            <p className="mt-4 text-[11px] text-muted-foreground">Exemplo com dados fictícios. O envio real acontece na ativação do WhatsApp.</p>
          </Card>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Implantação</span>
            <h2 className="mt-3 text-4xl md:text-5xl">Do cardápio ao primeiro pedido.</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="border-t pt-5">
                <div className="font-display text-3xl text-primary/40">{s.n}</div>
                <h3 className="mt-3 text-xl">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="planos" className="border-y bg-card py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Planos</span>
            <h2 className="mt-3 text-4xl md:text-5xl">Escolha pelo tamanho da operação.</h2>
            <p className="mt-4 text-muted-foreground">
              Valores definidos na implantação, conforme volume de pedidos e número de unidades. Sem taxa escondida por pedido.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {plans.map((p) => (
              <Card key={p.name} className={`flex flex-col border bg-background p-6 ${p.featured ? "border-primary" : ""}`}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-2xl">{p.name}</h3>
                  {p.featured && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">Mais usado</span>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-5 font-display text-3xl">Sob consulta</div>
                <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-6 w-full" variant={p.featured ? "default" : "outline"}>
                  <Link to="/entrar">Falar sobre o plano</Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Dúvidas</span>
            <h2 className="mt-3 text-4xl md:text-5xl">Antes de abrir a demo.</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Se ficar alguma dúvida, o e-mail está no rodapé. Respondo pessoalmente.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`f${i}`}>
                <AccordionTrigger className="text-left font-medium">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="bg-primary py-16 text-primary-foreground md:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <UtensilsCrossed className="h-6 w-6 opacity-70" />
              <h2 className="mt-4 text-4xl md:text-5xl">Coloque a operação em ordem antes do próximo turno.</h2>
              <p className="mt-3 text-primary-foreground/80">Abra a demo, navegue como dono e como cliente. Sem cadastro.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/demo/dashboard">Abrir demonstração</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link to="/entrar">Criar conta</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-background py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-primary text-[10px] font-semibold text-primary-foreground">SF</span>
              <span className="font-display text-lg">Smart Food</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Gestão para restaurantes que precisam de menos ruído e mais serviço. Um projeto de Nicolas Renz.
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Produto</div>
            <div className="mt-3 space-y-2 text-sm">
              <a href="#modulos" className="block hover:text-primary">Módulos</a>
              <a href="#operacao" className="block hover:text-primary">Operação</a>
              <a href="#planos" className="block hover:text-primary">Planos</a>
              <Link to="/demo/dashboard" className="block hover:text-primary">Demonstração</Link>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contato</div>
            <div className="mt-3 space-y-2 text-sm">
              <a href="mailto:nicodiottodev@gmail.com" className="block hover:text-primary">nicodiottodev@gmail.com</a>
              <a href="https://github.com/Diottodev" className="block hover:text-primary" target="_blank" rel="noreferrer">GitHub</a>
              <Link to="/entrar" className="block hover:text-primary">Entrar</Link>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-6xl flex-wrap items-center justify-between gap-2 border-t px-6 pt-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Smart Food</span>
          <span>Demonstração com dados fictícios.</span>
        </div>
      </footer>
    </div>
  );
}
