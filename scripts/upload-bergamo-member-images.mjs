/**
 * Envia os 90 originais do Arsenal Bergamo para o bucket PRIVADO
 * `bergamo-member-images` e grava o caminho interno em
 * product_items.member_image_path (nunca uma URL).
 *
 * Fora do código acessível pelo navegador: vive em scripts/, nunca é
 * importado por nenhuma rota, componente ou função de servidor da
 * aplicação. Só roda manualmente, por um operador com acesso ao secret.
 *
 * Exige no ambiente (nunca hardcoded, nunca commitado):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Idempotente: mantém um manifesto local (SHA-256 por código) em
 * scripts/.bergamo-member-images-manifest.json. Rodar de novo sem
 * mudar os arquivos-fonte não reenvia nada (só confirma que o estado já
 * bate); mudar um arquivo-fonte reenvia só aquele código (upsert no
 * mesmo caminho estável `bergamo/{code}.jpg`, nunca cria um segundo
 * objeto). Nunca torna o bucket público, nunca imprime o service role,
 * nunca registra token.
 *
 * Uso: `SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/upload-bergamo-member-images.mjs`
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const GALLERY_DIR = join(ROOT, "src/assets/bergamo/gallery");
const MANIFEST_PATH = join(HERE, ".bergamo-member-images-manifest.json");
const BUCKET = "bergamo-member-images";
const EXPECTED_COUNT = 90;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variável de ambiente obrigatória ausente: ${name}. Este script nunca usa um valor hardcoded.`,
    );
  }
  return value;
}

function loadManifest() {
  if (!existsSync(MANIFEST_PATH)) return {};
  try {
    return JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  } catch {
    return {};
  }
}

function saveManifest(manifest) {
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function contentTypeFor(fileName) {
  if (fileName.endsWith(".png")) return "image/png";
  if (fileName.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

async function main() {
  // As duas variáveis vêm só do ambiente — nunca logadas, nunca
  // impressas, nem mesmo em caso de erro.
  const SUPABASE_URL = requireEnv("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const files = readdirSync(GALLERY_DIR)
    .filter((f) => /^\d{2}\.jpg$/.test(f))
    .sort();

  if (files.length !== EXPECTED_COUNT) {
    throw new Error(
      `Esperava exatamente ${EXPECTED_COUNT} arquivos em ${GALLERY_DIR}, encontrei ${files.length}. Abortando sem enviar nada.`,
    );
  }

  const { data: product, error: productError } = await admin
    .from("products")
    .select("id")
    .eq("slug", "bergamo")
    .maybeSingle();
  if (productError) throw new Error(productError.message);
  if (!product) throw new Error("Produto Bergamo não encontrado — abortando.");

  const manifest = loadManifest();
  const report = { uploaded: [], skipped: [], mismatched: [] };

  for (const file of files) {
    const code = file.replace(/\.jpg$/, "");
    const sourcePath = join(GALLERY_DIR, file);
    const checksum = sha256File(sourcePath);
    const storagePath = `bergamo/${file}`;

    const unchanged = manifest[code] === checksum;

    if (!unchanged) {
      const bytes = readFileSync(sourcePath);
      const { error: uploadError } = await admin.storage.from(BUCKET).upload(storagePath, bytes, {
        contentType: contentTypeFor(file),
        upsert: true,
      });
      if (uploadError) {
        report.mismatched.push({ code, reason: uploadError.message });
        continue;
      }
      manifest[code] = checksum;
    }

    const { error: updateError } = await admin
      .from("product_items")
      .update({ member_image_path: storagePath })
      .eq("product_id", product.id)
      .eq("code", code);

    if (updateError) {
      report.mismatched.push({ code, reason: updateError.message });
      continue;
    }

    if (unchanged) report.skipped.push(code);
    else report.uploaded.push(code);
  }

  saveManifest(manifest);

  console.log(`Enviados (novo ou alterado): ${report.uploaded.length} — ${report.uploaded.join(", ") || "nenhum"}`);
  console.log(`Ignorados (checksum igual):  ${report.skipped.length} — ${report.skipped.join(", ") || "nenhum"}`);
  console.log(`Divergentes/erro:            ${report.mismatched.length}`);
  for (const m of report.mismatched) console.log(`  - ${m.code}: ${m.reason}`);

  if (report.mismatched.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Falha no upload:", err.message);
  process.exit(1);
});
