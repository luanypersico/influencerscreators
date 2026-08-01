/**
 * Toggleable realism "commands".
 *
 * Each command is an English fragment appended to the base prompt. Grouping
 * mirrors how people actually debug a fake-looking image: first the face, then
 * the body, then the device, then the light, then the edit.
 */

export type PromptMode = "image" | "video";

export interface Command {
  id: string;
  label: string;
  /** Portuguese micro-explanation shown under the label. */
  hint: string;
  /** English fragment concatenated into the prompt. */
  fragment: string;
}

export interface CommandGroup {
  id: string;
  label: string;
  /** Which mode this group applies to. Omitted means both. */
  mode?: PromptMode;
  commands: Command[];
}

export const COMMAND_GROUPS: CommandGroup[] = [
  {
    id: "rosto",
    label: "Rosto e pele",
    commands: [
      {
        id: "poros",
        label: "Poros visíveis",
        hint: "Textura real em close",
        fragment: "visible skin pores and fine peach fuzz across the cheeks and jaw",
      },
      {
        id: "oleosa",
        label: "Zona T oleosa",
        hint: "Brilho especular no nariz e testa",
        fragment: "oily T-zone with specular shine on the nose, forehead and chin",
      },
      {
        id: "imperfeicoes",
        label: "Imperfeições ativas",
        hint: "Espinha, cravo, vermelhidão",
        fragment:
          "active blemishes, a healing spot, blackheads on the nose and uneven redness on the cheeks",
      },
      {
        id: "olheira",
        label: "Olheira e cansaço",
        hint: "Pálpebra levemente inchada",
        fragment: "faint under-eye discoloration and slightly puffy lower eyelids",
      },
      {
        id: "assimetria",
        label: "Assimetria facial",
        hint: "Nada de rosto espelhado",
        fragment:
          "natural facial asymmetry: one eyebrow sits higher, the smile pulls to one side",
      },
      {
        id: "labio",
        label: "Lábio rachado",
        hint: "Detalhe que quase ninguém pede",
        fragment: "chapped lip texture with fine vertical cracks, no gloss",
      },
      {
        id: "pelos",
        label: "Pelos fora do lugar",
        hint: "Sobrancelha e cabelo soltos",
        fragment: "stray eyebrow hairs and loose strands falling across the forehead",
      },
    ],
  },
  {
    id: "corpo",
    label: "Corpo",
    commands: [
      {
        id: "maos",
        label: "Mãos corretas",
        hint: "Cinco dedos, unha real",
        fragment:
          "anatomically correct hands with five fingers, short uneven nails, one small hangnail and dry skin near the knuckles",
      },
      {
        id: "postura",
        label: "Postura relaxada",
        hint: "Peso em uma perna",
        fragment: "relaxed unposed body language, weight on one leg, shoulders slightly uneven",
      },
      {
        id: "marcas",
        label: "Marcas de roupa",
        hint: "Alça e elástico na pele",
        fragment: "faint strap marks on the shoulders and elastic imprints on the skin",
      },
      {
        id: "suor",
        label: "Suor real",
        hint: "Para academia e calor",
        fragment: "light sweat sheen at the hairline, temples and along the spine",
      },
      {
        id: "tecido",
        label: "Tecido com peso",
        hint: "Ruga e dobra natural",
        fragment: "clothing with real weight: natural creasing at the elbows and waist, slight pilling",
      },
    ],
  },
  {
    id: "dispositivo",
    label: "Dispositivo",
    commands: [
      {
        id: "iphone",
        label: "Câmera de celular",
        hint: "24mm, HDR agressivo",
        fragment:
          "shot on an iPhone 15 Pro, 24mm equivalent, aggressive in-camera HDR and mild edge distortion",
      },
      {
        id: "dslr",
        label: "85mm f/1.4",
        hint: "Retrato com separação real",
        fragment:
          "shot on a Canon EOS R5 with an 85mm f/1.4 lens wide open, focus locked on the near eye",
      },
      {
        id: "doc35",
        label: "35mm documental",
        hint: "Contexto e cenário legível",
        fragment: "shot on a Sony A7 IV with a 35mm f/1.8 lens at f/2.0, documentary framing",
      },
      {
        id: "filme",
        label: "Filme Portra 400",
        hint: "Grão fino e halation",
        fragment: "shot on Kodak Portra 400 35mm film with visible fine grain and gentle halation",
      },
      {
        id: "compacta",
        label: "Compacta com flash",
        hint: "Estética anos 2000",
        fragment:
          "shot on a 2000s compact point-and-shoot with direct on-camera flash, hot highlights and a hard shadow outline behind the subject",
      },
      {
        id: "webcam",
        label: "Webcam / print de vídeo",
        hint: "Foco mole e compressão",
        fragment:
          "looks like a frame grab from a handheld video: soft focus, rolling-shutter smear and compression artifacts",
      },
    ],
  },
  {
    id: "iluminacao",
    label: "Iluminação",
    commands: [
      {
        id: "janela",
        label: "Janela nublada",
        hint: "A luz mais segura de todas",
        fragment:
          "soft diffused daylight from one large window on an overcast day, gentle falloff, no hard shadows",
      },
      {
        id: "golden",
        label: "Golden hour lateral",
        hint: "Rim light quente no cabelo",
        fragment: "low golden-hour sun raking from the side, warm rim light on the hair, long shadows",
      },
      {
        id: "solduro",
        label: "Sol duro de meio-dia",
        hint: "Sombra de borda dura",
        fragment: "harsh midday sun with hard-edged shadows and squinting eyes",
      },
      {
        id: "flash",
        label: "Flash direto à noite",
        hint: "Fundo escuro, pele estourada",
        fragment:
          "direct flash at night against a dark background, slight overexposure on the nose and forehead",
      },
      {
        id: "mista",
        label: "Luz mista de interior",
        hint: "Choque de temperatura",
        fragment:
          "mixed indoor lighting: warm tungsten lamps plus cool screen spill, visible color temperature clash",
      },
      {
        id: "unica",
        label: "Uma única fonte",
        hint: "Nada de luz vindo de tudo",
        fragment:
          "exactly one dominant light source with a clearly readable direction, everything else is bounce",
      },
    ],
  },
  {
    id: "cenario",
    label: "Cenário",
    commands: [
      {
        id: "bagunca",
        label: "Bagunça real",
        hint: "Cenário limpo denuncia IA",
        fragment:
          "lived-in background clutter: chargers, cups, crumpled fabric, things left mid-use",
      },
      {
        id: "gente",
        label: "Gente desfocada",
        hint: "Prova de que o mundo existe",
        fragment: "out-of-focus strangers passing behind, one partially cropped by the frame edge",
      },
      {
        id: "sujeira",
        label: "Vidro e espelho sujos",
        hint: "Marca de dedo, poeira",
        fragment: "fingerprints, dust and smudges on nearby glass or mirror surfaces",
      },
      {
        id: "corte",
        label: "Enquadramento torto",
        hint: "Ninguém enquadra perfeito",
        fragment: "slightly crooked horizon and imperfect composition, too much headroom on one side",
      },
    ],
  },
  {
    id: "edicao",
    label: "Edição",
    commands: [
      {
        id: "semfiltro",
        label: "Zero filtro de beleza",
        hint: "Ligue isso sempre",
        fragment:
          "absolutely no beauty filter, no skin smoothing, no airbrushing, no symmetry correction",
      },
      {
        id: "grao",
        label: "Grão e ruído",
        hint: "Ruído na sombra",
        fragment: "natural sensor noise in the shadows and fine film-like grain",
      },
      {
        id: "grade",
        label: "Cor contida",
        hint: "Sem saturação de banco de imagem",
        fragment: "restrained neutral color grade, film-like tonal rolloff, no HDR crunch",
      },
      {
        id: "sharp",
        label: "Sem sharpening",
        hint: "Evita halo nos olhos",
        fragment: "no over-sharpening, no halos around edges, no glossy catchlights in the eyes",
      },
      {
        id: "jpeg",
        label: "Cara de JPEG salvo",
        hint: "Artefato de compressão leve",
        fragment: "mild JPEG compression artifacts as if re-saved by a social app",
      },
    ],
  },
  {
    id: "movimento",
    label: "Movimento",
    mode: "video",
    commands: [
      {
        id: "tremida",
        label: "Câmera tremida",
        hint: "Movimento manual e irregular",
        fragment: "handheld camera shake with irregular micro-drift, no artificial stabilization",
      },
      {
        id: "abrupto",
        label: "Movimentos abruptos",
        hint: "Mudanças rápidas e não suaves",
        fragment: "abrupt non-smooth movements, quick corrections instead of eased motion",
      },
      {
        id: "reframe",
        label: "Reenquadramento ao vivo",
        hint: "Ajustes visíveis da câmera",
        fragment: "camera reframing mid-shot with small visible unplanned adjustments",
      },
      {
        id: "micro",
        label: "Microexpressões",
        hint: "Piscada e respiração",
        fragment: "subtle facial micro-expressions, natural blinking every 2-3 seconds, visible breathing",
      },
      {
        id: "identidade",
        label: "Trava de identidade",
        hint: "Sem morphing de rosto",
        fragment:
          "the face keeps identical proportions and identity for the entire duration, no morphing, no drifting features, no limbs changing length",
      },
      {
        id: "corte",
        label: "Início e fim crus",
        hint: "Sem fade, sem transição",
        fragment: "abrupt start and end, no fade in or out, no speed ramps, one continuous take",
      },
      {
        id: "pacing",
        label: "Ritmo irregular",
        hint: "Pausas naturais na fala",
        fragment: "uneven pacing with natural pauses, nothing metronomic",
      },
    ],
  },
  {
    id: "audio",
    label: "Áudio",
    mode: "video",
    commands: [
      {
        id: "sala",
        label: "Som de sala",
        hint: "Reflexo curto, sem estúdio",
        fragment:
          "audio recorded in a small room: close dry voice with short reflections and faint room tone",
      },
      {
        id: "semmusica",
        label: "Sem música",
        hint: "Só a voz",
        fragment: "voice only, no music bed, no reverb tail, no sound design",
      },
      {
        id: "lipsync",
        label: "Lipsync preciso",
        hint: "Boca coerente com a sílaba",
        fragment:
          "lip shapes match the spoken syllables precisely, jaw opening scaled to each vowel, no over-articulation",
      },
      {
        id: "ambiente",
        label: "Ruído de ambiente",
        hint: "Rua, cozinha, ventilador",
        fragment: "quiet ambient background noise appropriate to the location, slightly clipping at peaks",
      },
    ],
  },
  {
    id: "outros",
    label: "Outros",
    commands: [
      {
        id: "semtexto",
        label: "Sem texto na imagem",
        hint: "Evita marca d'água inventada",
        fragment: "no text, no watermark, no logo anywhere in the frame",
      },
      {
        id: "semmarca",
        label: "Produto sem marca",
        hint: "Para UGC seguro",
        fragment: "any product in frame is unbranded with a plain readable label",
      },
      {
        id: "indistinguivel",
        label: "Indistinguível de foto",
        hint: "Fecha o prompt com força",
        fragment:
          "the result must be indistinguishable from an ordinary photo taken by a real person on a real day",
      },
    ],
  },
];

/** Groups visible for a given mode. */
export function groupsForMode(mode: PromptMode): CommandGroup[] {
  return COMMAND_GROUPS.filter((g) => !g.mode || g.mode === mode);
}