"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { initialsOf } from "@/features/auth/session";
import { myOrganismsQuery } from "@/features/shell/counters";
import { Avatar } from "@/shared/ui/avatar";
import { cardClass, useComingSoon } from "@/shared/ui/home-blocks";
import { SvgIcon, type SvgIconName } from "@/shared/ui/svg-icon";
import type { SessionUser } from "@/stores/session";

/** Accès à la publication (FEED-09, lot 2) : les boutons annoncent l'écran à venir. */
export function ComposerCard({ user }: { user: SessionUser }) {
  const t = useTranslations();
  const comingSoon = useComingSoon();
  // « Publier au nom d'un organisme » seulement pour qui en a créé un (droits lus dans l'API).
  const { data: organisms } = useQuery(myOrganismsQuery());

  const chip = (icon: SvgIconName | null, label: string, trailing?: SvgIconName) => (
    <button
      type="button"
      onClick={comingSoon}
      className="border-grey-200 text-grey-900 hover:bg-grey-50 inline-flex h-9 items-center gap-1.5 rounded-full border bg-white px-3 text-[13px] font-medium transition-colors"
    >
      {icon && <SvgIcon name={icon} size={20} className="text-primary" />}
      {label}
      {trailing && <SvgIcon name={trailing} size={20} className="text-grey-800" />}
    </button>
  );

  return (
    <section aria-label={t("composerPlaceholder")} className={`${cardClass} tablet:px-5 px-4 py-3`}>
      <div className="tablet:gap-4 flex items-center gap-3">
        <Avatar initials={initialsOf(user)} picture={user.picture} size={44} />
        <button
          type="button"
          onClick={comingSoon}
          className="border-grey-200 text-grey-700 hover:bg-grey-50 h-11 min-w-0 flex-1 truncate rounded-full border bg-white px-5 text-left text-[14px] transition-colors"
        >
          {t("composerPlaceholder")}
        </button>
      </div>
      <div className="tablet:gap-2.5 mt-2.5 flex flex-wrap items-center gap-2">
        {chip("image", t("photoVideo"))}
        {chip("videocam_filled", t("video"))}
        {!!organisms?.length && chip(null, t("publishAsOrganism"), "expand_more")}
        <button
          type="button"
          onClick={comingSoon}
          className="bg-primary-strong hover:bg-primary-dark ml-auto h-10 rounded-full px-5 text-[14px] font-bold text-white shadow-[0_6px_14px_rgb(0_153_112/0.22)] transition-colors"
        >
          {t("publish")}
        </button>
      </div>
    </section>
  );
}
