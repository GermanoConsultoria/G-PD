/** @type {import('tailwindcss').Config} */

// Cores que trocam entre tema claro/escuro são lidas de variáveis CSS (ver
// index.css, blocos :root e .dark), permitindo alternar o tema sem tocar em
// nenhuma classe nos componentes. Suporta o modificador de opacidade do
// Tailwind (ex: bg-status-good/10) via rgb(var(--x) / <alpha>).
function corVariavel(variavel) {
  return ({ opacityValue }) =>
    opacityValue === undefined ? `rgb(var(${variavel}))` : `rgb(var(${variavel}) / ${opacityValue})`;
}

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: corVariavel("--color-surface"),
        page: corVariavel("--color-page"),
        ink: {
          primary: corVariavel("--color-ink-primary"),
          secondary: corVariavel("--color-ink-secondary"),
          muted: corVariavel("--color-ink-muted"),
        },
        grid: corVariavel("--color-grid"),
        baseline: corVariavel("--color-baseline"),
        // Cores de marca/estado: propositalmente constantes nos dois temas.
        series: {
          1: "#2a78d6",
          2: "#eb6834",
          3: "#1baf7a",
          4: "#eda100",
          5: "#e87ba4",
          6: "#008300",
          7: "#4a3aa7",
          8: "#e34948",
        },
        status: {
          good: "#0ca30c",
          warning: "#fab219",
          serious: "#ec835a",
          critical: "#d03b3b",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
