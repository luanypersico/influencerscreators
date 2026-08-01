import { useCallback, useRef, useState } from "react";

export interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
}

/** Magnifier lens: diameter and how much it zooms in on the image beneath it. */
const LENS_SIZE = 150;
const LENS_ZOOM = 2.5;
/** Touch only: how long a still touch must be held before it's treated as a
 *  zoom instead of a divider drag, and how far it may move before that
 *  decision is made (crossing this cancels the hold and starts a drag). */
const LONG_PRESS_MS = 300;
const MOVE_CANCEL_PX = 10;

interface MagnifierState {
  x: number;
  y: number;
  boxWidth: number;
  boxHeight: number;
}

/**
 * Draggable before/after comparison.
 *
 * Pointer events (not mouse events) so touch and pen work with the same code
 * path; the divider is also a real slider input for keyboard and screen readers.
 *
 * A magnifier lens shows a zoomed-in crop of whichever image is under the
 * cursor: mouse users get it on hover, touch users get it on a held touch
 * (a quick touch-and-move still drags the divider as before).
 */
export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "Original",
  afterLabel = "Realista",
}: BeforeAfterSliderProps) {
  const [pct, setPct] = useState(50);
  const [magnifier, setMagnifier] = useState<MagnifierState | null>(null);
  const frame = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const magnifying = useRef(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const moveTo = useCallback((clientX: number) => {
    const box = frame.current?.getBoundingClientRect();
    if (!box || box.width === 0) return;
    const next = ((clientX - box.left) / box.width) * 100;
    setPct(Math.min(100, Math.max(0, next)));
  }, []);

  const updateMagnifier = useCallback((clientX: number, clientY: number) => {
    const box = frame.current?.getBoundingClientRect();
    if (!box || box.width === 0 || box.height === 0) return;
    setMagnifier({
      x: Math.min(Math.max(clientX - box.left, 0), box.width),
      y: Math.min(Math.max(clientY - box.top, 0), box.height),
      boxWidth: box.width,
      boxHeight: box.height,
    });
  }, []);

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = undefined;
    }
  };

  const endInteraction = useCallback(() => {
    dragging.current = false;
    magnifying.current = false;
    clearLongPress();
    pointerStart.current = null;
    setMagnifier(null);
  }, []);

  return (
    <div className="relative">
      <div
        ref={frame}
        onPointerDown={(e) => {
          // Capture can throw in edge cases (e.g. an already-released pointer
          // id); the drag/zoom logic below must still run when it does.
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            // ignored
          }
          pointerStart.current = { x: e.clientX, y: e.clientY };
          if (e.pointerType !== "touch") {
            dragging.current = true;
            moveTo(e.clientX);
            return;
          }
          // Touch: hold still to zoom, move to drag — decided in onPointerMove.
          longPressTimer.current = setTimeout(() => {
            magnifying.current = true;
            updateMagnifier(e.clientX, e.clientY);
          }, LONG_PRESS_MS);
        }}
        onPointerMove={(e) => {
          if (magnifying.current) {
            updateMagnifier(e.clientX, e.clientY);
            return;
          }
          if (dragging.current) {
            moveTo(e.clientX);
            return;
          }
          if (e.pointerType === "mouse") {
            updateMagnifier(e.clientX, e.clientY);
            return;
          }
          if (pointerStart.current && longPressTimer.current) {
            const dx = e.clientX - pointerStart.current.x;
            const dy = e.clientY - pointerStart.current.y;
            if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) {
              clearLongPress();
              dragging.current = true;
              moveTo(e.clientX);
            }
          }
        }}
        onPointerUp={endInteraction}
        onPointerCancel={endInteraction}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse" && !dragging.current) setMagnifier(null);
        }}
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

        {magnifier && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full border-2 border-white shadow-2xl"
            style={{
              left: magnifier.x - LENS_SIZE / 2,
              top: magnifier.y - LENS_SIZE / 2,
              width: LENS_SIZE,
              height: LENS_SIZE,
              backgroundImage: `url(${magnifier.x < (pct / 100) * magnifier.boxWidth ? beforeSrc : afterSrc})`,
              backgroundSize: `${magnifier.boxWidth * LENS_ZOOM}px ${magnifier.boxHeight * LENS_ZOOM}px`,
              backgroundPosition: `${-(magnifier.x * LENS_ZOOM - LENS_SIZE / 2)}px ${-(magnifier.y * LENS_ZOOM - LENS_SIZE / 2)}px`,
            }}
          />
        )}

        <span className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-background/80 px-2.5 py-1 text-[0.6rem] font-medium tracking-wide text-muted-foreground backdrop-blur">
          Zoom: passe o mouse (ou toque e segure)
        </span>
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
