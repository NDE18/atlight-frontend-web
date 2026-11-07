import { describe, expect, it } from "vitest";
import { emptyDigits, formatSeconds, pasteDigits, typeIntoDigit } from "./code-digits";

describe("typeIntoDigit", () => {
  it("passe à la case suivante après un chiffre", () => {
    expect(typeIntoDigit(emptyDigits(), 0, "4")).toEqual({ digits: ["4", "", "", ""], focus: 1 });
  });

  it("ignore ce qui n'est pas un chiffre", () => {
    expect(typeIntoDigit(["4", "", "", ""], 1, "a")).toEqual({
      digits: ["4", "", "", ""],
      focus: null,
    });
  });

  it("remplace le chiffre déjà présent dans la case", () => {
    expect(typeIntoDigit(["4", "7", "", ""], 1, "79")).toEqual({
      digits: ["4", "9", "", ""],
      focus: 2,
    });
    expect(typeIntoDigit(["4", "7", "", ""], 1, "37")).toEqual({
      digits: ["4", "3", "", ""],
      focus: 2,
    });
  });

  it("revient à la case précédente quand on vide une case", () => {
    expect(typeIntoDigit(["4", "7", "", ""], 1, "")).toEqual({
      digits: ["4", "", "", ""],
      focus: 0,
    });
  });

  it("répartit un code saisi d'un coup (saisie automatique)", () => {
    expect(typeIntoDigit(emptyDigits(), 0, "4721")).toEqual({
      digits: ["4", "7", "2", "1"],
      focus: 3,
    });
    expect(typeIntoDigit(["4", "", "", ""], 1, "72")).toEqual({
      digits: ["4", "7", "2", ""],
      focus: 3,
    });
  });

  it("saute à la première case vide suivante", () => {
    expect(typeIntoDigit(["", "7", "", ""], 0, "4")).toEqual({
      digits: ["4", "7", "", ""],
      focus: 2,
    });
  });

  it("reste sur la dernière case une fois le code complet", () => {
    expect(typeIntoDigit(["4", "7", "2", ""], 3, "1").focus).toBeNull();
  });
});

describe("pasteDigits", () => {
  it("remplit les quatre cases depuis un code collé", () => {
    expect(pasteDigits(" 47-21 ")).toEqual(["4", "7", "2", "1"]);
    expect(pasteDigits("472199")).toEqual(["4", "7", "2", "1"]);
    expect(pasteDigits("abc")).toBeNull();
  });
});

describe("formatSeconds", () => {
  it("formate les comptes à rebours", () => {
    expect(formatSeconds(45)).toBe("0:45");
    expect(formatSeconds(600, true)).toBe("10:00");
    expect(formatSeconds(59.2, true)).toBe("01:00");
    expect(formatSeconds(-3)).toBe("0:00");
  });
});
