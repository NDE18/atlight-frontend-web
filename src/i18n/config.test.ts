import { describe, expect, it } from "vitest";
import { negotiateLocale } from "./config";
import { arbToMessages, diffKeys } from "../../scripts/arb-to-json.mjs";

describe("negotiateLocale", () => {
  it("choisit la première langue supportée selon q", () => {
    expect(negotiateLocale("de-DE,en;q=0.8,fr;q=0.9")).toBe("fr");
    expect(negotiateLocale("en-US,en;q=0.9")).toBe("en");
  });

  it("retombe sur le français", () => {
    expect(negotiateLocale(null)).toBe("fr");
    expect(negotiateLocale("de,es")).toBe("fr");
  });
});

describe("conversion ARB", () => {
  it("retire les métadonnées et garde la syntaxe ICU", () => {
    const messages = arbToMessages({
      "@@locale": "fr",
      groupMembers: "{count, plural, =1{1 membre} other{{count} membres}}",
      "@groupMembers": { placeholders: { count: {} } },
    });
    expect(messages).toEqual({
      groupMembers: "{count, plural, =1{1 membre} other{{count} membres}}",
    });
  });

  it("détecte les clés manquantes", () => {
    expect(diffKeys({ a: "1", b: "2" }, { a: "1" })).toEqual(["b"]);
  });
});
