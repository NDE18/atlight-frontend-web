import { describe, expect, it } from "vitest";
import { safeNextPath, withNext } from "./safe-next";

describe("safeNextPath", () => {
  it("garde un chemin interne avec sa requête et son ancre", () => {
    expect(safeNextPath("/p/post/42")).toBe("/p/post/42");
    expect(safeNextPath("/search?q=foot#top")).toBe("/search?q=foot#top");
  });

  it("refuse les URL externes et les chemins ambigus", () => {
    expect(safeNextPath("https://evil.example")).toBeNull();
    expect(safeNextPath("//evil.example")).toBeNull();
    expect(safeNextPath("/\\evil.example")).toBeNull();
    expect(safeNextPath("javascript:alert(1)")).toBeNull();
    expect(safeNextPath("")).toBeNull();
    expect(safeNextPath(null)).toBeNull();
  });

  it("refuse les pages d'authentification", () => {
    expect(safeNextPath("/login")).toBeNull();
    expect(safeNextPath("/register?step=2")).toBeNull();
    expect(safeNextPath("/forgot-password")).toBeNull();
    expect(safeNextPath("/loginx")).toBe("/loginx");
  });
});

describe("withNext", () => {
  it("encode le chemin de retour", () => {
    expect(withNext("/register", "/p/post/42?x=1")).toBe("/register?next=%2Fp%2Fpost%2F42%3Fx%3D1");
    expect(withNext("/register", "https://evil.example")).toBe("/register");
  });
});
