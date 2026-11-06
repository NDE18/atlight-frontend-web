"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { destinationAfterAuth } from "@/features/onboarding/storage";
import { ApiError } from "@/shared/api/client";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { withNext } from "@/shared/utils/safe-next";
import { SvgIcon } from "@/shared/ui/svg-icon";
import { useSessionStore, type SessionUser } from "@/stores/session";
import { authApi } from "../../api";
import { pendingVerification, usePendingVerification } from "../../pending-verification";
import { ROLE_PERK_ICONS } from "../../roles";
import { toSessionUser } from "../../session";
import { isSignupRole, type CodeCheckResult } from "../../types";
import {
  usernameAvailabilityQuery,
  useUsernameAvailability,
} from "../../use-username-availability";
import {
  REGISTRATION_DEFAULTS,
  STEP_FIELDS,
  identitySchema,
  registrationSchema,
  type RegistrationValues,
} from "../../validation";
import { AuthLayout } from "../auth-layout";
import { AuthPanel } from "../auth-panel";
import { CodeVerification, EmailChangeRejectedError } from "../code-verification";
import { PrimaryButton, linkClass } from "../form-controls";
import { StepProgress } from "../step-progress";
import { SuccessBurst } from "../success-burst";
import { AccountStep } from "./account-step";
import { IdentityStep } from "./identity-step";
import { RoleStep } from "./role-step";

type Step = 1 | 2 | 3 | 4;

const STEP_ANIMATIONS = {
  none: "",
  forward: "animate-step-forward",
  backward: "animate-step-backward",
} as const;

function parseStep(value: string | null): Step {
  const step = Number(value);
  return step === 2 || step === 3 || step === 4 ? step : 1;
}

/**
 * Inscription en 4 volets sur une seule page (AUTH-01, cahier 4.1.1) : Rôle, Identité, Compte, Code.
 * Le compte n'est créé qu'au clic final de l'étape 3.
 */
export function RegisterWizard({ next }: { next: string | null }) {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const setUser = useSessionStore((s) => s.setUser);
  // Le serveur rend l'étape 1 (bon pour le LCP) ; l'étape 4 dépend du sessionStorage
  // et n'apparaît qu'une fois la page hydratée, après un rechargement.
  const hydrated = useHydrated();
  const pending = usePendingVerification();

  const form = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema) as unknown as Resolver<RegistrationValues>,
    mode: "onTouched",
    defaultValues: REGISTRATION_DEFAULTS,
  });
  const [role, firstname, lastname, username] = useWatch({
    control: form.control,
    name: ["role", "firstname", "lastname", "username"],
  });
  const usernameStatus = useUsernameAvailability(username);

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [creating, setCreating] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<SessionUser | null>(null);
  const verifiedUser = useRef<SessionUser | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Une URL d'étape ouverte sans les étapes précédentes valides renvoie à l'étape 1 ;
  // une fois le compte créé, seule l'étape 4 est accessible.
  const maxStep: Step = isSignupRole(role)
    ? identitySchema.safeParse({ firstname, lastname, username }).success
      ? 3
      : 2
    : 1;
  const requested = parseStep(searchParams.get("step"));
  const step: Step = pending ? 4 : requested !== 4 && requested <= maxStep ? requested : 1;

  // Sens du glissement : vers la gauche en avançant, vers la droite en revenant. Pas d'animation
  // au premier affichage : un volet qui part d'une opacité nulle retarde le LCP.
  const [shown, setShown] = useState<{ step: Step; direction: "none" | "forward" | "backward" }>({
    step,
    direction: "none",
  });
  if (shown.step !== step)
    setShown({ step, direction: step > shown.step ? "forward" : "backward" });

  const stepUrl = (target: Step) =>
    `/register?step=${target}${next ? `&next=${encodeURIComponent(next)}` : ""}`;
  const goTo = (target: Step) => router.push(stepUrl(target), { scroll: false });

  useEffect(() => {
    // Avant l'hydratation, l'étape 4 éventuelle (sessionStorage) n'est pas encore connue.
    if (!hydrated || confirmed || requested === step) return;
    router.replace(`/register?step=${step}${next ? `&next=${encodeURIComponent(next)}` : ""}`, {
      scroll: false,
    });
  }, [hydrated, confirmed, next, requested, router, step]);

  // À chaque changement d'étape, le focus va sur le titre du volet.
  const view = confirmed ? "done" : String(step);
  const lastView = useRef(view);
  useEffect(() => {
    if (lastView.current === view) return;
    lastView.current = view;
    titleRef.current?.focus({ preventScroll: false });
  }, [view]);

  const nextFromRole = async () => {
    if (await form.trigger(STEP_FIELDS[1])) goTo(2);
  };

  const nextFromIdentity = async () => {
    if (!(await form.trigger(STEP_FIELDS[2]))) return;
    setCheckingUsername(true);
    try {
      // Attend la vérification en cours plutôt que d'ignorer le clic.
      const available = await queryClient.fetchQuery(
        usernameAvailabilityQuery(form.getValues("username").trim()),
      );
      if (available) goTo(3);
    } catch {
      form.setError("username", { message: "usernameCheckFailed" });
    } finally {
      setCheckingUsername(false);
    }
  };

  const createAccount = async () => {
    if (creating || !(await form.trigger(STEP_FIELDS[3]))) return;
    const values = form.getValues();
    if (!isSignupRole(values.role)) return goTo(1);

    setSubmitError(null);
    setCreating(true);
    try {
      const created = await authApi.register({
        username: values.username.trim(),
        email: values.email.trim(),
        firstname: values.firstname.trim(),
        lastname: values.lastname.trim(),
        password: values.password,
        role: values.role,
      });
      if (created) {
        // Le mot de passe ne reste pas en mémoire au-delà de la création du compte.
        form.resetField("password");
        form.resetField("confirmation");
        pendingVerification.save({
          userId: created.id,
          firstname: values.firstname.trim(),
          email: values.email.trim(),
          sentAt: Date.now(),
        });
        goTo(4);
        return;
      }
      // Refus sans détail du backend : nom d'utilisateur pris entre-temps, sinon e-mail déjà utilisé.
      const available = await queryClient
        .fetchQuery({ ...usernameAvailabilityQuery(values.username.trim()), staleTime: 0 })
        .catch(() => true);
      if (!available) {
        form.setError("username", { message: "usernameTakenMeanwhile" });
        goTo(2);
      } else {
        form.setError("email", { message: "emailTaken" }, { shouldFocus: true });
      }
    } catch (error) {
      setSubmitError(
        error instanceof ApiError && error.status === 429
          ? "authTooManyAttempts"
          : "registerErrorKeepEntries",
      );
    } finally {
      setCreating(false);
    }
  };

  const verifyCode = async (code: string): Promise<CodeCheckResult> => {
    if (!pending) return "invalid";
    const outcome = await authApi.confirmRegistration(pending.userId, code);
    if (outcome.result !== "ok") return outcome.result;
    const user = toSessionUser(outcome.session);
    queryClient.clear();
    setUser(user);
    verifiedUser.current = user;
    return "ok";
  };

  const finishVerification = () => setConfirmed(verifiedUser.current);

  // Données de l'étape 4 effacées après validation, une fois l'écran de succès affiché :
  // les effacer avant ferait revenir un instant l'étape 1 (et son URL).
  useEffect(() => {
    if (confirmed) pendingVerification.clear();
  }, [confirmed]);

  const resendCode = async () => {
    if (!pending || !(await authApi.resendCode(pending.userId))) throw new Error("resend refused");
    pendingVerification.update({ sentAt: Date.now() });
  };

  const changeEmail = async (email: string) => {
    if (!pending) return;
    const updated = await authApi.changePendingEmail(pending.userId, email);
    if (!updated) throw new EmailChangeRejectedError();
    pendingVerification.update({ email, sentAt: Date.now() });
  };

  const roleKey = isSignupRole(role) ? role : "none";
  const perkIcons = ROLE_PERK_ICONS[isSignupRole(role) ? role : "default"];
  const panel = confirmed ? (
    <AuthPanel hero={t("welcomePanelHero")} sub={t("welcomePanelSub")} showProfile />
  ) : step === 4 ? (
    <AuthPanel hero={t("verifyPanelHero")} sub={t("verifyPanelSub")} showProfile />
  ) : (
    <AuthPanel
      hero={t("registerHero", { role: roleKey })}
      perks={[1, 2, 3].map((n, i) => ({
        icon: perkIcons[i],
        text: t(`registerPerk${n}`, { role: roleKey }),
      }))}
    />
  );

  if (confirmed) {
    return (
      <AuthLayout width="lg" evenColumns panel={panel}>
        <div className="animate-step-forward step-panel flex flex-col gap-5 text-center">
          <SuccessBurst />
          <h1
            ref={titleRef}
            tabIndex={-1}
            className="m-0 text-[27px] leading-[1.12] font-bold tracking-[-0.01em] outline-none min-[900px]:text-[32px]"
          >
            {t("accountConfirmedTitle")}
          </h1>
          <p className="text-grey-700 m-0 text-base leading-normal">{t("accountConfirmedLead")}</p>
          <PrimaryButton
            type="button"
            onClick={() => router.replace(destinationAfterAuth(next, confirmed))}
          >
            {t("continueAction")}
            <SvgIcon name="arrow_forward" size={22} />
          </PrimaryButton>
        </div>
      </AuthLayout>
    );
  }

  const labels = [t("role"), t("registerStepIdentity"), t("registerStepAccount"), t("code")];

  return (
    <AuthLayout width="lg" evenColumns panel={panel}>
      <StepProgress
        total={4}
        current={step}
        labels={labels}
        ariaLabel={t("registerStepsLabel")}
        // Une étape terminée y revient ; plus rien n'est cliquable une fois le compte créé.
        onStepClick={pending ? undefined : (target) => goTo(target as Step)}
      />

      <div key={step} className={`step-panel ${STEP_ANIMATIONS[shown.direction]}`}>
        {step === 1 && (
          <RoleStep
            form={form}
            titleRef={titleRef}
            loginHref={withNext("/login", next)}
            onNext={nextFromRole}
          />
        )}
        {step === 2 && (
          <IdentityStep
            form={form}
            titleRef={titleRef}
            usernameStatus={usernameStatus}
            busy={checkingUsername}
            onBack={() => goTo(1)}
            onNext={nextFromIdentity}
          />
        )}
        {step === 3 && (
          <AccountStep
            form={form}
            titleRef={titleRef}
            busy={creating}
            submitError={submitError}
            onBack={() => goTo(2)}
            onSubmit={createAccount}
          />
        )}
        {step === 4 && pending && (
          <div className="flex flex-col gap-[18px]">
            <CodeVerification
              title={t("verifyEmailTitle")}
              titleRef={titleRef}
              email={pending.email}
              sentAt={pending.sentAt}
              onVerify={verifyCode}
              onVerified={finishVerification}
              onResend={resendCode}
              onChangeEmail={changeEmail}
            />
            <p className="m-0 text-center text-[15px]">
              <Link href={withNext("/login", next)} className={`${linkClass} font-bold`}>
                {t("backToLogin")}
              </Link>
            </p>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
