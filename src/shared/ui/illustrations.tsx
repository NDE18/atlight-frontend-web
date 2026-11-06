"use client";

import { useId } from "react";

/*
 * Illustrations vectorielles de l'accueil (maquette Accueil2), à la place des photos de la maquette :
 * légères, nettes à toutes les densités d'écran, et remplaçables plus tard par de vraies images.
 * Décoratives : aria-hidden.
 */

/** Identifiant unique utilisable dans url(#…) : useId produit des caractères spéciaux. */
function useSvgId() {
  return `art${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
}

interface ArtProps {
  className?: string;
}

/** Bannière « Bonjour » : stade de nuit, projecteurs, joueur de dos avec le numéro 10. */
export function HeroArt({ className = "" }: ArtProps) {
  const id = useSvgId();
  return (
    <svg
      viewBox="0 0 600 150"
      preserveAspectRatio="xMaxYMid slice"
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0B2E25" />
          <stop offset=".65" stopColor="#0F4A39" />
          <stop offset="1" stopColor="#146B51" />
        </linearGradient>
        <radialGradient id={`${id}glow`}>
          <stop offset="0" stopColor="#FFFFFF" stopOpacity=".95" />
          <stop offset=".22" stopColor="#E9FFF6" stopOpacity=".55" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <pattern id={`${id}crowd`} width="9" height="7" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" fill="#9FD8C2" opacity=".35" />
          <circle cx="6.5" cy="5" r="1.2" fill="#FFFFFF" opacity=".2" />
        </pattern>
        <linearGradient id={`${id}pitch`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1C8B5E" />
          <stop offset="1" stopColor="#0E6B47" />
        </linearGradient>
        <linearGradient id={`${id}jersey`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14AD7A" />
          <stop offset="1" stopColor="#0A7D57" />
        </linearGradient>
        <linearGradient id={`${id}fade`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset=".34" stopColor="#FFFFFF" stopOpacity=".9" />
          <stop offset=".6" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="600" height="150" fill={`url(#${id}sky)`} />
      <path d="M0 62Q300 40 600 62V114H0Z" fill="#0A3A2D" />
      <path d="M0 62Q300 40 600 62V114H0Z" fill={`url(#${id}crowd)`} />
      <circle cx="330" cy="16" r="48" fill={`url(#${id}glow)`} />
      <circle cx="470" cy="10" r="58" fill={`url(#${id}glow)`} />
      <circle cx="588" cy="22" r="42" fill={`url(#${id}glow)`} />
      <g fill="#FFFFFF" opacity=".9">
        <rect x="318" y="12" width="24" height="5" rx="1" />
        <rect x="456" y="6" width="28" height="5" rx="1" />
        <rect x="578" y="18" width="20" height="5" rx="1" />
      </g>
      <path d="M0 114H600V150H0Z" fill={`url(#${id}pitch)`} />
      <g stroke="#FFFFFF" strokeOpacity=".22" strokeWidth="2">
        <path d="M140 114 90 150M300 114V150M460 114 510 150M0 128H600" />
      </g>
      <g>
        <path d="M418 92 405 126 418 131 431 104Z" fill="#3A2418" />
        <path d="M522 92 535 126 522 131 509 104Z" fill="#3A2418" />
        <path
          d="M418 88 446 72H494L522 88 512 114 500 108V150H440V108L428 114Z"
          fill={`url(#${id}jersey)`}
        />
        <path d="M455 72Q470 82 485 72" fill="none" stroke="#FFFFFF" strokeWidth="3" />
        <rect x="463" y="60" width="14" height="13" rx="4" fill="#2E1C12" />
        <circle cx="470" cy="50" r="15" fill="#3A2418" />
        <path d="M455 47a15 15 0 0 1 30 0q-15-9-30 0Z" fill="#1E120B" />
        <text
          x="470"
          y="141"
          textAnchor="middle"
          fontSize="42"
          fontWeight="800"
          fontFamily="inherit"
          fill="#FFFFFF"
        >
          10
        </text>
      </g>
      <rect width="600" height="150" fill={`url(#${id}fade)`} />
    </svg>
  );
}

/** Fond de l'offre recommandée : terrain de jour, tribunes et ballon. */
export function OfferArt({ className = "" }: ArtProps) {
  const id = useSvgId();
  return (
    <svg
      viewBox="0 0 300 210"
      preserveAspectRatio="xMaxYMid slice"
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DFF4EC" />
          <stop offset="1" stopColor="#B7E3D0" />
        </linearGradient>
        <pattern id={`${id}crowd`} width="8" height="6" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.3" fill="#2F7D5D" opacity=".35" />
          <circle cx="6" cy="4.5" r="1.1" fill="#1B5B42" opacity=".25" />
        </pattern>
        <linearGradient id={`${id}fade`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset=".3" stopColor="#FFFFFF" stopOpacity=".85" />
          <stop offset=".55" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="300" height="210" fill={`url(#${id}sky)`} />
      <path d="M0 70Q150 48 300 64V120H0Z" fill="#8FCBB1" />
      <path d="M0 70Q150 48 300 64V120H0Z" fill={`url(#${id}crowd)`} />
      <path d="M0 120H300V210H0Z" fill="#3FAE6A" />
      <g fill="#36A060">
        <path d="M0 120H60L20 210H0Z" />
        <path d="M120 120H180L170 210H100Z" />
        <path d="M240 120H300V210H250Z" />
      </g>
      <path
        d="M40 210 110 120H230L300 168"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity=".7"
        strokeWidth="2.5"
      />
      <g transform="translate(232 168)">
        <ellipse cx="0" cy="22" rx="20" ry="5" fill="#1B5B42" opacity=".35" />
        <circle r="20" fill="#FFFFFF" />
        <path d="M0-8 7.6-2.5 4.7 6.5H-4.7L-7.6-2.5Z" fill="#212121" />
        <path
          d="M0-20V-8M19-6 7.6-2.5M12 16 4.7 6.5M-12 16-4.7 6.5M-19-6-7.6-2.5"
          stroke="#212121"
          strokeWidth="2"
        />
      </g>
      <rect width="300" height="210" fill={`url(#${id}fade)`} />
    </svg>
  );
}

const EVENT_PALETTES: Record<string, { sky: string; pitch: string; accent: string }> = {
  MATCH: { sky: "#0F4A39", pitch: "#1C8B5E", accent: "#FFFFFF" },
  TOURNAMENT: { sky: "#1E3A5F", pitch: "#2E7D5B", accent: "#FFC400" },
  TRYOUT: { sky: "#CFEDE0", pitch: "#3FAE6A", accent: "#FF9800" },
};

/** Vignette d'un événement, déclinée selon son type (match, tournoi, essai). */
export function EventArt({ type, className = "" }: ArtProps & { type?: string | null }) {
  const palette = EVENT_PALETTES[type ?? ""] ?? EVENT_PALETTES.MATCH;
  return (
    <svg
      viewBox="0 0 104 72"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
      focusable="false"
    >
      <rect width="104" height="72" fill={palette.sky} />
      <circle cx="22" cy="8" r="14" fill="#FFFFFF" opacity=".25" />
      <circle cx="84" cy="6" r="16" fill="#FFFFFF" opacity=".25" />
      <path d="M0 30Q52 22 104 30V42H0Z" fill="#000000" opacity=".18" />
      <path d="M0 42H104V72H0Z" fill={palette.pitch} />
      <g fill="none" stroke="#FFFFFF" strokeOpacity=".75" strokeWidth="1.5">
        <path d="M14 72 30 42H74L90 72" />
        <ellipse cx="52" cy="56" rx="12" ry="5" />
      </g>
      {type === "TRYOUT" ? (
        <g fill={palette.accent}>
          <path d="M28 64 32 56 36 64Z" />
          <path d="M48 66 52 58 56 66Z" />
          <path d="M68 64 72 56 76 64Z" />
        </g>
      ) : (
        <circle cx="52" cy="56" r="3.5" fill={palette.accent} />
      )}
    </svg>
  );
}

/** Vague verte décorative au bas de la barre latérale. */
export function SidebarWave({ className = "" }: ArtProps) {
  const id = useSvgId();
  return (
    <svg
      viewBox="0 0 272 100"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}wave`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#14AD7A" />
          <stop offset="1" stopColor="#0B7A55" />
        </linearGradient>
      </defs>
      <path d="M50 100C70 52 112 30 160 30S228 38 242 47V100Z" fill="#B7E7D2" />
      <path d="M0 58C30 50 72 50 104 64C112 70 112 100 112 100H0Z" fill="#A2DEC4" />
      <path d="M18 100C50 70 110 46 170 34S250 10 272 6V100Z" fill={`url(#${id}wave)`} />
      <path d="M130 100C170 82 220 70 272 62V100Z" fill="#08804F" fillOpacity="0.55" />
    </svg>
  );
}
