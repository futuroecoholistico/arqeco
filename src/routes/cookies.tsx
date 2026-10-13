import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Política de Cookies — ARQECO" },
      { name: "description", content: "Quais cookies e armazenamentos locais a ARQECO usa e como você pode controlá-los." },
      { property: "og:title", content: "Política de Cookies — ARQECO" },
      { property: "og:description", content: "Transparência sobre cookies na plataforma ARQECO." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cookies,
});

const rows = [
  ["Sessão de login", "Mantém você conectado à sua conta", "Essencial", "Até você sair"],
  ["Preferência de cookies", "Guarda a sua escolha neste aviso", "Essencial", "12 meses"],
  ["Pagamento", "Segurança e prevenção a fraudes no checkout do provedor", "Essencial", "Durante o pagamento"],
];

function Cookies() {
  return (
    <main className="min-h-screen bg-background px-5 py-16">
      <article className="mx-auto max-w-3xl text-sm leading-relaxed">
        <Link to="/" className="font-display text-2xl font-semibold text-primary">ARQECO</Link>
        <h1 className="mt-10 font-display text-4xl font-semibold">Política de Cookies</h1>
        <p className="mt-6">Cookies são pequenos arquivos guardados no seu navegador. A ARQECO usa apenas cookies e armazenamento local <strong>essenciais</strong> ao funcionamento da plataforma. Não usamos cookies de publicidade nem vendemos dados de navegação.</p>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead><tr className="border-b border-border">{["Nome", "Finalidade", "Tipo", "Duração"].map((h) => <th key={h} className="py-2 pr-4 font-semibold">{h}</th>)}</tr></thead>
            <tbody>{rows.map((r) => <tr key={r[0]} className="border-b border-border">{r.map((c) => <td key={c} className="py-2 pr-4">{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <h2 className="mt-10 font-display text-xl font-semibold">Como controlar</h2>
        <p className="mt-3">Você pode apagar ou bloquear cookies nas configurações do seu navegador. Bloquear os essenciais pode impedir o login e a contratação. Se no futuro passarmos a usar cookies de análise ou marketing, eles só serão ativados com o seu consentimento.</p>
        <p className="mt-6">Saiba mais na <Link to="/privacidade" className="text-primary underline">Política de Privacidade</Link> e nos <Link to="/termos" className="text-primary underline">Termos de Uso</Link>. Última atualização: 13 de outubro de 2026.</p>
      </article>
    </main>
  );
}
