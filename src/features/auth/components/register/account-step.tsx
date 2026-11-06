"use client";

import { useTranslations } from "next-intl";
import { useState, type Ref } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { accountSchema, checkPassword, type RegistrationValues } from "../../validation";
import {
  BackButton,
  Field,
  FieldError,
  FormAlert,
  PasswordInput,
  PasswordRules,
  PrimaryButton,
  StepHeading,
  TextInput,
  linkClass,
} from "../form-controls";

interface AccountStepProps {
  form: UseFormReturn<RegistrationValues>;
  titleRef: Ref<HTMLHeadingElement>;
  busy: boolean;
  submitError: string | null;
  onBack: () => void;
  onSubmit: () => void;
}

/** Étape 3 : e-mail, mot de passe et confirmation, politique de confidentialité. Crée le compte. */
export function AccountStep({
  form,
  titleRef,
  busy,
  submitError,
  onBack,
  onSubmit,
}: AccountStepProps) {
  const t = useTranslations();
  const {
    register,
    formState: { errors },
  } = form;
  const [email, password, confirmation, acceptPrivacy, username] = useWatch({
    control: form.control,
    name: ["email", "password", "confirmation", "acceptPrivacy", "username"],
  });
  const [focused, setFocused] = useState(false);
  const rulesShown = focused || !!password || !!confirmation;
  const ready = accountSchema.safeParse({ email, password, confirmation, acceptPrivacy }).success;

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-5"
    >
      <StepHeading
        title={t("registerAccountTitle")}
        lead={t("registerAccountLead", { username: username.trim() })}
        titleRef={titleRef}
      />

      <Field
        label={t("email")}
        htmlFor="reg-email"
        errorId="reg-email-error"
        error={errors.email?.message && t(errors.email.message)}
      >
        <TextInput
          id="reg-email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          invalid={!!errors.email}
          aria-describedby={errors.email ? "reg-email-error" : undefined}
          {...register("email")}
        />
      </Field>

      <Field
        label={t("password")}
        htmlFor="reg-password"
        errorId="reg-password-error"
        error={errors.password?.message && t(errors.password.message)}
      >
        <PasswordInput
          id="reg-password"
          autoComplete="new-password"
          maxLength={128}
          invalid={!!errors.password}
          aria-describedby={
            errors.password ? "reg-password-error" : rulesShown ? "reg-password-rules" : undefined
          }
          onFocus={() => setFocused(true)}
          {...register("password")}
        />
      </Field>

      <Field
        label={t("confirmPassword")}
        htmlFor="reg-confirmation"
        errorId="reg-confirmation-error"
        error={errors.confirmation?.message && t(errors.confirmation.message)}
      >
        <PasswordInput
          id="reg-confirmation"
          autoComplete="new-password"
          maxLength={128}
          invalid={!!errors.confirmation}
          aria-describedby={errors.confirmation ? "reg-confirmation-error" : undefined}
          onFocus={() => setFocused(true)}
          {...register("confirmation")}
        />
      </Field>

      {rulesShown && (
        <div id="reg-password-rules">
          <PasswordRules checks={checkPassword(password, confirmation)} />
        </div>
      )}

      <div className="flex flex-col gap-[7px]">
        <label className="text-grey-800 flex cursor-pointer items-start gap-2.5 text-sm leading-normal">
          <input
            type="checkbox"
            className="accent-primary mt-0.5 size-5 flex-none cursor-pointer"
            aria-invalid={errors.acceptPrivacy ? true : undefined}
            aria-describedby={errors.acceptPrivacy ? "reg-privacy-error" : undefined}
            {...register("acceptPrivacy")}
          />
          <span>
            {t("acceptPrivacyPrefix")}
            <a href="/legal/privacy.html" target="_blank" rel="noopener" className={linkClass}>
              {t("privacyPolicy")}
            </a>
            {t("acceptPrivacySuffix")}
          </span>
        </label>
        {errors.acceptPrivacy?.message && (
          <FieldError id="reg-privacy-error" message={t(errors.acceptPrivacy.message)} />
        )}
      </div>

      {submitError && <FormAlert tone="error">{t(submitError)}</FormAlert>}

      <div className="flex gap-2.5">
        <BackButton onClick={onBack} />
        <PrimaryButton busy={busy} inactive={!ready}>
          {busy ? t("creatingAccount") : t("createMyAccount")}
        </PrimaryButton>
      </div>
    </form>
  );
}
