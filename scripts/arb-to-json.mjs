#!/usr/bin/env node
// Convertit les fichiers ARB du mobile (source unique des libellés) en messages JSON pour next-intl.
//
//   node scripts/arb-to-json.mjs            convertit ARB_DIR/app_{en,fr}.arb → messages/{en,fr}.json
//   node scripts/arb-to-json.mjs --check    vérifie que en.json et fr.json ont exactement les mêmes clés
//
// ARB_DIR vaut par défaut ../atlight-frontend-mobile/lib/l10n (dépôts frères).
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arbDir = path.resolve(root, process.env.ARB_DIR ?? "../atlight-frontend-mobile/lib/l10n");
const outDir = path.join(root, "messages");
const locales = ["en", "fr"];

/** Retire les métadonnées ARB (`@@locale`, `@cle`) et ne garde que les libellés. */
export function arbToMessages(arb) {
  return Object.fromEntries(
    Object.entries(arb)
      .filter(([key, value]) => !key.startsWith("@") && typeof value === "string")
      .sort(([a], [b]) => a.localeCompare(b)),
  );
}

/** Clés présentes dans une langue et absentes de l'autre. */
export function diffKeys(a, b) {
  const kb = new Set(Object.keys(b));
  return Object.keys(a).filter((k) => !kb.has(k));
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function convert() {
  if (!existsSync(arbDir)) {
    console.error(`Dossier ARB introuvable : ${arbDir} (définir ARB_DIR)`);
    process.exit(1);
  }
  await mkdir(outDir, { recursive: true });
  for (const locale of locales) {
    const messages = arbToMessages(await readJson(path.join(arbDir, `app_${locale}.arb`)));
    await writeFile(path.join(outDir, `${locale}.json`), JSON.stringify(messages, null, 2) + "\n");
    console.log(`messages/${locale}.json : ${Object.keys(messages).length} clés`);
  }
}

async function check() {
  const [en, fr] = await Promise.all(locales.map((l) => readJson(path.join(outDir, `${l}.json`))));
  const missingFr = diffKeys(en, fr);
  const missingEn = diffKeys(fr, en);
  if (missingFr.length || missingEn.length) {
    if (missingFr.length) console.error(`Absentes de fr.json : ${missingFr.join(", ")}`);
    if (missingEn.length) console.error(`Absentes de en.json : ${missingEn.join(", ")}`);
    process.exit(1);
  }
  console.log(`Traductions cohérentes : ${Object.keys(en).length} clés en FR et en EN.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await (process.argv.includes("--check") ? check() : convert());
}
