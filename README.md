# Controle de Produção e Perdas de Salgados

Sistema completo (back-end + front-end) para lançamento rápido de produção/perdas
na produção (tablet) e acompanhamento gerencial (dashboard).

## Estrutura

```
G-PD/
  wrangler.jsonc  Configuração do Cloudflare Worker único (API + frontend estático)
  backend/        Hono + TypeScript + Supabase (Postgres) — roda como Cloudflare Worker
  frontend/       React + TypeScript + Vite + Tailwind CSS + Recharts
```

Em produção, **um único Cloudflare Worker** serve tanto a API (`/api/*`, código
em `backend/src/worker.ts`) quanto os arquivos estáticos do frontend
(`frontend/dist`, gerado por `vite build`) — não são dois serviços separados.

## Banco de dados (Supabase)

O schema Postgres fica versionado em `backend/supabase/schema.sql`. Rode esse
script uma vez no **SQL Editor** do seu projeto Supabase (cria os schemas
`public`, usado em dev/produção, e `test`, usado só pela suíte automatizada).
Depois, em **Settings → API → Data API → Exposed schemas**, adicione `test`
à lista (só `public` fica exposto por padrão).

O backend usa sempre a chave **`service_role`** do Supabase (nunca a
`anon`/`publishable`) — RLS está habilitado em todas as tabelas sem policies,
então só o backend consegue ler/escrever.

## Como rodar localmente

### 1. Variáveis de ambiente

Copie `.dev.vars.example` (raiz do repo) para `.dev.vars` e preencha com as
credenciais do seu projeto Supabase:

```bash
cp .dev.vars.example .dev.vars
```

### 2. Back-end (Worker via wrangler dev)

```bash
cd backend
npm install
npm run seed   # popula produtos, turnos e motivos oficiais no schema "public"
npm run dev    # sobe o Worker local (API + fallback de assets) em http://localhost:8787
```

### 3. Front-end (Vite, com hot reload)

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
```

O Vite já está configurado com proxy de `/api` para `http://localhost:8787`
durante o desenvolvimento. Em produção, API e frontend são servidos pelo
mesmo Worker/domínio, sem proxy.

## Deploy (Cloudflare)

O deploy é automático a cada push na branch `main` (Cloudflare Workers Builds,
conectado ao repositório GitHub). O build configurado no painel do Cloudflare
roda `cd frontend && npm ci && npm run build` antes de publicar — o Worker
nunca deve publicar os arquivos-fonte crus do frontend.

Deploy manual, se precisar:

```bash
cd frontend && npm run build   # gera frontend/dist
cd ../backend && npm run deploy
```

As variáveis de ambiente de produção (`SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `JWT_SECRET`, `CORS_ORIGIN`)
são configuradas em **Settings → Variables and secrets (Runtime)** no painel
do Worker no Cloudflare — nunca commitadas no repositório.

## Rotas principais

- `/` — Tela de lançamento rápido (tablet): Produção e Perdas. Sem login.
- `/login` — Login administrativo.
- `/dashboard` — Painel do gestor: KPIs, filtros de data, gráficos e tabela analítica.
- `/produtos` — Cadastro/edição de produtos e custos.
- `/lancamentos` — Edição/exclusão administrativa de produções e perdas.
- `/auditoria` — Trilha de auditoria das ações administrativas.

## Regras de negócio implementadas

- **Valores monetários em centavos**: todo valor monetário é armazenado e
  trafega pela API como inteiro em centavos (nunca float), para evitar erros
  de arredondamento. Ver `backend/src/utils/money.ts` e `frontend/src/utils/money.ts`.
- **Custo histórico**: toda perda grava `custoUnitarioHistoricoCentavos` e
  `custoTotalCentavos` no momento do lançamento (snapshot do custo do
  produto). Alterar o custo de um produto depois **não** altera perdas já
  registradas — garante relatórios auditáveis. Ver
  `backend/src/controllers/perdas.controller.ts`.
- **Turno/data inteligentes**: o endpoint `GET /api/contexto-atual` deduz o
  turno (06h-14h / 14h-22h) e a data a partir do horário do servidor, sem
  nunca atribuir a madrugada (22h-06h) a um turno.
- **Soft delete de produtos**: "desativar" um produto o remove do tablet sem
  apagar o histórico de produções/perdas vinculado a ele.
- **Auditoria administrativa**: toda criação/edição/exclusão feita pela área
  administrativa é registrada em `audit_logs`, incluindo um snapshot legível
  do registro quando ele é fisicamente excluído.
- **Autenticação administrativa**: login único (senha em `ADMIN_PASSWORD`,
  sessão via JWT assinado com `hono/jwt`/Web Crypto). O tablet (`/`) nunca
  exige login; todas as rotas administrativas exigem.

## Principais endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Login administrativo |
| GET/POST/PUT/DELETE | `/api/produtos` | CRUD de produtos (GET público; escrita exige admin) |
| GET | `/api/turnos`, `/api/motivos` | Cadastros fixos (públicos) |
| GET | `/api/contexto-atual` | Turno/data/estado operacional sugeridos |
| GET/POST/PUT/DELETE | `/api/producoes` | Lançar (público) / listar, editar, excluir (admin) |
| GET/POST/PUT/DELETE | `/api/perdas` | Lançar (público) / listar, editar, excluir (admin) — com custo histórico |
| GET | `/api/dashboard/resumo` | KPIs do período (admin) |
| GET | `/api/dashboard/perdas-por-motivo` | Ranking por motivo (admin) |
| GET | `/api/dashboard/perdas-por-produto` | Ranking por produto (admin) |
| GET | `/api/dashboard/evolucao-perdas` | Série diária (admin) |
| GET | `/api/dashboard/analitico` | Tabela analítica por produto (admin) |
| GET | `/api/auditoria` | Trilha de auditoria (admin) |

## Testes

```bash
cd backend
npm test
```

Roda contra o schema `test` do mesmo projeto Supabase (limpo e semeado do
zero a cada execução pelo `globalSetup`), sem tocar no schema `public`.
