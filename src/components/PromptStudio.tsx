import { Image as ImageIcon, Video } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { ArsenalLogo } from "@/components/brand/ArsenalLogo";
import { CommandPanel } from "@/components/CommandPanel";
import { PresetRail } from "@/components/PresetRail";
import { PromptOutput } from "@/components/PromptOutput";
import heroAi from "@/assets/hero-ai.jpg";
import heroPortrait from "@/assets/hero-portrait.jpg";
import { NEGATIVE_PROMPT } from "@/data/builder";
import { COMMAND_GROUPS, type PromptMode } from "@/data/commands";
import { PROMPTS, type Prompt } from "@/data/prompts";
import { cn } from "@/lib/utils";

/** Prompt categories that belong to the video tab. */
const VIDEO_CATEGORIES = new Set(["video", "motion"]);

const FALLBACK_BASE: Record<PromptMode, string> = {
  image:
    "Photorealistic photograph of a 24-year-old Brazilian woman in an everyday setting, shot like an ordinary snapshot rather than a campaign image.",
  video:
    "Photorealistic handheld video of a 24-year-old Brazilian woman in an everyday setting, one continuous take, spoken naturally to camera.",
};

function fragmentFor(key: string): string | undefined {
  const [groupId, commandId] = key.split(":");
  return COMMAND_GROUPS.find((g) => g.id === groupId)?.commands.find((c) => c.id === commandId)
    ?.fragment;
}

/**
 * The studio: pick a mode, pick a preset, toggle commands, copy the result.
 * All prompt text is derived from state — never stored twice — except when the
 * user hand-edits, which sets an explicit override.
 */
export function PromptStudio() {
  const [mode, setMode] = useState<PromptMode>("image");
  const [presetId, setPresetId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [override, setOverride] = useState<string | null>(null);

  const presets = useMemo(
    () =>
      PROMPTS.filter((p) =>
        mode === "video" ? VIDEO_CATEGORIES.has(p.category) : !VIDEO_CATEGORIES.has(p.category),
      ),
    [mode],
  );

  const preset = presets.find((p) => p.id === presetId) ?? null;

  const composed = useMemo(() => {
    const base = preset?.prompt ?? FALLBACK_BASE[mode];
    const fragments = [...selected].map(fragmentFor).filter(Boolean) as string[];
    if (fragments.length === 0) return base;
    return `${base}\n\nApply: ${fragments.join("; ")}.`;
  }, [preset, mode, selected]);

  const value = override ?? composed;

  const toggle = useCallback((key: string) => {
    setOverride(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const selectPreset = useCallback((next: Prompt) => {
    setOverride(null);
    setPresetId((current) => (current === next.id ? null : next.id));
  }, []);

  const switchMode = useCallback((next: PromptMode) => {
    setMode(next);
    setPresetId(null);
    setOverride(null);
    setSelected(new Set());
  }, []);

  return (
    <div id="studio" className="mx-auto max-w-7xl px-4 pb-10 md:px-8">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-6">
        <div className="flex min-w-0 items-center gap-3">
          <ArsenalLogo className="w-24 shrink-0 sm:w-28" />
          <div className="min-w-0">
            <h1 className="truncate text-2xl leading-tight md:text-3xl">Me dá uma Influencer</h1>
            <p className="truncate text-xs text-muted-foreground">
              Prompts que tiram a cara de IA de fotos e vídeos
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-1 rounded-full border border-border bg-card p-1">
          <ModeButton active={mode === "image"} onClick={() => switchMode("image")}>
            <ImageIcon className="size-3.5" /> Imagem
          </ModeButton>
          <ModeButton active={mode === "video"} onClick={() => switchMode("video")}>
            <Video className="size-3.5" /> Vídeo
          </ModeButton>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <BeforeAfterSlider beforeSrc={heroAi} afterSrc={heroPortrait} />
          </div>
          <PromptOutput
            value={value}
            onChange={setOverride}
            onClear={() => {
              setSelected(new Set());
              setPresetId(null);
              setOverride(null);
            }}
            negative={NEGATIVE_PROMPT}
          />
        </div>

        <div className="flex flex-col gap-4">
          <PresetRail presets={presets} activeId={presetId} onSelect={selectPreset} />
          <CommandPanel mode={mode} selected={selected} onToggle={toggle} />
        </div>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  children,
  ...rest
}: React.ComponentProps<"button"> & { active: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
