/** Types de réaction (ReactionType du mobile), valeurs envoyées par l'API. */
export const REACTION_TYPES = ["GOLD", "SILVER", "TROPHY", "GOAL", "WHISTLE", "STRONG"] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];

/** Post du fil (`/api/user/publication/feed`), mêmes champs que `Post.fromJson` du mobile. */
export interface PostDto {
  id: number | string;
  personId?: number | string | null;
  personName?: string | null;
  personAvatar?: string | null;
  personVerified?: boolean;
  personOpenToTryouts?: boolean;
  personRole?: string | null;
  personClub?: string | null;
  description?: string | null;
  mediaType?: string | null;
  images?: (string | null)[] | null;
  videoUrl?: string | null;
  coverUrl?: string | null;
  createdAt?: string | null;
  commentsCount?: number;
  repostsCount?: number;
  likesCount?: number;
  myReaction?: string | null;
  byType?: Partial<Record<string, number>> | null;
  hashtags?: string[] | null;
  isRepost?: boolean;
  actorName?: string | null;
  actorAvatar?: string | null;
  repostedAt?: string | null;
  repostComment?: string | null;
  isOrganization?: boolean;
  organismId?: number | null;
  organismName?: string | null;
  organismPicture?: string | null;
  jobOfferId?: number | null;
  jobTitle?: string | null;
}

/** Hashtag tendance des 7 derniers jours (`/feed/trending`). */
export interface TrendingHashtag {
  name: string;
  count?: number;
}

/** Story (`/api/stories/feed`), regroupée ensuite par auteur comme sur le mobile. */
export interface StoryDto {
  id: number;
  personId: number;
  personName?: string | null;
  personUsername?: string | null;
  personPicture?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  createdAt?: string | null;
  viewedByMe?: boolean;
}

export interface StoryGroup {
  personId: number;
  personName: string;
  personPicture: string | null;
  allViewed: boolean;
}
