"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, type ReactNode } from "react";
import { OpenToTryoutsRing } from "@/shared/ui/open-to-tryouts-ring";
import { SvgIcon, type SvgIconName } from "@/shared/ui/svg-icon";
import type { SignupRole } from "../types";
import { ROLE_LABEL_KEYS } from "../roles";
import { heroFont } from "./hero-font";

const SPORT_KEYS = [
  "football",
  "basket",
  "athle",
  "tennis",
  "rugby",
  "natation",
  "volley",
  "boxe",
  "handball",
  "cyclisme",
  "judo",
  "gym",
] as const;
export type PanelSport = (typeof SPORT_KEYS)[number];

/** Profils d'exemple de la carte animée (données fictives des maquettes). */
const SAMPLE_PROFILES: Record<
  PanelSport,
  {
    name: string;
    role: SignupRole;
    club?: string;
    ott: boolean;
    verified: boolean;
    bg: string;
    fg: string;
  }
> = {
  football: {
    name: "Awa Diallo",
    role: "ATHLETE",
    club: "Stade Lagune FC",
    ott: true,
    verified: true,
    bg: "#E6F5F1",
    fg: "#00664B",
  },
  basket: {
    name: "Yann Essomba",
    role: "ATHLETE",
    club: "Basket Club du Littoral",
    ott: true,
    verified: false,
    bg: "#E3EEF9",
    fg: "#134A7C",
  },
  athle: {
    name: "Inès Kamga",
    role: "ATHLETE",
    club: "Lagune Athlé",
    ott: false,
    verified: true,
    bg: "#FFF4D6",
    fg: "#6B4E00",
  },
  tennis: {
    name: "Junior Mbarga",
    role: "COACH",
    club: "Tennis Club de Kribi",
    ott: false,
    verified: false,
    bg: "#EEE9F8",
    fg: "#46307F",
  },
  rugby: {
    name: "Sarah Bello",
    role: "AGENT",
    ott: false,
    verified: true,
    bg: "#FCE7E4",
    fg: "#8A2B1C",
  },
  natation: {
    name: "Marie Nguema",
    role: "ATHLETE",
    club: "Cercle nautique du Wouri",
    ott: true,
    verified: false,
    bg: "#E3EEF9",
    fg: "#134A7C",
  },
  volley: {
    name: "Fatou Sarr",
    role: "MANAGER",
    club: "Académie Kribi Sport",
    ott: false,
    verified: true,
    bg: "#FCE7E4",
    fg: "#8A2B1C",
  },
  boxe: {
    name: "Kevin Atangana",
    role: "ATHLETE",
    club: "Boxing Club du Centre",
    ott: true,
    verified: false,
    bg: "#ECEFF1",
    fg: "#37474F",
  },
  handball: {
    name: "Nadia Owono",
    role: "ATHLETE",
    club: "Handball Club de la Sanaga",
    ott: true,
    verified: false,
    bg: "#E6F5F1",
    fg: "#00664B",
  },
  cyclisme: {
    name: "Paul Ndongo",
    role: "ATHLETE",
    club: "Vélo Club du Littoral",
    ott: false,
    verified: true,
    bg: "#FFF4D6",
    fg: "#6B4E00",
  },
  judo: {
    name: "Aïcha Bamba",
    role: "COACH",
    club: "Dojo de la Lagune",
    ott: false,
    verified: true,
    bg: "#EEE9F8",
    fg: "#46307F",
  },
  gym: {
    name: "Léa Mvondo",
    role: "ATHLETE",
    club: "Gym Club de Kribi",
    ott: true,
    verified: false,
    bg: "#FCE7E4",
    fg: "#8A2B1C",
  },
};

const REACTIONS: { icon: SvgIconName; color: string }[] = [
  { icon: "emoji_events", color: "var(--color-reaction-gold)" },
  { icon: "military_tech", color: "var(--color-reaction-silver)" },
  { icon: "military_tech", color: "var(--color-reaction-trophy)" },
  { icon: "sport_football", color: "var(--color-reaction-goal)" },
  { icon: "sports", color: "var(--color-reaction-whistle)" },
  { icon: "fitness_center", color: "var(--color-reaction-strong)" },
];

const STEP_MS = 3400;
const sportIcon = (sport: PanelSport) => `sport_${sport}` as SvgIconName;

export interface PanelPerk {
  icon: SvgIconName;
  text: string;
}

interface AuthPanelProps {
  /** Titre fixe ; sans titre, « Le réseau professionnel du football. » défile sport par sport. */
  hero?: string;
  sub?: string;
  showProfile?: boolean;
  perks?: PanelPerk[];
}

/** Panneau vert des écrans d'authentification (maquettes du lot 1). Décoratif, hors titres. */
export function AuthPanel({ hero, sub, showProfile = false, perks }: AuthPanelProps) {
  const t = useTranslations();
  const [turn, setTurn] = useState(0);
  // Textes animés seulement quand ils changent, pas au premier affichage :
  // un texte qui part d'une opacité nulle retarde le LCP tant que la page s'hydrate.
  const [firstCopy] = useState(hero + "|" + sub);
  const copyMotion = hero + "|" + sub !== firstCopy ? "animate-rise" : "";
  const turnMotion = turn > 0;
  const sport = SPORT_KEYS[turn % SPORT_KEYS.length];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setTurn((n) => n + 1);
    }, STEP_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="@container flex min-w-0 flex-1">
      <section
        aria-label={t("authPanelLabel")}
        className="bg-primary relative flex min-w-0 flex-1 flex-col gap-[22px] overflow-hidden px-(--pad) pt-11 pb-[26px] text-white [--pad:clamp(28px,8cqi,64px)] max-[899px]:gap-2.5 max-[899px]:px-6 max-[899px]:pt-4 max-[899px]:pb-[46px]"
      >
        <CourtFloor sport={sport} />

        <div className="relative my-auto flex min-w-0 flex-col gap-5 max-[899px]:my-0 max-[899px]:gap-2">
          {hero ? (
            <>
              <span
                aria-hidden
                className="text-primary-dark inline-flex h-[38px] w-max items-center gap-[7px] rounded-[19px] bg-white pr-3.5 pl-2.5 text-sm font-bold max-[899px]:hidden"
              >
                <span
                  key={turn}
                  className={`${turnMotion ? "animate-rise-fast" : ""} inline-flex items-center gap-[7px]`}
                >
                  <SvgIcon name={sportIcon(sport)} size={20} />
                  {t("authSportLabel", { sport })}
                </span>
              </span>
              <p
                key={hero}
                className={`${heroClass} ${copyMotion} max-w-[11.5ch] max-[899px]:max-w-none`}
              >
                {hero}
              </p>
            </>
          ) : (
            <p className={heroClass}>
              <span className="block">{t("authHeroLead")}</span>
              <span className="sr-only">{t("authHeroAllSports")}</span>
              <span
                aria-hidden
                className="-mt-[.06em] -mb-[.1em] block overflow-hidden pt-[.06em] pr-[.12em] pb-[.1em]"
              >
                <span
                  key={turn}
                  className={`${turnMotion ? "animate-word" : ""} block whitespace-nowrap`}
                >
                  {t("authHeroSport", { sport })}
                </span>
              </span>
            </p>
          )}

          {sub && (
            <p
              key={sub}
              className={`${copyMotion} m-0 max-w-[31em] text-[19px] leading-[1.38] font-bold max-[899px]:hidden`}
            >
              {sub}
            </p>
          )}

          {showProfile && <ProfileCard sport={sport} turn={turn} animate={turnMotion} />}

          {perks && perks.length > 0 && (
            <ul
              key={perks.map((p) => p.text).join("|")}
              className={`${copyMotion} text-grey-900 mt-1.5 max-w-[430px] list-none rounded-2xl bg-white px-[18px] py-2 shadow-(--shadow-panel-card) max-[899px]:hidden`}
            >
              {perks.map((perk) => (
                <li
                  key={perk.text}
                  className="border-grey-200 flex items-center gap-[13px] border-b py-2.5 text-[15px] leading-[1.35] last:border-b-0"
                >
                  <span className="bg-code-bg text-primary-dark flex size-9 flex-none items-center justify-center rounded-full">
                    <SvgIcon name={perk.icon} size={20} />
                  </span>
                  <span>{perk.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <SportTicker current={sport} />
      </section>
    </div>
  );
}

const heroClass = `${heroFont.className} m-0 text-[clamp(36px,9.4cqi,74px)] leading-[1.02] font-black tracking-[-0.02em] text-balance italic max-[899px]:text-[27px]`;

function ProfileCard({
  sport,
  turn,
  animate,
}: {
  sport: PanelSport;
  turn: number;
  animate: boolean;
}) {
  const t = useTranslations();
  const profile = SAMPLE_PROFILES[sport];
  const initials = profile.name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("");
  const role = t(ROLE_LABEL_KEYS[profile.role]);

  return (
    <div aria-hidden className="relative mt-1.5 h-[166px] max-[899px]:hidden">
      <div className="animate-float text-grey-900 absolute top-5 left-0 flex w-[min(100%,430px)] items-center gap-4 rounded-2xl bg-white px-[18px] py-4 shadow-(--shadow-panel-card) motion-reduce:animate-none">
        <div
          key={turn}
          className={`${animate ? "animate-rise-fast" : ""} flex w-full min-w-0 items-center gap-4`}
        >
          <span
            className="relative flex size-[92px] flex-none items-center justify-center rounded-full text-2xl font-bold"
            style={{ background: profile.bg, color: profile.fg }}
          >
            {initials}
            {profile.ott && <OpenToTryoutsRing />}
          </span>
          <span className="flex min-w-0 flex-col gap-1">
            <span className="flex items-center gap-[5px] text-lg leading-tight font-bold">
              {profile.name}
              {profile.verified && <SvgIcon name="verified" size={18} className="text-primary" />}
            </span>
            <span className="text-grey-700 text-sm leading-snug">
              {profile.club ? `${role} @${profile.club}` : role}
            </span>
            <span className="bg-code-bg text-primary-dark mt-1 inline-flex w-max max-w-full items-center gap-1.5 rounded-lg py-[5px] pr-2.5 pl-[7px] text-[13px] font-medium">
              <SvgIcon name={sportIcon(sport)} size={16} />
              {t("authSportLabel", { sport })}
            </span>
          </span>
        </div>
      </div>
      <div className="animate-float absolute top-0 left-[min(calc(100%-210px),236px)] flex gap-[3px] rounded-[20px] bg-white px-[9px] py-1.5 shadow-[0_10px_24px_rgb(0_60_44/0.28)] [animation-delay:-2.4s] motion-reduce:animate-none">
        {REACTIONS.map((reaction, i) => (
          <SvgIcon key={i} name={reaction.icon} size={25} style={{ color: reaction.color }} />
        ))}
      </div>
    </div>
  );
}

function SportTicker({ current }: { current: PanelSport }) {
  const t = useTranslations();
  // Deux fois la liste : la piste défile de -50 % puis repart sans saut.
  const pills = [...SPORT_KEYS, ...SPORT_KEYS];
  return (
    <div aria-hidden className="relative -mx-(--pad) flex-none overflow-hidden max-[899px]:-mx-6">
      <div className="animate-ticker flex w-max gap-2 motion-reduce:animate-none">
        {pills.map((sport, i) => (
          <span
            key={i}
            data-on={sport === current}
            className="text-primary-dark data-[on=true]:bg-secondary data-[on=true]:text-primary-ink inline-flex h-9 flex-none items-center gap-1.5 rounded-[18px] bg-white/95 pr-[13px] pl-[9px] text-sm font-bold transition-colors duration-300 max-[899px]:h-8 max-[899px]:text-[13px]"
          >
            <SvgIcon name={sportIcon(sport)} size={20} />
            {t("authSportLabel", { sport })}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Tracés de terrain en perspective derrière le panneau, un par sport. */
function CourtFloor({ sport }: { sport: PanelSport }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -right-[250px] -bottom-[330px] size-[900px] [transform:perspective(1500px)_rotateX(50deg)_rotateZ(-26deg)] max-[899px]:-right-[290px] max-[899px]:-bottom-[470px] max-[899px]:size-[620px]"
    >
      {SPORT_KEYS.map((key) => (
        <svg
          key={key}
          viewBox="0 0 880 880"
          data-on={key === sport}
          className="court-scene absolute inset-0 size-full opacity-0 transition-opacity duration-500 data-[on=true]:opacity-100"
          fill="none"
          stroke="#fff"
          strokeOpacity={0.34}
          strokeWidth={3}
        >
          {COURTS[key]}
        </svg>
      ))}
    </div>
  );
}

const COURTS: Record<PanelSport, ReactNode> = {
  football: (
    <>
      <rect x="100" y="40" width="680" height="800" pathLength="1" />
      <line x1="100" y1="440" x2="780" y2="440" pathLength="1" />
      <circle cx="440" cy="440" r="92" pathLength="1" />
      <rect x="250" y="40" width="380" height="136" pathLength="1" />
      <rect x="340" y="40" width="200" height="50" pathLength="1" />
      <path d="M372 176a84 84 0 0 0 136 0" pathLength="1" />
      <rect x="250" y="704" width="380" height="136" pathLength="1" />
      <rect x="340" y="790" width="200" height="50" pathLength="1" />
      <path d="M372 704a84 84 0 0 1 136 0" pathLength="1" />
    </>
  ),
  basket: (
    <>
      <rect x="120" y="40" width="640" height="800" pathLength="1" />
      <line x1="120" y1="440" x2="760" y2="440" pathLength="1" />
      <circle cx="440" cy="440" r="72" pathLength="1" />
      <rect x="340" y="40" width="200" height="224" pathLength="1" />
      <circle cx="440" cy="264" r="72" pathLength="1" />
      <path d="M170 40v120a270 270 0 0 0 540 0V40" pathLength="1" />
      <rect x="340" y="616" width="200" height="224" pathLength="1" />
      <circle cx="440" cy="616" r="72" pathLength="1" />
      <path d="M170 840V720a270 270 0 0 1 540 0v120" pathLength="1" />
    </>
  ),
  athle: (
    <>
      <rect x="120" y="50" width="640" height="780" rx="320" pathLength="1" />
      <rect x="160" y="90" width="560" height="700" rx="280" pathLength="1" />
      <rect x="200" y="130" width="480" height="620" rx="240" pathLength="1" />
      <rect x="240" y="170" width="400" height="540" rx="200" pathLength="1" />
      <rect x="280" y="210" width="320" height="460" rx="160" pathLength="1" />
      <line x1="120" y1="440" x2="280" y2="440" pathLength="1" />
      <line x1="600" y1="370" x2="760" y2="370" pathLength="1" />
    </>
  ),
  tennis: (
    <>
      <rect x="190" y="50" width="500" height="780" pathLength="1" />
      <line x1="252" y1="50" x2="252" y2="830" pathLength="1" />
      <line x1="628" y1="50" x2="628" y2="830" pathLength="1" />
      <line x1="150" y1="440" x2="730" y2="440" pathLength="1" strokeWidth="6" />
      <line x1="252" y1="240" x2="628" y2="240" pathLength="1" />
      <line x1="252" y1="640" x2="628" y2="640" pathLength="1" />
      <line x1="440" y1="240" x2="440" y2="640" pathLength="1" />
    </>
  ),
  rugby: (
    <>
      <rect x="130" y="30" width="620" height="820" pathLength="1" />
      <line x1="130" y1="120" x2="750" y2="120" pathLength="1" />
      <line x1="130" y1="760" x2="750" y2="760" pathLength="1" />
      <line x1="130" y1="280" x2="750" y2="280" pathLength="1" />
      <line x1="130" y1="600" x2="750" y2="600" pathLength="1" />
      <line x1="130" y1="440" x2="750" y2="440" pathLength="1" />
      <path d="M400 80v80M480 80v80M400 112h80M400 720v80M480 720v80M400 768h80" pathLength="1" />
    </>
  ),
  natation: (
    <>
      <rect x="120" y="40" width="640" height="800" pathLength="1" />
      {[200, 280, 360, 440, 520, 600, 680].map((x) => (
        <line key={x} x1={x} y1="40" x2={x} y2="840" pathLength="1" />
      ))}
      <line x1="120" y1="150" x2="760" y2="150" pathLength="1" />
      <line x1="120" y1="730" x2="760" y2="730" pathLength="1" />
    </>
  ),
  volley: (
    <>
      <rect x="170" y="100" width="540" height="680" pathLength="1" />
      <line x1="130" y1="440" x2="750" y2="440" pathLength="1" strokeWidth="6" />
      <line x1="170" y1="320" x2="710" y2="320" pathLength="1" />
      <line x1="170" y1="560" x2="710" y2="560" pathLength="1" />
    </>
  ),
  boxe: (
    <>
      <rect x="130" y="130" width="620" height="620" pathLength="1" />
      <rect x="170" y="170" width="540" height="540" pathLength="1" />
      <rect x="210" y="210" width="460" height="460" pathLength="1" />
      <circle cx="130" cy="130" r="22" pathLength="1" />
      <circle cx="750" cy="130" r="22" pathLength="1" />
      <circle cx="130" cy="750" r="22" pathLength="1" />
      <circle cx="750" cy="750" r="22" pathLength="1" />
      <circle cx="440" cy="440" r="86" pathLength="1" />
    </>
  ),
  handball: (
    <>
      <rect x="120" y="40" width="640" height="800" pathLength="1" />
      <line x1="120" y1="440" x2="760" y2="440" pathLength="1" />
      <path d="M230 40a210 210 0 0 0 420 0" pathLength="1" />
      <path d="M170 40a270 270 0 0 0 540 0" pathLength="1" />
      <path d="M230 840a210 210 0 0 1 420 0" pathLength="1" />
      <path d="M170 840a270 270 0 0 1 540 0" pathLength="1" />
    </>
  ),
  cyclisme: (
    <>
      <rect x="130" y="40" width="620" height="800" rx="310" pathLength="1" />
      <rect x="185" y="95" width="510" height="690" rx="255" pathLength="1" />
      <rect x="240" y="150" width="400" height="580" rx="200" pathLength="1" />
      <line x1="130" y1="440" x2="240" y2="440" pathLength="1" strokeWidth="6" />
    </>
  ),
  judo: (
    <>
      <rect x="110" y="110" width="660" height="660" pathLength="1" />
      <rect x="210" y="210" width="460" height="460" pathLength="1" />
      <line x1="400" y1="390" x2="400" y2="490" pathLength="1" />
      <line x1="480" y1="390" x2="480" y2="490" pathLength="1" />
    </>
  ),
  gym: (
    <>
      <rect x="120" y="120" width="640" height="640" pathLength="1" />
      <rect x="170" y="170" width="540" height="540" pathLength="1" />
      <line x1="170" y1="170" x2="710" y2="710" pathLength="1" />
      <line x1="710" y1="170" x2="170" y2="710" pathLength="1" />
    </>
  ),
};
