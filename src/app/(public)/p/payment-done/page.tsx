import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false } };

// Retour CinetPay après un paiement Mobile Money, web ou mobile (PUB-05, lot 4 bis).
// Écran provisoire : le suivi du statut (toutes les 4 s, 5 min max) arrive au lot 6.
export default function PaymentDonePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center p-4 text-center">
      <h1 className="text-primary text-2xl font-bold">atlight</h1>
    </main>
  );
}
