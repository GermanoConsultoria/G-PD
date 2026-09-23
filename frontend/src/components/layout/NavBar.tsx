import { NavLink } from "react-router-dom";

const linkBase =
  "px-4 py-2 rounded-lg text-sm font-medium transition-colors";
const linkAtivo = "bg-series-1 text-white";
const linkInativo = "text-ink-secondary hover:bg-black/5";

export function NavBar() {
  return (
    <header className="border-b border-grid bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <span className="font-semibold text-ink-primary">
          Controle de Produção &amp; Perdas
        </span>
        <nav className="flex gap-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `${linkBase} ${isActive ? linkAtivo : linkInativo}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/produtos"
            className={({ isActive }) => `${linkBase} ${isActive ? linkAtivo : linkInativo}`}
          >
            Produtos
          </NavLink>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `${linkBase} ${isActive ? linkAtivo : linkInativo}`}
          >
            Lançamento (Tablet)
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
