"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { destinationAfterAuth } from "@/features/onboarding/storage";
import { ApiError } from "@/shared/api/client";
import { withNext } from "@/shared/utils/safe-next";
import { useSessionStore } from "@/stores/session";
import { authApi } from "../api";
import { technicalErrorKey } from "../errors";
import { toSessionUser } from "../session";
import { loginSchema, type LoginValues } from "../validation";
import { AuthLayout } from "./auth-layout";
import { AuthPanel } from "./auth-panel";
import {
  Field,
  FormAlert,
  OutlineLink,
  PasswordInput,
  PrimaryButton,
  TextInput,
  linkClass,
} from "./form-controls";

/** Connexion par nom d'utilisateur (AUTH-03) ; succès = retour sur la page demandée (`next`). */
export function LoginScreen({ next }: { next: string | null }) {
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useSessionStore((s) => s.setUser);
  const [formError, setFormError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    resetField,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = handleSubmit(async ({ username, password }) => {
    setFormError(null);
    try {
      const session = await authApi.login(username.trim(), password);
      const user = toSessionUser(session);
      // Aucune donnée d'un compte précédent ne doit survivre à la connexion.
      queryClient.clear();
      setUser(user);
      setRedirecting(true);
      router.replace(destinationAfterAuth(next, user));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        // Message générique : on ne dit pas lequel des deux est faux.
        setFormError("loginBadCredentials");
        resetField("password");
        setFocus("password");
      } else if (error instanceof ApiError && error.status === 403) {
        setFormError("loginAccountNotActivated");
      } else {
        setFormError(technicalErrorKey(error));
      }
    }
  });

  return (
    <AuthLayout width="sm" panel={<AuthPanel sub={t("loginPanelSub")} showProfile />}>
      {/* Pas d'animation d'entrée depuis une opacité nulle : elle retarderait le LCP. */}
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-[18px]">
        <div className="mb-1.5 flex flex-col gap-2">
          <h1 className="m-0 text-[28px] leading-[1.1] font-bold tracking-[-0.01em] min-[900px]:text-[34px]">
            {t("loginTitle")}
          </h1>
          <p className="text-grey-700 m-0 text-base leading-normal">{t("loginLead")}</p>
        </div>

        <Field
          label={t("username")}
          htmlFor="login-username"
          errorId="login-username-error"
          error={errors.username?.message && t(errors.username.message)}
        >
          <TextInput
            id="login-username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={t("usernamePlaceholder")}
            invalid={!!errors.username}
            aria-describedby={errors.username ? "login-username-error" : undefined}
            {...register("username")}
          />
        </Field>

        <Field
          label={t("password")}
          htmlFor="login-password"
          errorId="login-password-error"
          error={errors.password?.message && t(errors.password.message)}
        >
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            placeholder={t("passwordPlaceholder")}
            invalid={!!errors.password}
            aria-describedby={errors.password ? "login-password-error" : undefined}
            {...register("password")}
          />
        </Field>

        <div className="-mt-2 flex justify-end">
          <Link
            href={withNext("/forgot-password", next)}
            className={`${linkClass} min-h-9 py-2 text-sm`}
          >
            {t("forgotPassword")}
          </Link>
        </div>

        {formError && <FormAlert tone="error">{t(formError)}</FormAlert>}

        <PrimaryButton busy={isSubmitting || redirecting}>
          {isSubmitting || redirecting ? t("signingIn") : t("signInAction")}
        </PrimaryButton>

        <div className="text-grey-700 before:bg-grey-300 after:bg-grey-300 flex items-center gap-3 text-sm before:h-px before:flex-1 after:h-px after:flex-1">
          {t("newOnAtlight")}
        </div>
        <OutlineLink href={withNext("/register", next)}>{t("createAccount")}</OutlineLink>
      </form>
    </AuthLayout>
  );
}
