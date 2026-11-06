import DOMPurify from "dompurify";

/** Seule porte d'entrée pour injecter du HTML (dangerouslySetInnerHTML) : jamais de HTML brut. */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
