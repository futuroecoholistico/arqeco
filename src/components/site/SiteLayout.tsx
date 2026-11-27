import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, MessageCircle, X } from "lucide-react";
import compactLogoAsset from "@/assets/arqeco-logo-branco.png.asset.json";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { categoryHome } from "@/lib/account";

export const WHATSAPP_URL = `https://wa.me/5511964710505?text=${encodeURIComponent("Olá! Vim pelo site da ARQECO e gostaria de falar sobre um projeto.")}`;

const nav: [string, string][] = [
  ["Para sua casa", "/casa"],
  ["Para seu negócio", "/negocio"],
  ["Para arquitetos e designers", "/profissionais"],
  ["Portfólio", "/portfolio"],
  ["Sobre", "/nossa-trajetoria"],
];

export function useAccountPath() {
  const [accountPath, setAccountPath] = useState<ReturnType<typeof categoryHome> | null>(null);
  useEffect(() => {
    let live = true;
    const refresh = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { if (live) setAccountPath(null); return; }
      const { data: p } = await supabase.from("profiles").select("registration_category").eq("user_id", data.session.user.id).maybeSingle();
      if (live) setAccountPath(categoryHome(p?.registration_category));
    };
    void refresh();
    const { data } = supabase.auth.onAuthStateChange(() => setTimeout(() => void refresh(), 0));
    return () => { live = false; data.subscription.unsubscribe(); };
  }, []);
  return accountPath;
}

function SiteHeader() {
  const [open, setOpen] = useState(false);
  const accountPath = useAccountPath();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 text-foreground backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5">
        <Link to="/" aria-label="ARQECO — Arquitetura Ecológica" className="flex shrink-0 items-center gap-3">
          <span className="brand-mark grid size-11 place-items-center bg-primary"><img src={compactLogoAsset.url} alt="" width={500} height={500} className="size-10 object-contain" /></span>
          <span className="font-display text-2xl font-semibold text-primary">ARQECO<span className="mt-0.5 block font-sans text-[9px] font-medium">Arquitetura Ecológica</span></span>
        </Link>
        <nav aria-label="Principal" className="hidden gap-6 text-xs font-medium xl:flex">
          {nav.map(([l, h]) => <a key={h} href={h} className="opacity-70 transition-opacity hover:opacity-100">{l}</a>)}
        </nav>
        <div className="hidden items-center gap-4 xl:flex">
          <Link to={accountPath ?? "/auth"} className="text-sm font-medium opacity-75 hover:opacity-100">{accountPath ? "Meu painel" : "Entrar"}</Link>
          <Button asChild variant="editorial"><a href="/orcamento">Pedir orçamento</a></Button>
        </div>
        <Button variant="ghost" size="icon" className="xl:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
      </div>
      {open && (
        <div className="space-y-1 border-t border-border px-5 py-4 xl:hidden">
          {nav.map(([l, h]) => <a key={h} href={h} onClick={() => setOpen(false)} className="block py-2 text-sm">{l}</a>)}
          <Link to={accountPath ?? "/auth"} className="block py-2 text-sm font-semibold">{accountPath ? "Meu painel" : "Entrar"}</Link>
          <Button asChild variant="editorial" className="mt-2 w-full"><a href="/orcamento">Pedir orçamento</a></Button>
        </div>
      )}
    </header>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">{title}</p>
      <ul className="mt-3 space-y-2 text-sm">{links.map(([l, h]) => <li key={l}><a href={h} className="opacity-85 hover:opacity-100">{l}</a></li>)}</ul>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-sidebar pb-20 text-sidebar-foreground md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div><img src={compactLogoAsset.url} alt="ARQECO" width={500} height={500} className="h-14 w-auto object-contain" /><p className="mt-3 text-xs opacity-70">Arquitetura ecológica, projetos e escolhas conscientes.</p></div>
        <FooterCol title="Para sua casa" links={[["Planos de interiores", "/casa"], ["Construir ou reformar", "/construir"], ["Dossiê gratuito", "/diagnostico"], ["Meus projetos", "/painel"]]} />
        <FooterCol title="Para seu negócio" links={[["Well Spaces Business", "/negocio"], ["Pedir orçamento", "/orcamento"], ["Portfólio", "/portfolio"]]} />
        <FooterCol title="Profissionais e parceiros" links={[["Arquitetos e designers", "/profissionais"], ["Programa de indicação", "/afiliado"], ["Curadoria e Índice", "/curadoria"], ["Fornecedores e creators", "/parceiros"]]} />
        <FooterCol title="Legal" links={[["Termos de uso", "/termos"], ["Política de Privacidade (LGPD)", "/privacidade"], ["Cookies", "/cookies"], ["Fale com o encarregado", "mailto:contato.arquiteturaecologica@gmail.com"]]} />
      </div>
    </footer>
  );
}

function StickyContact() {
  return (
    <>
      <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="Fale conosco pelo WhatsApp: (11) 96471-0505" className="fixed bottom-6 right-6 z-40 hidden size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-editorial transition-transform hover:scale-105 md:grid">
        <MessageCircle className="size-7" />
      </a>
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-border bg-background/95 p-3 backdrop-blur-xl md:hidden">
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#25D366] text-sm font-semibold text-white"><MessageCircle className="size-4" /> WhatsApp</a>
        <Button asChild variant="editorial" className="h-11"><a href="/orcamento">Pedir orçamento</a></Button>
      </div>
    </>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="arqeco-home bg-background text-foreground">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <StickyContact />
    </div>
  );
}
