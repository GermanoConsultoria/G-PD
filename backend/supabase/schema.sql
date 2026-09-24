-- G-PD — schema Postgres para o projeto Supabase.
-- Rode este script inteiro uma vez no SQL Editor do Supabase
-- (Dashboard → SQL Editor → New query → colar → Run).
--
-- Cria o schema "public" (usado por dev/produção, já populado com os dados
-- oficiais) e o schema "test" (mesmas tabelas, vazio — usado pela suíte
-- automatizada). Depois de rodar isto, vá em
-- Settings → API → Data API → "Exposed schemas" e adicione "test" à lista
-- (por padrão só "public" fica exposto à API REST que o supabase-js usa).
--
-- Este script é idempotente: pode ser rodado de novo sem duplicar dados
-- nem apagar histórico (usa IF NOT EXISTS / ON CONFLICT DO NOTHING).

-- ============================== public ==============================

create table if not exists public.produtos (
  id bigint generated always as identity primary key,
  nome text not null unique,
  categoria text,
  unidade text not null default 'un',
  custo_unitario_centavos integer not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists produtos_ativo_idx on public.produtos (ativo);

create table if not exists public.turnos (
  id bigint generated always as identity primary key,
  codigo text not null unique,
  nome text not null,
  hora_inicio text not null,
  hora_fim text not null
);

create table if not exists public.motivos_perda (
  id bigint generated always as identity primary key,
  codigo text not null unique,
  nome text not null,
  ativo boolean not null default true
);

create table if not exists public.producoes (
  id bigint generated always as identity primary key,
  produto_id bigint not null references public.produtos (id),
  turno_id bigint not null references public.turnos (id),
  data date not null,
  quantidade integer not null,
  created_at timestamptz not null default now()
);
create index if not exists producoes_data_idx on public.producoes (data);
create index if not exists producoes_produto_id_idx on public.producoes (produto_id);

create table if not exists public.perdas (
  id bigint generated always as identity primary key,
  produto_id bigint not null references public.produtos (id),
  turno_id bigint not null references public.turnos (id),
  motivo_id bigint not null references public.motivos_perda (id),
  data date not null,
  quantidade integer not null,
  custo_unitario_historico_centavos integer not null,
  custo_total_centavos integer not null,
  created_at timestamptz not null default now()
);
create index if not exists perdas_data_idx on public.perdas (data);
create index if not exists perdas_produto_id_idx on public.perdas (produto_id);
create index if not exists perdas_motivo_id_idx on public.perdas (motivo_id);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  administrador text not null,
  entidade text not null,
  entidade_id bigint not null,
  acao text not null,
  campo text,
  valor_anterior text,
  valor_novo text
);
create index if not exists audit_logs_entidade_entidade_id_idx on public.audit_logs (entidade, entidade_id);
create index if not exists audit_logs_criado_em_idx on public.audit_logs (criado_em);

-- RLS habilitado sem policies: a PUBLISHABLE_KEY (anon) fica sem nenhum
-- acesso a estas tabelas. Todo acesso real passa pelo backend Express, que
-- usa a SERVICE_ROLE_KEY (ignora RLS por definição).
alter table public.produtos enable row level security;
alter table public.turnos enable row level security;
alter table public.motivos_perda enable row level security;
alter table public.producoes enable row level security;
alter table public.perdas enable row level security;
alter table public.audit_logs enable row level security;

-- Seed oficial: turnos, motivos de perda e os 7 produtos oficiais do G-PD.
insert into public.turnos (codigo, nome, hora_inicio, hora_fim) values
  ('T1', 'Turno 1', '06:00', '14:00'),
  ('T2', 'Turno 2', '14:00', '22:00')
on conflict (codigo) do nothing;

insert into public.motivos_perda (codigo, nome) values
  ('CAIU_CHAO', 'Caiu no chão'),
  ('AZEDOU', 'Azedou'),
  ('RACHOU', 'Rachou'),
  ('DURO', 'Duro'),
  ('NAO_VENDEU', 'Não vendeu')
on conflict (codigo) do nothing;

insert into public.produtos (nome, categoria, unidade, custo_unitario_centavos) values
  ('Salgados', 'Salgados', 'un', 411),
  ('Torta', 'Torta', 'un', 581),
  ('Palito', 'Palito', 'un', 268),
  ('Pão de Queijo', 'Pão de Queijo', 'un', 166),
  ('Mini Pão de Queijo', 'Pão de Queijo', 'un', 39),
  ('Pão de Queijo Parmesão', 'Pão de Queijo', 'un', 112),
  ('Pão de Queijo Goiabada', 'Pão de Queijo', 'un', 112)
on conflict (nome) do nothing;

-- ============================== test ==============================
-- Mesmas tabelas, sem seed: a suíte de testes (vitest) semeia e limpa os
-- dados dela mesma a cada execução, via supabase-js apontando pro schema
-- "test" (client configurado com db.schema = "test").

create schema if not exists test;

create table if not exists test.produtos (
  id bigint generated always as identity primary key,
  nome text not null unique,
  categoria text,
  unidade text not null default 'un',
  custo_unitario_centavos integer not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists produtos_ativo_idx on test.produtos (ativo);

create table if not exists test.turnos (
  id bigint generated always as identity primary key,
  codigo text not null unique,
  nome text not null,
  hora_inicio text not null,
  hora_fim text not null
);

create table if not exists test.motivos_perda (
  id bigint generated always as identity primary key,
  codigo text not null unique,
  nome text not null,
  ativo boolean not null default true
);

create table if not exists test.producoes (
  id bigint generated always as identity primary key,
  produto_id bigint not null references test.produtos (id),
  turno_id bigint not null references test.turnos (id),
  data date not null,
  quantidade integer not null,
  created_at timestamptz not null default now()
);
create index if not exists producoes_data_idx on test.producoes (data);
create index if not exists producoes_produto_id_idx on test.producoes (produto_id);

create table if not exists test.perdas (
  id bigint generated always as identity primary key,
  produto_id bigint not null references test.produtos (id),
  turno_id bigint not null references test.turnos (id),
  motivo_id bigint not null references test.motivos_perda (id),
  data date not null,
  quantidade integer not null,
  custo_unitario_historico_centavos integer not null,
  custo_total_centavos integer not null,
  created_at timestamptz not null default now()
);
create index if not exists perdas_data_idx on test.perdas (data);
create index if not exists perdas_produto_id_idx on test.perdas (produto_id);
create index if not exists perdas_motivo_id_idx on test.perdas (motivo_id);

create table if not exists test.audit_logs (
  id bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  administrador text not null,
  entidade text not null,
  entidade_id bigint not null,
  acao text not null,
  campo text,
  valor_anterior text,
  valor_novo text
);
create index if not exists audit_logs_entidade_entidade_id_idx on test.audit_logs (entidade, entidade_id);
create index if not exists audit_logs_criado_em_idx on test.audit_logs (criado_em);

alter table test.produtos enable row level security;
alter table test.turnos enable row level security;
alter table test.motivos_perda enable row level security;
alter table test.producoes enable row level security;
alter table test.perdas enable row level security;
alter table test.audit_logs enable row level security;

-- ============================== grants ==============================
-- O schema "public" já vem com essas permissões pré-configuradas pelo
-- Supabase; o schema "test" é criado do zero por este script e precisa
-- delas explicitamente para a service_role conseguir ler/escrever (RLS
-- continua ativo e sem policies, então mesmo com o grant só a service_role
-- — que ignora RLS — realmente acessa os dados).
grant usage on schema test to service_role;
grant all on all tables in schema test to service_role;
grant all on all sequences in schema test to service_role;
alter default privileges in schema test grant all on tables to service_role;
alter default privileges in schema test grant all on sequences to service_role;
