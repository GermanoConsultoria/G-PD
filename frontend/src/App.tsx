import { Route, Routes, useLocation } from "react-router-dom";
import { NavBar } from "./components/layout/NavBar";
import { Producao } from "./pages/Producao";
import { Dashboard } from "./pages/Dashboard";
import { Produtos } from "./pages/Produtos";

export default function App() {
  const location = useLocation();
  const isTablet = location.pathname === "/";

  return (
    <div className="min-h-screen bg-page">
      {!isTablet && <NavBar />}
      <Routes>
        <Route path="/" element={<Producao />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/produtos" element={<Produtos />} />
      </Routes>
    </div>
  );
}
