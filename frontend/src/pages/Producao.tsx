import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getContextoAtual,
  getMotivos,
  getProdutos,
  getTurnos,
  registrarPerda,
  registrarProducao,
} from "../api/endpoints";
import type { MotivoPerda, Produto, Turno } from "../api/types";
import { ConfirmToast } from "../components/tablet/ConfirmToast";
import { MotivoPicker } from "../components/tablet/MotivoPicker";
import { NumericKeypad } from "../components/tablet/NumericKeypad";
import { ProductGrid } from "../components/tablet/ProductGrid";
import { ShiftDateBar } from "../components/tablet/ShiftDateBar";
import { hojeISO } from "../utils/format";

type Modo = "producao" | "perda";
type Etapa = { tipo: "idle" } | { tipo: "quantidade"; produto: Produto } | { tipo: "motivo"; produto: Produto; quantidade: number };

export function Producao() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [motivos, setMotivos] = useState<MotivoPerda[]>([]);

  const [modo, setModo] = useState<Modo>("producao");
  const [data, setData] = useState(hojeISO());
  const [turnoId, setTurnoId] = useState<number | null>(null);
  const [etapa, setEtapa] = useState<Etapa>({ tipo: "idle" });
  const [toast, setToast] = useState<{ mensagem: string; tipo: "sucesso" | "erro" } | null>(null);

  useEffect(() => {
    Promise.all([getProdutos(true), getTurnos(), getMotivos(), getContextoAtual()]).then(
      ([produtosResp, turnosResp, motivosResp, contexto]) => {
        setProdutos(produtosResp);
        setTurnos(turnosResp);
        setMotivos(motivosResp);
        setData(contexto.data);
        setTurnoId(contexto.turno.id);
      }
    );
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  function mostrarToast(mensagem: string, tipo: "sucesso" | "erro") {
    setToast({ mensagem, tipo });
  }

  async function confirmarQuantidade(quantidade: number) {
    if (etapa.tipo !== "quantidade" || turnoId === null) return;
    const produto = etapa.produto;

    if (modo === "producao") {
      try {
        await registrarProducao({ produtoId: produto.id, turnoId, data, quantidade });
        mostrarToast(`Produção registrada: ${quantidade} ${produto.nome}`, "sucesso");
      } catch {
        mostrarToast("Erro ao registrar produção", "erro");
      }
      setEtapa({ tipo: "idle" });
    } else {
      setEtapa({ tipo: "motivo", produto, quantidade });
    }
  }

  async function confirmarMotivo(motivo: MotivoPerda) {
    if (etapa.tipo !== "motivo" || turnoId === null) return;
    const { produto, quantidade } = etapa;

    try {
      await registrarPerda({ produtoId: produto.id, turnoId, motivoId: motivo.id, data, quantidade });
      mostrarToast(`Perda registrada: ${quantidade} ${produto.nome} (${motivo.nome})`, "sucesso");
    } catch {
      mostrarToast("Erro ao registrar perda", "erro");
    }
    setEtapa({ tipo: "idle" });
  }

  const classeAtivaProducao = "active:border-series-1 active:bg-series-1/10";
  const classeAtivaPerda = "active:border-status-critical active:bg-status-critical/10";

  return (
    <div className="tablet-shell min-h-screen p-4">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-ink-primary">Lançamento de Produção</h1>
          <Link to="/dashboard" className="text-xs text-ink-muted underline">
            Painel do Gestor
          </Link>
        </div>

        <ShiftDateBar
          data={data}
          turnos={turnos}
          turnoId={turnoId}
          onMudarData={setData}
          onMudarTurno={setTurnoId}
        />

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setModo("producao")}
            className={`rounded-2xl py-5 text-lg font-bold ${
              modo === "producao" ? "bg-series-1 text-white" : "border border-grid bg-surface text-ink-secondary"
            }`}
          >
            Registrar Produção
          </button>
          <button
            type="button"
            onClick={() => setModo("perda")}
            className={`rounded-2xl py-5 text-lg font-bold ${
              modo === "perda" ? "bg-status-critical text-white" : "border border-grid bg-surface text-ink-secondary"
            }`}
          >
            Registrar Perda
          </button>
        </div>

        <ProductGrid
          produtos={produtos}
          classeAtiva={modo === "producao" ? classeAtivaProducao : classeAtivaPerda}
          onSelecionar={(produto) => setEtapa({ tipo: "quantidade", produto })}
        />
      </div>

      {etapa.tipo === "quantidade" && (
        <NumericKeypad
          titulo={modo === "producao" ? "Quantidade produzida" : "Quantidade perdida"}
          subtitulo={etapa.produto.nome}
          corDestaque={modo === "producao" ? "bg-series-1" : "bg-status-critical"}
          onConfirmar={confirmarQuantidade}
          onCancelar={() => setEtapa({ tipo: "idle" })}
        />
      )}

      {etapa.tipo === "motivo" && (
        <MotivoPicker
          motivos={motivos}
          onSelecionar={confirmarMotivo}
          onCancelar={() => setEtapa({ tipo: "idle" })}
        />
      )}

      {toast && <ConfirmToast mensagem={toast.mensagem} tipo={toast.tipo} />}
    </div>
  );
}
