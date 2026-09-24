import { supabase } from "../db/supabase";

export type AcaoAuditoria = "CRIACAO" | "EDICAO" | "EXCLUSAO";

interface AlteracaoCampo {
  campo: string;
  valorAnterior: unknown;
  valorNovo: unknown;
}

interface RegistrarAuditoriaParams {
  administrador: string;
  entidade: string;
  entidadeId: number;
  acao: AcaoAuditoria;
  /** Uma linha de auditoria por campo alterado (uso em EDICAO). */
  alteracoes?: AlteracaoCampo[];
  /** Snapshot legivel do registro completo (uso em CRIACAO/EXCLUSAO). */
  snapshot?: Record<string, unknown>;
}

function serializar(valor: unknown): string | null {
  if (valor === null || valor === undefined) return null;
  if (typeof valor === "object") return JSON.stringify(valor);
  return String(valor);
}

/**
 * Grava a trilha de auditoria de uma acao administrativa. Para EDICAO,
 * grava uma linha por campo alterado (campo/valorAnterior/valorNovo). Para
 * CRIACAO e EXCLUSAO, grava uma unica linha com um snapshot do registro em
 * valorNovo/valorAnterior respectivamente — essencial para EXCLUSAO, ja que
 * o sistema usa exclusao fisica e a linha original deixara de existir.
 */
export async function registrarAuditoria(params: RegistrarAuditoriaParams): Promise<void> {
  const { administrador, entidade, entidadeId, acao, alteracoes, snapshot } = params;

  if (alteracoes && alteracoes.length > 0) {
    const { error } = await supabase.from("audit_logs").insert(
      alteracoes.map((alteracao) => ({
        administrador,
        entidade,
        entidade_id: entidadeId,
        acao,
        campo: alteracao.campo,
        valor_anterior: serializar(alteracao.valorAnterior),
        valor_novo: serializar(alteracao.valorNovo),
      }))
    );
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("audit_logs").insert({
    administrador,
    entidade,
    entidade_id: entidadeId,
    acao,
    campo: null,
    valor_anterior: acao === "EXCLUSAO" ? serializar(snapshot) : null,
    valor_novo: acao === "CRIACAO" ? serializar(snapshot) : null,
  });
  if (error) throw error;
}
