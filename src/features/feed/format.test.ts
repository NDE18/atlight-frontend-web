import { describe, expect, it } from "vitest";
import {
  cleanUrl,
  groupStories,
  isCloudinary,
  postImages,
  splitPostText,
  topReactions,
  totalReactions,
} from "./format";
import type { StoryDto } from "./types";

describe("splitPostText", () => {
  it("isole les hashtags et les mentions", () => {
    expect(splitPostText("Bravo @awa.diallo pour le #Football !")).toEqual([
      { kind: "text", value: "Bravo " },
      { kind: "mention", value: "@awa.diallo" },
      { kind: "text", value: " pour le " },
      { kind: "hashtag", value: "#Football" },
      { kind: "text", value: " !" },
    ]);
  });

  it("laisse le point final hors du lien", () => {
    expect(splitPostText("Merci @club.")).toEqual([
      { kind: "text", value: "Merci " },
      { kind: "mention", value: "@club" },
      { kind: "text", value: "." },
    ]);
  });

  it("ne fait pas un lien d'une adresse e-mail ni d'un # sans nom", () => {
    expect(splitPostText("contact@atlight.fr")).toEqual([
      { kind: "text", value: "contact@atlight.fr" },
    ]);
    expect(splitPostText("Numéro #...")).toEqual([{ kind: "text", value: "Numéro #..." }]);
  });

  it("accepte les lettres accentuées", () => {
    expect(splitPostText("#Équipe")).toEqual([{ kind: "hashtag", value: "#Équipe" }]);
  });
});

describe("groupStories", () => {
  const story = (id: number, personId: number, viewedByMe: boolean): StoryDto => ({
    id,
    personId,
    personName: `P${personId}`,
    personPicture: "null",
    viewedByMe,
  });

  it("regroupe par auteur : les miennes, puis non vues, puis vues", () => {
    const groups = groupStories(
      [story(1, 2, true), story(2, 3, false), story(3, 7, true), story(4, 2, true)],
      7,
    );
    expect(groups.map((g) => [g.personId, g.allViewed])).toEqual([
      [7, true],
      [3, false],
      [2, true],
    ]);
    expect(groups[0].personPicture).toBeNull();
  });

  it("un groupe reste non vu tant qu'une story ne l'est pas", () => {
    expect(groupStories([story(1, 2, true), story(2, 2, false)], null)[0].allViewed).toBe(false);
  });
});

describe("réactions", () => {
  it("garde les trois plus fréquentes", () => {
    const post = { id: 1, byType: { GOLD: 2, GOAL: 9, STRONG: 4, WHISTLE: 1 } };
    expect(topReactions(post)).toEqual(["GOAL", "STRONG", "GOLD"]);
    expect(totalReactions(post)).toBe(16);
  });

  it("retombe sur likesCount sans détail par type", () => {
    expect(totalReactions({ id: 1, likesCount: 5 })).toBe(5);
    expect(totalReactions({ id: 1 })).toBe(0);
  });
});

describe("URL des médias", () => {
  it("écarte les valeurs vides et les vidéos", () => {
    expect(cleanUrl(" null ")).toBeNull();
    expect(
      postImages({
        id: 1,
        images: ["https://res.cloudinary.com/a.jpg", "", null, "https://res.cloudinary.com/b.mp4"],
      }),
    ).toEqual(["https://res.cloudinary.com/a.jpg"]);
  });

  it("ne laisse passer que Cloudinary vers next/image", () => {
    expect(isCloudinary("https://res.cloudinary.com/demo/x.png")).toBe(true);
    expect(isCloudinary("https://exemple.com/x.png")).toBe(false);
    expect(isCloudinary(null)).toBe(false);
  });
});
