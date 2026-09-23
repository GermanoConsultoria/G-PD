# Controle de Produção e Perdas de Salgados

Sistema completo (back-end + front-end) para lançamento rápido de produção/perdas
na produção (tablet) e acompanhamento gerencial (dashboard).

## Estrutura

```
G-PD/
  backend/   Node + Express + TypeScript + Prisma (SQLite por padrão)
  frontend/  React + TypeScript + Vite + Tailwind CSS + Recharts
```

## Como rodar

### 1. Back-end (API)

```bash
cd backend
npm install
npx prisma migrate dev   # cria o banco SQLite (dev.db) e aplica o schema
npm run seed             # popula produtos, turnos e motivos padrão
npm run dev              # http://localhost:3333
```

### 2. Front-end

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173 (ou próxima porta livre)
```

O Vite já está configurado com proxy de `/api` para `http://localhost:3333`,
então basta abrir o front-end no navegador.

## Rotas principais

- `/` — Tela de lançamento rápido (tablet): Produção e Perdas.
- `/dashboard` — Painel do gestor: KPIs, filtros de data e gráficos.
- `/produtos` — Cadastro/edição de produtos e custos.

## Regras de negócio implementadas

- **Custo histórico**: toda perda grava `custoUnitarioHistorico` e `custoTotal`
  no momento do lançamento (snapshot do custo do produto). Alterar o custo de
  um produto depois **não** altera perdas já registradas — garante relatórios
  auditáveis. Ver `backend/src/controllers/perdas.controller.ts`.
- **Turno/data inteligentes**: o endpoint `GET /api/contexto-atual` deduz o
  turno (06h-14h / 14h-22h) e a data a partir do horário do servidor, usado
  para pré-selecionar os campos no tablet.
- **Soft delete de produtos**: "desativar" um produto o remove do tablet sem
  apagar o histórico de produções/perdas vinculado a ele.

## Trocar para PostgreSQL

O schema (`backend/prisma/schema.prisma`) usa SQLite por padrão para rodar sem
instalar nada. Para produção com PostgreSQL:

1. Troque `provider = "sqlite"` para `provider = "postgresql"` no datasource.
2. Ajuste `DATABASE_URL` no `.env` (ex: `postgresql://user:senha@host:5432/db`).
3. Rode `npx prisma migrate dev` novamente.

Nenhum outro código precisa mudar — o Prisma Client abstrai o banco.

## Principais endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| GET/POST/PUT/DELETE | `/api/produtos` | CRUD de produtos |
| GET | `/api/turnos`, `/api/motivos` | Cadastros fixos |
| GET | `/api/contexto-atual` | Turno/data sugeridos |
| GET/POST | `/api/producoes` | Lançar/listar produção |
| GET/POST | `/api/perdas` | Lançar/listar perdas (com custo histórico) |
| GET | `/api/dashboard/resumo?dataInicio=&dataFim=` | KPIs do período |
| GET | `/api/dashboard/perdas-por-motivo` | Ranking por motivo |
| GET | `/api/dashboard/perdas-por-produto` | Ranking por produto |
| GET | `/api/dashboard/evolucao-perdas` | Série diária |
