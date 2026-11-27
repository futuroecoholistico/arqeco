export type AuthPerfil = "cliente" | "profissional" | "afiliado" | "fornecedor";
export type RegistrationOption = {
  perfil: AuthPerfil;
  category: "client" | "professional" | "affiliate" | "supplier";
  label: string;
  description: string;
};

export const REGISTRATION_OPTIONS: RegistrationOption[] = [
  {
    perfil: "cliente",
    category: "client",
    label: "Usuário da plataforma",
    description: "Contratar um projeto de interiores, criar Dossiês Eco-Holísticos e acompanhar tudo no seu painel.",
  },
  {
    perfil: "profissional",
    category: "professional",
    label: "Profissional de arquitetura ou design",
    description: "Seja um profissional ArqecoPro",
  },
  {
    perfil: "afiliado",
    category: "affiliate",
    label: "Creator / afiliado",
    description: "Divulgar a ARQECO com link próprio e acumular ecos e comissões por indicação.",
  },
];

export const SUPPLIER_OPTION: RegistrationOption = {
  perfil: "fornecedor",
  category: "supplier",
  label: "Fornecedor / marca",
  description: "Colocar seus produtos na Curadoria ArqEco e vender pela rede de afiliados.",
};
