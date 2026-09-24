import { useEffect, useState } from "react";

type Tema = "light" | "dark";

const CHAVE_ARMAZENAMENTO = "gpd_tema";

function lerPreferenciaInicial(): Tema {
  const salvo = localStorage.getItem(CHAVE_ARMAZENAMENTO);
  if (salvo === "light" || salvo === "dark") return salvo;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  const [tema, setTema] = useState<Tema>(() => lerPreferenciaInicial());

  useEffect(() => {
    document.documentElement.classList.toggle("dark", tema === "dark");
    localStorage.setItem(CHAVE_ARMAZENAMENTO, tema);
  }, [tema]);

  function alternar() {
    setTema((atual) => (atual === "dark" ? "light" : "dark"));
  }

  return { tema, alternar };
}
