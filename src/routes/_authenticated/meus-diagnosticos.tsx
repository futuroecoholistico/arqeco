import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listarMeusDiagnosticos } from "@/lib/diagnostico.functions";
import { NIVEIS_LABELS, TIPOS_AMBIENTE } from "@/domain/types";

export const Route = createFileRoute("/_authenticated/meus-diagnosticos")({
  head: () => ({
    meta: [
      { title: "Meus dossiês — ARQECO — Eco-Holístico" },
      { name: "description", content: "Histórico dos seus Dossiês Eco Holísticos®." },
      { property: "og:title", content: "Meus Dossiês Eco Holísticos®" },
      { property: "og:description", content: "Consulte seu histórico de análises." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MeusDiagnosticos,
});

function MeusDiagnosticos() {
  const list = useServerFn(listarMeusDiagnosticos);
  const { data, isLoading, error } = useQuery({
    queryKey: ["diagnosticos", "meus"],
    queryFn: () => list(),
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl">Meus dossiês</h1>
          <p className="mt-1 text-muted-foreground">Histórico das suas análises Eco Holísticas.</p>
        </div>
        <Link to="/diagnostico" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Novo dossiê</Link>
      </div>

      <div className="mt-8">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}
        {data && data.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <p className="text-muted-foreground">Nenhum dossiê ainda.</p>
            <Link to="/diagnostico" className="mt-4 inline-block text-primary hover:underline">Fazer o primeiro</Link>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {data?.map((d) => {
            const tipo = TIPOS_AMBIENTE.find((t) => t.id === d.tipoAmbiente);
            return (
              <Link key={d.id} to="/diagnostico/$id" params={{ id: d.id }}
                className="group rounded-xl border border-border/60 bg-card/60 p-5 transition hover:border-primary">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(d.createdAt).toLocaleDateString("pt-BR")}</span>
                  <span className={`rounded-full px-2 py-0.5 ${d.status === "concluido" ? "bg-primary/15 text-primary" : d.status === "erro" ? "bg-destructive/15 text-destructive" : "bg-secondary text-secondary-foreground"}`}>{d.status}</span>
                </div>
                <div className="font-display mt-3 text-2xl text-primary">{tipo?.label ?? d.tipoAmbiente}</div>
                {d.nivel && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    Nível {d.nivel} — {NIVEIS_LABELS[d.nivel]}
                  </div>
                )}
                {d.indiceRegeneracao !== null && (
                  <div className="mt-3">
                    <div className="text-xs text-muted-foreground">Índice: {d.indiceRegeneracao}/100</div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full bg-primary" style={{ width: `${d.indiceRegeneracao}%` }} />
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
