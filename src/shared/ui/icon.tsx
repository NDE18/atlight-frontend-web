import type { HTMLAttributes } from "react";

interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  /** Nom Material Symbols, identique au nom Material Icons du mobile (ex. "travel_explore"). */
  name: string;
  size?: number;
  filled?: boolean;
  /** Libellé pour les lecteurs d'écran ; sans libellé l'icône est décorative. */
  label?: string;
}

export function Icon({
  name,
  size = 24,
  filled = false,
  label,
  className = "",
  style,
  ...rest
}: IconProps) {
  return (
    <span
      className={`material-symbols-outlined leading-none select-none ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `"FILL" ${filled ? 1 : 0}, "wght" 400, "GRAD" 0, "opsz" ${Math.min(48, Math.max(20, size))}`,
        ...style,
      }}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      {...rest}
    >
      {name}
    </span>
  );
}
