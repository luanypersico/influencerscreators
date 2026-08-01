/**
 * Curated prompt library for photorealistic AI influencer generation.
 *
 * Every prompt is written in English on purpose: image models (NanoBanana Pro,
 * GPT Image, Flux, Midjourney) are trained overwhelmingly on English captions,
 * so English yields measurably tighter adherence than Portuguese.
 */

export interface Prompt {
  /** Stable slug, used as React key and copy-analytics id. */
  id: string;
  title: string;
  /** Portuguese one-liner: what this prompt is for. */
  description: string;
  category: CategoryId;
  /** Searchable free-form tags (lowercase, no accents). */
  tags: string[];
  /** The prompt itself, ready to paste. */
  prompt: string;
}

export type CategoryId =
  | "retrato"
  | "selfie"
  | "ugc"
  | "lifestyle"
  | "fitness"
  | "moda"
  | "viagem"
  | "video"
  | "motion";

export interface Category {
  id: CategoryId;
  label: string;
  hint: string;
}

export const CATEGORIES: Category[] = [
  { id: "retrato", label: "Retrato", hint: "Close, pele e olhar" },
  { id: "selfie", label: "Selfie", hint: "Frontal, câmera na mão" },
  { id: "ugc", label: "UGC / Review", hint: "Vender produto" },
  { id: "lifestyle", label: "Lifestyle", hint: "Rotina e cenário" },
  { id: "fitness", label: "Fitness", hint: "Academia e corpo" },
  { id: "moda", label: "Moda", hint: "Look e editorial" },
  { id: "viagem", label: "Viagem", hint: "Locação e luz natural" },
  { id: "video", label: "Vídeo", hint: "Movimento e câmera" },
  { id: "motion", label: "Motion Control", hint: "Câmera, tempo e ação por beats" },
];

/**
 * Reusable English fragment for motion prompts.
 *
 * Video models (Veo, Kling, Runway, Sora, Hailuo) drift the face and morph
 * hands far more than image models. Naming what must NOT move is what keeps a
 * clip usable.
 */
const MOTION_LOCK =
  "Motion constraints: the face keeps identical proportions and identity for the entire duration, no morphing, no drifting features, no extra fingers, no limbs changing length. Clothing and hair move with real weight and inertia. Exactly one continuous take, no cuts, no speed ramps, no zoom punches unless described. Frame rate 24fps with natural motion blur on moving edges.";

/** Reusable English fragment appended to stills to kill the plastic look. */
const RAW = "Unretouched skin with visible pores, peach fuzz and subtle blemishes. No beauty filter, no smoothing, no HDR glow. Natural asymmetry in the face.";

export const PROMPTS: Prompt[] = [
  {
    id: "retrato-janela-nublada",
    title: "Retrato de janela nublada",
    description: "O mais seguro da lista. Luz suave, pele crua, funciona em qualquer modelo.",
    category: "retrato",
    tags: ["close", "luz natural", "iniciante", "pele"],
    prompt: `Editorial documentary portrait of a 24-year-old Brazilian woman, tight head-and-shoulders framing, standing beside a large apartment window on an overcast afternoon. Soft diffused daylight from camera-left, gentle falloff into the shadow side, no hard shadows. Shot on a Canon EOS R5 with an 85mm f/1.4 lens wide open, focus locked on the near eye, background dissolving into soft grey. She looks slightly past the lens with a calm, tired expression, lips relaxed and barely parted. ${RAW} Visible fine hairs escaping her ponytail, faint under-eye discoloration, chapped lip texture, a single healing blemish on the chin. Restrained neutral color grade, film-like tonal rolloff.`,
  },
  {
    id: "retrato-flash-noite",
    title: "Flash direto na noite",
    description: "Estética point-and-shoot dos anos 2000. Quase impossível de identificar como IA.",
    category: "retrato",
    tags: ["flash", "noite", "festa", "y2k"],
    prompt: `Candid night photo of a 22-year-old Brazilian woman outside a bar, shot on a 2000s compact point-and-shoot camera with direct on-camera flash. Harsh frontal flash: hot specular highlights on the forehead and nose, hard shadow outline on the wall right behind her, background falling to near black. Slightly crooked framing, timestamp burned into the lower-right corner in orange. She is mid-sentence, eyes half closed, one hand blurred in motion. ${RAW} Oily T-zone catching the flash, smudged eyeliner, flyaway hair. Mild red-eye, noticeable sensor noise in the shadows, slight overexposure clipping on the cheekbones.`,
  },
  {
    id: "retrato-golden-hour",
    title: "Golden hour contraluz",
    description: "Rim light quente no cabelo, o clássico de feed que ainda funciona.",
    category: "retrato",
    tags: ["por do sol", "contraluz", "quente"],
    prompt: `Backlit portrait of a 27-year-old Black Brazilian woman on a rooftop at golden hour, waist-up framing. The low sun sits just behind her right shoulder, creating a warm orange rim light along her hairline and jaw, with heavy lens flare washing across the lower-left of the frame. Shot on a Sony A7 IV with a 35mm f/1.8 lens at f/2.0, focus on the eyes, city skyline compressed and blown out behind. She is laughing mid-breath, head tilted, not looking at the camera. ${RAW} Deep brown skin with natural sheen from the day's heat, tiny beads of sweat at the temple, natural coily hair catching the light strand by strand. Kodak Portra 400 color response with gentle halation around the highlights.`,
  },
  {
    id: "retrato-sol-duro",
    title: "Sol do meio-dia sem piedade",
    description: "Luz dura, olho semicerrado. O oposto do retrato genérico de IA.",
    category: "retrato",
    tags: ["sol", "duro", "verao", "candid"],
    prompt: `Unflattering midday portrait of a 25-year-old Latina woman standing on a residential street, harsh vertical sun directly overhead. Hard-edged shadows under the brow, nose and lower lip, blown-out highlights on the forehead, deep contrast between lit and shadowed skin. She squints against the light, one eye more closed than the other, hand half raised to shade her face. Shot on an iPhone 15 Pro main camera with aggressive in-camera HDR that flattens the shadows unnaturally. ${RAW} Sunscreen sheen, visible sweat on the upper lip, sunburn beginning on the shoulders. Slightly crooked horizon, casual framing with the subject off-center.`,
  },
  {
    id: "retrato-carro",
    title: "Passageira no carro",
    description: "Luz de janela em movimento, cenário confinado e crível.",
    category: "retrato",
    tags: ["carro", "viagem", "luz natural"],
    prompt: `Photo of a 24-year-old Brazilian woman in the passenger seat of a car during a late-afternoon drive, shot from the driver's seat at eye level. Warm directional light entering through the side window, moving shadows from trees streaking across her face, seatbelt crossing her chest. Shot handheld on a 35mm f/1.8 lens at f/2.2, slight motion instability, one frame of hair blur. She looks out of the window, chin resting on her hand, distracted. ${RAW} Windblown hair sticking to her lip gloss, faint reflection of the windshield across her cheek. Dusty dashboard and cluttered door pocket visible out of focus in the foreground.`,
  },
  {
    id: "selfie-elevador",
    title: "Mirror selfie no elevador",
    description: "O formato que mais converte em Instagram. Espelho com marca de dedo é o detalhe.",
    category: "selfie",
    tags: ["espelho", "instagram", "outfit"],
    prompt: `Mirror selfie of a 23-year-old Brazilian woman in a mirrored apartment elevator, full-body framing, phone held at chest height and clearly visible in the reflection with the flash off. Cool overhead LED panel light from directly above, creating slight shadows under the eyes and nose. Fingerprints and dust smudges across the mirror surface, faint scratches near the edge. Shot on an iPhone 15 Pro rear camera, 24mm equivalent, mild barrel distortion. She wears an oversized washed tee and baggy jeans, fabric creasing naturally at the hips, one hip cocked, weight on one leg. ${RAW} Neutral closed-mouth expression, hair slightly frizzy at the crown. Unedited straight-out-of-phone look with mild shadow noise.`,
  },
  {
    id: "selfie-cama",
    title: "Selfie de manhã na cama",
    description: "Intimista e desarrumada. Alto CTR em stories.",
    category: "selfie",
    tags: ["manha", "quarto", "intimista"],
    prompt: `Front-camera selfie of a 26-year-old Brazilian woman lying in bed just after waking up, arm's-length framing from slightly above, one arm visible entering the frame. Soft grey morning light from a window behind the camera, no artificial light. Shot on an iPhone front camera, 24mm equivalent, noticeable edge distortion and softness. Wrinkled white bedding, a charger cable and a half-empty glass of water blurred on the nightstand behind her. ${RAW} Pillow crease still marking her cheek, puffy eyelids, dry lips, no makeup, hair flattened on one side and frizzy on the other. Flat low-contrast rendering with visible noise in the shadows, slightly out of focus.`,
  },
  {
    id: "selfie-academia",
    title: "Selfie pós-treino",
    description: "Suor real, iluminação de academia. Base de qualquer conta fitness.",
    category: "selfie",
    tags: ["gym", "suor", "espelho"],
    prompt: `Post-workout mirror selfie of a 28-year-old Brazilian woman in a commercial gym bathroom, waist-up framing, phone in one hand at chest level. Cold fluorescent ceiling light, greenish color cast, slight flicker banding across the image. Shot on an iPhone rear camera with the flash off. She wears a fitted seamless sports set with a visible sweat patch down the sternum and along the lower back, fabric slightly pilled from use. ${RAW} Flushed cheeks and chest, sweat on the hairline and temple, hair pulled into a messy bun with strands stuck to her neck, faint elastic mark on the wrist. Tiled wall with grout lines and a paper towel dispenser visible behind. Unedited phone rendering, mild noise.`,
  },
  {
    id: "selfie-carro-flash",
    title: "Selfie no carro à noite",
    description: "Flash frontal + escuridão atrás. Textura de pele máxima.",
    category: "selfie",
    tags: ["noite", "flash", "carro"],
    prompt: `Front-camera selfie of a 22-year-old Brazilian woman in the driver's seat of a parked car at night, screen flash on. The white screen flash lights her face frontally and hard, falling off instantly to complete darkness behind, with faint orange streetlight bokeh through the rear window. Arm's-length framing, slight upward angle, seatbelt strap visible. Shot on an iPhone front camera, heavy noise reduction smearing the darkest areas. ${RAW} Every pore lit by the flash, oily forehead shine, visible peach fuzz along the jaw, mascara slightly transferred under the eye, one earring catching a hot specular highlight. Neutral half-smile, looking slightly off-lens.`,
  },
  {
    id: "ugc-skincare",
    title: "UGC skincare na pia",
    description: "Formato review honesto. Produto na mão, banheiro real.",
    category: "ugc",
    tags: ["produto", "banheiro", "review", "skincare"],
    prompt: `UGC-style product photo: a 27-year-old Brazilian woman holding an unbranded white skincare bottle up beside her face in a small home bathroom, waist-up framing, looking into the lens as if talking to camera. Warm mixed light from a wall sconce above the mirror plus cool daylight from a frosted window, visible color temperature clash. Shot on an iPhone 15 Pro rear camera, 24mm equivalent, handheld with a slight tilt. Cluttered sink counter in the foreground: toothbrush cup, hair ties, a used towel. ${RAW} Damp hair pushed back with a headband, bare face, visible pores and redness around the nose, one shoulder wet from the shower. The product label is fully in focus and readable; her fingers grip it naturally with slight nail-bed pressure. Unedited phone look.`,
  },
  {
    id: "ugc-unboxing",
    title: "Unboxing na mesa",
    description: "Top-down para carrossel de produto.",
    category: "ugc",
    tags: ["produto", "unboxing", "flatlay"],
    prompt: `Overhead UGC photo of a 25-year-old woman's hands opening a plain cardboard shipping box on a scratched wooden dining table. Shot from directly above on an iPhone rear camera, handheld, slightly off-perpendicular. Soft window daylight from the left, real shadow falloff across the table surface. Torn packing tape curling up, crumpled paper filler, a box cutter and phone lying beside. Her hands show natural skin texture: visible knuckle creases, short unpolished nails, a faint ink mark on one finger. Dust particles and crumbs on the table, a coffee ring stain near the edge. No smoothing, no HDR, natural in-camera noise, slightly soft focus on the far corner of the frame.`,
  },
  {
    id: "ugc-comida",
    title: "Review de comida no restaurante",
    description: "Prato na frente, expressão real. Nicho gastronômico.",
    category: "ugc",
    tags: ["comida", "restaurante", "review"],
    prompt: `Candid restaurant photo of a 29-year-old Brazilian woman about to take a bite of a burger, shot from across the table at seated eye level. Warm tungsten pendant light directly above the table, cool daylight leaking from a window on the far side. Shot on a 35mm f/1.8 lens at f/2.2, focus on her face, the food slightly closer to camera and softly out of focus. She is mid-laugh, mouth open, eyes squinted, clearly not posing. ${RAW} Grease shine on her lips and fingers, a crumb on her chin, napkin bunched in one hand. Messy table: half-empty glasses, condensation rings, a phone face down, another diner blurred in the background. Unedited warm cast, mild noise.`,
  },
  {
    id: "lifestyle-cafe",
    title: "Café lotado, mesa bagunçada",
    description: "Cenário público com gente desfocada. Contexto vende autenticidade.",
    category: "lifestyle",
    tags: ["cafe", "trabalho", "candid"],
    prompt: `Candid photo of a 26-year-old Brazilian woman working at a cluttered table inside a small crowded specialty coffee shop. Shot from a neighboring table on a 35mm f/1.8 lens at f/2.0, she is unaware of the camera, foreground partially obstructed by a blurred chair back. Overcast daylight from a large storefront window camera-left, warm filament bulbs adding a second color temperature from above. Table clutter: laptop with stickers, notebook with handwriting, a cortado with drying foam residue on the glass rim, phone, crumpled receipt. Other customers and a barista out of focus behind. ${RAW} She frowns slightly at the screen, one hand in her hair, glasses sliding down her nose. Natural film-like grade, no HDR.`,
  },
  {
    id: "lifestyle-quarto",
    title: "Quarto real, fim de tarde",
    description: "Vida cotidiana com objetos verdadeiros. Ótimo para feed autoral.",
    category: "lifestyle",
    tags: ["quarto", "casa", "intimista"],
    prompt: `Documentary photo of a 24-year-old Brazilian woman sitting cross-legged on the floor of her lived-in bedroom in the late afternoon. Warm low sun cutting through half-closed blinds, projecting hard horizontal stripes of light across the wall, the floor and her arm; airborne dust visible in the light beam. Shot on a Sony A7 IV with a 35mm f/1.8 lens at f/2.0, slightly low camera position. Room clutter is essential: unmade bed with wrinkled sheets, clothes piled on a chair, tangled charger cables, a laundry basket, posters taped unevenly to the wall. She wears a worn hoodie and shorts, hair unstyled. ${RAW} Looking down at nothing in particular, shoulders dropped. Kodak Portra 400 rendering with fine grain.`,
  },
  {
    id: "lifestyle-cozinha",
    title: "Cozinha de manhã",
    description: "Rotina doméstica, vapor e movimento.",
    category: "lifestyle",
    tags: ["cozinha", "manha", "rotina"],
    prompt: `Morning kitchen photo of a 30-year-old Brazilian woman pouring coffee, waist-up framing from the side. Cool blue-grey dawn light from a window plus a warm overhead kitchen bulb, the two temperatures visibly fighting across her face. Steam rising from the mug catching the window light. Shot handheld on a 35mm f/1.8 lens at f/2.0, one hand slightly motion-blurred mid-pour. Real kitchen background: dishes in the sink, a magnet-covered fridge, a dish towel thrown over the oven handle, crumbs on the counter. She wears an old t-shirt, hair in a slept-on state, no makeup. ${RAW} Half-open eyes, mouth relaxed, clearly pre-caffeine. Flat unedited rendering with shadow noise.`,
  },
  {
    id: "lifestyle-metro",
    title: "Metrô na hora do rush",
    description: "Urbano, apertado, sem posar. Difícil de simular e por isso convincente.",
    category: "lifestyle",
    tags: ["urbano", "metro", "candid"],
    prompt: `Candid photo of a 23-year-old Brazilian woman standing in a crowded São Paulo metro car during rush hour, shot at eye level from about a meter away with other passengers partly blocking the frame. Cold overhead fluorescent light with a slight green cast, reflections and moving tunnel lights streaking in the window behind her. Shot on a 35mm f/1.8 lens at f/2.0 with a slow shutter, causing mild motion blur on the passengers around her while her face stays sharp. She holds the overhead bar with one hand, earphones in, staring blankly ahead. ${RAW} Tired eyes, hair slightly damp from the heat, backpack strap pressing into her shoulder. Handheld tilt, unpolished framing.`,
  },
  {
    id: "fitness-treino",
    title: "Meio do treino, peso na barra",
    description: "Esforço visível. Nada de pose parada de academia.",
    category: "fitness",
    tags: ["gym", "treino", "esforco"],
    prompt: `Action photo of a 28-year-old Brazilian woman mid-set at a squat rack in a real commercial gym, full-body framing from a low three-quarter angle. Cold overhead industrial lighting mixed with a warm strip light along the mirror wall. Shot on a Sony A7 IV with a 35mm f/1.8 lens at f/2.2, 1/125s, slight motion blur on the loaded barbell. Real gym context: rubber flooring with scuff marks, chalk dust, other members out of focus behind, plates racked unevenly. ${RAW} Strained expression with a clenched jaw and flared nostrils, veins raised on the forearms, sweat running along the temple and pooling at the collarbone, sports set darkened with sweat down the spine, hair escaping a tight bun. Documentary color grade, no HDR crunch.`,
  },
  {
    id: "fitness-corrida",
    title: "Corrida de rua ao amanhecer",
    description: "Movimento real com panning. Nicho outdoor.",
    category: "fitness",
    tags: ["corrida", "outdoor", "movimento"],
    prompt: `Panning shot of a 26-year-old Brazilian woman running on a coastal boardwalk at dawn, full-body side framing. Low pink-orange sunrise light from behind her, creating a rim along her arms and legs, long shadow stretching across the pavement. Shot on a Canon EOS R5 with an 85mm f/1.4 lens at f/2.8, 1/60s panning with the subject: her torso is sharp while the background and her trailing foot smear into horizontal motion blur. ${RAW} Mouth open breathing hard, sweat already on the chest and forehead, ponytail mid-swing, running shoes with visible dirt and wear. Sea haze softening the far background, a blurred cyclist passing in the opposite direction. Natural warm grade with visible grain.`,
  },
  {
    id: "fitness-descanso",
    title: "Descanso entre séries",
    description: "Momento morto que só existe em foto real.",
    category: "fitness",
    tags: ["gym", "pausa", "candid"],
    prompt: `Candid photo of a 29-year-old Brazilian man sitting on a gym bench between sets, forearms on his knees, head down, catching his breath. Waist-up framing from a low front angle. Harsh overhead gym lighting creating hard shadows in the eye sockets and under the pectorals. Shot on a 35mm f/1.8 lens at f/2.0, focus on the face, dumbbell rack blurred behind. ${RAW} Tan skin flushed and shining with sweat, light stubble, individual chest hairs visible, a small scar on the shoulder, wrist wraps loosely tied, phone resting on the bench beside him with a smudged screen. Damp t-shirt clinging unevenly. Documentary grade, mild noise in the shadows.`,
  },
  {
    id: "moda-editorial",
    title: "Editorial de rua",
    description: "Look em destaque, pele ainda real. Para marcas.",
    category: "moda",
    tags: ["editorial", "look", "rua"],
    prompt: `Street-style fashion photograph of a 25-year-old Brazilian woman on a São Paulo sidewalk, full-body framing from a low angle. Overcast diffused daylight, soft and even, with a faint bounce from the wet pavement. Shot on a Canon EOS R5 with an 85mm f/1.4 lens at f/2.0, compressing the graffitied wall and blurred pedestrians behind her. She wears a relaxed tailored blazer over a plain tank top and wide-leg trousers; fabric hangs with real weight, natural creases at the elbows and knees, hem brushing the shoe. She is mid-stride, one hand adjusting the blazer, looking off-frame. ${RAW} Light matte makeup with pores preserved, a stray hair across the cheek, faint shine on the nose. Restrained editorial grade, neutral whites, film-like rolloff.`,
  },
  {
    id: "moda-provador",
    title: "Provador de loja",
    description: "Espelho, etiqueta pendurada, luz feia de loja. Muito crível.",
    category: "moda",
    tags: ["loja", "espelho", "look"],
    prompt: `Fitting-room mirror selfie of a 24-year-old Brazilian woman trying on a dress, full-body framing, phone held at hip height. Unflattering overhead store lighting with a slight yellow-green cast, hard shadows under the eyes and chin. Shot on an iPhone rear camera, mild barrel distortion, mirror slightly smudged and reflecting a curtain rail. The price tag still hangs from the armpit seam, the fabric creased from the hanger. Her own clothes are piled on the fitting-room bench behind her, a shoe knocked over on the floor. ${RAW} Skeptical closed-mouth expression, hair static from pulling the dress over her head, bra strap visible. Unedited phone rendering with noise.`,
  },
  {
    id: "moda-detalhe",
    title: "Detalhe de tecido e mão",
    description: "Macro para carrossel de produto de moda.",
    category: "moda",
    tags: ["macro", "detalhe", "tecido"],
    prompt: `Macro detail photograph of a woman's hand resting on the cuff of a heavyweight cotton jacket, filling the frame. Shot on a Canon EOS R5 with a 100mm macro lens at f/4, razor-thin depth of field falling off across the fabric weave. Soft directional window light from camera-right revealing the texture: individual cotton fibers, stitch irregularities, a slightly frayed thread at the seam, faint wear at the cuff edge. The hand shows real skin: visible knuckle creases, dry patch near the thumb, short nails with uneven cuticles, fine hair on the back of the hand, a faint tan line at the wrist from a watch. Neutral color grade, no sharpening halos.`,
  },
  {
    id: "viagem-praia",
    title: "Praia no fim do dia",
    description: "Sal, areia grudada, luz quente. Nicho viagem.",
    category: "viagem",
    tags: ["praia", "verao", "por do sol"],
    prompt: `Candid photo of a 23-year-old Brazilian woman walking out of the sea on a Brazilian beach late in the afternoon, full-body framing from the shoreline. Low warm sun from camera-left, hard rim light along her wet arms and shoulders, long shadow across the damp sand, sea haze softening the horizon. Shot on a Sony A7 IV with a 35mm f/1.8 lens at f/2.8, slight sand and salt spray on the front element causing mild flare. ${RAW} Wet hair stuck flat to her scalp and neck, water droplets running down her arms, sand clinging to her shins and hip, salt residue drying on the shoulders, eyes squinting against the sun. Faded swimsuit with a slightly stretched strap. Kodak Portra 400 rendering, visible grain.`,
  },
  {
    id: "viagem-mirante",
    title: "Mirante com vento",
    description: "Paisagem larga, pessoa pequena. Bom para capa de perfil.",
    category: "viagem",
    tags: ["paisagem", "vento", "montanha"],
    prompt: `Wide travel photograph of a 27-year-old Brazilian woman standing at a mountain viewpoint in the early morning, subject occupying roughly one fifth of the frame on the right third, vast valley and low cloud filling the rest. Cool overcast light with a faint warm break in the clouds on the horizon. Shot on a Sony A7 IV with a 24mm lens at f/5.6, everything acceptably sharp, slight vignetting in the corners. Strong wind: her jacket presses against her body on one side and flaps loose on the other, hair blown fully across her face, hood half inflated. She looks away from the camera toward the valley. Damp rock underfoot, worn hiking boots with mud. Natural flat grade, no HDR, mild grain.`,
  },
  {
    id: "viagem-hotel",
    title: "Quarto de hotel de manhã",
    description: "Mala aberta, cortina translúcida. Cenário de creator em viagem.",
    category: "viagem",
    tags: ["hotel", "manha", "interior"],
    prompt: `Photo of a 26-year-old Brazilian woman sitting on the edge of an unmade hotel bed in the morning, medium waist-up framing from a low angle. Soft grey daylight filtered through a sheer curtain behind her, blowing out the window into pure white while leaving her face in gentle shadow. Shot on a Canon EOS R5 with a 35mm lens at f/2.0, focus on the eyes. Real travel clutter: open suitcase on the floor with clothes spilling out, a room-service tray, passport and charger on the nightstand, towel over the chair. ${RAW} Bare face, hair tied loosely, hotel robe half open, one leg tucked under. She stares out of frame, still half asleep. Neutral grade with film-like highlight rolloff.`,
  },
  {
    id: "video-talking-head",
    title: "Vídeo: talking head UGC",
    description: "Prompt para vídeo. Fala direto na câmera, tremor de mão real.",
    category: "video",
    tags: ["video", "ugc", "fala"],
    prompt: `8-second vertical video, 9:16. A 27-year-old Brazilian woman speaks directly to the camera in her living room, handheld phone at arm's length, waist-up framing. Natural handheld micro-shake throughout, autofocus hunting once at the start before locking. Soft window daylight from camera-left, warm lamp spill from behind. She gestures with one hand while talking, eyebrows moving, blinking irregularly, shifting weight mid-sentence. ${RAW} Camera: iPhone front camera look, 24mm equivalent, mild edge distortion, slight rolling-shutter smear when she moves. Lived-in background: sofa with a thrown blanket, plant, TV off. No camera movement other than the natural hand instability. No music, ambient room tone only.`,
  },
  {
    id: "video-b-roll",
    title: "Vídeo: b-roll andando",
    description: "Plano de apoio com tracking lateral. Base de qualquer edição.",
    category: "video",
    tags: ["video", "broll", "movimento"],
    prompt: `6-second cinematic b-roll clip, 9:16 vertical. A 24-year-old Brazilian woman walks along a shaded city street; the camera tracks laterally beside her at a steady walking pace, keeping her in the left third of the frame. Dappled sunlight filtering through tree leaves sweeps across her face and shoulders as she moves. Shot on a 35mm f/1.8 lens at f/2.2, 24fps with a 180-degree shutter, natural motion blur in the background. She never looks at the camera; she adjusts her bag strap once and glances at a shop window. ${RAW} Hair moving with each step, fabric of her jacket shifting naturally. Slight handheld gimbal float, no artificial smoothness. Neutral film grade, fine grain.`,
  },
  {
    id: "video-espelho",
    title: "Vídeo: outfit no espelho",
    description: "Transição de look. O formato mais replicado em vertical.",
    category: "video",
    tags: ["video", "outfit", "espelho"],
    prompt: `5-second vertical video, 9:16. A 23-year-old Brazilian woman films herself in a full-length bedroom mirror, phone held in one hand at chest height and visible in the reflection. She turns slowly to show the outfit, then does a small step-and-pivot; the phone moves with her body, so the framing drifts and re-centers naturally. Overhead room light plus daylight from a window camera-right, mixed temperatures. Mirror shows real smudges and a sticker in the corner; the bedroom behind is lived-in with clothes on the bed. ${RAW} Fabric swings with real weight and settles a beat after she stops. iPhone rear-camera look, mild rolling shutter, autofocus breathing once during the turn. Ambient room sound only.`,
  },
  {
    id: "retrato-preto-branco",
    title: "Preto e branco de filme",
    description: "Grão real e contraste. Esconde o que o modelo erra em cor.",
    category: "retrato",
    tags: ["pb", "filme", "grao"],
    prompt: `Black and white portrait of a 30-year-old Brazilian woman beside a doorway, medium close-up. Shot on Ilford HP5 Plus 400 35mm film pushed one stop, pronounced grain structure, deep blacks with retained shadow detail, soft highlight rolloff. Single hard light source from a doorway camera-right, leaving half her face in shadow, no fill. 50mm f/2 lens, focus on the near eye, slight softness at the frame edges. She looks directly into the lens, unsmiling, chin slightly down. ${RAW} Skin texture fully rendered by the grain: pores, a small mole beside the mouth, fine lines at the eye corner, individual eyebrow hairs. Faint dust and a single scratch from the film scan, uneven frame border.`,
  },
  {
    id: "lifestyle-varanda-noite",
    title: "Varanda à noite",
    description: "Luz prática urbana. Clima noturno sem estúdio.",
    category: "lifestyle",
    tags: ["noite", "urbano", "varanda"],
    prompt: `Night photo of a 28-year-old Brazilian woman leaning on an apartment balcony railing, medium framing from the side. Lit only by practical sources: warm orange street sodium light from below, cool blue-white spill from the living room behind her, and distant city bokeh across the background. Shot on a Sony A7 IV with a 35mm f/1.8 lens wide open at f/1.8, ISO 3200, visible luminance noise in the shadows. She holds a glass, looking out at the city, unaware of the camera. ${RAW} The two light temperatures split across her face, one side warm and one cool; skin shine along the cheekbone, faint smile lines. Hair moving slightly in the night breeze. Flat low-contrast grade, no noise reduction.`,
  },
  {
    id: "ugc-antes-depois",
    title: "Antes e depois honesto",
    description: "Par de imagens com a MESMA luz. O erro comum é mudar a luz.",
    category: "ugc",
    tags: ["antes depois", "produto", "comparativo"],
    prompt: `Two-panel before/after photo of the same 26-year-old Brazilian woman, identical framing, identical lighting, identical camera position in both panels — the only difference is her skin condition. Bathroom setting, soft daylight from a frosted window camera-left, iPhone rear camera at 24mm equivalent, head-and-shoulders framing, neutral expression, hair pulled back with the same headband. Left panel: visible active blemishes on the cheek and chin, redness around the nose, uneven tone, oily T-zone. Right panel: same face, same pores and peach fuzz still fully visible, but calmer redness and fewer active blemishes. No retouching, no smoothing, no lighting change, no makeup in either panel. Unedited phone rendering with matching noise in both frames.`,
  },
  {
    id: "moda-flash-parede",
    title: "Look com flash contra parede",
    description: "Sombra dura atrás é assinatura de foto real de festa.",
    category: "moda",
    tags: ["flash", "look", "noite"],
    prompt: `Full-body outfit photo of a 25-year-old Brazilian woman standing against a plain painted wall at night, shot with direct on-camera flash from about two meters away. The flash produces a hard, slightly offset shadow outline of her body on the wall behind, hot highlights on the fabric folds and forehead, and rapid falloff at the frame edges. Shot on a compact camera, 28mm equivalent, mild barrel distortion, slightly crooked framing. She stands casually, one hand in a pocket, weight on one leg, looking slightly away. ${RAW} Flash reveals every skin texture detail; jewelry throws a blown-out specular point. Wall shows real imperfection: scuff marks, a nail hole, uneven paint. Straight-out-of-camera JPEG look with visible compression.`,
  },
  {
    id: "retrato-chuva",
    title: "Chuva na janela",
    description: "Textura de água e reflexo. Alto impacto visual.",
    category: "retrato",
    tags: ["chuva", "janela", "clima"],
    prompt: `Portrait of a 24-year-old Brazilian woman seen through a rain-covered window from outside, medium close-up. Water droplets and running streaks sit on the glass plane in sharp focus while her face behind is softened and partly distorted by the refraction. Overcast grey daylight, low contrast, cool blue-grey color cast. Shot on a Canon EOS R5 with an 85mm f/1.4 lens at f/2.0, focus plane on the glass, her eyes just behind it. She looks out at the rain, not at the camera, breath faintly fogging a patch of glass. ${RAW} Where the glass is clear, real skin texture is visible. Reflections of the street overlay part of her face. Muted natural grade, film grain, no clarity boost.`,
  },
  {
    id: "lifestyle-amigos",
    title: "Grupo de amigos na mesa",
    description: "Prova social. Difícil para IA e por isso valioso.",
    category: "lifestyle",
    tags: ["grupo", "social", "candid"],
    prompt: `Candid photo of four friends crowded around a small bar table outdoors in the evening, shot from a standing position at the end of the table. One 25-year-old Brazilian woman is the focal subject, laughing with her head thrown slightly back; the others are mid-conversation and partly cut by the frame edges. Warm string lights overhead as the main source, plus a cool phone screen lighting one face from below. Shot on a 35mm f/1.8 lens at f/2.0, focus on the main subject, the nearest friend's shoulder blurred in the foreground. ${RAW} Real table clutter: sweating beer glasses, condensation rings, crumpled napkins, a shared plate half eaten, phones face down. Natural overlapping poses, nobody arranged. Handheld tilt, warm grade, visible grain.`,
  },
  {
    id: "fitness-pilates",
    title: "Pilates em estúdio",
    description: "Nicho wellness. Luz limpa sem virar propaganda.",
    category: "fitness",
    tags: ["pilates", "wellness", "estudio"],
    prompt: `Photo of a 31-year-old Brazilian woman mid-exercise on a pilates reformer in a small studio, full-body side framing. Soft daylight through a large window camera-right, secondary bounce from a white wall, no artificial light. Shot on a Sony A7 IV with a 35mm f/1.8 lens at f/2.5, focus on her torso, the far end of the reformer falling out of focus. She is holding tension in a controlled position: muscles engaged and defined by the side light, jaw set, exhaling through pursed lips. ${RAW} Light sweat sheen along the spine and hairline, a few short hairs escaping the clip, sock grip texture visible, faint indentation of the strap on the foot. Studio background is plain but real: a stack of mats, a water bottle, scuffed floor. Neutral restrained grade.`,
  },
  {
    id: "viagem-mercado",
    title: "Mercado de rua",
    description: "Cenário denso e caótico. Prova de contexto.",
    category: "viagem",
    tags: ["mercado", "rua", "candid"],
    prompt: `Travel documentary photo of a 26-year-old Brazilian woman browsing a fruit stall in a busy open-air street market at midday. Full-body framing from a slight distance, other shoppers passing between the camera and the subject, one partially blocking the lower frame. Harsh overhead sun broken by a patchwork of tarpaulin awnings, throwing colored light and hard shadow shapes across her face and shoulders. Shot on a 35mm f/1.8 lens at f/2.8, focus on her, dense stall detail behind. ${RAW} She reaches for a mango, eyes on the fruit, mouth slightly open, sweat at the temples in the heat. Cloth tote bag straining on her shoulder. Chaotic real background: crates, handwritten price signs, a vendor mid-gesture. Kodak Portra rendering, grain visible.`,
  },
  {
    id: "selfie-grupo",
    title: "Selfie de grupo torta",
    description: "Enquadramento imperfeito é o ponto. Ninguém enquadra bem no braço.",
    category: "selfie",
    tags: ["grupo", "selfie", "candid"],
    prompt: `Arm's-length group selfie of three friends squeezed into frame outdoors in the late afternoon, taken by the 24-year-old Brazilian woman closest to the camera, whose face is largest and slightly distorted by the wide front lens. The framing is crooked and badly composed: one friend is half cut off at the edge, the horizon tilts noticeably, too much sky at the top. Warm low sun from behind causes flare and partial backlighting, faces slightly underexposed with aggressive in-camera HDR trying to compensate. Shot on an iPhone front camera, 24mm equivalent. ${RAW} All three squint, one blinks, mouths caught mid-word. Windblown hair crossing faces. Straight-out-of-phone rendering with noise and compression.`,
  },
  {
    id: "ugc-mao-produto",
    title: "Produto na mão em movimento",
    description: "Plano fechado para transição de vídeo ou capa.",
    category: "ugc",
    tags: ["produto", "mao", "detalhe"],
    prompt: `Close-up photo of a hand holding an unbranded matte cosmetic tube at chest height, shot slightly from above with the product label fully readable and in sharp focus. Soft window daylight from camera-left with a real shadow cast across the palm. Shot on a 50mm lens at f/2.8, background of a lived-in bathroom counter falling out of focus. The hand shows unretouched detail: pores on the back of the hand, faint vein structure, dry skin near the knuckle, short nails with slightly uneven edges and one small hangnail, natural pressure whitening where the fingers grip the tube. A faint fingerprint smudge on the product surface. Neutral color grade, no sharpening halos, natural sensor noise.`,
  },

  // ---- Motion Control -----------------------------------------------------
  // Structured as SHOT / CAMERA / SUBJECT / BEATS / AUDIO / LOCK so video
  // models get one instruction per axis instead of one long run-on sentence.
  {
    id: "motion-locked-off",
    title: "Câmera travada (o mais seguro)",
    description: "Zero movimento de câmera. É o clipe com maior taxa de acerto em qualquer modelo.",
    category: "motion",
    tags: ["estatico", "tripe", "iniciante", "talking head"],
    prompt: `SHOT: Medium close-up of a 24-year-old Brazilian woman seated on a sofa in a lived-in apartment, chest-up framing, slightly off-center to frame-left.
CAMERA: Locked off on a tripod. Absolutely no pan, no tilt, no dolly, no zoom. 50mm equivalent, f/2.0, focus fixed on her near eye for the whole shot.
LIGHT: Single soft window source camera-left, unchanging for the whole duration. Practical lamp glowing warm in the far background.
SUBJECT MOTION: She talks to the camera in a relaxed, conversational way. Small natural head movements, occasional blinks, one hand entering the lower frame to gesture briefly and leaving again. Weight shifts once on the sofa.
BEATS (5s): 0.0-1.0s she inhales and begins speaking; 1.0-3.5s continuous speech with two small head nods; 3.5-4.5s brief pause, glances down and back up; 4.5-5.0s resumes speaking, frame ends mid-sentence.
TEXTURE: Unretouched skin with visible pores and natural shine, no beauty filter, no smoothing.
${MOTION_LOCK}`,
  },
  {
    id: "motion-slow-push",
    title: "Push-in lento (dolly in)",
    description: "Aproximação suave e constante. Cria intimidade sem quebrar o rosto.",
    category: "motion",
    tags: ["dolly", "push in", "camera move", "retrato"],
    prompt: `SHOT: Starts as a medium shot of a 26-year-old Brazilian woman standing by a window, ends as a tight close-up on her face.
CAMERA: Very slow, perfectly linear dolly-in on a slider, constant speed, moving roughly 40cm over the full duration. No zoom, no handheld shake, no arc. 35mm lens at f/2.0. Focus pulls with the move to stay on her eyes.
LIGHT: Overcast daylight from the window camera-right. Light level rises subtly as the camera approaches the source. No flicker.
SUBJECT MOTION: She holds nearly still, breathing visibly, looking just past the lens. She blinks twice. Near the end she turns her eyes into the lens without moving her head.
BEATS (6s): 0.0-3.0s push begins, she looks off-camera; 3.0-4.0s slow blink; 4.0-6.0s eyes shift to the lens as the frame settles into the close-up.
TEXTURE: Unretouched skin, visible pores and peach fuzz, one stray hair moving with her breath.
${MOTION_LOCK}`,
  },
  {
    id: "motion-orbit",
    title: "Orbit / arco em volta",
    description: "Movimento circular controlado. Mostra o cenário sem perder o sujeito.",
    category: "motion",
    tags: ["orbit", "arco", "cenario", "camera move"],
    prompt: `SHOT: Three-quarter body framing of a 25-year-old Brazilian woman standing still in the middle of a rooftop at golden hour.
CAMERA: Smooth 45-degree arc orbiting clockwise around her at constant radius and constant speed, gimbal-stabilized, camera height fixed at chest level. She stays centered in frame the entire time. No zoom, no vertical movement. 35mm lens at f/2.8.
LIGHT: Low warm sun that starts behind her (rim light) and progressively moves to side light as the camera arcs. Lens flare enters frame briefly at the halfway point and leaves naturally.
SUBJECT MOTION: She stays largely planted, hair and the hem of her shirt moving in a steady breeze. Her head follows the camera slightly, eyes tracking the lens for the last third.
BEATS (7s): 0.0-2.5s arc begins with her backlit and face in shadow; 2.5-4.0s flare crosses the frame; 4.0-7.0s her face fills with warm side light as she turns her eyes to the lens.
TEXTURE: Unretouched skin, visible pores, warm highlights without HDR glow.
${MOTION_LOCK}`,
  },
  {
    id: "motion-handheld-follow",
    title: "Follow handheld andando",
    description: "Vlog cru. Trepidação e passos como assinatura de realismo.",
    category: "motion",
    tags: ["handheld", "walking", "vlog", "rua"],
    prompt: `SHOT: Medium shot from behind and slightly to the side of a 24-year-old Brazilian woman walking down a busy sidewalk in the late afternoon, occasionally turning her head back toward the camera.
CAMERA: Handheld, following at walking pace, keeping a constant distance. Natural unstabilized micro-shake and a subtle vertical bounce synced to the operator's footsteps. No artificial smoothing, no zoom. 24mm equivalent, f/2.2, deep enough focus that the street reads.
LIGHT: Direct low sun down the street creating long shadows and intermittent backlight as she passes buildings. Light shifts naturally as she crosses shade and sun.
SUBJECT MOTION: Steady walking rhythm with real weight transfer, arms swinging naturally, bag strap shifting on her shoulder. She glances back over her shoulder once and says something short to the camera. Pedestrians cross between the camera and her.
BEATS (6s): 0.0-2.0s walking away, backlit; 2.0-3.0s a passerby briefly blocks the frame; 3.0-4.5s she looks back and speaks; 4.5-6.0s she turns forward and keeps walking.
TEXTURE: Unretouched skin, phone-camera rendering with visible noise in the shadows.
${MOTION_LOCK}`,
  },
  {
    id: "motion-first-last-frame",
    title: "First frame → last frame",
    description: "Para modelos que aceitam imagem inicial e final. Descreve só a transição.",
    category: "motion",
    tags: ["keyframe", "first last frame", "kling", "transicao"],
    prompt: `TRANSITION BRIEF (use with a start image and an end image):
START STATE: The subject is seated at a cafe table, head down, looking at her phone, both hands on the device, face lit by the cool screen glow.
END STATE: The same subject leaning back, phone face down on the table, looking directly into the lens with a small closed-mouth smile, face now lit by warm window light.
HOW TO GET THERE: One continuous natural movement. She finishes reading, exhales, sets the phone down with her right hand while her left hand slides off the table, then leans back into the chair and lifts her chin to meet the lens. The screen glow fades from her face as she moves out of its throw and into the window light.
CAMERA: Static, no movement at all. The camera does not help the transition. 50mm at f/2.0, focus stays on her face.
PACING: Even and unhurried across the full duration, no snap at the end, no held freeze on either frame.
DO NOT: change her clothing, hair style, jewelry, the table objects, or the background between the two frames. Identity must be identical in every frame.
${MOTION_LOCK}`,
  },
  {
    id: "motion-loop",
    title: "Loop perfeito",
    description: "Primeiro e último frame idênticos. Ideal para fundo de story e capa animada.",
    category: "motion",
    tags: ["loop", "seamless", "story", "fundo"],
    prompt: `SHOT: Medium close-up of a 27-year-old Brazilian woman standing against a plain concrete wall, looking into the lens.
CAMERA: Static, locked off, 50mm at f/2.0. No movement whatsoever.
LOOP REQUIREMENT: The final frame must match the first frame exactly in pose, expression, hair position and light, so the clip loops seamlessly with no visible jump. Design the motion as a closed cycle that returns to its starting state.
SUBJECT MOTION: A single closed cycle: she tilts her head slightly to the right, blinks once, and returns precisely to the neutral starting position. Hair settles back to where it began. Breathing is the only residual motion.
BEATS (4s): 0.0-1.5s head tilts right; 1.5-2.0s blink at the extreme; 2.0-4.0s head returns to exact starting position and settles.
LIGHT: Constant soft frontal daylight, zero flicker or exposure drift across the clip — any change breaks the loop.
TEXTURE: Unretouched skin, visible pores, no beauty filter.
${MOTION_LOCK}`,
  },
  {
    id: "motion-lipsync",
    title: "Fala com lipsync limpo",
    description: "Base para talking head com áudio. Boca e mandíbula descritas explicitamente.",
    category: "motion",
    tags: ["lipsync", "fala", "audio", "talking head"],
    prompt: `SHOT: Close-up of a 25-year-old Brazilian woman speaking directly to camera in a bedroom, shoulders-up framing, eyes on the lens.
CAMERA: Static on a tripod at eye level, 50mm at f/2.0, focus locked on her eyes. No movement.
DIALOGUE: She says, in Brazilian Portuguese, in a calm conversational tone: "eu testei isso por trinta dias e vou ser bem honesta com você."
MOUTH AND JAW: Lip shapes match the spoken syllables precisely, jaw opening scaled to each vowel, teeth and tongue visible only where the sounds require it. Small natural pauses between phrases. No chewing motion, no over-articulation, no smile held through the whole line.
SUBJECT MOTION: Micro head movements on stressed words, two eyebrow raises for emphasis, natural blinking every 2-3 seconds, one small shoulder shift.
AUDIO: Her voice only, close and slightly dry, recorded in a small room with soft reflections. Faint room tone. No music, no reverb tail, no background chatter.
TEXTURE: Unretouched skin, visible pores and natural T-zone shine.
${MOTION_LOCK}`,
  },
  {
    id: "motion-produto-reveal",
    title: "Reveal de produto na mão",
    description: "Movimento curto e fechado — onde vídeo de IA erra menos e converte mais.",
    category: "motion",
    tags: ["produto", "ugc", "maos", "reveal"],
    prompt: `SHOT: Close-up on the hands of a 26-year-old Brazilian woman at a bathroom counter, bringing an unbranded matte cosmetic tube up into frame and turning the label toward the lens.
CAMERA: Slight handheld drift only, otherwise still. 50mm at f/2.8. Focus starts on the counter and pulls to the product as it rises. No zoom.
SUBJECT MOTION: The product enters from the bottom of the frame, rises to chest height, and rotates roughly 90 degrees so the label faces the camera and comes to rest. Fingers grip with visible pressure, the thumb repositions once mid-move. Real weight in the wrist, a small overshoot and settle at the top rather than a robotic stop.
BEATS (4s): 0.0-1.5s product rises into frame, focus pulling; 1.5-2.5s rotation to reveal the label; 2.5-4.0s hand holds steady with tiny natural tremor, label sharp and readable.
LIGHT: Soft window daylight camera-left with a real shadow cast on the counter that moves correctly with the product.
HANDS: Five fingers, correct anatomy, short uneven nails, dry skin near the knuckle, one small hangnail. No finger morphing at any frame.
${MOTION_LOCK}`,
  },
];