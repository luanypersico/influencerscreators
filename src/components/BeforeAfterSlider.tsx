import { useCallback, useRef, useState } from "react";

export interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
}

/**
 * Draggable before/after comparison.
 *
 * Pointer events (not mouse events) so touch and pen work with the same code
 * path; the divider is also a real slider input for keyboard and screen readers.
 */
export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "Original",
  afterLabel = "Realista",
}: BeforeAfterSliderProps) {
  const [pct, setPct] = useState(50);
  const frame = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  const moveTo = useCallback((clientX: number) => {
    const box = frame.current?.getBoundingClientRect();
    if (!box || box.width === 0) return;
    const next = ((clientX - box.left) / box.width) * 100;
    setPct(Math.min(100, Math.max(0, next)));
  }, []);

  return (
    <div className="relative">
      <div
        ref={frame}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          moveTo(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
        className="relative aspect-[4/5] w-full touch-none overflow-hidden rounded-xl select-none"
      >
        <img
          src={afterSrc}
          alt="Versão realista: pele com poros, brilho natural e imperfeições preservadas"
          width={1024}
          height={1280}
          className="absolute inset-0 size-full object-cover"
        />
        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        >
          <img
            src={beforeSrc}
            alt=""
            width={1024}
            height={1280}
            className="absolute inset-0 h-full w-[var(--frame-w)] object-cover"
            style={{ "--frame-w": `${frame.current?.offsetWidth ?? 0}px` } as React.CSSProperties}
          />
        </div>

        <span className="absolute top-3 left-3 rounded-full bg-background/80 px-2.5 py-1 text-[0.65rem] font-medium tracking-wide text-foreground backdrop-blur">
          {beforeLabel}
        </span>
        <span className="absolute top-3 right-3 rounded-full bg-background/80 px-2.5 py-1 text-[0.65rem] font-medium tracking-wide text-primary backdrop-blur">
          {afterLabel}
        </span>

        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-white/90"
          style={{ left: `${pct}%` }}
        >
          <span className="absolute top-1/2 left-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-background/90 text-xs text-primary shadow-lg">
            ↔
          </span>
        </div>
      </div>

      <label className="sr-only" htmlFor="ba-range">
        Comparar antes e depois
      </label>
      <input
        id="ba-range"
        type="range"
        min={0}
        max={100}
        value={Math.round(pct)}
        onChange={(e) => setPct(Number(e.target.value))}
        className="mt-3 w-full accent-[var(--primary)]"
      />
    </div>
  );
}