"use client";

import { useTranslations } from "next-intl";
import { SvgIcon } from "@/shared/ui/svg-icon";

interface StepProgressProps {
  total: number;
  current: number;
  /** Libellés sous les barres (inscription : Rôle, Identité, Compte, Code). */
  labels?: string[];
  ariaLabel: string;
  /** Une étape terminée est cliquable quand ce callback est fourni et l'autorise. */
  onStepClick?: (step: number) => void;
}

/**
 * Indicateur d'étape : « Étape 2 sur 4 », une barre par étape, remplie jusqu'à l'étape en cours.
 * L'étape en cours porte aria-current="step" ; le lecteur d'écran entend « Étape 2 sur 4 : Identité ».
 */
export function StepProgress({
  total,
  current,
  labels,
  ariaLabel,
  onStepClick,
}: StepProgressProps) {
  const t = useTranslations();
  const currentLabel = labels?.[current - 1];

  return (
    <nav aria-label={ariaLabel} className="flex flex-col gap-[9px]">
      <p className="text-grey-700 m-0 text-sm font-medium">
        <span aria-hidden={currentLabel ? true : undefined}>{t("stepOf", { current, total })}</span>
        {currentLabel && (
          <span className="sr-only">
            {t("stepOfLabel", { current, total, label: currentLabel })}
          </span>
        )}
      </p>
      <ol
        className="m-0 grid list-none gap-1.5 p-0"
        style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: total }, (_, i) => {
          const step = i + 1;
          const state = step < current ? "done" : step === current ? "current" : "todo";
          const label = labels?.[i];
          const content = (
            <>
              <span className="bg-grey-200 block h-1.5 overflow-hidden rounded-[3px]">
                <span
                  className="bg-primary block h-full rounded-[3px] transition-[width] duration-300 ease-out"
                  style={{ width: state === "todo" ? "0%" : "100%" }}
                />
              </span>
              {label && (
                <span
                  data-state={state}
                  className="text-grey-600 data-[state=current]:text-grey-900 data-[state=done]:text-primary-strong mt-1.5 flex items-center gap-1 text-xs font-medium data-[state=current]:font-bold"
                >
                  {state === "done" && <SvgIcon name="check" size={14} />}
                  <span className="truncate">{label}</span>
                </span>
              )}
            </>
          );
          return (
            <li
              key={step}
              aria-current={state === "current" ? "step" : undefined}
              className="min-w-0"
            >
              {state === "done" && onStepClick ? (
                <button
                  type="button"
                  onClick={() => onStepClick(step)}
                  aria-label={label ? t("stepOfLabel", { current: step, total, label }) : undefined}
                  className="block w-full rounded py-1 text-left"
                >
                  {content}
                </button>
              ) : (
                <span className="block py-1" aria-hidden={label ? undefined : true}>
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
