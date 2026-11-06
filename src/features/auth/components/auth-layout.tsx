import Image from "next/image";
import type { ReactNode } from "react";
import { LanguageSwitch } from "@/shared/ui/language-switch";

const WIDTHS = { sm: "max-w-[400px]", md: "max-w-[440px]", lg: "max-w-[480px]" } as const;

interface AuthLayoutProps {
  /** Panneau vert (AuthPanel) : à gauche sur bureau, en bandeau au-dessus sur téléphone. */
  panel: ReactNode;
  width?: keyof typeof WIDTHS;
  /** Colonnes égales (inscription) au lieu de 1,08 / 1 (maquettes). */
  evenColumns?: boolean;
  /** Action en haut du volet (ex. « Passer » de l'onboarding). */
  topAction?: ReactNode;
  children: ReactNode;
}

/** Mise en page commune des écrans d'authentification (maquettes du lot 1, rupture à 900 px). */
export function AuthLayout({
  panel,
  width = "md",
  evenColumns = false,
  topAction,
  children,
}: AuthLayoutProps) {
  return (
    <div
      className={`grid min-h-dvh grid-cols-1 grid-rows-[auto_1fr] bg-white min-[900px]:grid-rows-1 ${
        evenColumns
          ? "min-[900px]:grid-cols-2"
          : "min-[900px]:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]"
      }`}
    >
      <div className="flex min-w-0">{panel}</div>
      <main className="relative flex min-w-0 flex-col items-center px-6 pb-7 min-[900px]:py-10">
        {topAction && (
          <div className="absolute top-3 right-4 z-10 min-[900px]:top-5 min-[900px]:right-6">
            {topAction}
          </div>
        )}
        <div className={`flex w-full flex-col gap-[18px] min-[900px]:my-auto ${WIDTHS[width]}`}>
          <Image
            src="/icons/mark.png"
            alt="Atlight"
            width={76}
            height={76}
            priority
            className="animate-pop shadow-mark relative z-[2] size-[76px] self-center rounded-[18px] max-[899px]:-mt-9 max-[899px]:size-[72px] max-[899px]:rounded-[20px] max-[899px]:border-[3px] max-[899px]:border-white"
          />
          {children}
          <LanguageSwitch />
        </div>
      </main>
    </div>
  );
}
