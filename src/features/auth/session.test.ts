import { describe, expect, it } from "vitest";
import { initialsOf, toSessionUser } from "./session";
import { suggestUsername } from "./use-username-availability";

describe("toSessionUser", () => {
  it("reprend l'utilisateur et le profil de AuthenticationResponseDto", () => {
    expect(
      toSessionUser({
        user: { id: 3, username: "awa.diallo", role: "ATHLETE" },
        person: {
          id: 7,
          firstname: "Awa",
          lastname: "Diallo",
          sport: "Football",
          clubName: "Stade Lagune FC",
        },
      }),
    ).toMatchObject({
      userId: 3,
      personId: 7,
      username: "awa.diallo",
      role: "ATHLETE",
      firstname: "Awa",
      sport: "Football",
      clubName: "Stade Lagune FC",
    });
  });

  it("accepte un compte sans profil Person", () => {
    expect(
      toSessionUser({ user: { id: 3, username: "club", role: "ORGANISM" }, person: null }).personId,
    ).toBeNull();
  });
});

describe("initialsOf", () => {
  it("prend les initiales du prénom et du nom, sinon du nom d'utilisateur", () => {
    expect(initialsOf({ firstname: "Inès", lastname: "Kamga", username: "ines" })).toBe("IK");
    expect(initialsOf({ firstname: null, lastname: null, username: "ines" })).toBe("I");
  });
});

describe("suggestUsername", () => {
  it("ajoute ou incrémente un numéro", () => {
    expect(suggestUsername("awa.diallo")).toBe("awa.diallo1");
    expect(suggestUsername("awa9")).toBe("awa10");
  });
});
