"use client";

import { useTranslations } from "next-intl";
import { useId } from "react";

/** Cadre « Open to tryouts » autour d'un avatar (PROF-05), comme sur le mobile. */
export function OpenToTryoutsRing() {
  const t = useTranslations();
  const arcId = useId();
  return (
    <svg
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
      aria-hidden
    >
      <circle cx="50" cy="50" r="42.5" fill="none" stroke="var(--color-primary)" strokeWidth="15" />
      <defs>
        <path id={arcId} d="M3.8 50A46.2 46.2 0 0 0 96.2 50" />
      </defs>
      <text fontSize="9.6" fontWeight="700" fill="#fff" letterSpacing=".55">
        <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
          {t("openToTryoutsRing")}
        </textPath>
      </text>
    </svg>
  );
}
