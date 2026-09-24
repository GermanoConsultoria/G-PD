/**
 * As tabelas no Postgres usam snake_case (convenção do banco); a API
 * continua respondendo em camelCase (contrato já usado pelo frontend). Estes
 * mappers isolam essa tradução num único lugar.
 */

export interface ProdutoRow {
  id: number;
  nome: string;
  categoria: string | null;
  unidade: string;
  custo_unitario_centavos: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export function mapProduto(row: ProdutoRow) {
  return {
    id: row.id,
    nome: row.nome,
    categoria: row.categoria,
    unidade: row.unidade,
    custoUnitarioCentavos: row.custo_unitario_centavos,
    ativo: row.ativo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface TurnoRow {
  id: number;
  codigo: string;
  nome: string;
  hora_inicio: string;
  hora_fim: string;
}

export function mapTurno(row: TurnoRow) {
  return {
    id: row.id,
    codigo: row.codigo as "T1" | "T2",
    nome: row.nome,
    horaInicio: row.hora_inicio,
    horaFim: row.hora_fim,
  };
}

export interface MotivoRow {
  id: number;
  codigo: string;
  nome: string;
  ativo: boolean;
}

export function mapMotivo(row: MotivoRow) {
  return { id: row.id, codigo: row.codigo, nome: row.nome };
}

export interface ProducaoRow {
  id: number;
  produto_id: number;
  turno_id: number;
  data: string;
  quantidade: number;
  created_at: string;
  produto: ProdutoRow;
  turno: TurnoRow;
}

export function mapProducao(row: ProducaoRow) {
  return {
    id: row.id,
    produtoId: row.produto_id,
    turnoId: row.turno_id,
    data: row.data,
    quantidade: row.quantidade,
    produto: mapProduto(row.produto),
    turno: mapTurno(row.turno),
  };
}

export interface PerdaRow {
  id: number;
  produto_id: number;
  turno_id: number;
  motivo_id: number;
  data: string;
  quantidade: number;
  custo_unitario_historico_centavos: number;
  custo_total_centavos: number;
  created_at: string;
  produto: ProdutoRow;
  turno: TurnoRow;
  motivo: MotivoRow;
}

export function mapPerda(row: PerdaRow) {
  return {
    id: row.id,
    produtoId: row.produto_id,
    turnoId: row.turno_id,
    motivoId: row.motivo_id,
    data: row.data,
    quantidade: row.quantidade,
    custoUnitarioHistoricoCentavos: row.custo_unitario_historico_centavos,
    custoTotalCentavos: row.custo_total_centavos,
    produto: mapProduto(row.produto),
    turno: mapTurno(row.turno),
    motivo: mapMotivo(row.motivo),
  };
}

export interface AuditLogRow {
  id: number;
  criado_em: string;
  administrador: string;
  entidade: string;
  entidade_id: number;
  acao: string;
  campo: string | null;
  valor_anterior: string | null;
  valor_novo: string | null;
}

export function mapAuditLog(row: AuditLogRow) {
  return {
    id: row.id,
    criadoEm: row.criado_em,
    administrador: row.administrador,
    entidade: row.entidade,
    entidadeId: row.entidade_id,
    acao: row.acao as "CRIACAO" | "EDICAO" | "EXCLUSAO",
    campo: row.campo,
    valorAnterior: row.valor_anterior,
    valorNovo: row.valor_novo,
  };
}
