"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, type FormEvent, type Ref } from "react";
import { ApiError } from "@/shared/api/client";
import { refreshNow, useNow } from "@/shared/hooks/use-now";
import { emptyDigits, formatSeconds } from "../code-digits";
import { technicalErrorKey } from "../errors";
import type { CodeCheckResult } from "../types";
import {
  CODE_LENGTH,
  CODE_VALIDITY_SECONDS,
  EMAIL_PATTERN,
  RESEND_DELAY_SECONDS,
  isCompleteCode,
} from "../validation";
import { CodeInput, type CodeInputState } from "./code-input";
import {
  FieldError,
  FormAlert,
  PrimaryButton,
  Spinner,
  StepHeading,
  inputClass,
  linkClass,
} from "./form-controls";

/** Levée par `onChangeEmail` quand le backend refuse la nouvelle adresse. */
export class EmailChangeRejectedError extends Error {}

interface CodeVerificationProps {
  title: string;
  email: string;
  /** Envoi du dernier code (ms) : base des comptes à rebours de validité et de renvoi. */
  sentAt: number;
  verifyLabel?: string;
  titleRef?: Ref<HTMLHeadingElement>;
  /** Vérifie le code ; une erreur levée est traitée comme une panne réseau ou serveur. */
  onVerify: (code: string) => Promise<CodeCheckResult>;
  /** Appelé après la courte animation de succès. */
  onVerified: () => void;
  /** Demande un nouveau code ; doit lever une erreur en cas d'échec. */
  onResend: () => Promise<void>;
  /** Inscription : nouvelle adresse saisie sur place, un nouveau code y est envoyé. */
  onChangeEmail?: (email: string) => Promise<void>;
  /** Mot de passe oublié : « Modifier l'e-mail » ramène à la saisie de l'adresse. */
  onEditEmail?: () => void;
}

type Status = "input" | "verifying" | "ok" | "error" | "expired";

/**
 * Saisie d'un code e-mail à 4 chiffres (AUTH-02, AUTH-04) : validité de 10 minutes affichée,
 * renvoi après 45 s, code faux ou expiré expliqué sans bloquer le compte.
 */
export function CodeVerification({
  title,
  email,
  sentAt,
  verifyLabel,
  titleRef,
  onVerify,
  onVerified,
  onResend,
  onChangeEmail,
  onEditEmail,
}: CodeVerificationProps) {
  const t = useTranslations();
  const now = useNow();
  const ids = useId();
  const [digits, setDigits] = useState(emptyDigits);
  const [status, setStatus] = useState<Status>("input");
  const [shake, setShake] = useState(false);
  const [tried, setTried] = useState(false);
  const [focusSignal, setFocusSignal] = useState(0);
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [draftError, setDraftError] = useState<string | null>(null);
  const [changing, setChanging] = useState(false);
  const newCodeButton = useRef<HTMLButtonElement>(null);

  const elapsed = now ? Math.max(0, (now - sentAt) / 1000) : 0;
  const secondsLeft = Math.max(0, CODE_VALIDITY_SECONDS - elapsed);
  const cooldown = Math.max(0, RESEND_DELAY_SECONDS - elapsed);
  const expired = status === "expired" || (now > 0 && secondsLeft <= 0 && status !== "ok");
  const busy = status === "verifying" || status === "ok";

  useEffect(() => {
    if (expired) newCodeButton.current?.focus();
  }, [expired]);

  const restart = () => {
    refreshNow();
    setStatus("input");
    setDigits(emptyDigits());
    setTried(false);
    setResent(true);
    setFocusSignal((n) => n + 1);
  };

  const verify = async (code: string) => {
    if (busy || expired) return;
    setStatus("verifying");
    setErrorKey(null);
    setResent(false);
    setTried(false);
    try {
      const result = await onVerify(code);
      if (result === "ok") {
        setStatus("ok");
        window.setTimeout(onVerified, 700);
      } else if (result === "expired") {
        setStatus("expired");
      } else {
        // Code faux : message sous les cases, cases vidées, focus sur la première.
        setStatus("error");
        setShake(true);
        window.setTimeout(() => {
          setShake(false);
          setDigits(emptyDigits());
          setFocusSignal((n) => n + 1);
        }, 450);
      }
    } catch (error) {
      setStatus("input");
      setErrorKey(technicalErrorKey(error));
    }
  };

  const onDigitsChange = (next: string[]) => {
    setDigits(next);
    setTried(false);
    if (status === "error") setStatus("input");
    if (isCompleteCode(next)) void verify(next.join(""));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isCompleteCode(digits)) {
      setTried(true);
      return;
    }
    void verify(digits.join(""));
  };

  const resend = async () => {
    if (resending) return;
    setResending(true);
    setErrorKey(null);
    try {
      await onResend();
      restart();
    } catch (error) {
      setErrorKey(
        error instanceof ApiError && error.status === 429
          ? "authTooManyAttempts"
          : "codeResendError",
      );
    } finally {
      setResending(false);
    }
  };

  const startEdit = () => {
    if (onEditEmail) {
      onEditEmail();
      return;
    }
    setDraft(email);
    setDraftError(null);
    setEditing(true);
  };

  const saveEmail = async () => {
    const value = draft.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setDraftError("emailInvalid");
      return;
    }
    if (!onChangeEmail || changing) return;
    setChanging(true);
    setDraftError(null);
    try {
      await onChangeEmail(value);
      setEditing(false);
      restart();
    } catch (error) {
      setDraftError(
        error instanceof EmailChangeRejectedError ? "emailChangeError" : technicalErrorKey(error),
      );
    } finally {
      setChanging(false);
    }
  };

  const inputState: CodeInputState = expired
    ? "expired"
    : status === "verifying"
      ? "input"
      : status === "input"
        ? "input"
        : status;
  const low = secondsLeft <= 60;
  const buttonLabel =
    status === "verifying"
      ? t("verifying")
      : status === "ok"
        ? t("codeConfirmed")
        : tried
          ? t("enterAllDigits", { total: CODE_LENGTH })
          : (verifyLabel ?? t("verifyAction"));

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-[18px]">
      <StepHeading
        title={title}
        titleRef={titleRef}
        lead={
          <>
            {t.rich("codeSentTo", {
              total: CODE_LENGTH,
              email,
              strong: (chunks) => (
                <strong className="text-grey-900 font-bold [overflow-wrap:anywhere]">
                  {chunks}
                </strong>
              ),
            })}{" "}
            {!editing && (onChangeEmail || onEditEmail) && (
              <button type="button" onClick={startEdit} className={`${linkClass} text-[15px]`}>
                {t("changeEmailAction")}
              </button>
            )}
          </>
        }
      />

      {editing && (
        <div className="animate-rise-fast flex flex-wrap items-start gap-2">
          <label htmlFor={`${ids}-email`} className="sr-only">
            {t("newEmail")}
          </label>
          <input
            id={`${ids}-email`}
            type="email"
            autoComplete="email"
            autoFocus
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setDraftError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void saveEmail();
              } else if (event.key === "Escape") {
                setEditing(false);
              }
            }}
            aria-invalid={draftError ? true : undefined}
            aria-describedby={draftError ? `${ids}-email-error` : undefined}
            className={`${inputClass} h-[46px] flex-[1_1_200px]`}
          />
          <button
            type="button"
            onClick={() => void saveEmail()}
            aria-busy={changing || undefined}
            className="border-primary-strong text-primary-strong hover:bg-third flex h-[46px] items-center gap-2 rounded-[10px] border-[1.5px] bg-white px-[15px] text-[15px] font-bold transition-colors aria-busy:pointer-events-none"
          >
            {changing && <Spinner className="border-primary/30 border-t-primary" />}
            {t("sendCode")}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-grey-700 hover:text-grey-900 h-[46px] px-2 text-[15px] font-medium"
          >
            {t("cancel")}
          </button>
          {draftError && (
            <div className="basis-full">
              <FieldError id={`${ids}-email-error`} message={t(draftError)} />
            </div>
          )}
        </div>
      )}

      <CodeInput
        digits={digits}
        onChange={onDigitsChange}
        state={inputState}
        disabled={busy || expired}
        shake={shake}
        focusSignal={focusSignal}
      />

      {status === "error" && (
        <FormAlert tone="error" title={t("codeIncorrectTitle")}>
          {t("codeIncorrectBody")}
        </FormAlert>
      )}
      {expired && (
        <FormAlert tone="warn" title={t("codeExpiredTitle")}>
          {t("codeExpiredBody")}
        </FormAlert>
      )}
      {resent && !expired && status !== "error" && (
        <FormAlert tone="success">{t("codeResentTo", { email })}</FormAlert>
      )}
      {errorKey && <FormAlert tone="error">{t(errorKey)}</FormAlert>}

      {!expired && status !== "ok" && (
        <div className="flex flex-col gap-[7px]">
          <div className="text-grey-700 flex items-center justify-between gap-2.5 text-sm">
            <span>{t("codeExpiresIn")}</span>
            <strong
              data-low={low}
              className="text-grey-900 data-[low=true]:text-warn-strong tabular-nums"
            >
              {formatSeconds(secondsLeft, true)}
            </strong>
          </div>
          <div aria-hidden className="bg-grey-200 h-[5px] overflow-hidden rounded-[3px]">
            <div
              data-low={low}
              className="bg-primary data-[low=true]:bg-warn h-full rounded-[3px] transition-[width] duration-1000 ease-linear"
              style={{ width: `${(secondsLeft / CODE_VALIDITY_SECONDS) * 100}%` }}
            />
          </div>
        </div>
      )}

      {expired ? (
        <PrimaryButton
          ref={newCodeButton}
          type="button"
          busy={resending}
          onClick={() => void resend()}
        >
          {t("getNewCode")}
        </PrimaryButton>
      ) : (
        <>
          <PrimaryButton busy={status === "verifying"} inactive={!isCompleteCode(digits) && !busy}>
            {buttonLabel}
          </PrimaryButton>
          <div className="text-grey-700 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-sm">
            <span>{t("noCodeReceived")}</span>
            <button
              type="button"
              onClick={() => void resend()}
              disabled={cooldown > 0 || resending || busy}
              className="text-primary-strong enabled:hover:text-primary-dark disabled:text-grey-700 min-h-10 px-0.5 text-sm font-bold tabular-nums enabled:hover:underline disabled:cursor-default disabled:font-medium"
            >
              {cooldown > 0
                ? t("resendCodeIn", { time: formatSeconds(cooldown) })
                : t("resendCode")}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
