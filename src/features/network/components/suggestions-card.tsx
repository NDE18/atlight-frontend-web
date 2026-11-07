"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { initialsFromName } from "@/features/auth/session";
import { roleLabelKey } from "@/features/auth/roles";
import { cleanUrl } from "@/features/feed/format";
import { Avatar } from "@/shared/ui/avatar";
import { ArrowLink, cardClass, SectionError, useComingSoon } from "@/shared/ui/home-blocks";
import { SvgIcon } from "@/shared/ui/svg-icon";
import { suggestionsQuery } from "../api";

/** Suggestions de connexion (NET-03), dans l'ordre de l'API ; la demande arrive au lot 3. */
export function SuggestionsCard({ username }: { username: string }) {
  const t = useTranslations();
  const comingSoon = useComingSoon();
  const { data, isError, refetch } = useQuery(suggestionsQuery(username));
  if (!isError && !data?.length) return null;

  return (
    <section aria-labelledby="home-suggestions" className={`${cardClass} px-4 py-3.5`}>
      <div className="flex items-center justify-between gap-3">
        <h2 id="home-suggestions" className="m-0 text-[15px] font-bold">
          {t("connectionSuggestions")}
        </h2>
        <ArrowLink onClick={comingSoon}>{t("seeAll")}</ArrowLink>
      </div>
      {isError ? (
        <div className="mt-2">
          <SectionError message={t("sectionLoadError")} onRetry={() => void refetch()} />
        </div>
      ) : (
        <ul className="m-0 mt-2.5 flex list-none flex-col gap-3 p-0">
          {data?.map((person) => {
            const name =
              [person.firstname, person.lastname].filter(Boolean).join(" ") ||
              person.username ||
              "";
            const roleKey = roleLabelKey(person.role ?? undefined);
            const detail = [roleKey ? t(roleKey) : null, person.sport].filter(Boolean).join(" · ");
            return (
              <li key={person.userId} className="flex items-center gap-3">
                <Avatar
                  initials={initialsFromName(name)}
                  picture={cleanUrl(person.picture)}
                  size={44}
                />
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate text-[14px] font-bold">{name}</p>
                  {detail && <p className="text-grey-700 m-0 truncate text-[12px]">{detail}</p>}
                </div>
                <button
                  type="button"
                  onClick={comingSoon}
                  className="text-primary-strong inline-flex h-8 flex-none items-center gap-0.5 rounded-full bg-[#E3F4EC] pr-3 pl-2 text-[13px] font-bold transition-colors hover:bg-[#D3EEE2]"
                >
                  <SvgIcon name="add" size={18} />
                  {t("connect")}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
