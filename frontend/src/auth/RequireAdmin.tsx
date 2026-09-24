import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAdminToken } from "../api/client";

interface RequireAdminProps {
  children: ReactElement;
}

/**
 * Guarda de rota do lado do cliente. Apenas evita renderizar a tela
 * administrativa sem token local — o servidor continua sendo a autoridade
 * final: qualquer chamada de API que responda 401 já limpa o token e
 * redireciona para /login (ver interceptor em api/client.ts).
 */
export function RequireAdmin({ children }: RequireAdminProps) {
  const location = useLocation();

  if (!getAdminToken()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
