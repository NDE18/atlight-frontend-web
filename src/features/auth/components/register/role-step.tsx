"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Ref } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { SvgIcon } from "@/shared/ui/svg-icon";
import { ROLE_OPTIONS } from "../../roles";
import { isSignupRole } from "../../types";
import type { RegistrationValues } from "../../validation";
import { FieldError, PrimaryButton, StepHeading } from "../form-controls";

interface RoleStepProps {
  form: UseFormReturn<RegistrationValues>;
  titleRef: Ref<HTMLHeadingElement>;
  loginHref: string;
  onNext: () => void;
}

/** Étape 1 : six cartes de rôle, sélection unique (cahier 4.1.1). */
export function RoleStep({ form, titleRef, loginHref, onNext }: RoleStepProps) {
  const t = useTranslations();
  const role = useWatch({ control: form.control, name: "role" });
  const error = form.formState.errors.role?.message;

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
        title={t("registerRoleTitle")}
        lead={t("registerRoleLead")}
        titleRef={titleRef}
      />

      <fieldset
        className="m-0 min-w-0 border-0 p-0"
        aria-describedby={error ? "register-role-error" : undefined}
      >
        <legend className="sr-only">{t("role")}</legend>
        <div className="grid grid-cols-2 gap-2 min-[900px]:grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] min-[900px]:gap-2.5">
          {ROLE_OPTIONS.map((option) => (
            <label
              key={option.role}
              className="group has-checked:border-primary has-checked:bg-third has-checked:text-primary-dark hover:border-primary has-focus-visible:outline-primary-strong border-grey-400 hover:bg-grey-50 relative flex min-h-[62px] cursor-pointer items-center gap-2 rounded-xl border bg-white px-2.5 py-[9px] transition-[border-color,background-color,transform,box-shadow] duration-150 active:scale-[.985] has-checked:shadow-[0_0_0_.5px_var(--color-primary)] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 min-[900px]:min-h-[66px] min-[900px]:gap-3 min-[900px]:px-3.5 min-[900px]:py-[11px]"
            >
              <input
                type="radio"
                value={option.role}
                className="sr-only"
                {...form.register("role")}
                onKeyDown={(event) => {
                  // Entrée déclenche le bouton principal (cahier 4.1.1, clavier).
                  if (event.key === "Enter") {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
              />
              <span className="group-has-checked:bg-primary bg-grey-100 text-grey-700 flex size-[34px] flex-none items-center justify-center rounded-full transition-colors group-has-checked:text-white min-[900px]:size-10">
                <SvgIcon name={option.icon} size={20} />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm leading-tight font-medium group-has-checked:font-bold min-[900px]:text-base">
                  {t(option.labelKey)}
                </span>
                <span className="text-grey-700 text-xs leading-snug max-[359px]:hidden min-[900px]:text-[13px]">
                  {t(option.descriptionKey)}
                </span>
              </span>
              <SvgIcon
                name="check_circle"
                size={20}
                className="text-primary-strong ml-auto hidden min-[900px]:group-has-checked:block"
              />
            </label>
          ))}
        </div>
      </fieldset>
      {error && <FieldError id="register-role-error" message={t(error)} />}

      <div className="flex gap-2.5">
        <PrimaryButton inactive={!isSignupRole(role)}>{t("next")}</PrimaryButton>
      </div>
      <p className="text-grey-700 m-0 text-center text-[15px]">
        {t("alreadyHaveAccount")}
        <Link href={loginHref} className="text-primary-strong font-bold hover:underline">
          {t("signInAction")}
        </Link>
      </p>
    </form>
  );
}
