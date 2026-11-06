import type { PostDto, StoryDto, StoryGroup } from "./types";
import { REACTION_TYPES, type ReactionType } from "./types";

/** URL venue de l'API : '' ou 'null' → null (`_cleanUrl` du mobile). */
export function cleanUrl(value: string | null | undefined): string | null {
  const url = value?.trim();
  return url && url !== "null" ? url : null;
}

/** Seules les images Cloudinary passent par next/image (et la CSP). */
export function isCloudinary(url: string | null | undefined): url is string {
  return !!url && url.startsWith("https://res.cloudinary.com/");
}

/** Stories regroupées par auteur : les miennes d'abord, puis non vues, puis vues (mobile). */
export function groupStories(stories: StoryDto[], myPersonId: number | null): StoryGroup[] {
  const byPerson = new Map<number, StoryDto[]>();
  for (const story of stories) {
    byPerson.set(story.personId, [...(byPerson.get(story.personId) ?? []), story]);
  }
  const groups = [...byPerson.values()].map((list) => ({
    personId: list[0].personId,
    personName: list[0].personName ?? "",
    personPicture: cleanUrl(list[0].personPicture),
    allViewed: list.every((s) => s.viewedByMe),
  }));
  return groups.sort((a, b) => {
    if (a.personId === myPersonId) return -1;
    if (b.personId === myPersonId) return 1;
    return Number(a.allViewed) - Number(b.allViewed);
  });
}

export type TextSegment = { kind: "text" | "hashtag" | "mention"; value: string };

/** Découpe le texte d'un post : #hashtags et @mentions sont cliquables (FEED-05). */
export function splitPostText(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const pattern = /([#@][\p{L}\p{N}_.]+)/gu;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    // Un # ou @ collé à un mot (ex. une adresse e-mail) n'est pas un lien.
    if (index > 0 && /[\p{L}\p{N}]/u.test(text[index - 1])) continue;
    const value = match[0].replace(/\.+$/, "");
    // « #… » sans nom (que des points) reste du texte.
    if (value.length < 2) continue;
    if (index > last) segments.push({ kind: "text", value: text.slice(last, index) });
    segments.push({ kind: value.startsWith("#") ? "hashtag" : "mention", value });
    last = index + value.length;
  }
  if (last < text.length) segments.push({ kind: "text", value: text.slice(last) });
  return segments;
}

/** Réactions les plus fréquentes du post (3 au plus, comme la carte du mobile). */
export function topReactions(post: PostDto): ReactionType[] {
  const counts = post.byType ?? {};
  return REACTION_TYPES.filter((type) => (counts[type] ?? 0) > 0)
    .sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0))
    .slice(0, 3);
}

export function totalReactions(post: PostDto): number {
  const counts = Object.values(post.byType ?? {}).reduce<number>((sum, n) => sum + (n ?? 0), 0);
  return counts || post.likesCount || 0;
}

/** Images affichables du post (vidéos et valeurs vides écartées). */
export function postImages(post: PostDto): string[] {
  return (post.images ?? [])
    .map((url) => cleanUrl(url))
    .filter((url): url is string => !!url && !/\.(mp4|mov|webm|m3u8)(\?|$)/i.test(url));
}
