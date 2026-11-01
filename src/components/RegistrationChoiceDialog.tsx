import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { REGISTRATION_OPTIONS, SUPPLIER_OPTION } from "@/lib/registration-options";

export function RegistrationChoiceDialog({
  label,
  variant = "paper",
  size = "lg",
  className,
}: {
  label: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="register-panel w-[calc(100vw-2rem)] max-w-lg border sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-sidebar-foreground">
            Como você quer se cadastrar?
          </DialogTitle>
          <DialogDescription className="text-sidebar-foreground/70">
            Escolha o perfil que combina com você. O cadastro é o mesmo para toda a plataforma.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {REGISTRATION_OPTIONS.map((option) => (
            <Button
              asChild
              key={option.perfil}
              variant="paper"
              className="h-auto whitespace-normal items-center justify-between gap-4 border-sidebar-foreground/35 py-4 text-left text-sidebar-foreground hover:border-accent hover:text-accent"
            >
              <Link to="/auth" search={{ perfil: option.perfil }}>
                <span>
                  <span className="block text-sm font-semibold">{option.label}</span>
                  <span className="mt-1 block text-xs font-normal leading-relaxed opacity-70">
                    {option.description}
                  </span>
                </span>
                <ArrowRight className="shrink-0" />
              </Link>
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-1 text-xs">
          <Link to="/auth" search={{ modo: "entrar" }} className="font-semibold underline underline-offset-4">
            Já tenho conta · Entrar
          </Link>
          <Link to="/auth" search={{ perfil: SUPPLIER_OPTION.perfil }} className="opacity-70 underline underline-offset-4">
            Sou {SUPPLIER_OPTION.label.toLowerCase()}
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
