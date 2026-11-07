"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useAppStore } from "@/stores/app";
import { SvgIcon } from "./svg-icon";

/** Carte blanche des blocs de l'accueil (maquette Accueil2). */
export const cardClass =
  "rounded-none border-y border-grey-200 bg-white shadow-[0_1px_3px_rgb(16_24_20/0.05)] tablet:rounded-2xl tablet:border";

/** Action d'un lot suivant : message « Bientôt disponible sur le web. » */
export function useComingSoon() {
  const t = useTranslations();
  const showToast = useAppStore((s) => s.showToast);
  return () => showToast(t("comingSoonWeb"));
}

/** « Voir tout → » / « Voir plus → » en tête ou en pied de bloc. */
export function ArrowLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-primary-strong hover:text-primary-dark inline-flex min-h-9 flex-none items-center gap-1 text-[13px] font-bold hover:underline"
    >
      {children}
      <SvgIcon name="arrow_forward" size={18} />
    </button>
  );
}

/** Erreur réseau d'un bloc : message et nouvel essai, jamais un bloc vide (section 6). */
export function SectionError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const t = useTranslations();
  return (
    <div
      role="alert"
      className="text-grey-700 flex flex-wrap items-center justify-between gap-3 text-[13px]"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="text-primary-strong hover:bg-third min-h-10 rounded-full px-4 font-bold"
      >
        {t("retry")}
      </button>
    </div>
  );
}

/** Bloc de chargement (squelette). */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`bg-grey-200 animate-pulse rounded-lg ${className}`} />;
}
