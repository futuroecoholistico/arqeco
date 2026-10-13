import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const KEY = "arqeco-cookie-ok";

export function CookieNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(!localStorage.getItem(KEY)); }, []);
  if (!show) return null;
  return (
    <div role="dialog" aria-label="Aviso de cookies" className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-2xl flex-col gap-3 rounded-md border border-border bg-card p-4 text-sm text-card-foreground shadow-lg sm:flex-row sm:items-center">
      <p className="flex-1">Usamos apenas cookies essenciais para login e pagamento. Veja a <Link to="/cookies" className="text-primary underline">Política de Cookies</Link>.</p>
      <Button variant="editorial" size="sm" onClick={() => { localStorage.setItem(KEY, new Date().toISOString()); setShow(false); }}>Entendi</Button>
    </div>
  );
}
