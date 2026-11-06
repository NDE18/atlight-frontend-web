import type { Metadata } from "next";

// Pages publiques /p/* rendues côté serveur : indexables, avec balises Open Graph (PUB-01).
export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
