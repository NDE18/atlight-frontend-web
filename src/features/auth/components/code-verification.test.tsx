import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import messages from "../../../../messages/fr.json";
import { CodeVerification } from "./code-verification";

function renderStep(props: Partial<Parameters<typeof CodeVerification>[0]> = {}) {
  const handlers = {
    onVerify: vi.fn().mockResolvedValue("ok"),
    onVerified: vi.fn(),
    onResend: vi.fn().mockResolvedValue(undefined),
  };
  render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <CodeVerification
        title="Vérifiez votre e-mail"
        email="awa@exemple.com"
        sentAt={Date.now()}
        {...handlers}
        {...props}
      />
    </NextIntlClientProvider>,
  );
  return { ...handlers, ...props };
}

const boxes = () => screen.getAllByRole("textbox", { name: /Chiffre \d sur 4/ });

describe("CodeVerification (AUTH-02)", () => {
  it("avance de case en case et valide automatiquement au 4e chiffre", async () => {
    const { onVerify } = renderStep();
    const user = userEvent.setup();
    await user.click(boxes()[0]);
    await user.keyboard("4721");
    expect(onVerify).toHaveBeenCalledWith("4721");
  });

  it("remplit les 4 cases quand on colle un code complet", async () => {
    const { onVerify } = renderStep();
    fireEvent.paste(screen.getByRole("group", { name: "Code à 4 chiffres" }), {
      clipboardData: { getData: () => "47 21" },
    });
    expect(boxes().map((b) => (b as HTMLInputElement).value)).toEqual(["4", "7", "2", "1"]);
    expect(onVerify).toHaveBeenCalledWith("4721");
  });

  it("code faux : message clair, cases vidées, focus sur la première", async () => {
    renderStep({ onVerify: vi.fn().mockResolvedValue("invalid") });
    const user = userEvent.setup();
    await user.click(boxes()[0]);
    await user.keyboard("0000");
    expect(await screen.findByText("Ce code est incorrect.")).toBeInTheDocument();
    await waitFor(() =>
      expect(boxes().every((b) => (b as HTMLInputElement).value === "")).toBe(true),
    );
    expect(boxes()[0]).toHaveFocus();
  });

  it("code expiré : propose d'en recevoir un nouveau", async () => {
    const onResend = vi.fn().mockResolvedValue(undefined);
    renderStep({ onVerify: vi.fn().mockResolvedValue("expired"), onResend });
    const user = userEvent.setup();
    await user.click(boxes()[0]);
    await user.keyboard("4721");
    expect(await screen.findByText("Ce code a expiré.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Recevoir un nouveau code" }));
    expect(onResend).toHaveBeenCalled();
  });

  it("« Renvoyer le code » n'est actif qu'après 45 s", () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      renderStep({ sentAt: Date.now() });
      expect(screen.getByRole("button", { name: /Renvoyer le code dans 0:4\d/ })).toBeDisabled();
      act(() => vi.advanceTimersByTime(46_000));
      expect(screen.getByRole("button", { name: "Renvoyer le code" })).toBeEnabled();
    } finally {
      vi.useRealTimers();
    }
  });
});
