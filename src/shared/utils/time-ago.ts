export type TimeAgo =
  { unit: "now" } | { unit: "minutes" | "hours" | "days" | "weeks"; value: number };

/**
 * Même paliers que time_ago.dart / NotificationModel.timeAgo du mobile :
 * à l'instant, minutes, heures, jours (jusqu'à 7), puis semaines.
 * Le libellé se construit avec les clés justNow / minutesAgo / hoursAgo / daysAgo / weeksAgo.
 */
export function timeAgo(date: Date | string, now: Date = new Date()): TimeAgo {
  const diffMs = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) return { unit: "weeks", value: Math.floor(days / 7) };
  if (days > 0) return { unit: "days", value: days };
  if (hours > 0) return { unit: "hours", value: hours };
  if (minutes > 0) return { unit: "minutes", value: minutes };
  return { unit: "now" };
}
