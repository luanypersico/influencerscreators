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
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          className="absolute inset-0 size-full object-cover [-webkit-touch-callout:none]"
        />
        {/* clip-path instead of a width-limited wrapper so the underlying image
            never rescales while dragging. draggable=false + onDragStart prevent
            the browser's native image drag from hijacking the pointer gesture
            mid-swipe (it was firing pointercancel and freezing the divider). */}
        <img
          src={beforeSrc}
          alt=""
          aria-hidden="true"
          width={1024}
          height={1280}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          className="absolute inset-0 size-full object-cover [-webkit-touch-callout:none]"
          style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
        />

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