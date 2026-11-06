import type { CSSProperties } from "react";
import { SvgIcon, type SvgIconName } from "@/shared/ui/svg-icon";

/** Éclats sportifs autour de la coche de succès (maquettes Vérification et Mot de passe oublié). */
const SPARKS: { x: number; y: number; dx: number; dy: number; icon: SvgIconName }[] = [
  { x: 6, y: 8, dx: 34, dy: 28, icon: "sport_football" },
  { x: 72, y: 0, dx: 0, dy: 36, icon: "sport_basket" },
  { x: 138, y: 8, dx: -34, dy: 28, icon: "sport_tennis" },
  { x: 2, y: 108, dx: 38, dy: -30, icon: "sport_rugby" },
  { x: 72, y: 116, dx: 0, dy: -36, icon: "sport_athle" },
  { x: 142, y: 108, dx: -38, dy: -30, icon: "sport_volley" },
];

export function SuccessBurst() {
  return (
    <div aria-hidden className="relative h-[150px] w-[180px] self-center">
      {SPARKS.map((spark, n) => (
        <span
          key={spark.icon}
          className="animate-spark bg-code-bg text-primary-dark absolute flex size-[34px] items-center justify-center rounded-full"
          style={
            {
              left: spark.x,
              top: spark.y,
              "--dx": `${spark.dx}px`,
              "--dy": `${spark.dy}px`,
              animationDelay: `${120 + n * 45}ms`,
            } as CSSProperties
          }
        >
          <SvgIcon name={spark.icon} size={20} />
        </span>
      ))}
      <span className="animate-pop bg-primary absolute top-[37px] left-[52px] flex size-[76px] items-center justify-center rounded-full text-white">
        <SvgIcon name="check" size={44} />
      </span>
    </div>
  );
}
