import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Providers } from "./providers";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SHARE_BASE_URL ?? "https://atlight.fr"),
  title: { default: "Atlight", template: "%s · Atlight" },
  description: "Connect. Share. Grow.",
  // Icônes : fichiers favicon.ico, icon.png et apple-icon.png de src/app (logo Atlight).
  // Espace connecté non indexé ; les pages publiques /p/* rétablissent l'indexation.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#009970",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${roboto.variable} h-full`}>
      <body className="min-h-full">
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
