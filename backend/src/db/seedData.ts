import type { SupabaseClient } from "@supabase/supabase-js";

export const TURNOS_OFICIAIS = [
  { codigo: "T1", nome: "Turno 1", hora_inicio: "06:00", hora_fim: "14:00" },
  { codigo: "T2", nome: "Turno 2", hora_inicio: "14:00", hora_fim: "22:00" },
];

export const MOTIVOS_OFICIAIS = [
  { codigo: "CAIU_CHAO", nome: "Caiu no chão" },
  { codigo: "AZEDOU", nome: "Azedou" },
  { codigo: "RACHOU", nome: "Rachou" },
  { codigo: "DURO", nome: "Duro" },
  { codigo: "NAO_VENDEU", nome: "Não vendeu" },
];

// Lista oficial de produtos do G-PD. Custos em centavos (inteiro).
export const PRODUTOS_OFICIAIS = [
  { nome: "Salgados", categoria: "Salgados", unidade: "un", custo_unitario_centavos: 411 },
  { nome: "Torta", categoria: "Torta", unidade: "un", custo_unitario_centavos: 581 },
  { nome: "Palito", categoria: "Palito", unidade: "un", custo_unitario_centavos: 268 },
  { nome: "Pão de Queijo", categoria: "Pão de Queijo", unidade: "un", custo_unitario_centavos: 166 },
  { nome: "Mini Pão de Queijo", categoria: "Pão de Queijo", unidade: "un", custo_unitario_centavos: 39 },
  { nome: "Pão de Queijo Parmesão", categoria: "Pão de Queijo", unidade: "un", custo_unitario_centavos: 112 },
  { nome: "Pão de Queijo Goiabada", categoria: "Pão de Queijo", unidade: "un", custo_unitario_centavos: 112 },
];

/**
 * Semeia turnos, motivos de perda e os 7 produtos oficiais no schema do
 * cliente informado. Idempotente: usa upsert com ignoreDuplicates, então
 * nunca sobrescreve um custo que o admin já tenha alterado depois da
 * primeira execução.
 */
export async function seedDatabase(client: SupabaseClient): Promise<void> {
  const { error: turnosError } = await client
    .from("turnos")
    .upsert(TURNOS_OFICIAIS, { onConflict: "codigo", ignoreDuplicates: true });
  if (turnosError) throw turnosError;

  const { error: motivosError } = await client
    .from("motivos_perda")
    .upsert(MOTIVOS_OFICIAIS, { onConflict: "codigo", ignoreDuplicates: true });
  if (motivosError) throw motivosError;

  const { error: produtosError } = await client
    .from("produtos")
    .upsert(PRODUTOS_OFICIAIS, { onConflict: "nome", ignoreDuplicates: true });
  if (produtosError) throw produtosError;
}
