import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, MessageCircle, X } from "lucide-react";
import compactLogoAsset from "@/assets/arqeco-logo-branco.png.asset.json";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { categoryHome } from "@/lib/account";
import { WHATSAPP_LABEL, whatsappUrl } from "@/lib/site-content";

type NavItem = { label: string; to: string };

/** Menu principal separado por público (Fase 2 da reestruturação da jornada). */
export const mainNav: NavItem[] = [
  { label: "Para sua casa", to: "/casa" },
  { label: "Para seu negócio", to: "/negocio" },
  { label: "Para arquitetos e designers", to: "/profissionais" },
  { label: "Portfólio", to: "/portfolio" },
  { label: "Sobre", to: "/nossa-trajetoria" },
];

export function useAccountPath() {
  const [accountPath, setAccountPath] = useState<ReturnType<typeof categoryHome> | null>(null);
  useEffect(() => {
    let live = true;
    const refresh = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (live) setAccountPath(null);
        return;
      }
      const { data: p } = await supabase
        .from("profiles")
        .select("registration_category")
        .eq("user_id", data.session.user.id)
        .maybeSingle();
      if (live) setAccountPath(categoryHome(p?.registration_category));
    };
    void refresh();
    const { data } = supabase.auth.onAuthStateChange(() => setTimeout(() => void refresh(), 0));
    return () => {
      live = false;
      data.subscription.unsubscribe();
    };
  }, []);
  return accountPath;
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-forest-soft ${className}`}
    >
      <span className="h-px w-8 bg-current" />
      {children}
    </p>
  );
}

function Logo() {
  return (
    <Link
      to="/"
      aria-label="ARQECO — Arquitetura Ecológica, página inicial"
      className="flex shrink-0 items-center gap-3"
    >
      <span className="brand-mark grid size-11 place-items-center bg-primary">
        <img
          src={compactLogoAsset.url}
          alt=""
          width={500}
          height={500}
          className="size-10 object-contain"
        />
      </span>
      <span className="font-display text-2xl font-semibold text-primary">
        ARQECO
        <span className="mt-0.5 block font-sans text-[9px] font-medium">Arquitetura Ecológica</span>
      </span>
    </Link>
  );
}

export function SiteHeader({ quoteType }: { quoteType?: string | undefined }) {
  const [open, setOpen] = useState(false);
  const accountPath = useAccountPath();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 text-foreground backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5">
        <Logo />
        <nav
          aria-label="Menu principal"
          className="hidden items-center gap-6 text-xs font-medium xl:flex"
        >
          {mainNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="opacity-70 transition-opacity hover:opacity-100"
              activeProps={{ className: "!opacity-100 text-primary font-semibold" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 xl:flex">
          <Link
            to={accountPath ?? "/auth"}
            className="text-sm font-medium opacity-75 hover:opacity-100"
          >
            {accountPath ? "Meu painel" : "Entrar"}
          </Link>
          <Button asChild variant="editorial">
            <Link to="/orcamento" search={quoteType ? { tipo: quoteType } : {}}>
              Pedir orçamento
            </Link>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="xl:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open && (
        <nav
          aria-label="Menu principal"
          className="space-y-1 border-t border-border px-5 py-4 xl:hidden"
        >
          {mainNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-base"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to={accountPath ?? "/auth"}
            onClick={() => setOpen(false)}
            className="block py-2.5 text-base font-semibold"
          >
            {accountPath ? "Meu painel" : "Entrar"}
          </Link>
          <Button asChild variant="editorial" className="mt-2 w-full">
            <Link
              to="/orcamento"
              search={quoteType ? { tipo: quoteType } : {}}
              onClick={() => setOpen(false)}
            >
              Pedir orçamento
            </Link>
          </Button>
        </nav>
      )}
    </header>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">{title}</p>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map(([l, h]) => (
          <li key={l}>
            <a href={h} className="opacity-85 hover:opacity-100">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-sidebar pb-20 text-sidebar-foreground md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <img
            src={compactLogoAsset.url}
            alt="ARQECO"
            width={500}
            height={500}
            className="h-14 w-auto object-contain"
          />
          <p className="mt-3 max-w-xs text-xs opacity-70">
            Arquitetura ecológica, projetos e escolhas conscientes. Mais de 1.200 projetos
            entregues.
          </p>
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"
          >
            <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp {WHATSAPP_LABEL}
          </a>
        </div>
        <FooterCol
          title="Para sua casa"
          links={[
            ["Planos de interiores", "/casa#planos"],
            ["Construir ou reformar", "/orcamento?tipo=casa_construir"],
            ["Dossiê gratuito", "/diagnostico"],
            ["Meus projetos", "/painel"],
          ]}
        />
        <FooterCol
          title="Para seu negócio"
          links={[
            ["Well Spaces Business", "/negocio"],
            ["Pedir orçamento", "/orcamento?tipo=comercial"],
            ["Portfólio", "/portfolio"],
          ]}
        />
        <FooterCol
          title="Profissionais e parceiros"
          links={[
            ["Arquitetos e designers", "/profissionais"],
            ["Programa de indicação", "/profissionais#indicacao"],
            ["Curadoria e Índice", "/curadoria"],
            ["Fornecedores e creators", "/parceiros"],
          ]}
        />
        <FooterCol
          title="Legal"
          links={[
            ["Termos de uso", "/termos"],
            ["Política de Privacidade (LGPD)", "/privacidade"],
            ["Cookies", "/cookies"],
            ["Fale com o encarregado", "mailto:contato.arquiteturaecologica@gmail.com"],
          ]}
        />
      </div>
    </footer>
  );
}

/** WhatsApp sempre à mão: botão flutuante no desktop e barra fixa no celular. */
export function ConversionBar({
  quoteType,
  message,
}: {
  quoteType?: string | undefined;
  message?: string | undefined;
}) {
  const wa = whatsappUrl(
    message ?? "Olá! Vim pelo site da ARQECO e quero saber mais sobre um projeto.",
  );
  return (
    <>
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Fale conosco pelo WhatsApp ${WHATSAPP_LABEL}`}
        className="fixed bottom-6 right-6 z-40 hidden size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-editorial transition-transform hover:scale-105 md:grid"
      >
        <MessageCircle className="size-7" aria-hidden="true" />
      </a>
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-border bg-background/95 p-3 backdrop-blur-xl md:hidden">
        <Button asChild variant="paper" className="h-11">
          <a href={wa} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="text-[#1DA851]" /> WhatsApp
          </a>
        </Button>
        <Button asChild variant="editorial" className="h-11">
          <Link to="/orcamento" search={quoteType ? { tipo: quoteType } : {}}>
            Pedir orçamento
          </Link>
        </Button>
      </div>
    </>
  );
}

/** Moldura pública: cabeçalho por público, conteúdo, rodapé e CTA fixo. */
export function SiteLayout({
  children,
  quoteType,
  whatsappMessage,
}: {
  children: ReactNode;
  quoteType?: string;
  whatsappMessage?: string;
}) {
  return (
    <div className="arqeco-home bg-background text-foreground">
      <SiteHeader quoteType={quoteType} />
      <main>{children}</main>
      <SiteFooter />
      <ConversionBar quoteType={quoteType} message={whatsappMessage} />
    </div>
  );
}
