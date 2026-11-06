import { describe, expect, it } from "vitest";
import { cleanUrl } from "./clean-url";

describe("cleanUrl", () => {
  it("traite '', 'null' et l'absence comme pas d'image", () => {
    expect(cleanUrl("")).toBeNull();
    expect(cleanUrl("null")).toBeNull();
    expect(cleanUrl(undefined)).toBeNull();
  });

  it("garde une URL valide", () => {
    expect(cleanUrl(" https://res.cloudinary.com/a.jpg ")).toBe("https://res.cloudinary.com/a.jpg");
  });
});
