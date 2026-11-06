"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { initialsFromName } from "@/features/auth/session";
import { roleLabelKey } from "@/features/auth/roles";
import { timeAgo } from "@/shared/utils/time-ago";
import { Avatar } from "@/shared/ui/avatar";
import { cardClass, useComingSoon } from "@/shared/ui/home-blocks";
import { SvgIcon, type SvgIconName } from "@/shared/ui/svg-icon";
import {
  cleanUrl,
  isCloudinary,
  postImages,
  splitPostText,
  topReactions,
  totalReactions,
} from "../format";
import type { PostDto, ReactionType } from "../types";

/** Icônes et couleurs des réactions (ReactionRow du mobile). */
const REACTION_LOOK: Record<ReactionType, { icon: SvgIconName; color: string }> = {
  GOLD: { icon: "emoji_events", color: "var(--color-reaction-gold)" },
  SILVER: { icon: "military_tech", color: "var(--color-reaction-silver)" },
  TROPHY: { icon: "military_tech", color: "var(--color-reaction-trophy)" },
  GOAL: { icon: "sport_football", color: "var(--color-reaction-goal)" },
  WHISTLE: { icon: "sports", color: "var(--color-reaction-whistle)" },
  STRONG: { icon: "fitness_center", color: "var(--color-reaction-strong)" },
};

interface PostCardProps {
  post: PostDto;
  /** Heure de chargement du fil : base des « il y a 12 min » (rendu pur). */
  now: number;
}

/** Carte de post (FEED-05) ; réagir, commenter, reposter et partager arrivent au lot 2. */
export function PostCard({ post, now }: PostCardProps) {
  const t = useTranslations();
  const comingSoon = useComingSoon();

  const isOrg = !!post.isOrganization && !!post.organismName;
  const name = (isOrg ? post.organismName : post.personName) ?? "";
  const avatar = cleanUrl(isOrg ? post.organismPicture : post.personAvatar);
  const roleKey = isOrg ? null : roleLabelKey(post.personRole ?? undefined);
  const roleLine = [
    roleKey ? t(roleKey) : null,
    !isOrg && post.personClub ? `@${post.personClub}` : null,
  ]
    .filter(Boolean)
    .join(" ");
  const ago = post.createdAt ? timeAgo(post.createdAt, new Date(now)) : null;
  const agoLabel = !ago
    ? null
    : ago.unit === "now"
      ? t("justNow")
      : t(`${ago.unit}Ago`, { count: ago.value });

  const images = postImages(post).filter(isCloudinary);
  const video = post.mediaType?.toUpperCase() === "VIDEO" ? cleanUrl(post.videoUrl) : null;
  const reactions = topReactions(post);
  const total = totalReactions(post);
  const text = post.description?.trim() ?? "";

  const action = (icon: SvgIconName, label: string, accent = false) => (
    <button
      type="button"
      onClick={comingSoon}
      className={`hover:bg-grey-100 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-1 text-[13px] font-medium transition-colors ${
        accent ? "text-primary-strong font-bold" : "text-grey-800"
      }`}
    >
      <SvgIcon name={icon} size={22} />
      <span className="max-[420px]:sr-only">{label}</span>
    </button>
  );

  return (
    <article className={`${cardClass} overflow-hidden`}>
      {post.isRepost && post.actorName && (
        <div className="border-grey-200 tablet:px-5 flex flex-col gap-1 border-b px-4 py-2.5">
          <p className="text-grey-700 m-0 flex items-center gap-1.5 text-[12px]">
            <SvgIcon name="repeat" size={18} />
            <strong className="text-grey-900">{post.actorName}</strong> {t("reposted")}
          </p>
          {post.repostComment && <p className="m-0 text-[13px]">{post.repostComment}</p>}
        </div>
      )}

      <header className="tablet:px-5 flex items-start gap-3 px-4 pt-3.5">
        <Avatar
          initials={initialsFromName(name)}
          picture={avatar}
          size={48}
          openToTryouts={!isOrg && !!post.personOpenToTryouts}
        />
        <div className="min-w-0 flex-1">
          <p className="m-0 flex items-center gap-1.5 text-[15px] leading-snug font-bold">
            <span className="truncate">{name}</span>
            {!isOrg && post.personVerified && (
              <SvgIcon
                name="verified"
                size={18}
                className="text-primary"
                label={t("verifiedProfile")}
              />
            )}
          </p>
          <p className="text-grey-700 m-0 flex flex-wrap items-center gap-x-1.5 text-[12px]">
            {roleLine && <span>{roleLine}</span>}
            {roleLine && agoLabel && <span aria-hidden>·</span>}
            {agoLabel && <span>{agoLabel}</span>}
            <span aria-hidden>·</span>
            <SvgIcon name="public" size={15} label={t("visibilityPublic")} />
          </p>
        </div>
        <button
          type="button"
          onClick={comingSoon}
          aria-label={t("postMoreActions")}
          className="text-grey-700 hover:bg-grey-100 -mt-1 -mr-2 flex size-10 flex-none items-center justify-center rounded-full"
        >
          <SvgIcon name="more_horiz" size={24} />
        </button>
      </header>

      {text && (
        <p className="tablet:px-5 m-0 px-4 pt-2 text-[14px] leading-normal [overflow-wrap:anywhere] whitespace-pre-line">
          {splitPostText(text).map((segment, i) =>
            segment.kind === "text" ? (
              segment.value
            ) : (
              <button
                key={i}
                type="button"
                onClick={comingSoon}
                className="text-primary-strong font-medium hover:underline"
              >
                {segment.value}
              </button>
            ),
          )}
        </p>
      )}

      {video ? (
        <div className="tablet:px-4 mt-3">
          <video
            controls
            preload="metadata"
            poster={isCloudinary(post.coverUrl) ? post.coverUrl : undefined}
            className="tablet:rounded-xl aspect-video w-full bg-black"
          >
            <source src={video} />
          </video>
        </div>
      ) : images.length === 1 ? (
        <div className="tablet:mx-4 tablet:rounded-xl relative mt-2.5 aspect-[16/9] overflow-hidden min-[1280px]:aspect-[22/5]">
          {/* 16/9 comme le mobile ; bandeau panoramique de la maquette en trois colonnes. */}
          <Image
            src={images[0]}
            alt=""
            fill
            sizes="(min-width: 1100px) 640px, 100vw"
            className="object-cover object-[center_30%]"
          />
        </div>
      ) : images.length > 1 ? (
        <div className="tablet:mx-4 tablet:rounded-xl mt-3 grid grid-cols-2 gap-1 overflow-hidden">
          {images.slice(0, 4).map((src, i) => (
            <div key={src} className="bg-grey-100 relative aspect-square">
              <Image
                src={src}
                alt=""
                fill
                sizes="(min-width: 1100px) 320px, 50vw"
                className="object-cover"
              />
              {i === 3 && images.length > 4 && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-2xl font-bold text-white">
                  +{images.length - 4}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {post.jobTitle && (
        <button
          type="button"
          onClick={comingSoon}
          className="bg-code-bg text-primary-dark tablet:mx-4 mx-4 mt-2 flex w-[calc(100%-2rem)] items-center gap-2 rounded-lg px-4 py-2 text-left text-[12px] font-bold hover:bg-[#D5EEE7]"
        >
          <SvgIcon name="work" size={20} className="text-primary" label={t("linkedJobOffer")} />
          <span className="truncate">{post.jobTitle}</span>
        </button>
      )}

      <div className="text-grey-700 tablet:mx-5 mx-4 mt-3 flex flex-wrap items-center gap-2 text-[12px]">
        {reactions.length > 0 && (
          <span className="flex" aria-hidden>
            {reactions.map((type) => (
              <SvgIcon
                key={type}
                name={REACTION_LOOK[type].icon}
                size={22}
                style={{ color: REACTION_LOOK[type].color }}
                className="-ml-0.5 first:ml-0"
              />
            ))}
          </span>
        )}
        <span>
          {t("postReactionsCount", { count: total })} ·{" "}
          {t("postCommentsCount", { count: post.commentsCount ?? 0 })} ·{" "}
          {t("postRepostsCount", { count: post.repostsCount ?? 0 })}
        </span>
      </div>

      <div className="divide-grey-200 border-grey-200 tablet:mx-4 mx-3 mt-3 grid grid-cols-4 divide-x border-t py-1.5">
        <div className="px-1">{action("thumb_up", t("reactAction"), true)}</div>
        <div className="px-1">{action("chat_bubble_outline", t("comment"))}</div>
        <div className="px-1">{action("repeat", t("repost"))}</div>
        <div className="px-1">{action("share", t("shareAction"))}</div>
      </div>
    </article>
  );
}
