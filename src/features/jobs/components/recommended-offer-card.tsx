"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ArrowLink, cardClass, useComingSoon } from "@/shared/ui/home-blocks";
import { OfferArt } from "@/shared/ui/illustrations";
import { SvgIcon } from "@/shared/ui/svg-icon";
import { recommendedJobsQuery } from "../api";

/** Première offre recommandée par l'API (JOB-01) ; le détail de l'offre arrive au lot 5. */
export function RecommendedOfferCard() {
  const t = useTranslations();
  const comingSoon = useComingSoon();
  const { data } = useQuery(recommendedJobsQuery());
  const offer = data?.[0];
  if (!offer) return null;

  const meta = [offer.organismName, offer.sport].filter(Boolean).join(" · ");
  const summary = offer.description?.trim() || offer.position || offer.location;

  return (
    <section aria-labelledby="home-offer" className={`${cardClass} relative overflow-hidden`}>
      <OfferArt className="absolute inset-y-0 right-0 h-full w-[52%]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-[52%] bg-[linear-gradient(90deg,#fff_0%,rgb(255_255_255/0.85)_18%,rgb(255_255_255/0)_50%)]"
      />
      <div className="relative z-10 flex max-w-[68%] flex-col items-start gap-1 px-4 py-4">
        <p className="text-primary-strong m-0 flex items-center gap-2 text-[14px] font-bold">
          <span className="bg-primary flex size-6 items-center justify-center rounded-full text-white">
            <SvgIcon name="star" size={14} />
          </span>
          {t("recommendedOffer")}
        </p>
        <h2 id="home-offer" className="m-0 mt-2 text-[15px] leading-snug font-bold">
          {offer.title}
        </h2>
        {meta && <p className="text-grey-800 m-0 text-[13px]">{meta}</p>}
        {summary && (
          <p className="text-grey-700 m-0 mt-1.5 line-clamp-2 max-w-[24ch] text-[13px]">
            {summary}
          </p>
        )}
        <div className="mt-1.5">
          <ArrowLink onClick={comingSoon}>{t("viewOffer")}</ArrowLink>
        </div>
      </div>
    </section>
  );
}
