import { useEffect, useState } from "react";

/**
 * Cortina de privacidade reutilizável para páginas com conteúdo
 * sensível (galeria pública bloqueada, prompts da área de membros).
 * É uma dissuasão adicional, não uma garantia técnica — nenhum destes
 * eventos consegue detectar ou impedir uma captura de tela de verdade
 * (o sistema operacional não avisa o navegador de forma confiável).
 * O que ela faz: reage a sinais que o navegador de fato emite
 * (PrintScreen quando suportado, perda de foco/visibilidade, Ctrl/Cmd+P)
 * cobrindo a tela por um instante, e bloqueia a impressão via
 * `@media print` (ver estilos globais, classe `.protected-content`).
 */

const CURTAIN_DURATION_MS = 2500;

export function isPrintScreenKey(event: Pick<KeyboardEvent, "key" | "code">): boolean {
  return event.key === "PrintScreen" || event.code === "PrintScreen";
}

export function isPrintShortcut(
  event: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey">,
): boolean {
  return (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p";
}

export function PrivacyCurtain() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    function showCurtainBriefly() {
      setVisible(true);
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setVisible(false), CURTAIN_DURATION_MS);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (isPrintScreenKey(event)) {
        showCurtainBriefly();
      }
      if (isPrintShortcut(event)) {
        event.preventDefault();
        showCurtainBriefly();
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") showCurtainBriefly();
    }

    function handleBlur() {
      showCurtainBriefly();
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="privacy-curtain" role="presentation" aria-hidden="true">
      <p>Conteúdo protegido</p>
    </div>
  );
}
