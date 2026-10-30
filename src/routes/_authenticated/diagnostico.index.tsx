import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import {
  TIPOS_AMBIENTE,
  TRILHA_LABELS,
  trilhaDe,
  type TipoAmbiente,
  type ResultadoDiagnostico,
} from "@/domain/types";
import { getPerguntas, perguntaVisivel, prepararRespostasQuestionario, ORIENTACAO_ANAMNESE } from "@/lib/questionario";
import type { RespostasMap } from "@/domain/ports";
import type { DocumentoMarca } from "@/domain/ports";
import { uploadImagem, analisarAmbiente } from "@/lib/diagnostico.functions";
import { RelatorioView } from "@/components/eco/RelatorioView";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/diagnostico/")({
  head: () => ({
    meta: [
      { title: "Novo Dossiê Eco Holístico® — ARQECO — Eco-Holístico" },
      { name: "description", content: "Inicie uma nova análise Eco Holística do seu ambiente." },
      { property: "og:title", content: "Novo Dossiê Eco Holístico®" },
      { property: "og:description", content: "Envie foto, responda a anamnese e receba seu dossiê." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WizardPage,
});

type Etapa = "tipo" | "foto" | "questionario" | "processando" | "relatorio";

function WizardPage() {
  const [etapa, setEtapa] = useState<Etapa>("tipo");
  const [tipo, setTipo] = useState<TipoAmbiente | null>(null);
  const [imagemPath, setImagemPath] = useState<string | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [imagemOriginalUrl, setImagemOriginalUrl] = useState<string | null>(null);
  const [respostas, setRespostas] = useState<RespostasMap>({});
  const [documentoMarca, setDocumentoMarca] = useState<DocumentoMarca | null>(null);
  const [resultado, setResultado] = useState<ResultadoDiagnostico | null>(null);
  const [diagId, setDiagId] = useState<string | null>(null);

  const upload = useServerFn(uploadImagem);
  const analisar = useServerFn(analisarAmbiente);

  const [uploading, setUploading] = useState(false);
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast.error("Máximo de 8MB por imagem."); return; }
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      setImagemPreview(base64);
      const b64Data = base64.replace(/^data:[^;]+;base64,/, "");
      const res = await upload({ data: { base64: b64Data, mimeType: file.type || "image/jpeg" } });
      setImagemPath(res.path);
      setImagemOriginalUrl(res.signedUrl);
      toast.success("Foto enviada.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setUploading(false); }
  }

  const [bloqueado, setBloqueado] = useState(false);

  async function submitDiagnostico() {
    if (!tipo) return;
    setEtapa("processando");
    try {
      const { id, resultado, imagemOriginalUrl, bloqueado } = await analisar({
        data: { tipoAmbiente: tipo, imagemPath, respostas: prepararRespostasQuestionario(tipo, respostas), documentoMarca },
      });
      setDiagId(id);
      setResultado(resultado);
      setBloqueado(bloqueado);
      if (imagemOriginalUrl) setImagemOriginalUrl(imagemOriginalUrl);
      setEtapa("relatorio");
    } catch (err) {
      toast.error((err as Error).message);
      setEtapa("questionario");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <StepIndicator etapa={etapa} />

      {etapa === "tipo" && (
        <StepTipo onSelect={(t) => { setTipo(t); setEtapa("foto"); }} />
      )}
      {etapa === "foto" && tipo && (
        <StepFoto
          preview={imagemPreview} uploading={uploading}
          onFile={handleFile}
          onBack={() => setEtapa("tipo")}
          onNext={() => setEtapa("questionario")}
        />
      )}
      {etapa === "questionario" && tipo && (
        <StepQuestionario
          tipo={tipo} respostas={respostas} setRespostas={setRespostas}
          documentoMarca={documentoMarca} setDocumentoMarca={setDocumentoMarca}
          onBack={() => setEtapa("foto")}
          onSubmit={submitDiagnostico}
        />
      )}
      {etapa === "processando" && <StepProcessando />}
      {etapa === "relatorio" && resultado && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 no-print">
            <div>
              <div className="text-xs uppercase text-muted-foreground">Dossiê #{diagId?.slice(0, 8)}</div>
              <h1 className="font-display text-3xl">Seu Dossiê Eco Holístico®</h1>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => window.print()} className="rounded-md border border-border px-3 py-2 text-sm">Imprimir / PDF</Button>
              <Button onClick={() => { setEtapa("tipo"); setTipo(null); setImagemPath(null); setImagemPreview(null); setImagemOriginalUrl(null); setRespostas({}); setDocumentoMarca(null); setResultado(null); setDiagId(null); }}
                className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground">Novo dossiê</Button>
            </div>
          </div>
          <RelatorioView resultado={resultado} imagemOriginal={imagemOriginalUrl} tipoAmbiente={tipo ?? undefined} bloqueado={bloqueado} dossieId={diagId ?? undefined} />
        </div>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function StepIndicator({ etapa }: { etapa: Etapa }) {
  const steps: { id: Etapa; label: string }[] = [
    { id: "tipo", label: "Ambiente" },
    { id: "foto", label: "Foto" },
    { id: "questionario", label: "Anamnese" },
    { id: "processando", label: "Análise" },
    { id: "relatorio", label: "Relatório" },
  ];
  const idx = steps.findIndex((s) => s.id === etapa);
  return (
    <div className="mb-8 flex flex-wrap items-center gap-2 no-print">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${i <= idx ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}>{i + 1}</div>
          <span className={`text-xs ${i === idx ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
          {i < steps.length - 1 && <div className="mx-1 h-px w-6 bg-border" />}
        </div>
      ))}
    </div>
  );
}

function StepTipo({ onSelect }: { onSelect: (t: TipoAmbiente) => void }) {
  return (
    <div>
      <h1 className="font-display text-4xl">Qual ambiente vamos analisar?</h1>
      <p className="mt-2 text-muted-foreground">Cada tipo direciona a anamnese e a leitura elemental.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TIPOS_AMBIENTE.map((t) => (
          <Button key={t.id} onClick={() => onSelect(t.id)}
            className="group rounded-xl border border-border/70 bg-card/60 p-6 text-left transition hover:border-primary hover:bg-card">
            <div className="font-display text-2xl text-primary">{t.label}</div>
            <p className="mt-1 text-sm text-muted-foreground">{t.descricao}</p>
          </Button>
        ))}
      </div>
    </div>
  );
}

function StepFoto({ preview, uploading, onFile, onBack, onNext }: {
  preview: string | null; uploading: boolean;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void; onNext: () => void;
}) {
  return (
    <div>
      <h1 className="font-display text-4xl">Envie uma foto do ambiente</h1>
      <p className="mt-2 text-muted-foreground">Melhores resultados: foto ampla, luz natural, sem pessoas em primeiro plano. Opcional — você pode pular.</p>

      <div className="mt-8 rounded-xl border border-dashed border-border bg-card/40 p-6">
        {preview ? (
          <img src={preview} alt="Prévia" className="max-h-96 w-full rounded-lg object-contain" />
        ) : (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Nenhuma foto selecionada</div>
        )}
        <div className="mt-4">
          <label className="inline-flex cursor-pointer items-center rounded-md border border-primary/50 bg-primary/10 px-4 py-2 text-sm text-primary hover:bg-primary/20">
            {preview ? "Trocar foto" : "Selecionar foto"}
            <input type="file" accept="image/*" onChange={onFile} className="hidden" disabled={uploading} />
          </label>
          {uploading && <span className="ml-3 text-xs text-muted-foreground">Enviando...</span>}
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <Button onClick={onBack} className="rounded-md border border-border px-4 py-2 text-sm">Voltar</Button>
        <Button onClick={onNext} disabled={uploading} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
          Continuar
        </Button>
      </div>
    </div>
  );
}

function StepQuestionario({ tipo, respostas, setRespostas, documentoMarca, setDocumentoMarca, onBack, onSubmit }: {
  tipo: TipoAmbiente; respostas: RespostasMap;
  setRespostas: (r: RespostasMap) => void;
  documentoMarca: DocumentoMarca | null;
  setDocumentoMarca: (documento: DocumentoMarca | null) => void;
  onBack: () => void; onSubmit: () => void;
}) {
  const perguntas = getPerguntas(tipo).filter((p) => perguntaVisivel(p, respostas));
  const faltando = perguntas.filter((p) => p.obrigatoria && !respostas[p.id]);

  function setVal(id: string, v: string | number | boolean | string[] | null) {
    setRespostas({ ...respostas, [id]: v });
  }

  const trilha = trilhaDe(tipo);

  async function handleDocumento(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Envie o brandbook em PDF.");
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("O brandbook pode ter no máximo 10MB.");
      e.target.value = "";
      return;
    }
    const dataUrl = await fileToBase64(file);
    setDocumentoMarca({
      nome: file.name,
      mimeType: "application/pdf",
      base64: dataUrl.replace(/^data:[^;]+;base64,/, ""),
    });
    toast.success("Brandbook incluído na análise.");
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-primary">{TRILHA_LABELS[trilha]}</p>
      <h1 className="font-display text-4xl">Anamnese Eco Holística</h1>
      <p className="mt-2 text-muted-foreground">
        {trilha === "empresarial"
          ? "Conte sobre a marca, o público, a equipe e o que a empresa já faz em sustentabilidade."
          : "Suas respostas orientam a leitura elemental e as recomendações."}
      </p>
      <p className="mt-3 max-w-3xl text-sm text-muted-foreground">{ORIENTACAO_ANAMNESE}</p>

      {trilha === "empresarial" && (
        <div className="mt-8 border-y border-primary/30 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl">Brandbook ou livro da marca</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Opcional. Envie um PDF para incorporar propósito, posicionamento, identidade visual e diretrizes da marca ao dossiê final.
              </p>
            </div>
            {documentoMarca ? (
              <div className="flex items-center gap-3">
                <div className="max-w-52 truncate text-sm text-primary" title={documentoMarca.nome}>{documentoMarca.nome}</div>
                <Button type="button" variant="outline" onClick={() => setDocumentoMarca(null)}>
                  Remover
                </Button>
              </div>
            ) : (
              <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-primary/50 bg-primary/10 px-4 py-2 text-sm text-primary hover:bg-primary/20">
                Selecionar PDF
                <input type="file" accept="application/pdf,.pdf" onChange={handleDocumento} className="hidden" />
              </label>
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">PDF de até 10MB. O arquivo é usado somente nesta análise e não fica armazenado.</p>
        </div>
      )}

      <div className="mt-8 space-y-6">
        {perguntas.map((p, idx) => (
          <div key={p.id}>
          {p.secao && p.secao !== perguntas[idx - 1]?.secao && (
            <h2 className="font-display mb-3 mt-4 text-2xl text-primary">{p.secao}</h2>
          )}
          <div className="rounded-lg border border-border/60 bg-card/50 p-5">
            <label className="text-sm">
              {p.label}{p.obrigatoria && <span className="text-primary"> *</span>}
            </label>
            {(p.ajuda || p.tipo === "checkbox") && (
              <p className="mt-1 text-xs text-muted-foreground">{p.ajuda ?? "Você pode marcar mais de uma opção."}</p>
            )}
            <div className="mt-3">
              {p.tipo === "escala" && (
                <div className="space-y-3">
                  {p.itens?.map((item) => {
                    const key = `${p.id}::${item}`;
                    return (
                      <div key={item} className="flex flex-col gap-2 border-b border-border/40 pb-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-sm text-foreground">{item}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {p.opcoes?.map((op) => {
                            const active = respostas[key] === op;
                            const curto = op.split(" — ")[0];
                            return (
                              <Button key={op} type="button" title={op} aria-label={`${item}: ${op}`} onClick={() => setVal(key, op)}
                                className={`min-w-9 rounded-full border px-3 py-1 text-xs ${active ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:border-primary/60"}`}>
                                {curto === "Não sei avaliar" ? "Não sei" : curto}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs text-muted-foreground">1 = muito insatisfatório · 3 = regular · 5 = muito satisfatório</p>
                </div>
              )}
              {p.tipo === "text" && (
                <input type="text" placeholder={p.placeholder}
                  value={(respostas[p.id] as string) ?? ""}
                  onChange={(e) => setVal(p.id, e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              )}
              {p.tipo === "textarea" && (
                <textarea placeholder={p.placeholder} rows={3}
                  value={(respostas[p.id] as string) ?? ""}
                  onChange={(e) => setVal(p.id, e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              )}
              {p.tipo === "radio" && (
                <div className="flex flex-wrap gap-2">
                  {p.opcoes?.map((op) => {
                    const active = respostas[p.id] === op;
                    return (
                      <Button key={op} type="button" onClick={() => setVal(p.id, op)}
                        className={`rounded-full border px-4 py-1.5 text-sm ${active ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:border-primary/60"}`}>
                        {op}
                      </Button>
                    );
                  })}
                </div>
              )}
              {p.tipo === "checkbox" && (
                <div className="flex flex-wrap gap-2">
                  {p.opcoes?.map((op) => {
                    const arr = (respostas[p.id] as string[]) ?? [];
                    const active = arr.includes(op);
                    return (
                      <Button key={op} type="button" onClick={() => {
                        if (active) return setVal(p.id, arr.filter((x) => x !== op));
                        if (p.max && arr.length >= p.max) return toast.info(`Selecione até ${p.max} opções.`);
                        setVal(p.id, [...arr, op]);
                      }}
                        className={`rounded-full border px-4 py-1.5 text-sm ${active ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:border-primary/60"}`}>
                        {op}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button onClick={onBack} className="rounded-md border border-border px-4 py-2 text-sm">Voltar</Button>
        <div className="flex items-center gap-3">
          {faltando.length > 0 && <span className="text-xs text-muted-foreground">{faltando.length} obrigatória(s) faltando</span>}
          <Button onClick={onSubmit} disabled={faltando.length > 0}
            className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
            Gerar dossiê
          </Button>
        </div>
      </div>
    </div>
  );
}

function StepProcessando() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="h-16 w-16 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <h2 className="font-display mt-8 text-3xl">Alinhando os cinco elementos...</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Estamos analisando seu ambiente através das 5 Dimensões Eco Holísticas e construindo seu plano personalizado.
        Isso pode levar até 60 segundos.
      </p>
    </div>
  );
}
