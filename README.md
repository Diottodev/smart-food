# Smart Food

Sistema de gestão para restaurantes: pedidos, cardápio digital, KDS, entregas, clientes e financeiro no mesmo lugar.

Aplicação full stack multi-tenant construída com TanStack Start, React 19, Supabase e Cloudflare Workers. O cardápio público funciona sem login e o painel interno acompanha a operação em tempo real.

## O que tem

- **Cardápio digital público** por restaurante, com link próprio e checkout de pedido.
- **Pedidos e KDS** com fila por status: recebido, preparo, pronto e entrega.
- **Entregas** com entregadores, zonas, taxas e comissões.
- **Financeiro** com vendas, taxas, despesas e fechamento.
- **Clientes e reativação** com histórico, ticket e frequência.
- **Relatórios** de produtos, horários de pico, ticket médio e produtividade.
- **Painel master** para gestão de restaurantes e planos.
- **Demo navegável** em `/demo`, sem autenticação.
- **Onboarding, equipe, permissões e trial** por conta.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | TanStack Start + TanStack Router |
| UI | React 19, Tailwind CSS v4, Radix UI, shadcn/ui |
| Estado e dados | TanStack Query |
| Banco e auth | Supabase (Postgres, Auth, RLS) |
| Gráficos | Recharts |
| Kanban | hello-pangea/dnd |
| Build e deploy | Vite, Nitro, Cloudflare Workers |

## Rodando localmente

Requisitos: Node.js 20+ e uma conta no Supabase.

```bash
npm install
cp .env.example .env
npm run dev
```

Preencha o `.env` com as credenciais do seu projeto Supabase:

| Variável | Uso |
| --- | --- |
| `SUPABASE_URL` | URL do projeto, usada no servidor |
| `SUPABASE_PUBLISHABLE_KEY` | Chave pública, usada no servidor |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço, somente no servidor |
| `VITE_SUPABASE_URL` | URL exposta ao cliente |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave pública exposta ao cliente |
| `VITE_SUPABASE_PROJECT_ID` | Identificador do projeto |

> A `SUPABASE_SERVICE_ROLE_KEY` ignora RLS. Ela nunca deve ir para o cliente, para o Git ou para variáveis `VITE_*`.

Depois de configurar o projeto, aplique as migrations:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

As migrations ficam em `supabase/migrations/` e criam o schema, as políticas de RLS e os dados de apoio.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Sobe o ambiente de desenvolvimento |
| `npm run build` | Gera o build de produção em `.output/` |
| `npm run preview` | Pré-visualiza o build |
| `npm run lint` | Roda o ESLint |
| `npm run format` | Formata com Prettier |

## Rotas principais

| Rota | Descrição |
| --- | --- |
| `/` | Landing page |
| `/entrar` | Login e criação de conta |
| `/demo` | Painel demonstrativo |
| `/app/*` | Painel do restaurante |
| `/master/*` | Administração da plataforma |
| `/pedir/:slug` | Cardápio público |
| `/pedir/:slug/status/:orderId` | Acompanhamento do pedido |

## Estrutura

```text
src/
  components/        componentes de layout e UI
  hooks/             autenticação e utilitários de tela
  integrations/      clientes Supabase (browser e servidor)
  lib/               dados de demo, formatadores e utilitários
  routes/            rotas TanStack Start
supabase/
  migrations/        schema, RLS e seeds
```

## Deploy

O build usa Nitro com destino Cloudflare Workers:

```bash
npm run build
npx nitro deploy --prebuilt
```

É necessário autenticar no Cloudflare (`npx wrangler login`) e configurar as variáveis de ambiente no projeto de destino. O arquivo `wrangler.jsonc` contém a configuração base do Worker.

## Segurança

- RLS habilitado nas tabelas por tenant.
- Papéis de acesso separados entre usuário, equipe e master.
- Chave de serviço restrita ao servidor.
- `.env` fora do controle de versão; use `.env.example` como referência.

## Licença

Projeto pessoal de Nicolas Renz. Entre em contato antes de reutilizar em produção.
