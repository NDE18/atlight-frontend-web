"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type Ref } from "react";
import { useForm, useWatch } from "react-hook-form";
import { withNext } from "@/shared/utils/safe-next";
import { SvgIcon } from "@/shared/ui/svg-icon";
import { authApi } from "../api";
import { technicalErrorKey } from "../errors";
import { checkPassword, forgotEmailSchema, newPasswordSchema } from "../validation";
import { AuthLayout } from "./auth-layout";
import { AuthPanel } from "./auth-panel";
import { CodeVerification } from "./code-verification";
import {
  Field,
  FormAlert,
  PasswordInput,
  PasswordRules,
  PrimaryButton,
  StepHeading,
  TextInput,
  linkClass,
} from "./form-controls";
import { StepProgress } from "./step-progress";
import { SuccessBurst } from "./success-burst";

type Phase = "email" | "code" | "password" | "done";
const PHASE_NUMBER: Record<Phase, number> = { email: 1, code: 2, password: 3, done: 3 };

interface ResetTarget {
  userId: number;
  email: string;
  sentAt: number;
}

/** Mot de passe oublié par code e-mail (AUTH-04) : adresse, code, nouveau mot de passe. */
export function ForgotPasswordFlow({ next }: { next: string | null }) {
  const t = useTranslations();
  const [phase, setPhase] = useState<Phase>("email");
  const [target, setTarget] = useState<ResetTarget | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Focus sur le titre à chaque changement d'étape.
  const lastPhase = useRef(phase);
  useEffect(() => {
    if (lastPhase.current === phase) return;
    lastPhase.current = phase;
    titleRef.current?.focus();
  }, [phase]);

  // Glissement à chaque changement d'étape, pas au premier affichage (il retarderait le LCP).
  const [moved, setMoved] = useState(false);
  if (!moved && phase !== "email") setMoved(true);

  const restart = (message: string | null) => {
    setNotice(message);
    setPhase("email");
  };

  const loginHref = withNext("/login", next);

  return (
    <AuthLayout
      width="md"
      panel={
        <AuthPanel hero={t("forgotHero", { step: phase })} sub={t("forgotSub", { step: phase })} />
      }
    >
      {phase !== "done" && (
        <StepProgress total={3} current={PHASE_NUMBER[phase]} ariaLabel={t("forgotPassword")} />
      )}

      <div
        key={phase}
        className={`step-panel ${moved ? "animate-step-forward" : ""} flex flex-col gap-[18px]`}
      >
        {phase === "email" && (
          <EmailStep
            titleRef={titleRef}
            defaultEmail={target?.email ?? ""}
            notice={notice}
            onSent={(sent) => {
              setNotice(null);
              setTarget({ ...sent, sentAt: Date.now() });
              setPhase("code");
            }}
          />
        )}

        {phase === "code" && target && (
          <CodeVerification
            title={t("enterYourCode")}
            titleRef={titleRef}
            email={target.email}
            sentAt={target.sentAt}
            verifyLabel={t("continueAction")}
            onVerify={(code) => authApi.confirmResetCode(target.userId, code)}
            onVerified={() => setPhase("password")}
            onResend={async () => {
              if (!(await authApi.resendCode(target.userId))) throw new Error("resend refused");
              setTarget({ ...target, sentAt: Date.now() });
            }}
            onEditEmail={() => restart(null)}
          />
        )}

        {phase === "password" && target && (
          <NewPasswordStep
            titleRef={titleRef}
            email={target.email}
            onSaved={() => setPhase("done")}
            onExpired={() => restart("resetExpired")}
          />
        )}

        {phase === "done" && (
          <div className="flex flex-col gap-5 text-center">
            <SuccessBurst />
            <StepHeading
              title={t("passwordChangedTitle")}
              lead={t("passwordChangedLead")}
              titleRef={titleRef}
            />
            <Link
              href={loginHref}
              className="bg-primary shadow-button hover:bg-primary-hover flex h-[54px] items-center justify-center gap-2 rounded-xl text-[19px] font-bold text-white transition-colors"
            >
              {t("signInAction")}
              <SvgIcon name="arrow_forward" size={22} />
            </Link>
          </div>
        )}

        {(phase === "email" || phase === "code") && (
          <p className="m-0 text-center text-[15px]">
            <Link href={loginHref} className={`${linkClass} font-bold`}>
              {t("backToLogin")}
            </Link>
          </p>
        )}
      </div>
    </AuthLayout>
  );
}

function EmailStep({
  titleRef,
  defaultEmail,
  notice,
  onSent,
}: {
  titleRef: Ref<HTMLHeadingElement>;
  defaultEmail: string;
  notice: string | null;
  onSent: (target: Omit<ResetTarget, "sentAt">) => void;
}) {
  const t = useTranslations();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotEmailSchema),
    mode: "onTouched",
    defaultValues: { email: defaultEmail },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setFormError(null);
    try {
      const found = await authApi.requestPasswordReset(email);
      if (!found) {
        setError("email", { message: "forgotEmailUnknown" }, { shouldFocus: true });
        return;
      }
      onSent({ userId: found.id, email });
    } catch (error) {
      setFormError(technicalErrorKey(error));
    }
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-[18px]">
      <StepHeading title={t("forgotPassword")} lead={t("forgotLead")} titleRef={titleRef} />
      {notice && <FormAlert tone="warn">{t(notice)}</FormAlert>}
      <Field
        label={t("email")}
        htmlFor="forgot-email"
        errorId="forgot-email-error"
        error={errors.email?.message && t(errors.email.message)}
      >
        <TextInput
          id="forgot-email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          invalid={!!errors.email}
          aria-describedby={errors.email ? "forgot-email-error" : undefined}
          {...register("email")}
        />
      </Field>
      {formError && <FormAlert tone="error">{t(formError)}</FormAlert>}
      <PrimaryButton busy={isSubmitting}>
        {isSubmitting ? t("sendingCode") : t("receiveCode")}
      </PrimaryButton>
    </form>
  );
}

function NewPasswordStep({
  titleRef,
  email,
  onSaved,
  onExpired,
}: {
  titleRef: Ref<HTMLHeadingElement>;
  email: string;
  onSaved: () => void;
  onExpired: () => void;
}) {
  const t = useTranslations();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(newPasswordSchema),
    mode: "onTouched",
    defaultValues: { password: "", confirmation: "" },
  });
  const [password, confirmation] = useWatch({ control, name: ["password", "confirmation"] });
  const ready = newPasswordSchema.safeParse({ password, confirmation }).success;

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (await authApi.resetPassword(email, values.password)) onSaved();
      else onExpired();
    } catch (error) {
      setFormError(technicalErrorKey(error));
    }
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-[18px]">
      <StepHeading title={t("newPasswordTitle")} lead={t("newPasswordLead")} titleRef={titleRef} />
      {/* Champ caché : aide les gestionnaires de mots de passe à associer le compte. */}
      <input type="email" autoComplete="username" value={email} readOnly hidden />
      <Field
        label={t("newPassword")}
        htmlFor="reset-password"
        errorId="reset-password-error"
        error={errors.password?.message && t(errors.password.message)}
      >
        <PasswordInput
          id="reset-password"
          autoComplete="new-password"
          maxLength={128}
          invalid={!!errors.password}
          aria-describedby={errors.password ? "reset-password-error" : "reset-password-rules"}
          {...register("password")}
        />
      </Field>
      <Field
        label={t("confirmPassword")}
        htmlFor="reset-confirmation"
        errorId="reset-confirmation-error"
        error={errors.confirmation?.message && t(errors.confirmation.message)}
      >
        <PasswordInput
          id="reset-confirmation"
          autoComplete="new-password"
          maxLength={128}
          invalid={!!errors.confirmation}
          aria-describedby={errors.confirmation ? "reset-confirmation-error" : undefined}
          {...register("confirmation")}
        />
      </Field>
      <div id="reset-password-rules">
        <PasswordRules checks={checkPassword(password, confirmation)} />
      </div>
      {formError && <FormAlert tone="error">{t(formError)}</FormAlert>}
      <PrimaryButton busy={isSubmitting} inactive={!ready}>
        {isSubmitting ? t("savingPassword") : t("savePassword")}
      </PrimaryButton>
    </form>
  );
}
