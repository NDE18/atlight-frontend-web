import Image from "next/image";
import { OpenToTryoutsRing } from "./open-to-tryouts-ring";

interface AvatarProps {
  initials: string;
  picture?: string | null;
  size: number;
  /** Fond blanc sur l'en-tête vert du menu du compte. */
  inverse?: boolean;
  /** Cadre « Open to tryouts » autour de l'avatar. */
  openToTryouts?: boolean;
  className?: string;
}

/** Photo de profil Cloudinary, sinon initiales sur fond vert clair (comme les maquettes). */
export function Avatar({
  initials,
  picture,
  size,
  inverse = false,
  openToTryouts = false,
  className = "",
}: AvatarProps) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.34) };
  const face = picture?.startsWith("https://res.cloudinary.com/") ? (
    <Image
      src={picture}
      alt=""
      width={size}
      height={size}
      className={`flex-none rounded-full object-cover ${openToTryouts ? "" : className}`}
      style={style}
    />
  ) : (
    // Initiales décoratives en contenu CSS généré, pas en texte : dans un bouton libellé
    // « Ouvrir le menu du compte », un texte « IK » visible enfreindrait WCAG 2.5.3 (Label in Name).
    <span
      aria-hidden
      data-initials={initials}
      style={style}
      className={`text-primary-dark flex flex-none items-center justify-center rounded-full font-bold before:content-[attr(data-initials)] ${
        inverse ? "bg-white" : "bg-code-bg"
      } ${openToTryouts ? "" : className}`}
    />
  );
  if (!openToTryouts) return face;
  return (
    <span className={`relative flex flex-none ${className}`} style={{ width: size, height: size }}>
      {face}
      <OpenToTryoutsRing />
    </span>
  );
}
