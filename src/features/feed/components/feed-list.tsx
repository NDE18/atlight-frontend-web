"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { cardClass, SectionError, Skeleton } from "@/shared/ui/home-blocks";
import { feedQuery } from "../api";
import { PostCard } from "./post-card";

/** Fil classé (FORYOU), première page ; défilement infini, réactions et commentaires au lot 2. */
export function FeedList() {
  const t = useTranslations();
  const { data, dataUpdatedAt, isPending, isError, refetch } = useQuery(feedQuery());

  if (isPending) {
    return (
      <div className="flex flex-col gap-4" aria-busy>
        {[0, 1].map((i) => (
          <div key={i} className={`${cardClass} flex flex-col gap-3 p-5`}>
            <div className="flex items-center gap-3">
              <Skeleton className="size-14 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3.5 w-2/5" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
            <Skeleton className="h-3.5 w-11/12" />
            <Skeleton className="aspect-[16/9] w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`${cardClass} px-5 py-4`}>
        <SectionError message={t("feedLoadError")} onRetry={() => void refetch()} />
      </div>
    );
  }

  if (!data.length) {
    return (
      <p className={`${cardClass} text-grey-700 m-0 px-5 py-8 text-center text-[13px]`}>
        {t("noPostsYet")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {data.map((post) => (
        <PostCard key={`${post.id}-${post.isRepost ? "r" : "p"}`} post={post} now={dataUpdatedAt} />
      ))}
    </div>
  );
}
