"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { pasteDigits, typeIntoDigit } from "../code-digits";

export type CodeInputState = "input" | "error" | "ok" | "expired";

interface CodeInputProps {
  digits: string[];
  onChange: (digits: string[]) => void;
  state: CodeInputState;
  disabled: boolean;
  shake: boolean;
  /** Change à chaque fois que le focus doit revenir sur la première case (code faux, renvoi). */
  focusSignal: number;
  describedBy?: string;
}

const BOX_STATES: Record<CodeInputState | "filled", string> = {
  input: "",
  filled: "bg-code-bg border-primary",
  error: "bg-danger-bg border-danger text-danger-ink",
  ok: "bg-primary border-primary text-white animate-pop",
  expired: "bg-grey-100 border-grey-300",
};

/**
 * Code à 4 chiffres, une case par chiffre (AUTH-02) : le focus avance tout seul, Retour arrière
 * revient à la case précédente, coller un code complet remplit les 4 cases.
 */
export function CodeInput({
  digits,
  onChange,
  state,
  disabled,
  shake,
  focusSignal,
  describedBy,
}: CodeInputProps) {
  const t = useTranslations();
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (focusSignal > 0) boxes.current[0]?.focus({ preventScroll: true });
  }, [focusSignal]);

  const focusBox = (index: number | null) => {
    if (index !== null) boxes.current[index]?.focus();
  };

  const onKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === "ArrowRight" && index < digits.length - 1) {
      event.preventDefault();
      focusBox(index + 1);
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const pasted = pasteDigits(event.clipboardData.getData("text"));
    if (!pasted || disabled) return;
    event.preventDefault();
    onChange(pasted);
    const empty = pasted.findIndex((d) => !d);
    focusBox(empty === -1 ? pasted.length - 1 : empty);
  };

  return (
    <div
      role="group"
      aria-label={t("codeGroupLabel", { total: digits.length })}
      aria-describedby={describedBy}
      onPaste={onPaste}
      className={`grid max-w-[340px] grid-cols-4 gap-[9px] max-[899px]:gap-1.5 ${shake ? "animate-shake" : ""}`}
    >
      {digits.map((digit, index) => {
        const look =
          state === "input"
            ? digit
              ? "filled"
              : "input"
            : state === "error" && !digit
              ? "input"
              : state;
        return (
          <input
            key={index}
            ref={(el) => {
              boxes.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            aria-label={t("codeDigitLabel", { index: index + 1, total: digits.length })}
            aria-invalid={state === "error" || undefined}
            value={digit}
            disabled={disabled}
            onFocus={(event) => event.currentTarget.select()}
            onKeyDown={onKeyDown(index)}
            onChange={(event) => {
              const result = typeIntoDigit(digits, index, event.currentTarget.value);
              onChange(result.digits);
              focusBox(result.focus);
            }}
            style={{ animationDelay: state === "ok" ? `${index * 55}ms` : undefined }}
            className={`caret-primary focus:border-primary focus:shadow-field-focus border-grey-400 text-grey-900 hover:enabled:border-grey-500 h-16 w-full min-w-0 rounded-xl border bg-white text-center text-[27px] font-bold transition-[border-color,box-shadow,background-color,transform] duration-150 outline-none focus:-translate-y-0.5 focus-visible:outline-none disabled:opacity-100 max-[899px]:h-14 max-[899px]:rounded-[10px] max-[899px]:text-[23px] ${BOX_STATES[look]}`}
          />
        );
      })}
    </div>
  );
}
