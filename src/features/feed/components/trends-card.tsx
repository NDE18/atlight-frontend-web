"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ArrowLink, useComingSoon } from "@/shared/ui/home-blocks";
import { SvgIcon } from "@/shared/ui/svg-icon";
import { trendingQuery } from "../api";

/** Hashtags tendance des 7 derniers jours (FEED-03). Masqué s'il n'y en a aucun. */
export function TrendsCard() {
  const t = useTranslations();
  const comingSoon = useComingSoon();
  const { data } = useQuery(trendingQuery());
  const tags = (data ?? []).filter((tag) => tag.name).slice(0, 5);
  if (!tags.length) return null;

  return (
    <section
      aria-labelledby="home-trends"
      className="tablet:rounded-2xl tablet:px-5 flex items-start gap-3 bg-[#E9F6EF] px-4 py-2.5"
    >
      <SvgIcon name="trending_up" size={22} className="text-primary mt-0.5" />
      <div className="min-w-0 flex-1">
        <h2 id="home-trends" className="m-0 text-[14px] font-bold">
          {t("sportsTrends")}
        </h2>
        <ul className="tablet:gap-2.5 m-0 mt-1.5 flex list-none flex-wrap gap-2 p-0">
          {tags.map((tag) => (
            <li key={tag.name}>
              <button
                type="button"
                onClick={comingSoon}
                className="text-primary-dark h-7 rounded-full bg-[#D5EFE2] px-3 text-[13px] font-bold transition-colors hover:bg-[#C4E8D6]"
              >
                #{tag.name.replace(/^#/, "")}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="tablet:block hidden self-center">
        <ArrowLink onClick={comingSoon}>{t("showMore")}</ArrowLink>
      </div>
    </section>
  );
}
