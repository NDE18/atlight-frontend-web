"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { initialsFromName } from "@/features/auth/session";
import { Avatar } from "@/shared/ui/avatar";
import { cardClass, useComingSoon } from "@/shared/ui/home-blocks";
import { HeroArt } from "@/shared/ui/illustrations";
import { SvgIcon } from "@/shared/ui/svg-icon";
import type { SessionUser } from "@/stores/session";
import { storiesQuery } from "../api";
import { groupStories } from "../format";

/** Bannière « Bonjour » et stories (FEED-04, en lecture), en tête de l'accueil. */
export function WelcomeCard({ user }: { user: SessionUser }) {
  const t = useTranslations();
  const comingSoon = useComingSoon();

  return (
    <section aria-labelledby="home-greeting" className={`${cardClass} overflow-hidden`}>
      <div className="relative min-h-[120px] overflow-hidden">
        <HeroArt className="tablet:block absolute inset-y-0 right-0 hidden h-full w-[72%]" />
        {/* Fondu vers le blanc : l'illustration ne coupe jamais le texte. */}
        <div
          aria-hidden
          className="tablet:block pointer-events-none absolute inset-y-0 right-0 hidden w-[72%] bg-[linear-gradient(90deg,#fff_0%,rgb(255_255_255/0.85)_18%,rgb(255_255_255/0)_50%)]"
        />
        <div className="relative z-10 flex flex-col items-start gap-1 px-5 pt-4 pb-3">
          <h1
            id="home-greeting"
            className="tablet:text-[22px] m-0 text-[20px] leading-tight font-bold"
          >
            {t("homeGreeting", { name: user.firstname || user.username })}{" "}
            <span aria-hidden>👋</span>
          </h1>
          <p className="text-grey-800 m-0 max-w-[62ch] text-[13px]">{t("homeGreetingLead")}</p>
          <button
            type="button"
            onClick={comingSoon}
            className="bg-primary-strong hover:bg-primary-dark mt-2 inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-bold text-white transition-colors"
          >
            {t("exploreNetwork")}
            <SvgIcon name="arrow_forward" size={18} />
          </button>
        </div>
      </div>
      <StoriesStrip user={user} />
    </section>
  );
}

function StoriesStrip({ user }: { user: SessionUser }) {
  const t = useTranslations();
  const comingSoon = useComingSoon();
  const list = useRef<HTMLUListElement>(null);
  const { data } = useQuery(storiesQuery());
  const groups = groupStories(data ?? [], user.personId).filter(
    (g) => g.personId !== user.personId,
  );

  const ring = "flex size-[66px] items-center justify-center rounded-full border-2 p-[3px]";
  const label = "w-[74px] truncate text-center text-[12px] text-grey-800";

  return (
    <div className="tablet:px-4 relative px-3 pt-2 pb-3">
      <ul
        ref={list}
        className="tablet:gap-3 m-0 flex [scrollbar-width:none] list-none gap-2 overflow-x-auto scroll-smooth p-0"
      >
        <li className="flex-none">
          <button
            type="button"
            onClick={comingSoon}
            className="flex flex-col items-center gap-1.5 rounded-xl p-1"
          >
            <span className={`${ring} border-primary bg-code-bg`}>
              <SvgIcon name="add" size={30} className="text-primary" />
            </span>
            <span className={label}>{t("yourStory")}</span>
          </button>
        </li>
        {groups.map((group) => (
          <li key={group.personId} className="flex-none">
            <button
              type="button"
              onClick={comingSoon}
              aria-label={t("openStoryOf", { name: group.personName })}
              className="flex flex-col items-center gap-1.5 rounded-xl p-1"
            >
              <span className={`${ring} ${group.allViewed ? "border-grey-400" : "border-primary"}`}>
                <Avatar
                  initials={initialsFromName(group.personName)}
                  picture={group.personPicture}
                  size={56}
                />
              </span>
              <span className={label} aria-hidden>
                {group.personName}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {groups.length > 5 && (
        <button
          type="button"
          onClick={() => list.current?.scrollBy({ left: 320 })}
          aria-label={t("moreStories")}
          className="text-grey-800 hover:bg-grey-50 tablet:flex absolute top-[26px] right-3 hidden size-10 items-center justify-center rounded-full bg-white shadow-[0_4px_14px_rgb(0_0_0/0.14)]"
        >
          <SvgIcon name="chevron_right" size={26} />
        </button>
      )}
    </div>
  );
}
