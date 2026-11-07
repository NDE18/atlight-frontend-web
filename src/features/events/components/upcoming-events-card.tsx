"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLink, cardClass, SectionError, useComingSoon } from "@/shared/ui/home-blocks";
import { EventArt } from "@/shared/ui/illustrations";
import { upcomingEventsQuery } from "../api";

/** Deux prochains événements (EVT-01), date et heure dans le fuseau du navigateur (EVT-02). */
export function UpcomingEventsCard() {
  const t = useTranslations();
  const locale = useLocale();
  const comingSoon = useComingSoon();
  const { data, isError, refetch } = useQuery(upcomingEventsQuery());
  const events = (data ?? []).slice(0, 2);

  // Formats créés ici (rendu client) : sans fuseau imposé, Intl prend celui du navigateur.
  const day = new Intl.DateTimeFormat(locale, { day: "numeric" });
  const month = new Intl.DateTimeFormat(locale, { month: "short" });
  const time = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
  // Usage typographique français (« 14 h 00 »), comme sur la maquette.
  const clock = (date: Date) => {
    const parts = time.formatToParts(date);
    const hour = parts.find((p) => p.type === "hour")?.value;
    const minute = parts.find((p) => p.type === "minute")?.value;
    return locale.startsWith("fr") && hour && minute ? `${hour} h ${minute}` : time.format(date);
  };

  return (
    <section aria-labelledby="home-events" className={`${cardClass} px-4 py-3.5`}>
      <div className="flex items-center justify-between gap-3">
        <h2 id="home-events" className="m-0 text-[15px] font-bold">
          {t("upcomingEvents")}
        </h2>
        <ArrowLink onClick={comingSoon}>{t("seeAll")}</ArrowLink>
      </div>
      {isError ? (
        <div className="mt-2">
          <SectionError message={t("sectionLoadError")} onRetry={() => void refetch()} />
        </div>
      ) : events.length === 0 ? (
        <p className="text-grey-700 m-0 mt-3 text-[13px]">{t("noEventsYet")}</p>
      ) : (
        <ul className="divide-grey-200 m-0 mt-1 list-none divide-y p-0">
          {events.map((event) => {
            const start = new Date(event.startAt);
            const place = [event.location, clock(start)].filter(Boolean).join(" · ");
            return (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={comingSoon}
                  className="flex w-full items-center gap-3 py-2.5 text-left"
                >
                  <span className="bg-code-bg text-primary-strong flex size-14 flex-none flex-col items-center justify-center rounded-xl leading-none">
                    <span className="text-[22px] font-bold">{day.format(start)}</span>
                    <span className="mt-1 text-[12px] font-bold uppercase">
                      {month.format(start)}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 block text-[14px] leading-snug font-bold">
                      {event.title}
                    </span>
                    {place && (
                      <span className="text-grey-700 mt-0.5 block truncate text-[12px]">
                        {place}
                      </span>
                    )}
                  </span>
                  <EventArt type={event.type} className="h-[60px] w-[84px] flex-none rounded-lg" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
