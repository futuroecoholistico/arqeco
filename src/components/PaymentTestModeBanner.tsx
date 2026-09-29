const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return <div className="w-full border-b border-destructive/40 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">O pagamento real ainda não foi ativado. Conclua a ativação na aba de pagamentos.</div>;
  }
  if (clientToken.startsWith("pk_test_")) {
    return <div className="w-full border-b border-accent/40 bg-accent/15 px-4 py-2 text-center text-sm text-foreground">Pagamentos feitos na pré-visualização estão em modo de teste.</div>;
  }
  return null;
}
