export const CATEGORIES = [
  { id: "client", label: "Cliente", path: "/painel" },
  { id: "professional", label: "Arquiteto / designer", path: "/profissional" },
  { id: "supplier", label: "Fornecedor", path: "/fornecedor" },
  { id: "affiliate", label: "Afiliado / creator", path: "/afiliado" },
] as const;
export type Category = (typeof CATEGORIES)[number]["id"];
export function categoryHome(category: string | null | undefined) {
  return CATEGORIES.find((c) => c.id === category)?.path ?? "/minha-conta";
}
export function safeDestination(next?: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return null;
  return next;
}