import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { buscarDiagnostico } from "@/lib/diagnostico.functions";
import { RelatorioView } from "@/components/eco/RelatorioView";

export const Route = createFileRoute("/_authenticated/diagnostico/$id")({
  head: () => ({
    meta: [
      { title: "Dossiê Eco Holístico® — ARQECO — Eco-Holístico" },
      { name: "description", content: "Detalhes do seu Dossiê Eco Holístico®." },
      { property: "og:title", content: "Dossiê Eco Holístico® — Design Eco Holístico" },
      { property: "og:description", content: "Relatório completo do seu dossiê." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DiagnosticoDetalhe,
});

function DiagnosticoDetalhe() {
  const { id } = Route.useParams();
  const buscar = useServerFn(buscarDiagnostico);
  const { data, isLoading, error } = useQuery({
    queryKey: ["diagnostico", id],
    queryFn: () => buscar({ data: { id } }),
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link to="/meus-diagnosticos" className="text-sm text-muted-foreground hover:text-foreground no-print">← Voltar ao histórico</Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 no-print">
        <h1 className="font-display text-3xl">Dossiê Eco Holístico®</h1>
        <Button onClick={() => window.print()} className="rounded-md border border-border px-3 py-2 text-sm">Imprimir / PDF</Button>
      </div>

      <div className="mt-8">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}
        {data === null && <p className="text-muted-foreground">Dossiê não encontrado.</p>}
        {data && data.status === "processando" && (
          <p className="rounded-lg border border-border bg-card/60 p-6 text-muted-foreground">
            Este dossiê ainda está sendo processado.
          </p>
        )}
        {data && data.status === "erro" && (
          <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-destructive">
            Este dossiê terminou com erro. Tente iniciar um novo.
          </p>
        )}
        {data && data.status === "concluido" && data.resultado && (
          <RelatorioView resultado={data.resultado} imagemOriginal={data.imagemOriginalUrl} tipoAmbiente={data.tipoAmbiente} bloqueado={data.bloqueado} dossieId={data.id} />
        )}
      </div>
    </div>
  );
}
