import type { SvgIconName } from "@/shared/ui/svg-icon";

export interface NavEntry {
  key: string;
  labelKey: string;
  icon: SvgIconName;
  activeIcon?: SvgIconName;
  /** Absent tant que l'écran n'existe pas sur le web : un clic affiche « Bientôt disponible ». */
  href?: string;
  /** Couleur d'icône particulière (Premium en doré). */
  color?: string;
  /** Compteur affiché en pastille rouge. */
  badge?: "notifications";
}

/** Navigation principale, même ordre que la barre du bas du mobile et la maquette Accueil. */
export const MAIN_NAV: NavEntry[] = [
  { key: "home", labelKey: "home", icon: "home_outline", activeIcon: "home", href: "/" },
  { key: "network", labelKey: "network", icon: "group_outline" },
  { key: "posts", labelKey: "posts", icon: "article_outline" },
  {
    key: "notifications",
    labelKey: "notifications",
    icon: "notifications_outline",
    badge: "notifications",
  },
  { key: "mercato", labelKey: "mercato", icon: "box" },
];

/** Section « Explorer » de la barre latérale (tiroir du mobile). */
export const EXPLORE_NAV: NavEntry[] = [
  { key: "premium", labelKey: "premium", icon: "crown", color: "var(--color-premium)" },
  { key: "scouting", labelKey: "scouting", icon: "binoculars" },
  { key: "events", labelKey: "events", icon: "event" },
  { key: "groups", labelKey: "groups", icon: "groups" },
  { key: "invite", labelKey: "inviteFriends", icon: "person_add" },
];
