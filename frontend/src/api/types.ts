export interface Produto {
  id: number;
  nome: string;
  categoria: string | null;
  unidade: string;
  custoUnitarioCentavos: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Turno {
  id: number;
  codigo: "T1" | "T2";
  nome: string;
  horaInicio: string;
  horaFim: string;
}

export interface MotivoPerda {
  id: number;
  codigo: string;
  nome: string;
}

export interface ContextoAtual {
  data: string;
  emHorarioOperacional: boolean;
  turno: Turno | null;
}

export interface Producao {
  id: number;
  produtoId: number;
  turnoId: number;
  data: string;
  quantidade: number;
  produto: Produto;
  turno: Turno;
}

export interface Perda {
  id: number;
  produtoId: number;
  turnoId: number;
  motivoId: number;
  data: string;
  quantidade: number;
  custoUnitarioHistoricoCentavos: number;
  custoTotalCentavos: number;
  produto: Produto;
  turno: Turno;
  motivo: MotivoPerda;
}

export interface ResumoDashboard {
  totalProduzido: number;
  totalDescartado: number;
  taxaPerda: number;
  custoTotalPerdasCentavos: number;
}

export interface PerdaPorMotivo {
  motivoId: number;
  motivo: string;
  quantidade: number;
  custoTotalCentavos: number;
}

export interface PerdaPorProduto {
  produtoId: number;
  produto: string;
  quantidade: number;
  custoTotalCentavos: number;
}

export interface EvolucaoPerdaDia {
  data: string;
  quantidade: number;
  custoTotalCentavos: number;
}

export interface AnaliticoMotivo {
  codigo: string;
  nome: string;
}

export interface AnaliticoLinha {
  produtoId: number;
  produto: string;
  produzido: number;
  perdido: number;
  percentualPerda: number;
  porMotivo: Record<string, number>;
  custoTotalCentavos: number;
}

export interface AnaliticoResponse {
  motivos: AnaliticoMotivo[];
  linhas: AnaliticoLinha[];
}

export interface AuditLog {
  id: number;
  criadoEm: string;
  administrador: string;
  entidade: string;
  entidadeId: number;
  acao: "CRIACAO" | "EDICAO" | "EXCLUSAO";
  campo: string | null;
  valorAnterior: string | null;
  valorNovo: string | null;
}
