export interface Produto {
  id: number;
  nome: string;
  categoria: string | null;
  unidade: string;
  custoUnitario: number;
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
  turno: Turno;
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
  custoUnitarioHistorico: number;
  custoTotal: number;
  produto: Produto;
  turno: Turno;
  motivo: MotivoPerda;
}

export interface ResumoDashboard {
  totalProduzido: number;
  totalDescartado: number;
  taxaPerda: number;
  custoTotalPerdas: number;
}

export interface PerdaPorMotivo {
  motivoId: number;
  motivo: string;
  quantidade: number;
  custoTotal: number;
}

export interface PerdaPorProduto {
  produtoId: number;
  produto: string;
  quantidade: number;
  custoTotal: number;
}

export interface EvolucaoPerdaDia {
  data: string;
  quantidade: number;
  custoTotal: number;
}
