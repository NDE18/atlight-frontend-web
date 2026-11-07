"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { roleLabelKey } from "@/features/auth/roles";
import { initialsOf } from "@/features/auth/session";
import { useLogout } from "@/features/auth/use-logout";
import { useSessionGuard } from "@/features/auth/use-session-guard";
import { shareInvite } from "@/features/onboarding/invite";
import { locales, type Locale } from "@/i18n/config";
import { Avatar } from "@/shared/ui/avatar";
import { SidebarWave } from "@/shared/ui/illustrations";
import { LANGUAGE_LABEL_KEYS, useChangeLocale } from "@/shared/ui/language-switch";
import { SvgIcon, type SvgIconName } from "@/shared/ui/svg-icon";
import { useAppStore } from "@/stores/app";
import type { SessionUser } from "@/stores/session";
import { unreadMessagesQuery, unreadNotificationsQuery } from "../counters";
import { MAIN_COLUMN_ONLY, PAGE_FRAME, PAGE_GUTTER } from "../layout";
import { EXPLORE_NAV, MAIN_NAV, type NavEntry } from "../navigation";

interface AppShellProps {
  /** Langue choisie explicitement (cookie), null = langue du navigateur. */
  localePreference: Locale | null;
  children: ReactNode;
}

interface Counts {
  notifications: number;
  messages: number;
}

/**
 * Shell responsive de l'espace connecté (maquette Accueil2) : barre latérale ≥ 1100 px,
 * rail de 72 px entre 640 et 1099 px, barre du bas sous 640 px, menu du compte.
 */
export function AppShell({ localePreference, children }: AppShellProps) {
  const t = useTranslations();
  const { hydrated, user } = useSessionGuard();
  const toast = useAppStore((s) => s.toast);
  const showToast = useAppStore((s) => s.showToast);
  const [menuOpen, setMenuOpen] = useState(false);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);

  const sessionUser = hydrated ? user : null;
  const { data: notifications = 0 } = useQuery({
    ...unreadNotificationsQuery(sessionUser?.username ?? ""),
    enabled: !!sessionUser,
  });
  const { data: messages = 0 } = useQuery({ ...unreadMessagesQuery(), enabled: !!sessionUser });
  const counts: Counts = { notifications, messages };

  const comingSoon = () => showToast(t("comingSoonWeb"));
  const runEntry = async (entry: NavEntry) => {
    if (entry.key !== "invite") return comingSoon();
    const outcome = await shareInvite(t("joinMeOnAtlight"));
    if (outcome === "copied") showToast(t("linkCopied"));
  };

  const openMenu = (trigger: HTMLButtonElement | null) => {
    triggers.current = [trigger];
    setMenuOpen(true);
  };
  // Le focus revient sur le bouton qui a ouvert le menu.
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    triggers.current[0]?.focus();
  }, []);

  return (
    <div className="tablet:grid-cols-[var(--spacing-rail)_minmax(0,1fr)] desktop:grid-cols-[272px_minmax(0,1fr)] grid min-h-dvh grid-cols-1 bg-[#F3F6F4]">
      <a
        href="#main-content"
        className="focus:bg-primary-strong sr-only z-50 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:rounded-lg focus:px-4 focus:py-2 focus:text-white"
      >
        {t("skipToContent")}
      </a>

      <Sidebar
        user={sessionUser}
        counts={counts}
        menuOpen={menuOpen}
        onEntry={runEntry}
        onOpenMenu={openMenu}
      />

      <div className="flex min-w-0 flex-col">
        <TopBar
          user={sessionUser}
          counts={counts}
          menuOpen={menuOpen}
          onOpenMenu={openMenu}
          onComingSoon={comingSoon}
        />
        <main
          id="main-content"
          tabIndex={-1}
          className="tablet:pb-0 min-w-0 flex-1 pb-[76px] outline-none"
        >
          {children}
        </main>
      </div>

      <BottomNav counts={counts} onEntry={runEntry} />

      {menuOpen && sessionUser && (
        <AccountMenu
          user={sessionUser}
          localePreference={localePreference}
          onClose={closeMenu}
          onEntry={runEntry}
          onComingSoon={comingSoon}
        />
      )}

      <div
        aria-live="polite"
        className="tablet:bottom-[22px] fixed bottom-[76px] left-1/2 z-[60] -translate-x-1/2"
      >
        {toast && (
          <p className="animate-rise-fast bg-grey-900 m-0 max-w-[calc(100vw-32px)] rounded-xl px-4 py-2.5 text-sm text-white shadow-[0_12px_30px_rgb(0_0_0/0.28)]">
            {toast}
          </p>
        )}
      </div>
    </div>
  );
}

function badgeText(count: number) {
  return count > 99 ? "99+" : String(count);
}

function useIsActive() {
  const pathname = usePathname();
  return (entry: NavEntry) => !!entry.href && pathname === entry.href;
}

function NavItem({
  entry,
  onEntry,
  variant,
  count = 0,
}: {
  entry: NavEntry;
  onEntry: (entry: NavEntry) => void;
  variant: "side" | "bottom" | "menu";
  count?: number;
}) {
  const t = useTranslations();
  const isActive = useIsActive();
  const active = isActive(entry);
  const icon: SvgIconName = active && entry.activeIcon ? entry.activeIcon : entry.icon;
  const label = t(entry.labelKey);

  const classes = {
    // text-left : les entrées sans page sont des <button>, qui centrent leur texte par défaut.
    // Hauteur indexée sur celle de l'écran : la barre latérale tient sans défiler.
    side: "relative flex min-h-[clamp(34px,5dvh,46px)] w-full items-center justify-center gap-4 rounded-xl text-left text-[14px] font-medium text-grey-900 transition-colors hover:bg-grey-100 aria-[current=page]:bg-[#E6F5F1] aria-[current=page]:font-bold desktop:justify-start desktop:rounded-l-none desktop:pr-4 desktop:pl-7 desktop:before:absolute desktop:before:inset-y-0 desktop:before:left-0 desktop:before:w-[5px] desktop:before:rounded-r-md desktop:aria-[current=page]:before:bg-primary",
    bottom:
      "group relative flex min-h-[54px] flex-col items-center justify-center gap-px rounded-[10px] text-[11px] font-medium text-grey-700 aria-[current=page]:font-bold aria-[current=page]:text-primary-strong",
    menu: "flex min-h-11 w-full items-center gap-[11px] rounded-lg px-2.5 text-left text-sm text-grey-900 transition-colors hover:bg-grey-100",
  }[variant];

  // Pastille visuelle masquée aux lecteurs d'écran, remplacée par « 3 non lus » : le nom
  // accessible commence par le libellé visible (WCAG 2.5.3).
  const badge =
    count > 0 ? (
      <>
        <span
          aria-hidden
          className={
            variant === "side"
              ? "bg-badge max-desktop:absolute max-desktop:top-1 max-desktop:right-2 max-desktop:border-2 max-desktop:border-white desktop:ml-auto flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[13px] font-bold text-white"
              : "bg-badge absolute top-0.5 left-1/2 ml-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white px-1 text-[11px] font-bold text-white"
          }
        >
          {badgeText(count)}
        </span>
        <span className="sr-only">{t("unreadCount", { count })}</span>
      </>
    ) : null;

  const content =
    variant === "bottom" ? (
      <>
        <span className="group-aria-[current=page]:bg-primary-10 flex h-7 w-[52px] items-center justify-center rounded-[14px] transition-colors">
          <SvgIcon name={icon} size={24} style={{ color: entry.color }} />
        </span>
        <span>{label}</span>
        {badge}
      </>
    ) : (
      <>
        <SvgIcon
          name={icon}
          size={variant === "menu" ? 20 : 24}
          className={active ? "text-primary" : "text-grey-800"}
          style={{ color: entry.color }}
        />
        <span className={variant === "side" ? "max-desktop:sr-only min-w-0 flex-1 truncate" : ""}>
          {label}
        </span>
        {badge}
      </>
    );

  if (entry.href) {
    return (
      <Link
        href={entry.href}
        aria-current={active ? "page" : undefined}
        title={label}
        className={classes}
      >
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={() => onEntry(entry)} title={label} className={classes}>
      {content}
    </button>
  );
}

function Sidebar({
  user,
  counts,
  menuOpen,
  onEntry,
  onOpenMenu,
}: {
  user: SessionUser | null;
  counts: Counts;
  menuOpen: boolean;
  onEntry: (entry: NavEntry) => void;
  onOpenMenu: (trigger: HTMLButtonElement | null) => void;
}) {
  const t = useTranslations();
  const { logout, pending: loggingOut } = useLogout();
  const name = user
    ? [user.firstname, user.lastname].filter(Boolean).join(" ") || user.username
    : "";
  const roleKey = roleLabelKey(user?.role);
  const footerItem =
    "flex min-h-[clamp(32px,4.6dvh,42px)] w-full items-center justify-center gap-4 rounded-xl text-left text-[14px] font-medium text-grey-900 transition-colors hover:bg-grey-100 desktop:justify-start desktop:px-4";
  // Espacements de la barre latérale, eux aussi proportionnels à la hauteur de l'écran.
  const rule = "bg-grey-200 h-px flex-none";

  return (
    <nav
      aria-label={t("mainNavigation")}
      className="tablet:flex border-grey-200 sticky top-0 hidden h-dvh flex-col overflow-y-auto border-r bg-white"
    >
      <Link
        href="/"
        className="desktop:justify-start desktop:px-6 flex flex-none items-center justify-center gap-3 px-2 pt-[clamp(12px,2.6dvh,24px)] pb-[clamp(10px,2.2dvh,20px)]"
      >
        <Image
          src="/icons/mark.png"
          alt="Atlight"
          width={52}
          height={52}
          className="desktop:size-[clamp(40px,5.6dvh,52px)] size-[clamp(36px,5dvh,48px)] rounded-[12px]"
        />
        <span
          aria-hidden
          className="text-primary desktop:inline hidden text-[26px] leading-none font-bold tracking-tight"
        >
          atlight
        </span>
      </Link>

      <ul className="desktop:px-0 desktop:pr-5 m-0 flex list-none flex-col p-0 px-2">
        {MAIN_NAV.map((entry) => (
          <li key={entry.key}>
            <NavItem
              entry={entry}
              onEntry={onEntry}
              variant="side"
              count={entry.badge ? counts[entry.badge] : 0}
            />
          </li>
        ))}
      </ul>

      <div className={`${rule} desktop:mx-6 mx-3 my-[clamp(6px,1.2dvh,12px)]`} />
      <p className="desktop:block text-grey-600 m-0 hidden px-7 pb-0.5 text-[11px] font-bold tracking-[.04em] uppercase">
        {t("sideMenuExplore")}
      </p>
      {/* Entrées secondaires un peu plus serrées que la navigation principale. */}
      <ul className="desktop:px-0 desktop:pr-5 m-0 flex list-none flex-col p-0 px-2 [&>li>*]:min-h-[clamp(32px,4.6dvh,42px)]">
        {EXPLORE_NAV.map((entry) => (
          <li key={entry.key}>
            <NavItem entry={entry} onEntry={onEntry} variant="side" />
          </li>
        ))}
      </ul>

      <div className="desktop:px-5 border-grey-200 mt-auto flex flex-col gap-0.5 border-t px-2 pt-[clamp(6px,1.2dvh,12px)]">
        {user && (
          <button
            type="button"
            onClick={(event) => onOpenMenu(event.currentTarget)}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            className="desktop:justify-start hover:bg-grey-100 flex w-full items-center justify-center gap-3 rounded-xl p-1 text-left transition-colors"
          >
            <Avatar
              initials={initialsOf(user)}
              picture={user.picture}
              size={44}
              openToTryouts={user.openToTryouts}
            />
            <span className="desktop:block hidden min-w-0 flex-1">
              <span className="flex items-center gap-1 text-[13px] font-bold">
                <span className="truncate">{name}</span>
                {user.verified && (
                  <SvgIcon
                    name="verified"
                    size={16}
                    className="text-primary"
                    label={t("verifiedProfile")}
                  />
                )}
              </span>
              {roleKey && (
                <span className="text-grey-700 block truncate text-[12px]">{t(roleKey)}</span>
              )}
            </span>
            <span className="desktop:hidden sr-only">{t("openAccountMenu")}</span>
            <SvgIcon name="expand_more" size={22} className="desktop:block text-grey-800 hidden" />
          </button>
        )}
        <div className={`${rule} desktop:mx-1 my-[clamp(2px,0.6dvh,6px)]`} />
        <button
          type="button"
          onClick={(event) => onOpenMenu(event.currentTarget)}
          title={t("sideMenuSettings")}
          className={footerItem}
        >
          <SvgIcon name="settings" size={22} className="text-grey-800" />
          <span className="max-desktop:sr-only">{t("sideMenuSettings")}</span>
        </button>
        <button
          type="button"
          onClick={() => void logout()}
          disabled={loggingOut}
          aria-busy={loggingOut || undefined}
          title={t("logout")}
          className={footerItem}
        >
          <SvgIcon name="logout" size={22} className="text-grey-800" />
          <span className="max-desktop:sr-only">{t("logout")}</span>
        </button>
      </div>
      {/* La vague cède sa place en premier sur les écrans peu hauts (disparue sous ~550 px). */}
      <SidebarWave className="desktop:block mt-2 hidden h-[clamp(0px,calc(22dvh_-_120px),90px)] w-full flex-none" />
    </nav>
  );
}

function BottomNav({ counts, onEntry }: { counts: Counts; onEntry: (entry: NavEntry) => void }) {
  const t = useTranslations();
  return (
    <nav
      aria-label={t("mainNavigation")}
      className="tablet:hidden border-grey-200 fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t bg-white px-0.5 pt-1 pb-[max(4px,env(safe-area-inset-bottom))]"
    >
      {MAIN_NAV.map((entry) => (
        <NavItem
          key={entry.key}
          entry={entry}
          onEntry={onEntry}
          variant="bottom"
          count={entry.badge ? counts[entry.badge] : 0}
        />
      ))}
    </nav>
  );
}

/** Bouton icône avec pastille de non-lus (messages, notifications). */
function CounterButton({
  icon,
  label,
  count,
  onClick,
}: {
  icon: SvgIconName;
  label: string;
  count: number;
  onClick: () => void;
}) {
  const t = useTranslations();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={count > 0 ? t("unreadCountLabel", { label, count }) : label}
      title={label}
      className="tablet:size-12 text-grey-800 hover:bg-grey-100 relative flex size-11 flex-none items-center justify-center rounded-full transition-colors"
    >
      <SvgIcon name={icon} size={28} />
      {count > 0 && (
        <span
          aria-hidden
          className="bg-badge absolute top-0 right-0 flex h-[22px] min-w-[22px] items-center justify-center rounded-full border-2 border-white px-1 text-[12px] font-bold text-white"
        >
          {badgeText(count)}
        </span>
      )}
    </button>
  );
}

function AvatarButton({
  user,
  expanded,
  onClick,
  withChevron = false,
  className,
}: {
  user: SessionUser | null;
  expanded: boolean;
  onClick: (trigger: HTMLButtonElement) => void;
  withChevron?: boolean;
  className: string;
}) {
  const t = useTranslations();
  return (
    <button
      type="button"
      onClick={(event) => onClick(event.currentTarget)}
      aria-label={t("openAccountMenu")}
      aria-haspopup="dialog"
      aria-expanded={expanded}
      className={`hover:bg-grey-100 flex-none items-center gap-1 rounded-full p-0.5 transition-colors ${className}`}
    >
      {user ? (
        <Avatar initials={initialsOf(user)} picture={user.picture} size={withChevron ? 48 : 40} />
      ) : (
        <span aria-hidden className="bg-grey-200 size-10 rounded-full" />
      )}
      {withChevron && <SvgIcon name="expand_more" size={24} className="text-grey-800" />}
    </button>
  );
}

function TopBar({
  user,
  counts,
  menuOpen,
  onOpenMenu,
  onComingSoon,
}: {
  user: SessionUser | null;
  counts: Counts;
  menuOpen: boolean;
  onOpenMenu: (trigger: HTMLButtonElement | null) => void;
  onComingSoon: () => void;
}) {
  const t = useTranslations();
  return (
    <header
      className={`tablet:h-20 border-grey-200 sticky top-0 z-20 h-[60px] border-b bg-white px-2.5 ${PAGE_GUTTER}`}
    >
      {/* Même cadre que le contenu : la recherche s'aligne sur le fil, les icônes sur la droite. */}
      <div className={`${PAGE_FRAME} tablet:gap-3 flex h-full items-center gap-1.5`}>
        <AvatarButton
          user={user}
          expanded={menuOpen}
          onClick={onOpenMenu}
          className="tablet:hidden flex"
        />
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            onComingSoon();
          }}
          className={`tablet:mr-auto relative min-w-0 flex-1 ${MAIN_COLUMN_ONLY}`}
        >
          <SvgIcon
            name="search"
            size={24}
            className="text-grey-700 pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
          />
          <input
            type="search"
            placeholder={t("homeSearchPlaceholder")}
            aria-label={t("searchAria")}
            className="focus:border-primary tablet:h-12 text-grey-900 placeholder:text-grey-700 desktop:text-[14px] h-11 w-full rounded-full border border-transparent bg-[#F1F4F2] pr-4 pl-12 text-[16px] transition-[background-color,border-color,box-shadow] outline-none focus:bg-white focus:shadow-[0_0_0_3px_rgb(0_153_112/0.13)] focus-visible:outline-none"
          />
        </form>
        <CounterButton
          icon="chat"
          label={t("messages")}
          count={counts.messages}
          onClick={onComingSoon}
        />
        <CounterButton
          icon="notifications_outline"
          label={t("notifications")}
          count={counts.notifications}
          onClick={onComingSoon}
        />
        <AvatarButton
          user={user}
          expanded={menuOpen}
          onClick={onOpenMenu}
          withChevron
          className="tablet:flex ml-1 hidden"
        />
      </div>
    </header>
  );
}

function AccountMenu({
  user,
  localePreference,
  onClose,
  onEntry,
  onComingSoon,
}: {
  user: SessionUser;
  localePreference: Locale | null;
  onClose: () => void;
  onEntry: (entry: NavEntry) => void;
  onComingSoon: () => void;
}) {
  const t = useTranslations();
  const currentLocale = useLocale();
  const { logout, pending: loggingOut } = useLogout();
  const { change: changeLocale, pending: changingLocale } = useChangeLocale();
  const [languagesOpen, setLanguagesOpen] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialog.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const name = [user.firstname, user.lastname].filter(Boolean).join(" ") || user.username;
  const roleKey = roleLabelKey(user.role);
  const roleLine = [roleKey ? t(roleKey) : null, user.clubName ? `@${user.clubName}` : null]
    .filter(Boolean)
    .join(" ");
  const itemClass =
    "flex min-h-11 w-full items-center gap-[11px] rounded-lg px-2.5 text-left text-sm text-grey-900 transition-colors hover:bg-grey-100";
  const dangerClass = `${itemClass} text-danger`;
  const languageOptions: { value: Locale | null; label: string }[] = [
    { value: null, label: t("languageSystem") },
    ...locales.map((locale) => ({ value: locale, label: t(LANGUAGE_LABEL_KEYS[locale]) })),
  ];

  return (
    <>
      <button
        type="button"
        aria-label={t("close")}
        onClick={onClose}
        className="tablet:bg-transparent animate-fade fixed inset-0 z-[29] cursor-default bg-[rgb(17_24_20/0.45)]"
      />
      {/* Tiroir sur téléphone (enveloppes sans boîte) ; dès 640 px, panneau calé sur le bord
          droit du cadre de la barre du haut, donc sous l'avatar : décalage de la barre latérale,
          puis marges et cadre de la page, comme la barre du haut. */}
      <div className="tablet:fixed tablet:inset-x-0 tablet:top-[72px] tablet:z-30 tablet:block tablet:pl-rail desktop:pl-[272px] pointer-events-none contents">
        <div className={`${PAGE_GUTTER} tablet:block contents`}>
          <div className={`${PAGE_FRAME} tablet:flex tablet:justify-end contents`}>
            <div
              ref={dialog}
              role="dialog"
              aria-modal="true"
              aria-label={t("accountMenu")}
              tabIndex={-1}
              className="tablet:relative tablet:inset-auto tablet:w-[300px] tablet:max-h-[calc(100dvh-84px)] tablet:rounded-2xl tablet:border tablet:animate-menu tablet:origin-top-right animate-drawer shadow-popover border-grey-200 pointer-events-auto fixed inset-y-0 left-0 z-30 w-[min(320px,86%)] overflow-y-auto rounded-r-2xl bg-white outline-none"
            >
              <div className="bg-primary-strong flex items-center gap-3 p-4 text-white">
                <Avatar initials={initialsOf(user)} picture={user.picture} size={48} inverse />
                <div className="min-w-0">
                  <p className="m-0 truncate text-base leading-[21px] font-bold">{name}</p>
                  {roleLine && <p className="m-0 text-[13px] leading-[18px]">{roleLine}</p>}
                  <button
                    type="button"
                    onClick={onComingSoon}
                    className="py-[3px] text-[13px] font-bold text-white underline"
                  >
                    {t("viewProfile")}
                  </button>
                </div>
              </div>

              <MenuSection title={t("sideMenuExplore")} className="tablet:hidden">
                {EXPLORE_NAV.map((entry) => (
                  <NavItem key={entry.key} entry={entry} onEntry={onEntry} variant="menu" />
                ))}
              </MenuSection>

              <MenuSection title={t("sideMenuSettings")}>
                <button
                  type="button"
                  className={itemClass}
                  aria-expanded={languagesOpen}
                  onClick={() => setLanguagesOpen((open) => !open)}
                >
                  <SvgIcon name="language" size={20} />
                  <span className="flex-1">{t("language")}</span>
                  <span className="text-grey-700 text-xs">
                    {localePreference
                      ? t(LANGUAGE_LABEL_KEYS[localePreference])
                      : t("languageSystem")}
                  </span>
                </button>
                {languagesOpen && (
                  <div
                    role="group"
                    aria-label={t("language")}
                    className="flex flex-col gap-px pl-8"
                  >
                    {languageOptions.map((option) => {
                      const selected = option.value === localePreference;
                      return (
                        <button
                          key={option.value ?? "system"}
                          type="button"
                          lang={option.value ?? currentLocale}
                          aria-pressed={selected}
                          disabled={changingLocale}
                          onClick={() => changeLocale(option.value)}
                          className={`${itemClass} aria-pressed:text-primary-strong min-h-10 aria-pressed:font-bold`}
                        >
                          <SvgIcon name={selected ? "check_circle" : "radio_unchecked"} size={18} />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                )}
                <button type="button" className={itemClass} onClick={onComingSoon}>
                  <SvgIcon name="block" size={20} />
                  {t("blockedUsers")}
                </button>
                <button type="button" className={itemClass} onClick={onComingSoon}>
                  <SvgIcon name="info" size={20} />
                  {t("about")}
                </button>
              </MenuSection>

              <MenuSection title={t("sideMenuAccount")}>
                <button type="button" className={dangerClass} onClick={onComingSoon}>
                  <SvgIcon name="delete" size={20} />
                  {t("deleteAccount")}
                </button>
                <button
                  type="button"
                  className={dangerClass}
                  aria-busy={loggingOut || undefined}
                  disabled={loggingOut}
                  onClick={() => void logout()}
                >
                  <SvgIcon name="logout" size={20} />
                  {t("logout")}
                </button>
              </MenuSection>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MenuSection({
  title,
  className = "",
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`border-grey-200 flex flex-col gap-px border-b px-2 py-2.5 last:border-b-0 ${className}`}
    >
      <p className="text-grey-700 m-0 px-2.5 pt-0.5 pb-1 text-xs font-bold tracking-[.04em] uppercase">
        {title}
      </p>
      {children}
    </div>
  );
}
