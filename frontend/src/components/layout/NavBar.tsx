import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearAdminToken } from "../../api/client";

const linkBase = "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors";
const linkAtivo = "bg-series-1 text-white";
const linkInativo = "text-ink-secondary hover:bg-black/5";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();

  function handleSair() {
    clearAdminToken();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-grid bg-surface px-5 py-3">
        <span className="text-lg font-extrabold tracking-tight text-series-1">G-PD</span>
        <div className="flex items-center gap-3 text-sm text-ink-secondary">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Admin</span>
          <span className="text-ink-muted">•</span>
          <button type="button" onClick={handleSair} className="font-medium text-ink-secondary hover:text-ink-primary">
            Sair
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <nav className="flex w-56 shrink-0 flex-col gap-1 border-r border-grid bg-surface p-3">
          <NavLink to="/dashboard" className={({ isActive }) => `${linkBase} ${isActive ? linkAtivo : linkInativo}`}>
            Dashboard
          </NavLink>
          <NavLink to="/lancamentos" className={({ isActive }) => `${linkBase} ${isActive ? linkAtivo : linkInativo}`}>
            Lançamentos
          </NavLink>
          <NavLink to="/produtos" className={({ isActive }) => `${linkBase} ${isActive ? linkAtivo : linkInativo}`}>
            Produtos
          </NavLink>
          <NavLink to="/auditoria" className={({ isActive }) => `${linkBase} ${isActive ? linkAtivo : linkInativo}`}>
            Auditoria
          </NavLink>

          <div className="mt-auto border-t border-grid pt-3">
            <NavLink to="/" end className={({ isActive }) => `${linkBase} block ${isActive ? linkAtivo : linkInativo}`}>
              Terminal (Tablet)
            </NavLink>
          </div>
        </nav>

        <main className="flex-1 overflow-x-auto bg-page">{children}</main>
      </div>
    </div>
  );
}
