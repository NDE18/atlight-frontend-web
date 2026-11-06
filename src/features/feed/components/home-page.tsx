"use client";

import { UpcomingEventsCard } from "@/features/events/components/upcoming-events-card";
import { RecommendedOfferCard } from "@/features/jobs/components/recommended-offer-card";
import { SuggestionsCard } from "@/features/network/components/suggestions-card";
import { PAGE_FRAME, PAGE_GUTTER, SIDE_COLUMN } from "@/features/shell/layout";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { cardClass, Skeleton } from "@/shared/ui/home-blocks";
import { useSessionStore } from "@/stores/session";
import { ComposerCard } from "./composer-card";
import { FeedList } from "./feed-list";
import { TrendsCard } from "./trends-card";
import { WelcomeCard } from "./welcome-card";

/**
 * Accueil (maquette Accueil2) : bannière et stories, tendances, publication, fil ; à droite,
 * suggestions, offre recommandée et événements. Contenus lus dans l'API comme le mobile ;
 * les actions des lots suivants annoncent « Bientôt disponible sur le web ».
 */
export function HomePage() {
  const hydrated = useHydrated();
  const user = useSessionStore((s) => s.user);

  return (
    <div className={`${PAGE_GUTTER} py-3`}>
      <div className={`${PAGE_FRAME} ${SIDE_COLUMN} grid gap-4`}>
        {hydrated && user ? (
          <>
            <div className="flex min-w-0 flex-col gap-3">
              <WelcomeCard user={user} />
              <TrendsCard />
              <ComposerCard user={user} />
              <FeedList />
            </div>
            <aside className="hidden min-w-0 flex-col gap-4 self-start min-[1280px]:flex">
              <SuggestionsCard username={user.username} />
              <RecommendedOfferCard />
              <UpcomingEventsCard />
            </aside>
          </>
        ) : (
          <div className={`${cardClass} flex flex-col gap-3 p-5`} aria-busy>
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}
      </div>
    </div>
  );
}
