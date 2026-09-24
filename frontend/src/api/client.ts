import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
});

const TOKEN_KEY = "gpd_admin_token";

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (resposta) => resposta,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearAdminToken();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

interface RespostaErroApi {
  error?: string;
  detalhes?: { campo: string; mensagem: string }[];
}

/**
 * Centraliza a leitura de erros vindos da API. Usar em qualquer lugar que
 * precise mostrar uma mensagem de erro ao usuário, em vez de espalhar
 * `catch`/mensagens genéricas pelos componentes.
 */
export function extrairMensagemErro(error: unknown, mensagemPadrao: string): string {
  if (axios.isAxiosError(error)) {
    const dados = error.response?.data as RespostaErroApi | undefined;
    if (dados?.error) {
      if (dados.detalhes?.length) {
        return `${dados.error}: ${dados.detalhes.map((d) => d.mensagem).join("; ")}`;
      }
      return dados.error;
    }
  }
  return mensagemPadrao;
}
