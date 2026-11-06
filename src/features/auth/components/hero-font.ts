import { Roboto } from "next/font/google";

/** Roboto Black Italic du titre du panneau : chargée seulement sur les écrans d'authentification. */
export const heroFont = Roboto({
  subsets: ["latin"],
  weight: "900",
  style: "italic",
  display: "swap",
  preload: false,
});
