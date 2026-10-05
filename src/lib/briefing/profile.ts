import type { BriefingAnswers } from "./config";

export type VisualOption = { id: string; kind: string; name: string; description: string | null; image_url: string | null; tags: string[]; colors: string[] };

const ADJ: Record<string, string> = {
  Minimalista: "Minimalismo", Contemporâneo: "Contemporâneo", Escandinavo: "Escandinavo", "Boho Chic": "Boho",
  Provençal: "Provençal", Clean: "Clean", Moderno: "Moderno", Rústico: "Rústico", Industrial: "Industrial",
  Neoclássico: "Neoclássico", Ecológico: "Ecológico", Sustentável: "Sustentável",
};

const NATURAL_HINTS = ["madeira", "pedra", "natural", "fibras", "palha", "linho", "terrosos", "verdes", "natureza", "cerâmica"];

/** Combines chosen styles + material/palette tags into a readable aesthetic profile name. Not a verdict. */
export function aestheticProfile(a: BriefingAnswers, options: VisualOption[]): string | null {
  const byId = new Map(options.map((o) => [o.id, o]));
  const styles = (a.styles ?? []).map((id) => byId.get(id)?.name).filter(Boolean) as string[];
  if (!styles.length) return null;
  const tags = [...(a.materials ?? []), ...(a.palettes ?? []), ...(a.moodboards ?? [])].flatMap((id) => byId.get(id)?.tags ?? []).join(" ").toLowerCase();
  const natural = NATURAL_HINTS.some((h) => tags.includes(h)) || (a.feelYes ?? []).includes("Conectado à natureza");
  const sensorial = (a.feelYes ?? []).includes("Sensorial") || tags.includes("artesanal") || tags.includes("textur");
  const [first, second] = styles.map((s) => ADJ[s] ?? s);
  const parts = [first];
  if (natural && !/Rústico|Ecológico/.test(first ?? "")) parts.push("Natural");
  if (second && second !== first) parts.push(second);
  if (sensorial && parts.length < 3) parts.push("Sensorial");
  return parts.join(" ");
}

export type ProjectDNA = { rooms: string[]; feel: string[]; colors: string[]; materials: string[]; priorities: string[]; budget: string | null; styles: string[] };

export function projectDNA(a: BriefingAnswers, options: VisualOption[]): ProjectDNA {
  const name = (id: string) => options.find((o) => o.id === id)?.name ?? "";
  return {
    rooms: (a.rooms ?? []).map((r) => r.name),
    feel: (a.feelYes ?? []).slice(0, 3),
    colors: (a.palettes ?? []).map(name).filter(Boolean),
    materials: (a.materials ?? []).map(name).filter(Boolean).slice(0, 4),
    priorities: (a.priorities ?? []).slice(0, 3),
    budget: a.budget ?? null,
    styles: (a.styles ?? []).map(name).filter(Boolean),
  };
}
