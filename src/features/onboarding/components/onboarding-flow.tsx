"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { AuthPanel } from "@/features/auth/components/auth-panel";
import {
  Field,
  FormAlert,
  PrimaryButton,
  StepHeading,
  TextInput,
  inputClass,
} from "@/features/auth/components/form-controls";
import { StepProgress } from "@/features/auth/components/step-progress";
import { technicalErrorKey } from "@/features/auth/errors";
import type { PersonInfo } from "@/features/auth/types";
import { currentPersonQuery } from "@/features/auth/use-session-guard";
import { apiClient } from "@/shared/api/client";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { SvgIcon } from "@/shared/ui/svg-icon";
import { useSessionStore } from "@/stores/session";
import { shareInvite } from "../invite";
import { COUNTRIES, SPORTS, cleanText } from "../options";
import { markOnboardingDone } from "../storage";

interface ProfileValues {
  sport: string;
  clubName: string;
  residence: string;
}

/**
 * Onboarding (AUTH-07), mêmes étapes et même ordre que OnboardingPage du mobile :
 * 1. sport, club, pays de résidence (alimentent suggestions et offres) ; 2. invitation de contacts.
 */
export function OnboardingFlow({ next }: { next: string | null }) {
  const hydrated = useHydrated();
  const t = useTranslations();
  const panel = <AuthPanel hero={t("welcomePanelHero")} sub={t("welcomePanelSub")} showProfile />;
  if (!hydrated) {
    return (
      <AuthLayout panel={panel}>
        <div className="min-h-[420px]" />
      </AuthLayout>
    );
  }
  return <Flow next={next} panel={panel} />;
}

function Flow({ next, panel }: { next: string | null; panel: ReactNode }) {
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useSessionStore((s) => s.user);
  const patchUser = useSessionStore((s) => s.patchUser);
  const personId = user?.personId ?? null;
  const destination = next ?? "/";

  const [step, setStep] = useState<1 | 2>(1);
  // Glissement à l'étape 2 seulement : pas d'animation au premier affichage (LCP).
  const stepMotion = step > 1 ? "animate-step-forward" : "";
  const [inviteNotice, setInviteNotice] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Compte sans profil Person (organisme) : rien à compléter ici.
  useEffect(() => {
    if (personId === null) router.replace(destination);
  }, [personId, destination, router]);

  const lastStep = useRef(step);
  useEffect(() => {
    if (lastStep.current === step) return;
    lastStep.current = step;
    titleRef.current?.focus();
  }, [step]);

  const finish = () => {
    markOnboardingDone();
    router.replace(destination);
  };

  const { data: person } = useQuery({
    ...currentPersonQuery(personId ?? 0),
    enabled: personId !== null,
  });
  const loaded = useMemo<ProfileValues | undefined>(
    () =>
      person && {
        sport: cleanText(person.sport),
        clubName: cleanText(person.clubName),
        residence: cleanText(person.residence),
      },
    [person],
  );
  const { register, handleSubmit, control } = useForm<ProfileValues>({
    defaultValues: { sport: "", clubName: "", residence: "" },
    values: loaded,
    resetOptions: { keepDirtyValues: true },
  });
  const [sport, residence] = useWatch({ control, name: ["sport", "residence"] });

  const save = useMutation({
    mutationFn: async (values: ProfileValues) => {
      if (personId === null) throw new Error("no person");
      // POST /api/person remplace toute la fiche : on renvoie les autres champs tels quels.
      const current = person ?? (await queryClient.fetchQuery(currentPersonQuery(personId)));
      return apiClient<PersonInfo>("person", {
        method: "POST",
        body: {
          id: current.id,
          firstname: current.firstname,
          lastname: current.lastname,
          birthdate: current.birthdate ?? null,
          placeOfBirth: current.placeOfBirth || null,
          nationality: current.nationality || null,
          phone: current.phone || null,
          description: current.description || null,
          sport: values.sport,
          clubName: values.clubName.trim(),
          residence: values.residence,
        },
      });
    },
    onSuccess: (saved, values) => {
      if (personId !== null && saved)
        queryClient.setQueryData(currentPersonQuery(personId).queryKey, saved);
      patchUser({
        sport: values.sport,
        clubName: values.clubName.trim(),
        residence: values.residence,
      });
      setStep(2);
    },
  });

  const invite = async () => {
    const outcome = await shareInvite(t("joinMeOnAtlight"));
    setInviteNotice(outcome === "copied");
  };

  // Valeur déjà enregistrée hors des listes du mobile : gardée telle quelle.
  const sportOptions =
    sport && !(SPORTS as readonly string[]).includes(sport) ? [...SPORTS, sport] : SPORTS;
  const extraResidence =
    residence && !COUNTRIES.some((c) => c.name === residence) ? residence : null;
  const selectClass = `${inputClass} appearance-auto pr-3`;

  return (
    <AuthLayout
      panel={panel}
      topAction={
        <button
          type="button"
          onClick={finish}
          className="text-grey-700 hover:bg-grey-100 hover:text-grey-900 min-h-11 rounded-lg px-3 text-[15px] font-medium transition-colors"
        >
          {t("skip")}
        </button>
      }
    >
      <StepProgress total={2} current={step} ariaLabel={t("onboardingWelcomeTitle")} />

      <div key={step} className={`step-panel ${stepMotion}`}>
        {step === 1 ? (
          <form
            noValidate
            onSubmit={handleSubmit((values) => save.mutate(values))}
            className="flex flex-col gap-[18px]"
          >
            <StepHeading
              title={t("onboardingWelcomeTitle")}
              lead={t("onboardingWelcomeSubtitle")}
              titleRef={titleRef}
            />
            <Field label={t("mainSport")} htmlFor="onboarding-sport">
              <select id="onboarding-sport" className={selectClass} {...register("sport")}>
                <option value="">{t("selectOption")}</option>
                {sportOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("club")} htmlFor="onboarding-club">
              <TextInput
                id="onboarding-club"
                autoComplete="organization"
                {...register("clubName")}
              />
            </Field>
            <Field label={t("countryOfResidence")} htmlFor="onboarding-residence">
              <select id="onboarding-residence" className={selectClass} {...register("residence")}>
                <option value="">{t("selectOption")}</option>
                {COUNTRIES.map((country) => (
                  <option key={country.name} value={country.name}>
                    {`${country.flag} ${country.name}`}
                  </option>
                ))}
                {extraResidence && <option value={extraResidence}>{extraResidence}</option>}
              </select>
            </Field>
            {save.isError && <FormAlert tone="error">{t(technicalErrorKey(save.error))}</FormAlert>}
            <PrimaryButton busy={save.isPending} inactive={!sport}>
              {t("next")}
            </PrimaryButton>
          </form>
        ) : (
          <div className="flex flex-col gap-[18px]">
            <StepHeading
              title={t("onboardingInviteTitle")}
              lead={t("onboardingInviteSubtitle")}
              titleRef={titleRef}
            />
            <PrimaryButton type="button" onClick={() => void invite()}>
              <SvgIcon name="share" size={22} />
              {t("inviteFriends")}
            </PrimaryButton>
            {inviteNotice && <FormAlert tone="success">{t("linkCopied")}</FormAlert>}
            <button
              type="button"
              onClick={finish}
              className="border-primary-strong text-primary-strong hover:bg-third flex h-[50px] items-center justify-center rounded-xl border-[1.5px] text-base font-bold transition-colors"
            >
              {t("done")}
            </button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
