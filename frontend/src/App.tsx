import { Route, Routes, useLocation } from "react-router-dom";
import { NavBar } from "./components/layout/NavBar";
import { Producao } from "./pages/Producao";
import { Dashboard } from "./pages/Dashboard";
import { Produtos } from "./pages/Produtos";
import { Login } from "./pages/Login";
import { Lancamentos } from "./pages/Lancamentos";
import { Auditoria } from "./pages/Auditoria";
import { RequireAdmin } from "./auth/RequireAdmin";

export default function App() {
  const location = useLocation();
  const semNavBar = location.pathname === "/" || location.pathname === "/login";

  return (
    <div className="min-h-screen bg-page">
      {!semNavBar && <NavBar />}
      <Routes>
        <Route path="/" element={<Producao />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <RequireAdmin>
              <Dashboard />
            </RequireAdmin>
          }
        />
        <Route
          path="/produtos"
          element={
            <RequireAdmin>
              <Produtos />
            </RequireAdmin>
          }
        />
        <Route
          path="/lancamentos"
          element={
            <RequireAdmin>
              <Lancamentos />
            </RequireAdmin>
          }
        />
        <Route
          path="/auditoria"
          element={
            <RequireAdmin>
              <Auditoria />
            </RequireAdmin>
          }
        />
      </Routes>
    </div>
  );
}
