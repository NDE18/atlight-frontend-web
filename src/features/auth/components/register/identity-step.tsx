"use client";

import { useTranslations } from "next-intl";
import type { Ref } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { SvgIcon } from "@/shared/ui/svg-icon";
import { suggestUsername, type UsernameStatus } from "../../use-username-availability";
import { USERNAME_MAX, identitySchema, type RegistrationValues } from "../../validation";
import {
  BackButton,
  Field,
  FieldError,
  PrimaryButton,
  Spinner,
  StepHeading,
  TextInput,
} from "../form-controls";

interface IdentityStepProps {
  form: UseFormReturn<RegistrationValues>;
  titleRef: Ref<HTMLHeadingElement>;
  usernameStatus: UsernameStatus;
  busy: boolean;
  onBack: () => void;
  onNext: () => void;
}

/** Étape 2 : prénom, nom, nom d'utilisateur vérifié en direct (comme le mobile). */
export function IdentityStep({
  form,
  titleRef,
  usernameStatus,
  busy,
  onBack,
  onNext,
}: IdentityStepProps) {
  const t = useTranslations();
  const {
    register,
    setValue,
    formState: { errors },
  } = form;
  const [firstname, lastname, username] = useWatch({
    control: form.control,
    name: ["firstname", "lastname", "username"],
  });
  const ready =
    identitySchema.safeParse({ firstname, lastname, username }).success &&
    usernameStatus === "available";

  const errorText = (message?: string) => message && t(message, { max: USERNAME_MAX });
  const usernameError = errorText(errors.username?.message);
  const trimmed = username.trim();

  let usernameHint = null;
  if (usernameStatus === "checking") {
    usernameHint = (
      <p id="reg-username-status" role="status" className="sr-only">
        {t("usernameChecking")}
      </p>
    );
  } else if (usernameStatus === "available") {
    usernameHint = (
      <p
        id="reg-username-status"
        role="status"
        className="text-primary-strong m-0 text-[13px] leading-[1.4]"
      >
        {t("usernameAvailable")}
      </p>
    );
  } else if (usernameStatus === "taken") {
    const suggestion = suggestUsername(trimmed);
    usernameHint = (
      <FieldError
        id="reg-username-status"
        message={t.rich("usernameTakenSuggestion", {
          suggestion,
          option: (chunks) => (
            <button
              type="button"
              onClick={() => setValue("username", suggestion, { shouldValidate: true })}
              className="text-primary-strong font-medium underline"
            >
              {chunks}
            </button>
          ),
        })}
      />
    );
  } else if (usernameStatus === "error") {
    usernameHint = <FieldError id="reg-username-status" message={t("usernameCheckFailed")} />;
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onNext();
      }}
      className="flex flex-col gap-5"
    >
      <StepHeading
        title={t("registerIdentityTitle")}
        lead={t("registerIdentityLead")}
        titleRef={titleRef}
      />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(190px,100%),1fr))] gap-3.5">
        <Field
          label={t("firstName")}
          htmlFor="reg-firstname"
          errorId="reg-firstname-error"
          error={errorText(errors.firstname?.message)}
        >
          <TextInput
            id="reg-firstname"
            autoComplete="given-name"
            invalid={!!errors.firstname}
            aria-describedby={errors.firstname ? "reg-firstname-error" : undefined}
            {...register("firstname")}
          />
        </Field>
        <Field
          label={t("lastName")}
          htmlFor="reg-lastname"
          errorId="reg-lastname-error"
          error={errorText(errors.lastname?.message)}
        >
          <TextInput
            id="reg-lastname"
            autoComplete="family-name"
            invalid={!!errors.lastname}
            aria-describedby={errors.lastname ? "reg-lastname-error" : undefined}
            {...register("lastname")}
          />
        </Field>
      </div>

      <Field
        label={t("username")}
        htmlFor="reg-username"
        errorId="reg-username-error"
        error={usernameError}
        hint={usernameHint}
      >
        <div className="relative flex">
          <span
            aria-hidden
            className="text-grey-700 pointer-events-none absolute top-[14px] left-3.5 text-base"
          >
            @
          </span>
          <TextInput
            id="reg-username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={USERNAME_MAX}
            className="pr-11 pl-[30px]"
            invalid={!!usernameError || usernameStatus === "taken"}
            aria-describedby={
              usernameError
                ? "reg-username-error"
                : usernameHint
                  ? "reg-username-status"
                  : undefined
            }
            {...register("username")}
          />
          <span
            aria-hidden
            className="absolute top-[14px] right-[13px] flex size-[22px] items-center justify-center"
          >
            {usernameStatus === "checking" && (
              <Spinner className="border-grey-300 border-t-primary" />
            )}
            {usernameStatus === "available" && (
              <SvgIcon name="check_circle" size={20} className="text-primary-strong" />
            )}
            {(usernameStatus === "taken" || usernameStatus === "error") && (
              <SvgIcon name="error" size={20} className="text-danger" />
            )}
          </span>
        </div>
      </Field>

      <div className="flex gap-2.5">
        <BackButton onClick={onBack} />
        <PrimaryButton busy={busy} inactive={!ready}>
          {t("next")}
        </PrimaryButton>
      </div>
    </form>
  );
}
