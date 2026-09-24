import { api } from "./client";
import type {
  AnaliticoResponse,
  AuditLog,
  ContextoAtual,
  EvolucaoPerdaDia,
  MotivoPerda,
  Perda,
  PerdaPorMotivo,
  PerdaPorProduto,
  Producao,
  Produto,
  ResumoDashboard,
  Turno,
} from "./types";

export async function login(senha: string): Promise<{ token: string }> {
  const { data } = await api.post<{ token: string }>("/auth/login", { senha });
  return data;
}

export async function getProdutos(somenteAtivos = false): Promise<Produto[]> {
  const { data } = await api.get<Produto[]>("/produtos", {
    params: somenteAtivos ? { ativos: "true" } : undefined,
  });
  return data;
}

export async function criarProduto(payload: {
  nome: string;
  categoria?: string | null;
  unidade: string;
  custoUnitarioCentavos: number;
}): Promise<Produto> {
  const { data } = await api.post<Produto>("/produtos", payload);
  return data;
}

export async function atualizarProduto(
  id: number,
  payload: Partial<{
    nome: string;
    categoria: string | null;
    unidade: string;
    custoUnitarioCentavos: number;
    ativo: boolean;
  }>
): Promise<Produto> {
  const { data } = await api.put<Produto>(`/produtos/${id}`, payload);
  return data;
}

export async function removerProduto(id: number): Promise<Produto> {
  const { data } = await api.delete<Produto>(`/produtos/${id}`);
  return data;
}

export async function getTurnos(): Promise<Turno[]> {
  const { data } = await api.get<Turno[]>("/turnos");
  return data;
}

export async function getMotivos(): Promise<MotivoPerda[]> {
  const { data } = await api.get<MotivoPerda[]>("/motivos");
  return data;
}

export async function getContextoAtual(): Promise<ContextoAtual> {
  const { data } = await api.get<ContextoAtual>("/contexto-atual");
  return data;
}

export async function registrarProducao(payload: {
  produtoId: number;
  turnoId: number;
  data: string;
  quantidade: number;
}): Promise<Producao> {
  const { data } = await api.post<Producao>("/producoes", payload);
  return data;
}

export async function registrarPerda(payload: {
  produtoId: number;
  turnoId: number;
  motivoId: number;
  data: string;
  quantidade: number;
}): Promise<Perda> {
  const { data } = await api.post<Perda>("/perdas", payload);
  return data;
}

export interface FiltroPeriodo {
  dataInicio: string;
  dataFim: string;
}

export interface FiltroLancamentos extends FiltroPeriodo {
  produtoId?: number;
  turnoId?: number;
}

export async function getProducoes(filtro: FiltroLancamentos): Promise<Producao[]> {
  const { data } = await api.get<Producao[]>("/producoes", { params: filtro });
  return data;
}

export async function atualizarProducao(
  id: number,
  payload: Partial<{ produtoId: number; turnoId: number; data: string; quantidade: number }>
): Promise<Producao> {
  const { data } = await api.put<Producao>(`/producoes/${id}`, payload);
  return data;
}

export async function removerProducao(id: number): Promise<void> {
  await api.delete(`/producoes/${id}`);
}

export async function getPerdas(filtro: FiltroLancamentos): Promise<Perda[]> {
  const { data } = await api.get<Perda[]>("/perdas", { params: filtro });
  return data;
}

export async function atualizarPerda(
  id: number,
  payload: Partial<{ produtoId: number; turnoId: number; motivoId: number; data: string; quantidade: number }>
): Promise<Perda> {
  const { data } = await api.put<Perda>(`/perdas/${id}`, payload);
  return data;
}

export async function removerPerda(id: number): Promise<void> {
  await api.delete(`/perdas/${id}`);
}

export async function getResumoDashboard(filtro: FiltroPeriodo): Promise<ResumoDashboard> {
  const { data } = await api.get<ResumoDashboard>("/dashboard/resumo", { params: filtro });
  return data;
}

export async function getPerdasPorMotivo(filtro: FiltroPeriodo): Promise<PerdaPorMotivo[]> {
  const { data } = await api.get<PerdaPorMotivo[]>("/dashboard/perdas-por-motivo", { params: filtro });
  return data;
}

export async function getPerdasPorProduto(filtro: FiltroPeriodo): Promise<PerdaPorProduto[]> {
  const { data } = await api.get<PerdaPorProduto[]>("/dashboard/perdas-por-produto", { params: filtro });
  return data;
}

export async function getEvolucaoPerdas(filtro: FiltroPeriodo): Promise<EvolucaoPerdaDia[]> {
  const { data } = await api.get<EvolucaoPerdaDia[]>("/dashboard/evolucao-perdas", { params: filtro });
  return data;
}

export async function getAnalitico(filtro: FiltroPeriodo): Promise<AnaliticoResponse> {
  const { data } = await api.get<AnaliticoResponse>("/dashboard/analitico", { params: filtro });
  return data;
}

export interface FiltroAuditoria {
  entidade?: string;
  entidadeId?: number;
  dataInicio?: string;
  dataFim?: string;
}

export async function getAuditoria(filtro: FiltroAuditoria = {}): Promise<AuditLog[]> {
  const { data } = await api.get<AuditLog[]>("/auditoria", { params: filtro });
  return data;
}
