import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login } from "../api/endpoints";
import { extrairMensagemErro, setAdminToken } from "../api/client";

export function Login() {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setEntrando(true);
    setErro(null);
    try {
      const { token } = await login(senha);
      setAdminToken(token);
      const destino = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/dashboard";
      navigate(destino, { replace: true });
    } catch (error) {
      setErro(extrairMensagemErro(error, "Não foi possível entrar. Verifique a senha e tente novamente."));
    } finally {
      setEntrando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-grid bg-surface p-6 shadow-sm">
        <h1 className="text-center text-xl font-bold text-ink-primary">Controle de Produção</h1>
        <p className="mb-6 text-center text-sm text-ink-secondary">Área Administrativa</p>

        <label className="mb-1 block text-xs font-medium text-ink-secondary">Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="mb-4 w-full rounded-lg border border-grid px-3 py-2 text-sm"
          autoFocus
          required
        />

        {erro && <p className="mb-4 text-sm text-status-critical">{erro}</p>}

        <button
          type="submit"
          disabled={entrando || senha.length === 0}
          className="w-full rounded-lg bg-series-1 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {entrando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
