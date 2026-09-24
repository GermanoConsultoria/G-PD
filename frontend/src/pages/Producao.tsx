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
import { extrairMensagemErro } from "../api/client";
import type { MotivoPerda, Produto, Turno } from "../api/types";
import { MotivoPicker } from "../components/tablet/MotivoPicker";
import { NumericKeypad } from "../components/tablet/NumericKeypad";
import { ProductGrid } from "../components/tablet/ProductGrid";
import { ShiftDateBar } from "../components/tablet/ShiftDateBar";
import { StatusHeader } from "../components/tablet/StatusHeader";
import { SuccessScreen } from "../components/tablet/SuccessScreen";
import { ThemeToggle } from "../components/layout/ThemeToggle";
import { hojeISO } from "../utils/format";

type Modo = "producao" | "perda";

type Etapa =
  | { tipo: "home" }
  | { tipo: "produto"; modo: Modo }
  | { tipo: "quantidade"; modo: Modo; produto: Produto }
  | { tipo: "motivo"; produto: Produto; quantidade: number }
  | {
      tipo: "sucesso";
      modo: Modo;
      produtoNome: string;
      quantidade: number;
      turnoNome: string;
      data: string;
      motivoNome?: string;
      custoTotalCentavos?: number;
    };

const REFRESH_CONTEXTO_MS = 30_000;

export function Producao() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [motivos, setMotivos] = useState<MotivoPerda[]>([]);

  const [data, setData] = useState(hojeISO());
  const [turnoId, setTurnoId] = useState<number | null>(null);
  const [emHorarioOperacional, setEmHorarioOperacional] = useState(true);
  const [mostrarAjuste, setMostrarAjuste] = useState(false);

  const [etapa, setEtapa] = useState<Etapa>({ tipo: "home" });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([getProdutos(true), getTurnos(), getMotivos(), getContextoAtual()]).then(
      ([produtosResp, turnosResp, motivosResp, contexto]) => {
        setProdutos(produtosResp);
        setTurnos(turnosResp);
        setMotivos(motivosResp);
        setData(contexto.data);
        setEmHorarioOperacional(contexto.emHorarioOperacional);
        setTurnoId(contexto.turno?.id ?? null);
        setCarregando(false);
      }
    );
  }, []);

  // Mantém turno/horário em dia num tablet que fica ligado durante a troca de
  // turno (06:00, 14:00, 22:00), sem interferir se a pessoa ajustou manualmente
  // a data para lançar um dia retroativo.
  useEffect(() => {
    if (etapa.tipo !== "home") return;
    const intervalo = setInterval(() => {
      getContextoAtual().then((contexto) => {
        setEmHorarioOperacional(contexto.emHorarioOperacional);
        setData((dataAtual) => {
          if (dataAtual !== hojeISO()) return dataAtual;
          setTurnoId(contexto.turno?.id ?? null);
          return contexto.data;
        });
      });
    }, REFRESH_CONTEXTO_MS);
    return () => clearInterval(intervalo);
  }, [etapa.tipo]);

  const bloqueadoPorHorario = !emHorarioOperacional && data === hojeISO();
  const turnoAtual = turnos.find((t) => t.id === turnoId) ?? null;

  function irParaHome() {
    setErro(null);
    setEtapa({ tipo: "home" });
    getContextoAtual().then((contexto) => {
      setEmHorarioOperacional(contexto.emHorarioOperacional);
      if (data === hojeISO() || data === contexto.data) {
        setData(contexto.data);
        setTurnoId(contexto.turno?.id ?? null);
      }
    });
  }

  function abrirModo(modo: Modo) {
    if (bloqueadoPorHorario || turnoId === null) return;
    setErro(null);
    setEtapa({ tipo: "produto", modo });
  }

  function selecionarProduto(produto: Produto) {
    if (etapa.tipo !== "produto") return;
    setErro(null);
    setEtapa({ tipo: "quantidade", modo: etapa.modo, produto });
  }

  async function confirmarQuantidade(quantidade: number) {
    if (etapa.tipo !== "quantidade" || turnoId === null) return;
    const { modo, produto } = etapa;

    if (modo === "perda") {
      setErro(null);
      setEtapa({ tipo: "motivo", produto, quantidade });
      return;
    }

    setEnviando(true);
    setErro(null);
    try {
      await registrarProducao({ produtoId: produto.id, turnoId, data, quantidade });
      setEtapa({
        tipo: "sucesso",
        modo: "producao",
        produtoNome: produto.nome,
        quantidade,
        turnoNome: turnoAtual?.nome ?? "",
        data,
      });
    } catch (error) {
      setErro(extrairMensagemErro(error, "Não foi possível registrar o lançamento. Verifique a conexão e tente novamente."));
    } finally {
      setEnviando(false);
    }
  }

  async function confirmarMotivo(motivo: MotivoPerda) {
    if (etapa.tipo !== "motivo" || turnoId === null) return;
    const { produto, quantidade } = etapa;

    setEnviando(true);
    setErro(null);
    try {
      const perda = await registrarPerda({ produtoId: produto.id, turnoId, motivoId: motivo.id, data, quantidade });
      setEtapa({
        tipo: "sucesso",
        modo: "perda",
        produtoNome: produto.nome,
        quantidade,
        turnoNome: turnoAtual?.nome ?? "",
        data,
        motivoNome: motivo.nome,
        custoTotalCentavos: perda.custoTotalCentavos,
      });
    } catch (error) {
      setErro(extrairMensagemErro(error, "Não foi possível registrar o lançamento. Verifique a conexão e tente novamente."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="tablet-shell min-h-screen bg-page">
      {etapa.tipo === "home" && (
        <div className="p-4">
          <div className="mx-auto flex max-w-4xl flex-col gap-4">
            <div className="flex items-center justify-end gap-3">
              <Link to="/dashboard" className="text-xs text-ink-muted underline">
                Painel do Gestor
              </Link>
              <ThemeToggle />
            </div>

            {carregando ? (
              <div className="animate-pulse rounded-2xl border border-grid bg-surface p-5">
                <div className="h-4 w-24 rounded bg-grid" />
                <div className="mt-4 h-3 w-40 rounded bg-grid" />
                <div className="mt-2 h-7 w-32 rounded bg-grid" />
              </div>
            ) : (
              <StatusHeader data={data} emHorarioOperacional={emHorarioOperacional} turnoAtual={turnoAtual} turnos={turnos} />
            )}

            <button
              type="button"
              onClick={() => setMostrarAjuste((v) => !v)}
              className="self-start text-xs font-medium text-ink-muted underline"
            >
              {mostrarAjuste ? "Ocultar ajuste de data/turno" : "Ajustar data ou turno (lançamento retroativo)"}
            </button>

            {mostrarAjuste && (
              <ShiftDateBar data={data} turnos={turnos} turnoId={turnoId} onMudarData={setData} onMudarTurno={setTurnoId} />
            )}

            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                disabled={bloqueadoPorHorario || turnoId === null}
                onClick={() => abrirModo("producao")}
                className="rounded-2xl bg-series-1 py-10 text-3xl font-extrabold text-white shadow-sm transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                PRODUÇÃO
              </button>
              <button
                type="button"
                disabled={bloqueadoPorHorario || turnoId === null}
                onClick={() => abrirModo("perda")}
                className="rounded-2xl bg-status-critical py-10 text-3xl font-extrabold text-white shadow-sm transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                PERDA
              </button>
            </div>

            {bloqueadoPorHorario && (
              <p className="text-center text-sm text-ink-muted">
                Não é possível registrar lançamentos agora. Use "Ajustar data" apenas para corrigir um dia anterior.
              </p>
            )}
          </div>
        </div>
      )}

      {etapa.tipo === "produto" && (
        <div className="flex min-h-screen flex-col p-4 animate-[slideUp_0.15s_ease-out]">
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4">
            <div className="flex items-center justify-between">
              <button type="button" onClick={irParaHome} className="text-sm font-medium text-ink-muted underline">
                ← Voltar
              </button>
              <span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${etapa.modo === "producao" ? "bg-series-1" : "bg-status-critical"}`}>
                {etapa.modo === "producao" ? "PRODUÇÃO" : "PERDA"}
              </span>
            </div>
            <p className="text-center text-lg font-semibold text-ink-primary">Selecione o produto</p>
            <ProductGrid
              produtos={produtos}
              classeAtiva={etapa.modo === "producao" ? "active:border-series-1 active:bg-series-1/10" : "active:border-status-critical active:bg-status-critical/10"}
              onSelecionar={selecionarProduto}
            />
          </div>
        </div>
      )}

      {etapa.tipo === "quantidade" && (
        <NumericKeypad
          titulo={etapa.modo === "producao" ? "Quantos foram produzidos?" : "Quantos foram perdidos?"}
          subtitulo={etapa.produto.nome}
          corDestaque={etapa.modo === "producao" ? "bg-series-1" : "bg-status-critical"}
          erro={erro}
          enviando={enviando}
          onConfirmar={confirmarQuantidade}
          onCancelar={() => setEtapa({ tipo: "produto", modo: etapa.modo })}
        />
      )}

      {etapa.tipo === "motivo" && (
        <MotivoPicker
          produtoNome={etapa.produto.nome}
          quantidade={etapa.quantidade}
          motivos={motivos}
          erro={erro}
          enviando={enviando}
          onSelecionar={confirmarMotivo}
          onCancelar={() => setEtapa({ tipo: "quantidade", modo: "perda", produto: etapa.produto })}
        />
      )}

      {etapa.tipo === "sucesso" && (
        <SuccessScreen
          tipo={etapa.modo}
          produtoNome={etapa.produtoNome}
          quantidade={etapa.quantidade}
          turnoNome={etapa.turnoNome}
          data={etapa.data}
          motivoNome={etapa.motivoNome}
          custoTotalCentavos={etapa.custoTotalCentavos}
          onNovoLancamento={irParaHome}
        />
      )}
    </div>
  );
}
