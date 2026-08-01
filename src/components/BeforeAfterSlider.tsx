import { useCallback, useRef, useState } from "react";

export interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
}

/** Magnifier lens: diameter and how much it zooms in on the image beneath it. */
const LENS_SIZE = 220;
const LENS_ZOOM = 2.5;

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
 * The magnifier lens is opt-in via the zoom toggle button — while it's off,
 * every pointer interaction on the frame drags the divider exactly like
 * before. Only once the user turns zoom on does hover/touch on the frame
 * move a lens instead; this keeps the two gestures from ever competing for
 * the same touch.
 */
export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "Original",
  afterLabel = "Realista",
}: BeforeAfterSliderProps) {
  const [pct, setPct] = useState(50);
  const [zoomMode, setZoomMode] = useState(false);
  const [magnifier, setMagnifier] = useState<MagnifierState | null>(null);
  const frame = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const moveTo = useCallback((clientX: number) => {
    const box = frame.current?.getBoundingClientRect();
    if (!box || box.width === 0) return;
    const next = ((clientX - box.left) / box.width) * 100;
    setPct(Math.min(100, Math.max(0, next)));
  }, []);

  const updateMagnifier = useCallback((clientX: number, clientY: number) => {
    // A pending "pointer left" clear from a spurious leave event (see
    // onPointerLeave) is stale the moment a real move comes back in.
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = undefined;
    }
    const box = frame.current?.getBoundingClientRect();
    if (!box || box.width === 0 || box.height === 0) return;
    setMagnifier({
      x: Math.min(Math.max(clientX - box.left, 0), box.width),
      y: Math.min(Math.max(clientY - box.top, 0), box.height),
      boxWidth: box.width,
      boxHeight: box.height,
    });
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
          if (zoomMode) {
            updateMagnifier(e.clientX, e.clientY);
            return;
          }
          dragging.current = true;
          moveTo(e.clientX);
        }}
        onPointerMove={(e) => {
          if (zoomMode) {
            // Mouse hovers without a button held; touch only reports move
            // while the finger is actually down (buttons is 0 otherwise).
            if (e.pointerType === "mouse" || e.buttons > 0) {
              updateMagnifier(e.clientX, e.clientY);
            }
            return;
          }
          if (dragging.current) moveTo(e.clientX);
        }}
        onPointerUp={() => {
          dragging.current = false;
          if (zoomMode) setMagnifier(null);
        }}
        onPointerCancel={() => {
          dragging.current = false;
          if (zoomMode) setMagnifier(null);
        }}
        onPointerLeave={(e) => {
          // Dragging is tracked via pointer capture, so it keeps working even
          // if the cursor briefly reports as "outside" the frame — only a
          // real pointerup/pointercancel should end it.
          if (!zoomMode || e.pointerType !== "mouse") return;
          // Inserting the lens under a still cursor makes Chromium fire a
          // pointerleave that isn't real (the pointer never actually left).
          // Re-checking the event's own coordinates against the frame's
          // current bounds once the DOM has settled filters those out; a
          // genuine exit is outside the frame both now and 50ms from now.
          const { clientX, clientY } = e;
          leaveTimer.current = setTimeout(() => {
            const box = frame.current?.getBoundingClientRect();
            const stillInside =
              box &&
              clientX >= box.left &&
              clientX <= box.right &&
              clientY >= box.top &&
              clientY <= box.bottom;
            if (!stillInside) setMagnifier(null);
          }, 50);
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

        {zoomMode && magnifier && (
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

        <button
          type="button"
          aria-pressed={zoomMode}
          aria-label={zoomMode ? "Desativar zoom" : "Ativar zoom"}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            setZoomMode((v) => !v);
            setMagnifier(null);
          }}
          className={`absolute right-3 bottom-3 grid size-8 place-items-center rounded-full text-sm backdrop-blur transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
            zoomMode
              ? "bg-primary text-primary-foreground"
              : "bg-background/80 text-muted-foreground hover:text-foreground"
          }`}
        >
          🔍
        </button>
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
