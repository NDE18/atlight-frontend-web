import { describe, expect, it } from "vitest";
import { timeAgo } from "./time-ago";

const now = new Date("2026-11-06T12:00:00Z");
const ago = (ms: number) => new Date(now.getTime() - ms);

describe("timeAgo (paliers du mobile)", () => {
  it("renvoie « à l'instant » sous une minute", () => {
    expect(timeAgo(ago(30_000), now)).toEqual({ unit: "now" });
  });

  it("compte minutes, heures puis jours", () => {
    expect(timeAgo(ago(5 * 60_000), now)).toEqual({ unit: "minutes", value: 5 });
    expect(timeAgo(ago(3 * 3_600_000), now)).toEqual({ unit: "hours", value: 3 });
    expect(timeAgo(ago(7 * 86_400_000), now)).toEqual({ unit: "days", value: 7 });
  });

  it("passe aux semaines au-delà de 7 jours", () => {
    expect(timeAgo(ago(15 * 86_400_000), now)).toEqual({ unit: "weeks", value: 2 });
  });
});
