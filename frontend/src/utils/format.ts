import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatarNumero(valor: number): string {
  return valor.toLocaleString("pt-BR");
}

/** "2026-09-24" -> "QUINTA-FEIRA, 24 DE SETEMBRO" (para o cabeçalho do tablet). */
export function formatarDataExtensa(isoDate: string): string {
  const [ano, mes, dia] = isoDate.split("-").map(Number);
  const data = new Date(ano, mes - 1, dia);
  return format(data, "EEEE, d 'de' MMMM", { locale: ptBR }).toUpperCase();
}

export function formatarDataCurta(isoDate: string): string {
  const [ano, mes, dia] = isoDate.split("-");
  return `${dia}/${mes}`;
}

export function formatarDataCompleta(isoDate: string): string {
  const [ano, mes, dia] = isoDate.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function hojeISO(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function primeiroDiaDoMesISO(): string {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-01`;
}
