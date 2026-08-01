/**
 * Option sets for the prompt builder.
 *
 * Each option carries an English `value` fragment that is concatenated into the
 * final prompt. Labels stay in Portuguese for the UI.
 */

export interface Option {
  label: string;
  value: string;
}

export interface Field {
  id: string;
  label: string;
  /** Short explanation of why this axis matters for realism. */
  hint: string;
  options: Option[];
}

export const FIELDS: Field[] = [
  {
    id: "subject",
    label: "Perfil",
    hint: "Idade e etnia definem a estrutura facial",
    options: [
      { label: "Brasileira 22a, morena", value: "a 22-year-old Brazilian woman with warm light-brown skin and dark wavy hair" },
      { label: "Brasileira 27a, negra", value: "a 27-year-old Black Brazilian woman with deep brown skin and natural coily hair" },
      { label: "Brasileira 24a, ruiva sardenta", value: "a 24-year-old Brazilian woman with fair freckled skin and copper-red hair" },
      { label: "Latina 30a, cabelo liso", value: "a 30-year-old Latina woman with olive skin and long straight dark hair" },
      { label: "Asiática 25a", value: "a 25-year-old East Asian woman with fair neutral skin and shoulder-length black hair" },
      { label: "Homem brasileiro 29a", value: "a 29-year-old Brazilian man with tan skin, short dark hair and light stubble" },
    ],
  },
  {
    id: "shot",
    label: "Enquadramento",
    hint: "Define distância e o quanto a pele aparece",
    options: [
      { label: "Close-up", value: "tight close-up framing, head and shoulders" },
      { label: "Meio corpo", value: "medium waist-up framing" },
      { label: "Corpo inteiro", value: "full-body framing with headroom" },
      { label: "Selfie no braço", value: "arm's-length selfie framing, slight upward angle, one arm visible" },
      { label: "Roubada / candid", value: "candid wide framing, subject unaware of the camera" },
    ],
  },
  {
    id: "camera",
    label: "Câmera & lente",
    hint: "O maior atalho anti-IA: física óptica real",
    options: [
      { label: "35mm f/1.8 documental", value: "shot on a Sony A7 IV with a 35mm f/1.8 lens at f/2.0, shallow depth of field" },
      { label: "85mm f/1.4 retrato", value: "shot on a Canon EOS R5 with an 85mm f/1.4 lens wide open, creamy background separation" },
      { label: "iPhone frontal", value: "shot on an iPhone 15 Pro front camera, 24mm equivalent, mild lens distortion near the edges" },
      { label: "Filme 35mm Portra 400", value: "shot on Kodak Portra 400 35mm film, visible fine grain and gentle halation" },
      { label: "Point-and-shoot com flash", value: "shot on a 2000s compact point-and-shoot with direct on-camera flash, slight overexposure on the nose and forehead" },
    ],
  },
  {
    id: "light",
    label: "Luz",
    hint: "Luz errada é o que mais entrega imagem de IA",
    options: [
      { label: "Golden hour lateral", value: "low golden-hour sunlight raking from the side, warm rim light on the hair, long soft shadows" },
      { label: "Janela nublada", value: "soft diffused daylight from a large window on an overcast day, gentle falloff, no hard shadows" },
      { label: "Interior noturno prático", value: "mixed practical indoor lighting at night, warm tungsten lamps plus cool screen spill, visible color temperature clash" },
      { label: "Sol duro do meio-dia", value: "harsh midday sun, hard-edged shadows, squinting eyes, blown-out highlights on the skin" },
      { label: "Flash direto na noite", value: "direct flash at night against a dark background, hot specular highlights, sharp shadow outline behind the subject" },
    ],
  },
  {
    id: "scene",
    label: "Cenário",
    hint: "Contexto real dá credibilidade ao feed",
    options: [
      { label: "Rua de SP", value: "on a busy São Paulo sidewalk with graffitied walls and out-of-focus pedestrians behind" },
      { label: "Café bagunçado", value: "inside a small crowded specialty coffee shop, cluttered table, other customers blurred in the background" },
      { label: "Quarto real", value: "in a lived-in bedroom with slightly wrinkled bedding, chargers and clutter visible on the nightstand" },
      { label: "Academia", value: "in a real commercial gym with rubber flooring, racks and mirrors, other people out of focus" },
      { label: "Praia no fim do dia", value: "on a Brazilian beach late in the afternoon, damp sand, sea haze in the distance" },
      { label: "Elevador com espelho", value: "in a mirrored apartment elevator, phone visible in hand, fingerprints on the glass" },
    ],
  },
  {
    id: "wardrobe",
    label: "Roupa",
    hint: "Tecido com peso e ruga real",
    options: [
      { label: "Streetwear oversized", value: "wearing an oversized washed cotton tee and baggy jeans, fabric creasing naturally at the elbows" },
      { label: "Vestido de verão", value: "wearing a light floral summer dress that moves with the breeze, thin straps leaving faint marks on the shoulders" },
      { label: "Look academia", value: "wearing a fitted seamless sports set with visible sweat patches and slight fabric pilling" },
      { label: "Alfaiataria", value: "wearing a relaxed tailored blazer over a plain tank top, natural shoulder wrinkles" },
      { label: "Loungewear em casa", value: "wearing a worn hoodie and shorts, hair slightly messy, no styling" },
    ],
  },
  {
    id: "expression",
    label: "Expressão & pose",
    hint: "Assimetria vence o sorriso perfeito",
    options: [
      { label: "Meio riso natural", value: "caught mid-laugh with an asymmetric smile, eyes slightly crinkled, not looking at the lens" },
      { label: "Olhar direto neutro", value: "looking straight into the lens with a calm neutral expression, lips relaxed and slightly parted" },
      { label: "Distraída no celular", value: "distracted, looking down at her phone, shoulders dropped, weight on one leg" },
      { label: "Meio movimento", value: "mid-stride with motion blur on one hand, hair caught in movement" },
      { label: "Cansada / desarrumada", value: "tired end-of-day expression, slightly puffy eyes, hair falling out of place" },
    ],
  },
  {
    id: "skin",
    label: "Nível de imperfeição",
    hint: "O interruptor principal do realismo",
    options: [
      { label: "Alto — pele crua", value: "hyper-detailed unretouched skin: visible pores, fine peach fuzz, uneven tone, active blemishes, blackheads on the nose, oily T-zone with specular shine, faint under-eye discoloration, stray eyebrow hairs, chapped lip texture" },
      { label: "Médio — natural", value: "natural skin texture with visible pores, subtle redness on the cheeks and nose, a few freckles, minimal makeup, no smoothing" },
      { label: "Baixo — editorial", value: "clean but real skin texture, pores preserved, light matte makeup, no plastic smoothing or airbrushing" },
    ],
  },
  {
    id: "finish",
    label: "Acabamento",
    hint: "Como o arquivo final deveria parecer",
    options: [
      { label: "Foto de celular sem edição", value: "unedited straight-out-of-phone look, slightly crooked horizon, mild noise in the shadows, aggressive in-camera HDR" },
      { label: "RAW mal revelado", value: "flat RAW-like rendering with slightly clipped highlights, mild chromatic aberration at high-contrast edges" },
      { label: "Editorial contido", value: "restrained editorial color grade, neutral whites, film-like tonal rolloff, no HDR crunch" },
      { label: "Print de vídeo", value: "looks like a frame grab from a handheld video: soft focus, rolling-shutter smear, compression artifacts" },
    ],
  },
];

/** Appended to every generated prompt: the anti-AI guardrails. */
export const NEGATIVE_PROMPT =
  "airbrushed skin, plastic skin, waxy texture, beauty filter, symmetrical face, flawless complexion, over-sharpened eyes, glossy catchlights, HDR glow, oversaturated colors, studio backdrop, perfect teeth, mannequin pose, digital art, illustration, render, 3d, cgi, extra fingers, deformed hands, watermark, text";

/** Rules that materially raise realism, shown as a checklist in the UI. */
export const REALISM_RULES: { title: string; body: string }[] = [
  {
    title: "Nomeie a câmera e o diafragma",
    body: "Modelo de corpo + lente + abertura força o modelo a simular profundidade de campo e distorção reais em vez de um bokeh genérico.",
  },
  {
    title: "Peça imperfeição explícita",
    body: "Poros, brilho na zona T, fio de cabelo fora do lugar, lábio rachado. Sem isso, o padrão do modelo é pele de propaganda.",
  },
  {
    title: "Descreva uma única fonte de luz",
    body: "Direção, dureza e temperatura. Luz vinda de todo lado é a assinatura visual de imagem gerada.",
  },
  {
    title: "Sujeira no cenário",
    body: "Bagunça, gente desfocada, marca de dedo no espelho. Cenário limpo demais denuncia a origem sintética.",
  },
  {
    title: "Evite o olhar perfeito na lente",
    body: "Olhar desviado, meio movimento, expressão assimétrica. O retrato frontal e simétrico é o que mais parece IA.",
  },
  {
    title: "Fixe a identidade antes de escalar",
    body: "Monte um character sheet e repita o mesmo bloco de identidade em todo prompt. É o que mantém a mesma pessoa em posts diferentes.",
  },
];