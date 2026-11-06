"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, type ComponentPropsWithRef, type ReactNode, type Ref } from "react";
import { SvgIcon, type SvgIconName } from "@/shared/ui/svg-icon";
import { PASSWORD_RULES, type PasswordChecks } from "../rules";

/*
 * Contrôles des écrans d'authentification, aux valeurs des maquettes du lot 1
 * (champs 50 px, rayon 10 px, anneau de focus vert, erreurs en #C62828).
 */

export const inputClass =
  "h-[50px] w-full min-w-0 rounded-field border border-grey-400 bg-white px-3.5 text-base text-grey-900 outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-grey-600 hover:border-grey-500 focus:border-primary focus:shadow-field-focus focus-visible:outline-none aria-[invalid=true]:border-danger aria-[invalid=true]:focus:shadow-field-error";

export const linkClass =
  "font-medium text-primary-strong underline-offset-2 hover:text-primary-dark hover:underline";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string | null;
  errorId?: string;
  /** Aide ou état affiché sous le champ quand il n'y a pas d'erreur. */
  hint?: ReactNode;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, errorId, hint, children }: FieldProps) {
  return (
    <div className="flex min-w-0 flex-col gap-[7px]">
      <label htmlFor={htmlFor} className="text-grey-700 text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? <FieldError id={errorId} message={error} /> : hint}
    </div>
  );
}

export function FieldError({ id, message }: { id?: string; message: ReactNode }) {
  return (
    <p
      id={id}
      role="alert"
      className="animate-rise-fast text-danger m-0 flex items-start gap-[5px] text-[13px] leading-[1.35]"
    >
      <SvgIcon name="error" size={16} className="mt-px" />
      <span>{message}</span>
    </p>
  );
}

type InputProps = ComponentPropsWithRef<"input"> & { invalid?: boolean };

export function TextInput({ invalid, className = "", ...rest }: InputProps) {
  return (
    <input aria-invalid={invalid || undefined} className={`${inputClass} ${className}`} {...rest} />
  );
}

/** Champ mot de passe avec bouton Afficher / Masquer. */
export function PasswordInput({ invalid, className = "", ...rest }: Omit<InputProps, "type">) {
  const t = useTranslations();
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative flex">
      <input
        type={visible ? "text" : "password"}
        aria-invalid={invalid || undefined}
        className={`${inputClass} pr-[52px] ${className}`}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={t(visible ? "hidePassword" : "showPassword")}
        className="text-grey-700 hover:bg-grey-100 absolute top-[3px] right-[3px] flex size-11 items-center justify-center rounded-lg transition-colors"
      >
        <SvgIcon name={visible ? "visibility_off" : "visibility"} size={20} />
      </button>
    </div>
  );
}

export function Spinner({ className = "border-white/40 border-t-white" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`size-[18px] flex-none animate-spin rounded-full border-2 ${className}`}
    />
  );
}

interface PrimaryButtonProps extends ComponentPropsWithRef<"button"> {
  busy?: boolean;
  /**
   * Bouton grisé tant que l'étape n'est pas valide (cahier 4.1.1), mais toujours focalisable :
   * un clic affiche les erreurs au lieu de ne rien faire.
   */
  inactive?: boolean;
}

export function PrimaryButton({
  busy = false,
  inactive = false,
  className = "",
  children,
  type = "submit",
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      aria-disabled={(inactive && !busy) || undefined}
      aria-busy={busy || undefined}
      // Pas de flex-1 : dans un formulaire en colonne, il annulerait la hauteur de 54 px.
      // À côté du bouton Retour, w-full (qui peut rétrécir) occupe la place restante.
      className={`bg-primary shadow-button hover:bg-primary-hover hover:shadow-button-hover aria-disabled:bg-grey-300 aria-disabled:text-grey-700 flex h-[54px] w-full min-w-0 items-center justify-center gap-2 rounded-xl px-4 text-[19px] font-bold text-white transition-[background-color,box-shadow,transform] duration-150 active:scale-[.985] aria-busy:pointer-events-none aria-disabled:shadow-none ${className}`}
      {...rest}
    >
      {busy && <Spinner />}
      {children}
    </button>
  );
}

export function OutlineLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="border-primary-strong text-primary-strong hover:bg-third hover:text-primary-dark flex h-[50px] items-center justify-center rounded-xl border-[1.5px] text-base font-bold transition-[background-color,transform] duration-150 active:scale-[.985]"
    >
      {children}
    </Link>
  );
}

/** Bouton « Retour » des étapes 2 et 3 (icône seule, libellé pour les lecteurs d'écran). */
export function BackButton({ onClick }: { onClick: () => void }) {
  const t = useTranslations();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t("back")}
      title={t("back")}
      className="border-grey-400 text-grey-800 hover:bg-grey-100 flex size-[54px] flex-none items-center justify-center rounded-xl border bg-white transition-[background-color,transform] duration-150 active:scale-[.97]"
    >
      <SvgIcon name="arrow_back" size={20} />
    </button>
  );
}

const ALERT_TONES: Record<"error" | "warn" | "success", { box: string; icon: SvgIconName }> = {
  error: { box: "bg-danger-bg text-danger-ink", icon: "error" },
  warn: { box: "bg-warn-bg text-warn-ink", icon: "error" },
  success: { box: "bg-code-bg text-primary-dark", icon: "mail" },
};

export function FormAlert({
  tone,
  title,
  children,
}: {
  tone: keyof typeof ALERT_TONES;
  title?: ReactNode;
  children?: ReactNode;
}) {
  const { box, icon } = ALERT_TONES[tone];
  return (
    <div
      role={tone === "success" ? "status" : "alert"}
      className={`animate-rise-fast flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-sm leading-[1.42] ${box}`}
    >
      <SvgIcon name={icon} size={20} />
      <span>
        {title && <strong className="block">{title}</strong>}
        {children}
      </span>
    </div>
  );
}

/** Règles du mot de passe, cochées au fil de la saisie (PasswordDoubleField du mobile). */
export function PasswordRules({ checks }: { checks: PasswordChecks }) {
  const t = useTranslations();
  return (
    <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(190px,100%),1fr))] gap-x-3 gap-y-1.5 p-0 text-[13px] leading-[1.35]">
      {PASSWORD_RULES.map(({ key, label }) => (
        <li
          key={key}
          data-ok={checks[key]}
          className="text-grey-700 data-[ok=true]:text-primary-strong flex items-center gap-[5px] data-[ok=true]:font-medium"
        >
          <SvgIcon name={checks[key] ? "check_circle" : "radio_unchecked"} size={16} />
          {t(label)}
        </li>
      ))}
    </ul>
  );
}

/** Titre d'un volet : reçoit le focus à chaque changement d'étape (cahier 4.1.1, clavier). */
export function StepHeading({
  title,
  lead,
  titleRef,
}: {
  title: string;
  lead?: ReactNode;
  titleRef?: Ref<HTMLHeadingElement>;
}) {
  return (
    <div className="flex flex-col gap-[7px]">
      <h1
        ref={titleRef}
        tabIndex={-1}
        className="m-0 text-[27px] leading-[1.12] font-bold tracking-[-0.01em] outline-none min-[900px]:text-[32px]"
      >
        {title}
      </h1>
      {lead && <p className="text-grey-700 m-0 text-base leading-normal">{lead}</p>}
    </div>
  );
}
