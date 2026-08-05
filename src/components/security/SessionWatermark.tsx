import type { BergamoMemberWatermark } from "@/lib/member.server";

/**
 * Marca-d'água repetida, sutil, sobre a área autenticada — dissuasão
 * contra compartilhamento de prints, não uma garantia técnica. O
 * conteúdo (e-mail mascarado, identificador curto, "Uso pessoal") vem
 * sempre do servidor (getBergamoMemberContent), nunca montado a partir
 * de dados de sessão do cliente — por isso é sempre exatamente o que o
 * backend decidiu expor, nunca o UUID completo nem qualquer claim/token.
 */
export function buildWatermarkPatternDataUri(watermark: BergamoMemberWatermark): string {
  const text = `${watermark.maskedEmail} · #${watermark.shortId} · ${watermark.label}`;
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="340" height="180"><text x="170" y="94" transform="rotate(-24 170 94)" font-family="Arial, sans-serif" font-size="13" fill="white" fill-opacity="0.12" text-anchor="middle">${escaped}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function SessionWatermark({ watermark }: { watermark: BergamoMemberWatermark }) {
  return (
    <div
      aria-hidden="true"
      className="session-watermark"
      style={{ backgroundImage: `url("${buildWatermarkPatternDataUri(watermark)}")` }}
    />
  );
}
