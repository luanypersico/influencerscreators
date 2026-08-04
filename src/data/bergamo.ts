// Gerado a partir do acervo Bergamo (arquivos originais do produto).
export type BergamoPrompt = {
  id: string;
  title: string;
  category: string;
  prompt: string;
  image: string;
};

const galleryImages = import.meta.glob<string>('../assets/bergamo/gallery/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
});

function img(id: string): string {
  return galleryImages[`../assets/bergamo/gallery/${id}.jpg`] ?? '';
}

export const BERGAMO_PROMPTS: BergamoPrompt[] = [
  {
    id: '01',
    title: `Blazer preto e gola alta`,
    category: `Executivo`,
    image: img('01'),
    prompt: `Create a luxury editorial portrait using the PROVIDED FACE as the exact identity reference. Preserve the person's facial features, skin tone, facial proportions, and overall likeness with maximum accuracy. Do not change the identity. The subject is wearing a perfectly tailored matte black blazer over a fitted black turtleneck, creating a monochromatic luxury look. Arms are crossed naturally across the chest with relaxed confidence. The expression is calm, serious, confident, and slightly intense, making direct eye contact with the camera. Camera framing is a chest-up portrait with perfectly centered composition and symmetrical balance. Shot on an 85mm lens at f/1.8 with shallow depth of field and premium fashion photography aesthetics. Lighting is soft cinematic studio lighting with a large diffused key light, subtle shadow falloff, gentle rim light separating the subject from the background, producing rich contrast and dimensionality. Ultra-realistic skin texture with high-end magazine quality retouching while maintaining natural pores and details. Background is a smooth dark charcoal-gray textured studio backdrop with subtle gradients and elegant minimalism, creating a timeless luxury aesthetic. Style: Tom Ford campaign, luxury menswear editorial, cinematic, photorealistic, hyper-realistic, ultra-detailed, premium color grading, HDR, 8K, Vogue-quality fashion photography, sophisticated, powerful, minimal, elegant. Negative Prompt: cartoon, illustration, CGI, AI-looking face, low quality, blurry, oversharpened, distorted anatomy, extra fingers, bad hands, asymmetrical eyes, duplicate limbs, exaggerated smile, text, watermark, logo, noise, artifacts, cheap lighting, unrealistic skin, overprocessed face, wide-angle distortion.`,
  },
  {
    id: '02',
    title: `Olhar visionário`,
    category: `Autoridade`,
    image: img('02'),
    prompt: `Create a hyper-realistic futuristic cinematic portrait using the uploaded person's face and identity. Preserve the exact facial features, hairstyle, skin tone, facial structure, and identity of the uploaded person while recreating the same composition and mood.
The subject is photographed from a slightly low-angle perspective, looking confidently upward and away from the camera with a calm, ambitious, visionary expression. They are wearing a minimalist oversized black crewneck sweatshirt.
IMPORTANT: Do not add, remove, or modify any accessories or personal attributes. Preserve them exactly as they appear in the uploaded reference. If the person wears eyeglasses, jewelry, piercings, hats, or any other accessories in the reference image, keep them unchanged. If they do not have these accessories, do not add them.
The lighting is a high-end neon cinematic setup featuring vibrant magenta/pink light from one side and electric blue/violet rim lighting from the opposite side, creating dramatic depth and a modern tech-founder aesthetic. Soft diffused key lighting preserves realistic skin texture while colorful edge lighting defines the jawline and hair.
The background is a seamless purple-to-blue gradient studio backdrop with a dreamy glow and subtle atmospheric diffusion, creating a premium editorial feel without distractions.
Photography style: luxury magazine editorial, Apple campaign aesthetic, futuristic personal branding, ultra-photorealistic, 85mm lens, f/1.4, shallow depth of field, HDR, cinematic color grading, razor-sharp eyes, ultra-detailed skin texture, realistic hair strands, natural proportions, 8K, high-fashion portrait, premium commercial photography.
Important: Keep the uploaded person's face 100% recognizable. Do not stylize, cartoonize, or change their identity. Only replicate the pose, lighting, outfit, camera angle, and overall aesthetic of this reference image.`,
  },
  {
    id: '03',
    title: `Sorriso no banco de estúdio`,
    category: `Estúdio`,
    image: img('03'),
    prompt: `Create a three-quarter minimalist editorial portrait using the uploaded person's face and identity. The subject is sitting casually on a tall black metal stool, facing the camera with a relaxed posture and a genuine confident smile. One hand rests naturally on the thigh while the other holds a small black product box/book near the lap. The outfit consists of a premium off-white knit polo shirt with subtle collar detailing, tailored black pleated trousers, and a simple silver wristwatch. The setting is a seamless pure white studio with a high-key aesthetic. Soft diffused natural light creates gentle shadows. The composition is centered, framing from the thighs up to allow high-resolution face generation with perfect facial features, hairstyle, skin tone, and identity. Photorealistic, ultra-detailed skin texture, premium fashion campaign quality, 85mm lens, shallow depth of field, crisp focus, natural proportions, clean minimal styling, modern personal branding photography, cinematic color grading, 8K, magazine-quality. Important: Preserve the uploaded person's exact facial features, hairstyle, skin tone, and identity while keeping the face perfectly sharp and free of distortion.`,
  },
  {
    id: '04',
    title: `Retrato de poder CEO`,
    category: `Executivo`,
    image: img('04'),
    prompt: `Using the uploaded reference image, create a high-end CEO Power Portrait of the same person, preserving their exact facial features, identity, and likeness.
Cinematic executive headshot, photorealistic, ultra-detailed, shot on a medium-format camera with an 85mm portrait lens at f/2.0, shallow depth of field with creamy background separation.
Confident, commanding executive presence, direct and intense eye contact, subtle powerful expression. Impeccably tailored dark formal attire appropriate to the person, premium fabric texture, refined and elegant.
Dramatic Rembrandt lighting with a soft key light and controlled falloff, sculpted cheekbones, luminous catchlights in the eyes, deep cinematic shadows. Clean dark studio background with a subtle gradient and gentle atmospheric haze.
Cinematic color grading, rich contrast, teal-and-amber tonal balance, filmic dynamic range. Hyper-realistic skin with natural pores, fine texture and micro-detail, tack-sharp focus on the eyes. Subtle film grain, luxury corporate aesthetic, magazine-cover quality.
professional retouching, no plastic skin, no over-smoothing.`,
  },
  {
    id: '05',
    title: `Headshot de terno`,
    category: `Executivo`,
    image: img('05'),
    prompt: `Using the uploaded reference image, create a high-end power portrait of the same person, preserving their exact facial features, identity and likeness.
Photorealistic, ultra-detailed cinematic executive headshot, waist-up vertical framing, shot on a medium-format camera with an 85mm portrait lens at f/2.5, subtle shallow depth of field.
The person wears an impeccably tailored dark navy pinstripe suit with a crisp white dress shirt, a slim dark navy tie, and a neat white pocket square, premium fabric texture, elegant and refined.
Straight-on confident pose facing the camera, head slightly forward, calm and commanding neutral expression, direct intense eye contact.
Soft dramatic key light from the front with gentle falloff and controlled shadows, luminous catchlights in the eyes, subtle sculpting on the face.
Clean studio background with a smooth charcoal-to-near-black radial gradient, slightly brighter halo directly behind the subject, deep cinematic shadows at the edges.
Rich filmic color grading, cool desaturated tones, high dynamic range, hyper-realistic skin with natural pores and fine micro-detail, tack-sharp focus on the eyes, subtle film grain, luxury corporate magazine-cover aesthetic.
professional retouching, no plastic skin, no over-smoothing.`,
  },
  {
    id: '06',
    title: `Saindo das sombras`,
    category: `Editorial & Moda`,
    image: img('06'),
    prompt: `Using the uploaded reference image, create an ultra-realistic cinematic black-and-white portrait of the same person, preserving their exact facial features, identity and likeness.
Waist-up vertical framing, shot on a full-frame camera with a 50mm prime lens at f/1.8, shallow depth of field with soft background falloff.
The person wears a formal black suit, white shirt and slim black tie, premium fabric texture, elegant and understated.
Positioned slightly off-center, facing forward with a calm, serious expression and soft focus in the eyes.
Dramatic low-key lighting with a strong overhead-and-back light source creating a glowing rim light around the hair and silhouette, while the front of the face falls gently into deep shadow.
High contrast with smooth tonal falloff into darkness, moody and intimate atmosphere, faint highlight bloom on the brightest edges.
Dark minimalist studio background fading to pure black, no visible detail, subject emerging from the shadows.
Monochrome film grading with crushed blacks, soft rolled-off highlights and a full analog tonal range, heavy 35mm film grain and high-ISO texture (3200-6400) for a raw vintage feel, slight organic softness and subtle bloom.
Hyper-realistic skin with natural pores and fine micro-detail, tack-sharp focus on the eyes, no plastic skin, no over-smoothing.
fine-art editorial monochrome aesthetic, gallery-quality print look.`,
  },
  {
    id: '07',
    title: `Entre juncos e céu aberto`,
    category: `Lifestyle`,
    image: img('07'),
    prompt: `Use the uploaded reference person as the sole source for identity and physical appearance. Completely replace the original subject with the person shown in the uploaded reference image. The character may be female, male, or any gender representation; automatically adapt the subject naturally according to the uploaded person.
Preserve the reference person's exact identity completely, including their facial appearance, face shape, skin tone, hairstyle, hair length, hair texture, hairline, eyebrows, eyes, nose, lips, jawline, ears, age appearance, facial hair (if present), body type, height impression, shoulder width, body proportions, and overall gender representation. Do not blend the reference person with the original model and do not retain any physical or facial characteristics from the original subject.
Recreate the provided composition as closely as possible.
Create a photorealistic, cinematic vertical lifestyle portrait of the reference person standing alone inside a dense field of tall, dry reeds and wild grasses beneath an overcast beige sky. The scene should feel calm, introspective, natural, and emotionally peaceful. Position the person in the lower-center portion of the frame, surrounded by tall brown reeds rising around the waist, shoulders, and edges of the composition. Leave a large amount of open sky and negative space above the subject's head.
Show the person from approximately the upper thighs or waist upwards, photographed in a clean side-profile view. Their body should face toward the right side of the frame. Keep the shoulders relaxed and the arms resting naturally beside the body.
The subject should gently tilt their head backward, raising their chin slightly toward the sky. Their eyes must be softly closed, with a calm, peaceful, meditative facial expression. The pose should feel spontaneous and unforced, as though the person is quietly breathing in the fresh air.
Adapt the pose naturally to the uploaded person's anatomy, body shape, hairstyle, age appearance, and gender presentation while maintaining the same overall body language and profile composition. Longer hair should fall or move naturally around the shoulders; shorter or curly hair should preserve its exact reference texture and silhouette.
Dress the person in a minimal, plain, oversized white T-shirt with no logos, text, graphics, jewelry, or visible branding. Adapt the cut and fit naturally to the reference person's body and gender presentation while preserving the relaxed, loose silhouette. The fabric should have realistic folds, subtle wrinkles, natural weight, and soft shadows.
Use a slightly low or chest-level camera position, creating a subtle upward perspective toward the subject and the open sky. The camera should be placed several meters away, using an approximately 50mm-70mm full-frame lens for a natural editorial perspective without facial distortion.
Compose the image vertically. Keep the person relatively small within the environment, with the sky occupying approximately the upper two-thirds of the frame. Place blurred reeds in the immediate foreground on both sides to create depth and a natural framing effect.
The surrounding vegetation should consist of tall, dry pampas-like reeds, wheat-colored grasses, thin branches, and dark brown seed heads. Some foreground plants should partially overlap the lower body without covering the face. The reeds should appear slightly windswept and irregular rather than perfectly arranged.
Use soft, diffused natural daylight from the cloudy sky. Avoid harsh sunlight, artificial lighting, or dramatic studio shadows. Create gentle highlights across the face, neck, and white shirt, with soft shadow transitions and realistic skin texture.
Color grading should feature muted beige, cream, warm gray, faded brown, taupe, and subtle sepia tones. The sky should appear softly textured, pale beige-gray, and slightly hazy. Maintain low saturation, warm cinematic highlights, deep earthy shadows, and subtle film grain, and a timeless analog-photography atmosphere.
Use a shallow depth of field: the subject's face and upper body should remain clearly focused while the nearest foreground vegetation and distant background vegetation become softly blurred. Preserve realistic dimensional depth, natural atmospheric perspective, and gentle irregular soft`,
  },
  {
    id: '08',
    title: `No microfone do palco`,
    category: `Autoridade`,
    image: img('08'),
    prompt: `Using the uploaded reference image, create an ultra-photorealistic cinematic podcast portrait of the same person, preserving their exact facial features, identity and likeness from the reference.
The person is seated at a sleek modern podcast desk, leaning slightly forward with focused intensity, speaking into a large black dynamic broadcast microphone (Shure SM7B style) on an articulated boom arm positioned close to the mouth.
They wear high-quality matte-black over-ear headphones with subtle branding, the ear cups resting naturally against the head.
Engaged, intelligent and composed expression, eyes locked with sharp concentration on an off-camera guest to the side.
Outfit: a premium heather-grey oversized hoodie in soft brushed cotton-fleece, clean and minimal with no logos or text, realistic fabric texture with natural folds, ribbed cuffs and a relaxed drawstring collar sitting comfortably on the shoulders.
Background: a warm, upscale podcast studio with a floor-to-ceiling vertical walnut wood slat wall in rich brown tones, soft ambient depth, a leafy potted plant blurred on one side and a few subtle framed art pieces, creating a cozy editorial atmosphere.
Warm amber and soft golden LED accent lights glow gently behind the subject, running along the wood panels to create a smooth rim light that separates them from the background.
Lighting: refined cinematic studio setup, a large soft diffused key light illuminating one side of the face with gentle falloff, revealing skin texture, micro-detail and natural catchlights in the eyes, warm golden backlights providing rim separation and a subtle glow on the edges of the hair, shoulders and headphones, gentle fill on the shadow side, controlled contrast adding depth without harshness.
Technical capture: shot on a Sony A1 with an 85mm f/1.4 lens, extremely shallow depth of field, creamy bokeh on the wooden background, razor-sharp focus on the eyes and microphone, rich dynamic range, natural warm skin tones and premium cinematic color grading.
Ultra-detailed 8K photorealism, high micro-contrast, realistic fabric textures, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing, polished yet intimate editorial podcast aesthetic.`,
  },
  {
    id: '09',
    title: `Look quiet luxury`,
    category: `Old Money`,
    image: img('09'),
    prompt: `Using the uploaded reference image, create a hyper-realistic, ultra-detailed 8K fashion editorial portrait of the same person, preserving their exact facial features, identity and likeness from the reference.
Outfit &amp; styling: embodying a premium "Quiet Luxury" aesthetic, the person wears a rich chocolate-brown tailored linen button-down shirt, slightly unbuttoned at the chest, with sleeves rolled up to mid-forearms; the fabric texture, stitching, folds and natural creases must be clearly visible and sharply defined.
Paired with tailored high-waisted beige pleated trousers featuring a clean, structured, beltless waistband.
Accessories: a classic silver stainless steel luxury wristwatch with a dark dial on the wrist, and thin gold-framed aviator sunglasses held in one hand.
Pose &amp; expression: standing in a relaxed, confident pose, leaning slightly back against the stone wall, upright posture and clean body structure, one hand resting naturally inside the trouser pocket, the other hand holding the sunglasses at chest level, direct eye contact with a warm, approachable, confident smile.
Composition: medium portrait shot from mid-thigh up, subject centered with balanced negative space, no cropping of head or hands.
Environment &amp; background: a heavily textured beige natural stone wall fills the background, a rough surface with clearly visible grooves and cracks.
Lighting: strong early-afternoon sunlight streaming through a front top-right opening (door), directly illuminating the face and body while casting sharp diagonal shadows across both the wall and the body, high contrast, hard light with warm tones, natural bounce light subtly filling shadows to keep facial details clearly visible, no flat lighting, cinematic contrast maintained.
Camera &amp; technical: shot at eye level, simulated full-frame camera (Sony A1 style), 85mm lens at f/1.8, ISO 100, 1/200 shutter speed, sharp focus on the subject and nearby wall texture with subtle depth of field.
Ultra-realistic skin texture with natural pores, detailed fabric rendering, professional color grading, no plastic skin, no over-smoothing.`,
  },
  {
    id: '10',
    title: `Poltrona de couro I`,
    category: `Old Money`,
    image: img('10'),
    prompt: `Transform the uploaded image into a 64K DSLR-resolution, ultra-hyperrealistic cinematic black-and-white portrait of the person from the uploaded image, sitting in the same vintage leather armchair inside a very dark, dimly lit creative studio.
Use the uploaded image as the ONLY identity reference. Preserve the exact face, hair, skin tone, age, tattoos, accessories, body proportions and every unique identifying characteristic. Do not replace the face. Do not beautify. Do not change the person's identity or gender presentation.
The subject leans forward with the elbows resting firmly on the knees, hands loosely clasped together in front, shoulders slightly rolled forward, creating an intimate yet powerful posture. The head is slightly lowered while the eyes look directly upward into the camera with a calm, confident, emotionless expression.
The person wears full-length relaxed trousers that completely cover the legs down to the ankles (no shorts, legs fully covered), paired with the original top and sneakers from the reference, natural fabric folds and wrinkles.
The camera is positioned very close using a wide-angle lens from an extremely low perspective, making the upper body appear dominant while the knees and hands become prominent foreground elements. The composition remains perfectly centered with dramatic perspective depth.
Very dark low-key chiaroscuro lighting, strongly underexposed and moody. A single dim Edison bulb is the only light source, casting a small, tight pool of soft warm light onto the face and hands only, leaving most of the face in gentle shadow with just subtle sculpting highlights on the cheekbones, nose and brow. Do not overexpose the face, keep it darker and cinematic.
The comic-book collage wall in the background falls almost completely into deep shadow, barely readable, dissolving into near-black at the edges with a heavy natural vignette swallowing the corners. Only a faint hint of the posters is visible directly behind the subject.
Deep crushed blacks dominate the entire image, controlled highlights, rich monochrome grayscale, matte finish, authentic analog film grain, subtle dust particles, volumetric glow around the bulb, shallow depth of field, gritty editorial mood, HDR, DSLR quality, 35mm lens at f/2.0, ISO 800, museum-quality realism, rendered with Unreal Engine 5 and Octane Render.`,
  },
  {
    id: '11',
    title: `Poltrona de couro II`,
    category: `Old Money`,
    image: img('11'),
    prompt: `Transform the uploaded image into a 64K DSLR-resolution, ultra-hyperrealistic cinematic black-and-white portrait of the person from the uploaded image, sitting in the same vintage leather armchair inside a very dark, dimly lit creative studio.
Use the uploaded image as the ONLY identity reference. Preserve the exact facial structure, face shape, eye spacing, hair, skin tone, facial hair if present, tattoos, accessories, body proportions, original clothing and every unique identifying characteristic. Do not replace the face. Do not beautify. Do not stylize the person's identity.
The subject reclines comfortably into the vintage leather chair with both arms resting naturally on the armrests and one ankle crossed over the opposite knee. The head tilts slightly backward while the subject calmly looks directly upward toward the camera.
The camera is positioned almost directly overhead using a dramatic bird's-eye perspective with a wide lens. The composition places the chair perfectly centered within the frame while the surrounding comic-covered walls expand outward with strong perspective distortion.
The hanging Edison bulb appears suspended between the camera and the subject, creating a soft glow, bloom and volumetric light while casting dramatic shadows across the chair and face.
Very dark low-key chiaroscuro lighting, strongly underexposed and moody. The dim Edison bulb is the only light source, casting a small, tight pool of soft warm light onto the face and upper body only, leaving most of the face in gentle shadow with just subtle sculpting highlights on the cheekbones, nose and brow. Do not overexpose the face, keep it darker and cinematic.
The comic-book collage wall falls almost completely into deep shadow, barely readable, dissolving into near-black at the edges with a heavy natural vignette swallowing the corners. Only a faint hint of the posters is visible directly around the subject.
Everything else remains identical: same original outfit, vintage dark leather armchair, hanging Edison bulb, comic-book collage wall, monochrome cinematic treatment, deep crushed blacks, controlled highlights, authentic analog film grain, subtle dust particles, editorial mood, shallow depth of field, HDR, DSLR quality, 35mm lens at f/2.0, ISO 800, museum-quality realism, rendered with Unreal Engine 5 and Octane Render.`,
  },
  {
    id: '12',
    title: `Recostado na poltrona`,
    category: `Old Money`,
    image: img('12'),
    prompt: `Using the uploaded reference image, create an ultra-hyperrealistic cinematic black-and-white portrait of the same person, preserving their exact facial features, identity and likeness from the reference.
The person reclines deeply in a modern armchair, body angled slightly to the right, head tilted far back in a moment of quiet contemplation, gaze directed upward into the darkness.
They wear sleek dark sunglasses that obscure the eyes, and a refined wristwatch on the wrist catching subtle light. One hand is raised, holding a small clear glass of steaming hot drink, delicate wisps of steam curling upward from the surface.
Strong directional rim lighting from the side sculpts the scene, creating sharp silver-white highlights along the edges of the face, jawline, neck, shoulders, arm and the glass itself, while the rest of the figure dissolves into deep shadow.
Pure black background with no environmental detail, isolating the subject completely.
Low-key, high-contrast monochrome photography, dramatic chiaroscuro lighting, rich tonal range from pure black to brilliant silver highlights, deep crushed blacks, heavy natural vignette, cinematic depth.
Ultra-sharp focus on the glass, steam and facial contours, realistic volumetric steam catching the rim light, fine hyper-realistic skin texture with natural pores, no plastic skin, no over-smoothing.
Elegant minimalism, premium editorial photographic quality, authentic analog film grain, museum-quality realism.`,
  },
  {
    id: '13',
    title: `Camisa de linho`,
    category: `Old Money`,
    image: img('13'),
    prompt: `Use the uploaded image as the exact person. Preserve identity, facial structure, hairstyle, skin tone and body proportions perfectly.
Create a luxury old-money editorial portrait of the same person. They wear a premium linen shirt, pleated trousers, leather loafers, sunglasses and a luxury wristwatch, leaning casually against a vintage European convertible on a scenic European coastal road during golden hour.
Warm cinematic sunlight, luxury travel atmosphere, mountains, lake or ocean backdrop, elegant architecture, quiet-luxury aesthetic, premium fashion editorial, magazine-cover composition, natural relaxed pose, soft atmospheric haze, beautiful reflections.
Rich cinematic color grading, shallow depth of field, 85mm portrait lens, ultra-photorealistic, luxury campaign photography, timeless elegance, Vogue and GQ editorial quality, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.
No text, no watermark, no extra people, no identity changes.`,
  },
  {
    id: '14',
    title: `Revoada de corvos`,
    category: `Criativo`,
    image: img('14'),
    prompt: `Using the uploaded reference image, create a hyperrealistic cinematic waist-up portrait of the same person, preserving their exact facial features, identity and likeness from the reference.
The person stands in profile, wearing a long dark coat over a formal suit and tie, with black leather gloves on both hands. One hand is raised with the palm open, and the head follows the direction of the palm.
From the open palm emerges a black raven formed of ash and smoke, its lower body still dissolving into swirling particles and embers.
Many ravens fly around forming a dense, chaotic yet natural swarm filling the frame, some perched on the shoulders, wings spread mid-motion in different directions, adding depth and movement.
Numerous black feathers scatter and float throughout the scene, some small and sharp in the mid-ground, a few large feathers drifting in the immediate foreground rendered with soft dreamy blur and shallow-focus bokeh for a striking composited depth effect.
The wind blows from below, lifting the collar of the coat and slightly ruffling the hair.
Intense yet serene expression, calm and commanding.
Setting: a moody gothic cathedral courtyard with towering weathered stone architecture fading into atmospheric fog and depth.
Dramatic cinematic storm lighting with strong directional key light, deep shadows, cold desaturated tones with subtle cool blue-grey grading, volumetric haze and god rays cutting through the mist.
All elements — figure, coat, ravens, smoke and feathers — fully integrated with the light and atmosphere, rich dynamic range, shallow depth of field.
Extremely lifelike and photorealistic human subject with hyper-detailed skin showing natural pores, fine wrinkles, subtle skin imperfections, realistic subsurface tone, individual hair strands and lifelike catchlights in the eyes, natural fabric and leather texture, authentic photographic realism, subtle film grain, absolutely no plastic or artificial CGI look, no over-smoothing, epic cinematic movie-poster quality.`,
  },
  {
    id: '15',
    title: `Terraço ao pôr do sol`,
    category: `Lifestyle`,
    image: img('15'),
    prompt: `Using the uploaded reference image, create an ultra-realistic cinematic editorial portrait of the same person, preserving their exact facial features, identity, hairstyle, skin tone and body proportions from the reference.
The person sits quietly on the edge of a rooftop overlooking a massive city skyline, looking toward the horizon during an intense fiery orange sunset. An enormous glowing sky filled with burning amber and copper clouds dominates most of the frame, wet reflective rooftop mirroring the orange glow.
Warm amber sunset light wraps around the silhouette as a soft rim light, deep cinematic shadows, realistic atmospheric haze.
A semi-transparent horizontal motion-blur ghost trails behind the body toward one side only, perfectly aligned with the pose like a temporal echo, while the main subject stays perfectly sharp.
Premium cinematic sunset color grade: deep blacks, glowing amber highlights, burnt-orange sky, copper midtones, soft bloom and subtle halation, Kodak Vision3 film emulation, fine analog grain, dramatic contrast.
Shallow depth of field, moody emotional atmosphere, luxury fashion editorial composition, magazine-cover quality, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '16',
    title: `Camisa branca, fundo preto`,
    category: `Estúdio`,
    image: img('16'),
    prompt: `Create a premium black-and-white studio portrait of the same person from the uploaded reference image, preserving their recognizable facial identity, natural hairstyle, skin texture and existing facial hair.
Frame them from the upper thighs upward, standing confidently with a subtle body tilt, facing the camera with an intense, sharp expression.
Dress them in a crisp, fitted white dress shirt with the collar slightly open and the sleeves neatly rolled to the elbows, paired with tailored black trousers.
Pose with one arm folded horizontally across the waist supporting the opposite elbow, while the raised hand rests naturally against the lips or chin in a contemplative gesture. Add a classic round analog wristwatch with a dark leather strap on the raised wrist.
Place them against a clean, seamless charcoal-black studio background with a subtle soft gradient behind the upper body and no visible corners or props.
Use soft directional light from the upper camera-right side, creating sculpted highlights on one side of the face and shirt while the opposite side falls into rich shadow.
Keep strong subject-to-background separation, balanced contrast, crisp focus on the eyes, face, hands and watch, realistic fabric folds, natural anatomy and refined monochrome editorial toning.
Shot with an 85mm portrait lens, shallow depth of field, high-end professional photography, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '17',
    title: `Estação de metrô`,
    category: `Urbano`,
    image: img('17'),
    prompt: `Using the uploaded reference image, accurately reconstruct the same person's face, preserving their exact facial features, identity and likeness, and place them in this exact subway station scene, upper-body portrait only.
The person stands on the platform, body slightly angled left, head tilted upward and to the right at about 20-25 degrees, looking up past the camera with a deeply introspective, melancholic expression, not looking at the lens.
They wear thick black rectangular-frame glasses and a dark black high-collar structured overcoat, buttoned up.
Directly behind them a subway train rushes past at full speed, extreme horizontal motion blur filling the entire background, silver-grey train body blur with a vivid electric-blue stripe streak and a warm orange light streak within the blur.
Cool teal-blue-green fluorescent overhead lighting falls onto the face and hair from above, with a subtle blue train-light rim catching one shoulder edge.
Cool cinematic color grade with teal shadows and cool skin tone, fine film grain.
The cool fluorescent teal light must fall naturally on the face from above with proper realistic shadows and a consistent cool color cast matching the underground environment, fully integrated lighting, not a pasted-on face.
Hyper-realistic skin with natural pores, sharp focus on the eyes and face, shallow depth of field, no plastic skin, no over-smoothing, premium cinematic editorial quality.`,
  },
  {
    id: '18',
    title: `Gola alta e blazer`,
    category: `Executivo`,
    image: img('18'),
    prompt: `IDENTITY LOCK (highest priority): use the uploaded reference image only as an identity anchor. Keep the exact same person with maximum facial accuracy — identical facial geometry, eye shape, iris color, eyebrows, nose, lips, jawline, cheekbones, ears, facial hair, hairline, hairstyle, skin tone, texture, pores, asymmetry, age, ethnicity and proportions. Do not redesign or beautify the face.
Ultra-realistic cinematic editorial studio portrait, luxury magazine-cover aesthetic, professional commercial photography. Timeless, minimal and dramatic close-up headshot, centered composition, direct eye contact, relaxed posture, neutral confident expression.
Black cashmere turtleneck under a dark charcoal tailored blazer, luxury minimalist styling, no logos or accessories.
Pure matte black seamless studio backdrop with very subtle atmospheric haze, dark luxury mood.
Professional cinematic three-point lighting: strong white rim light behind both shoulders creating a glowing outline on hair and shoulders, large soft key light slightly camera-left, gentle fill camera-right. Low-key setup with deep cinematic shadows, controlled contrast, soft volumetric haze catching the rim light, bright edge lighting, natural catchlights in both eyes.
Sony A1, 85mm f/1.8, eye-level, ultra-shallow depth of field, natural lens compression, editorial framing.
Luxury editorial color grading: natural skin tones, rich blacks, cool shadows, neutral highlights, subtle cinematic contrast, high dynamic range, film-inspired look.
Ultra-photorealistic 8K detail — visible pores, natural wrinkles, realistic beard texture, individual hair strands, glossy eye reflections, micro skin detail, sharp eyelashes, premium fabric texture, physically accurate lighting. No skin smoothing or beauty filters.
Award-winning editorial / luxury fashion campaign quality, high-end magazine cover, ultra-sharp with natural depth, professional retouching that preserves skin texture.
Negative: identity drift, different face, AI face, plastic/wax skin, beauty filter, skin smoothing, cartoon, CGI, anime, illustration, overprocessed skin, blurry eyes, low detail, bad anatomy, distorted proportions, flat lighting, overexposed highlights, low resolution, incorrect beard or hairstyle, duplicate features, text, watermark, logo.`,
  },
  {
    id: '19',
    title: `Contraluz dramático`,
    category: `Editorial & Moda`,
    image: img('19'),
    prompt: `Create an ultra-realistic cinematic backlight portrait using the uploaded reference image as the main subject, preserving their exact face, hairstyle, beard/stubble, skin tone, age, body structure, facial proportions and overall identity.
Scene: the person stands in a minimal dark interior in front of a single large bright rectangular light panel or window centered directly behind them, with darkness on both sides of the frame. The bright centered background creates a soft glowing halo and a dramatic backlit silhouette around the hair, shoulders and arms.
Pose and gaze: the person stands upright, chest facing the camera, with the head and face turned slightly to the side, but the eyes look directly into the camera lens with perfect, steady eye contact, calm and composed introspective expression. Both hands are raised in front of the lower chest to waist level with fingers loosely clasped and lightly touching, elbows relaxed.
Camera angle: shot from a low angle, camera positioned below and pointing slightly upward toward the subject, giving a subtle powerful looking-up perspective. This is important: the camera is BELOW eye level, tilted up, not from above.
Framing: medium standing portrait from roughly waist up, subject centered, shallow depth of field, realistic lens feel.
Outfit: premium light-toned crewneck knit sweater or cream sweatshirt with soft textured fabric, simple elegant casual styling, no logos.
Lighting: strong white backlight from the centered panel creating bright rim light on the hair, shoulders and arms, while a soft gentle fill light wraps onto the face from the front, keeping the face clearly visible with realistic detail, natural skin texture, warm neutral color grading and cinematic contrast.
Style: cinematic lifestyle portrait, moody yet clean indoor atmosphere, premium editorial photography, realistic shadows, soft film grain, minimal composition, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '20',
    title: `Athleisure branco em estúdio`,
    category: `Estúdio`,
    image: img('20'),
    prompt: `Use the uploaded image only as the face and identity reference for the subject. Preserve the exact facial features, hairstyle, hairline, facial hair, skin tone, facial structure, body proportions and identity with maximum accuracy. Do not alter the face, hairstyle, beard or natural expression unless they already exist in the reference image.
Create an ultra-realistic luxury studio fashion editorial portrait of the same person, seated confidently on a minimalist white cube pedestal inside a professional photography studio. Full-body composition, centered with generous negative space above the head, inspired by Fear of God Essentials, Aimé Leon Dore, Nike Sportswear and GQ Style editorials.
The person sits in a relaxed yet confident posture, legs naturally apart, both feet flat on the floor. The hands are loosely clasped together between the knees, creating a calm and effortless pose. The head is tilted slightly upward while looking just above the camera, giving a composed, ambitious and self-assured expression.
Wearing a luxury monochrome all-white athleisure outfit consisting of: a premium heavyweight oversized white crewneck sweatshirt; matching slim-fit white jogger sweatpants with ribbed cuffs; clean white premium leather sneakers with realistic leather texture; a luxury stainless-steel wristwatch with a polished metal bracelet; a fitted white baseball cap; premium black designer sunglasses with realistic reflections; minimal accessories with no logos.
The portrait is photographed against a deep burgundy seamless studio backdrop with rich matte texture. A dramatic window-frame shadow projection stretches across the backdrop, creating an elegant architectural lighting effect. A large professional softbox is intentionally visible in the upper-right corner of the frame, giving an authentic behind-the-scenes editorial atmosphere while maintaining a polished commercial aesthetic.
Professional studio lighting setup: a large rectangular softbox positioned high at camera-right as the primary light source, soft directional lighting wrapping naturally around the face and clothing, gentle fill light from camera-left preserving natural skin detail, subtle rim light separating the subject from the burgundy background, soft realistic floor shadows beneath the cube pedestal.
Capture the portrait using a 50mm full-frame lens at f/4 aperture, 1/200 second shutter speed, ISO 100, ensuring crisp full-body detail with soft background separation.
Emphasize hyper-realistic details: natural skin texture with visible pores, fine beard texture and individual facial hairs, premium heavyweight cotton texture of the sweatshirt, realistic folds in the jogger pants, clean white leather sneaker texture, metallic reflections on the luxury wristwatch, natural reflections in the sunglasses, matte burgundy backdrop texture, crisp window-shadow projection, subtle reflections on the white cube pedestal.
Finish with premium commercial editorial color grading featuring rich burgundy tones, clean whites, natural skin tones, smooth highlight roll-off, subtle organic film grain, refined contrast, selective sharpening on the face and clothing, premium skin retouching that preserves natural texture and skin detail.
The final image should resemble a high-end Fear of God Essentials, Aimé Leon Dore, Nike Sportswear or GQ Style campaign, combining minimalist studio design, premium streetwear and world-class commercial fashion photography.
Ultra-realistic, photorealistic, luxury streetwear editorial, GQ Style magazine quality, cinematic studio photography, deep burgundy backdrop, window shadow projection, visible professional softbox, HDR, hyper-realistic skin texture, premium cotton fabrics, 50mm full-frame lens, f/4, ISO 100, masterpiece quality, award-winning commercial photography, 8K resolution, full-body portrait, centered composition, no text, no watermark, no logos.-----------------------------`,
  },
  {
    id: '21',
    title: `Look total black em estúdio`,
    category: `Estúdio`,
    image: img('21'),
    prompt: `Use the uploaded image only as the face and identity reference for the subject. Preserve the exact facial features, hairstyle, hairline, facial hair, skin tone, facial structure, body proportions and identity with maximum accuracy. Do not alter the face, hairstyle, beard or natural expression unless they already exist in the reference image.
Create an ultra-realistic cinematic luxury fashion editorial portrait of the same person, seated on the floor inside a professional photography studio. Full-body composition, centered with generous negative space, inspired by Saint Laurent, Tom Ford, Rick Owens and GQ Style editorials.
The person is seated casually on the floor, leaning naturally against a studio wall. One knee is bent close to the chest while the other leg extends naturally across the floor. One arm rests casually across the raised knee, the other hand relaxes beside the thigh. Several minimalist silver rings on the fingers. The posture feels relaxed, confident and effortlessly stylish. The head is turned slightly to one side, looking thoughtfully into the distance with a calm, introspective expression conveying confidence, sophistication and quiet strength.
Wearing a luxury monochromatic all-black outfit consisting of: an oversized tailored black blazer with soft structured shoulders; a premium black crew-neck T-shirt or lightweight knit underneath; relaxed tailored black trousers with elegant draping; premium black leather Chelsea boots; a luxury stainless-steel wristwatch; minimal silver rings with subtle polished reflections.
The portrait is photographed against a deep charcoal seamless backdrop featuring a dramatic rectangular beam of warm golden window light. The light creates a large geometric shape on the wall and floor behind the subject while producing long cinematic shadows, giving the image a powerful architectural composition.
Professional cinematic lighting setup: a simulated golden-hour window light projected from the upper left, warm directional sunlight illuminating only the body inside the light beam, deep surrounding shadows preserving dramatic contrast, natural reflected light bouncing softly from the studio floor, smooth shadow transitions with rich depth and dimensionality.
Capture the portrait using a 50mm full-frame lens at f/2.8 aperture, 1/200 second shutter speed, ISO 100, creating exceptional detail with subtle background separation.
Emphasize hyper-realistic details: natural skin texture with visible pores, fine beard texture and individual facial hairs, premium matte black fabric textures, elegant tailoring and realistic clothing folds, metallic reflections on the silver rings and wristwatch, rich floor reflections, dramatic shadow gradients, crisp architectural light geometry, sharp catchlights in the eyes.
Finish with warm cinematic editorial color grading featuring deep blacks, rich golden highlights, smooth tonal transitions, subtle organic film grain, gentle vignette, refined dodge-and-burn contouring, selective sharpening on the face and eyes, premium skin retouching that preserves natural texture and luxury commercial finishing.
The final image should resemble a high-end Saint Laurent, Tom Ford or Rick Owens editorial campaign, combining dramatic window light, minimalist composition and world-class commercial fashion photography.
Ultra-realistic, photorealistic, luxury fashion editorial, GQ Style magazine quality, Saint Laurent campaign style, Tom Ford aesthetic, Rick Owens editorial, cinematic studio photography, dramatic golden window light, geometric spotlight composition, 8K, hyper-realistic skin texture, premium black tailoring, 50mm full-frame lens, f/2.8, masterpiece quality, award-winning commercial photography, 8K resolution, full-body portrait, centered composition, no text, no watermark, no logos.
---------------`,
  },
  {
    id: '22',
    title: `Ao lado da SUV de luxo`,
    category: `Automotivo`,
    image: img('22'),
    prompt: `Create a photorealistic, full-body, ultra-high-resolution fashion editorial portrait of the same person from the uploaded reference image, preserving their exact facial features, identity and likeness.
The person stands confidently beside a deep metallic matte-black luxury SUV. The vehicle's driver's-side door is fully open, revealing a premium black leather interior, modern dashboard and steering wheel. The scene is captured from a dramatic high-angle, top-down perspective, with the subject looking directly upward toward the camera.
They wear a sleek, unzipped black satin bomber jacket over a fitted black crew-neck T-shirt, paired with loose-fit tailored black trousers and clean white low-top sneakers. Accessorized with gradient square-round sunglasses and a polished gold luxury watch on the wrist. One hand is casually tucked into the trouser pocket while the other arm hangs naturally at the side. Neatly styled hair with volume. Serious, confident and effortlessly cool expression, conveying a modern luxury lifestyle aesthetic.
The SUV's glossy matte paint reflects the soft ambient light, while the dark asphalt surface provides contrast against the vehicle and the subject's monochromatic outfit. Soft, diffused overcast daylight creates natural shadows and highlights, emphasizing the silky texture of the bomber jacket, the premium materials of the car interior and the reflective finish of the vehicle.
Professional commercial lifestyle photography, luxury automotive fashion campaign, medium-format camera quality, 85mm lens at f/2 aperture, shallow depth of field, razor-sharp focus on the subject, cinematic color grading, realistic skin texture with natural pores, natural reflections, HDR lighting, ultra-detailed, 8K resolution, hyper-realistic, premium editorial aesthetic, no plastic skin, no over-smoothing.----------------------------------------------------`,
  },
  {
    id: '23',
    title: `Terno e cigarro`,
    category: `Old Money`,
    image: img('23'),
    prompt: `Use the uploaded reference image as the exact identity reference. Preserve the same face shape, eyes, nose, lips, beard, haircut, age, skin texture, facial proportions and overall identity. Do not redesign the face. Create an ultra-realistic black-and-white cinematic portrait of the same person sitting in the back seat of a luxury car at night. They wear a dark tailored suit, white shirt, loosened tie and sunglasses. The person leans slightly forward with one elbow on the knee, holding a cigarette near the open car window, smoke drifting outside. The expression is silent, tired, powerful and cinematic. Background: blurred city lights through rain-covered car windows, leather seats, reflections on the glass, night traffic bokeh. Lighting: noir black-and-white contrast, soft side light across the face, deep shadows, film grain, luxury crime-drama mood. Composition: intimate close-up from the front passenger angle. Hyper-realistic skin with natural pores, sharp focus on the eyes and face, shallow depth of field, no plastic skin, no over-smoothing. No text, no logo, no watermark.`,
  },
  {
    id: '24',
    title: `Sentado no capô`,
    category: `Automotivo`,
    image: img('24'),
    prompt: `Use the uploaded reference image as the exact identity reference. Preserve the same face shape, eyes, nose, lips, beard, haircut, age, skin texture, facial proportions and overall identity. Do not redesign the face. Create an ultra-realistic cinematic image of the same person sitting casually on the hood of a matte-black luxury sports car inside a dark underground garage. They wear a black turtleneck, a tailored charcoal coat, slim black trousers, leather shoes and dark sunglasses. One hand rests on the car hood while the other adjusts the wristwatch. The posture is relaxed but dominant, with a cold, confident stare toward the camera. Background: concrete parking structure, soft fog, fluorescent ceiling lights, reflections on the car body, deep shadows. Lighting: cinematic teal-orange color grade, strong rim light behind the shoulders, realistic reflections, luxury editorial photography style. Composition: full body visible, car partially visible, clean space on the lower left for future typography. Hyper-realistic skin with natural pores, sharp focus on the eyes and face, shallow depth of field, no plastic skin, no over-smoothing. No text, no logo, no watermark.`,
  },
  {
    id: '25',
    title: `À mesa do restaurante`,
    category: `Old Money`,
    image: img('25'),
    prompt: `Using the uploaded reference image, create an ultra-realistic BLACK AND WHITE cinematic photograph. Apply the uploaded reference identity ONLY to the central boss character, preserving their exact facial features, identity and likeness from the reference. All other people in the scene are different, unrelated strangers and must NOT share the reference face. 1940s-1970s mafia film-noir aesthetic, dramatic chiaroscuro lighting. SUBJECT (the boss, center — the ONLY person based on the reference): the person sits at the head of a heavy dark wooden table in a vintage leather chair, wearing an elegant dark tailored three-piece suit with a white shirt and dark tie, leaning back with quiet authority, one elbow on the armrest, holding a thick lit cigar near the mouth, a slow curl of smoke rising and drifting through the light beam. Calm, intimidating stare directly into the camera. On the table directly in front: an open leather briefcase FULL of neatly stacked banded dollar bills, a crystal ashtray, a vintage rotary telephone, a half-filled whiskey glass. COMPOSITION: the boss perfectly centered and sharp, shot slightly from below to convey power, chest-up to table framing. Behind and beside him, slightly out of focus, FOUR bodyguards stand in dark suits and fedora hats. These four guards are completely different anonymous men, each with his own distinct face, all clearly different from the boss and from each other, faces partially hidden in deep shadow under the hat brims, serious expressions, two of them holding vintage Thompson-style rifles pointed DOWN in a resting position, hands crossed in front, motionless and loyal. ENVIRONMENT: dim private back-room office, venetian-blind shadows striping the wall, a single strong key light from above-left cutting through cigar smoke, deep black shadows, old wooden panel walls, subtle haze in the air. STYLE: high-contrast black and white, rich film grain, deep blacks, glowing highlights on the smoke and the money stacks, timeless classic mafia movie still, shot on a vintage 35mm film look, shallow depth of field with bodyguards softly blurred. REALISM: natural skin pores and beard strands on the boss, realistic fabric texture on the suits, authentic paper texture on the dollar stacks, believable smoke physics, hyper-realistic skin, no plastic skin, no over-smoothing. NEGATIVE: no color, no text, no watermark, no logos, no modern objects, no smartphones, no CGI look, not cartoonish, distorted faces, no blood, no violence, do NOT copy the reference face onto the bodyguards, no duplicate faces, no cloned or identical faces, bodyguards must not resemble the main subject.
(OBS: TALVEZ TENHA QUE SOLICITAR PARA ALTERAR O ROSTO DOS CAPANGAS)`,
  },
  {
    id: '26',
    title: `Old Money em café europeu`,
    category: `Old Money`,
    image: img('26'),
    prompt: `Transform the uploaded reference into a premium Old Money portrait. Preserve the subject's exact facial identity, hairstyle, facial hair, age, natural skin texture and recognisable facial features. The final result must look like a real high-fashion editorial photograph of the same person, not an AI-generated face.
Scene: place the subject seated confidently at an elegant outdoor European café on a refined Parisian-style street. Include classic woven café chairs, a small round metal table, an espresso cup and a folded newspaper. The surroundings should feature softly blurred historic European architecture, café windows, balconies and subtle street details.
Pose: the subject remains seated in a relaxed, confident old-money pose, one leg crossed naturally over the other, body leaning slightly back into the chair, one arm resting comfortably on the chair or table. They may be holding an espresso cup or newspaper, adjusting the scarf or coat, or looking thoughtfully into the distance. Keep the pose natural and effortless, not stiff, overly posed or exaggerated.
Outfit: dress the subject in a premium old-money winter outfit: a tailored wool overcoat, a fine-knit black turtleneck or elegant high-neck sweater, a refined scarf where suitable, tailored trousers, polished leather loafers or dress shoes, a minimal classic wristwatch and optional fitted leather gloves. The clothing should look luxurious, structured, realistic and perfectly tailored. Avoid oversized, baggy or trendy streetwear, visible branding, flashy jewellery or costume-like styling.
Style: timeless black-and-white European fashion editorial, old-money aesthetic, quiet luxury, sophisticated styling, classic magazine photography, refined cinematic realism, premium menswear campaign, subtle 1990s fashion photography influence.
Lighting: soft natural overcast morning light with balanced exposure. Keep the face clearly visible, bright, detailed and naturally separated from the darker outfit. Do not make the face dull, underexposed, overly shadowed, grey or completely black. Preserve realistic highlights in the eyes, skin texture, cheekbones, beard and jawline.
Black-and-white treatment: pure monochrome photography with rich blacks, clean whites, smooth midtones, subtle film grain and refined contrast. The image should feel luxurious and cinematic without crushing shadow details.
Camera and composition: premium full-frame editorial photography, approximately 50mm or 85mm lens, shallow depth of field, realistic perspective, crisp facial focus, softly blurred European background. Frame the subject from approximately the knees or waist upward while clearly showing the seated posture, café chair, clothing and surrounding props. The subject should occupy most of the frame without feeling tightly cropped.
Expression: calm, confident, composed, intelligent and slightly serious. The subject may look away from the camera, glance sideways, look down at the newspaper or make controlled eye contact.
Quality: ultra-photorealistic, realistic skin pores, natural facial proportions, detailed hair strands, accurate hands and fingers, realistic fabric textures, refined tonal range, premium luxury campaign quality, ultra-high resolution.`,
  },
  {
    id: '27',
    title: `Óculos e postura serena`,
    category: `Executivo`,
    image: img('27'),
    prompt: `Using the uploaded reference image, create a monochrome high-fashion editorial portrait of the same person, preserving their exact facial features, identity and likeness from the reference, wearing glasses.
The person wears a heavy, rough-textured dark wool overcoat layered over a smooth black hoodie with thin drawstrings. They are seated, leaning slightly forward, hands casually clasped resting on the lap, casting an intense, brooding gaze directly at the lens.
Cinematic lighting, extreme chiaroscuro. Harsh directional sunlight casts prominent geometric multi-paned window shadows diagonally across the textured background wall, draping over one side of the subject and leaving the opposite eye and cheekbone in stark, high-contrast highlights.
Technical specs: shot on an 85mm lens at f/5.6, medium depth of field, 8K resolution, hyper-detailed skin pores, ultra-crisp fabric weave, striking neo-noir aesthetic, raw studio photography, hyper-realistic skin, no plastic skin, no over-smoothing.`,
  },
  {
    id: '28',
    title: `Flip phone em estúdio`,
    category: `Estúdio`,
    image: img('28'),
    prompt: `Using the uploaded reference image, create an ultra-realistic studio fashion shot of the same person, preserving their exact facial features, identity and likeness from the reference. Captured with an ultra-wide-angle fisheye lens (~14mm) from a slightly elevated, close-up angle.
The person holds a retro flip phone (Razr style) to the ear, leaning toward the camera with a charming, charismatic expression (one raised eyebrow, slightly narrowed eyes), wearing dark sunglasses.
Outfit: a white tank top. Clean studio background with a cool blue-grey gradient and subtle vignette.
Direct flash / beauty-dish-style lighting, sharp details, high contrast, defined texture, slight specular highlights on the sunglasses.
Centered composition, face slightly distorted by the fisheye lens (large face in the foreground, smaller torso), 2000s (Y2K) editorial aesthetic, 8K resolution, extreme sharpness.
Add bloom, glare, ambient occlusion and atmospheric haze effects. Hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '29',
    title: `Apoiado no carro`,
    category: `Automotivo`,
    image: img('29'),
    prompt: `Using the uploaded reference image, create a luxury black-and-white editorial portrait of the same person, preserving their exact face, hairstyle, body proportions, skin tone and identity from the reference. The person leans casually against a classic vintage European car parked beside the Mediterranean coastline, hands in pockets, looking toward the horizon with a calm, confident, serious expression, no smile. Wearing a black knit sweater and tailored trousers, minimalist luxury styling. Cloudy dramatic sky, soft cinematic natural light. Authentic monochrome film photography, Leica M11 Monochrom aesthetic, Kodak Tri-X 400 film grain, rich blacks, soft highlights, shallow depth of field, 85mm editorial portrait, premium fashion campaign, realistic skin texture with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '30',
    title: `Dentro do café`,
    category: `Lifestyle`,
    image: img('30'),
    prompt: `Using the uploaded reference image, create a timeless black-and-white editorial portrait of the same person, preserving their exact face, hairstyle, body proportions, skin tone and identity from the reference. The person sits alone in a classic Parisian café, an espresso cup on the table and a folded newspaper nearby, looking thoughtfully out the café window with a calm, sophisticated expression. Wearing an elegant tailored wool overcoat over a fine-knit sweater, minimalist luxury styling. Soft natural window light, quiet old-money mood. Authentic monochrome film photography, Leica Monochrom aesthetic, Kodak Tri-X film grain, rich cinematic contrast, shallow depth of field, 50mm editorial portrait, premium fashion magazine quality, realistic skin texture with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '31',
    title: `Café à beira-mar`,
    category: `Lifestyle`,
    image: img('31'),
    prompt: `Using the uploaded reference image, create a cinematic luxury black-and-white portrait of the same person, preserving their exact face, hairstyle, body proportions, skin tone and identity from the reference. The person sits at a quiet Mediterranean seaside café, an espresso on the table, the calm ocean and coastline softly blurred behind them, relaxed elegant posture, looking away naturally with a composed expression. Wearing an elegant all-black outfit, minimalist luxury styling. Soft afternoon light, dramatic cloudy sky. Authentic monochrome film photography, Leica M11 Monochrom aesthetic, Kodak Tri-X 400 film grain, rich blacks, fine film grain, shallow depth of field, editorial portrait, magazine-quality composition, realistic skin texture with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '32',
    title: `De terno dentro do carro`,
    category: `Automotivo`,
    image: img('32'),
    prompt: `Using the uploaded reference image, create a photorealistic black-and-white editorial portrait of the same person, preserving their exact facial features, identity and likeness from the reference.
Medium full-length shot taken from inside a classic car, looking out through the windshield, the subject framed by the car's interior (blurred dashboard and window frame in the foreground). The person stands centrally and slightly to the right of center in the midground, hands in pockets, body angled slightly to the left, head turned to the left with a distant gaze.
Wearing a textured three-piece suit and tie, against a blurred classical building facade background.
High-contrast black and white, strong directional key light from the left, soft fill, subtle rim lighting, dramatic chiaroscuro for dimensional sculpting.
85mm lens at f/1.8, shallow depth of field, professional photography, ultra-realistic, photorealistic, high-frequency details, hyper-detailed, natural skin texture with visible pores, visible fabric texture, extremely sharp facial focus, micro-contrast, HDR, global illumination, soft shadows, realistic light falloff, cinematic color grading, 8K resolution, maximum detail preservation, no plastic skin, no over-smoothing.`,
  },
  {
    id: '33',
    title: `Em pé ao lado do carro`,
    category: `Automotivo`,
    image: img('33'),
    prompt: `Using the uploaded reference image, create a photorealistic black-and-white editorial portrait of the same person, preserving their exact facial features, identity and likeness from the reference. Medium shot, eye-level camera. The person stands outside a dark luxury car with the door partially open, looking directly forward, upper body visible from mid-chest, slightly angled to the right, arms relaxed, one hand lightly gripping the car door. Architectural background softly blurred, adding depth. Hard light source from the upper-left with a clear light-shadow transition across the face and suit, strong side fill creating dramatic contrast and sculpting, subtle rim lighting defining the edges of the suit and head against the urban background. Black-and-white editorial portrait, high contrast with deep blacks and bright whites, sophisticated and authoritative mood. Wearing a finely tailored dark suit, crisp white dress shirt and dark tie, showcasing fabric textures. 85mm lens at f/1.8, shallow depth of field, professional photography, ultra-realistic, photorealistic, high-frequency details, hyper-detailed, natural skin texture with visible pores, visible fabric texture, extremely sharp facial focus, micro-contrast, HDR, global illumination, soft shadows, realistic light falloff, cinematic color grading, 8K resolution, maximum detail preservation, no plastic skin, no over-smoothing.`,
  },
  {
    id: '34',
    title: `Faixa de pedestres`,
    category: `Urbano`,
    image: img('34'),
    prompt: `Using the uploaded reference image, create a cinematic editorial photograph of the same person, preserving their exact face, hairstyle, body proportions, skin tone and identity from the reference. The person stands completely still in the middle of a busy city pedestrian crosswalk, hands relaxed at the sides or lightly in pockets, calm still posture, looking directly toward the camera with a quiet, melancholic, introspective expression, no smile. Around them, many pedestrians walk in different directions rendered with heavy, realistic long-exposure motion blur, streaking and ghosting from their movement, while the subject stays perfectly sharp, crisp and completely in focus — a strong contrast between total stillness and the fast-moving blurred crowd.
Shot from a high-angle perspective, positioned fairly close to the subject so they fill a good portion of the frame in a full-body composition, compressed 50-85mm telephoto look, moderate proximity, not distant.
Moody cinematic lighting: soft overcast daylight, cool desaturated color palette with dark muted greys, browns and blacks, low saturation, gentle shadows, wet asphalt with subtle texture, no warm or golden tones, a slightly somber dramatic atmosphere.
Long-exposure photography, slow shutter speed, dynamic blurred crowd, subject tack-sharp, premium cinematic street photography, shallow depth of field with blurred foreground and background, subtle film grain, high dynamic range, emotional storytelling, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '35',
    title: `Dividido pela luz`,
    category: `Editorial & Moda`,
    image: img('35'),
    prompt: `Transform the uploaded reference into a premium Split by Light portrait while preserving the subject's exact facial identity, hairstyle, facial hair, age, expression, body proportions and pose. Create an ultra-realistic cinematic portrait photographed in a completely dark environment. The subject wears a simple dark top, shirt, jacket or T-shirt; the clothing must be clearly visible enough to avoid any appearance of nudity, while still blending naturally into the deep black background.
Lighting: illuminate only a narrow, sharply defined section of the face using a warm golden beam of light. The light should cut dramatically across the eyes, cheekbones, nose or mouth depending on the natural pose, while most of the face and body remain hidden inside rich, deep shadows. The illuminated area should feel intentional, sculpted and cinematic, not like ordinary sunlight or soft studio lighting. Use strong chiaroscuro contrast with a smooth transition between the bright golden highlight and the surrounding darkness.
The eyes should remain realistic, expressive and sharply detailed wherever the light touches them. Preserve realistic catchlights without creating glowing or supernatural eyes.
Style: ultra-realistic editorial portrait photography, dramatic chiaroscuro lighting, deep crushed blacks, warm golden highlights, luxury fashion campaign aesthetic, emotional facial expression, cinematic contrast, realistic skin texture, subtle film grain, premium magazine photography, minimal composition.
Background: pure near-black background with no visible scenery, objects, patterns, gradients or environmental distractions. The subject should appear to emerge naturally from the darkness.
Composition: close-up or chest-up framing, subject occupying most of the image. Different natural poses are allowed, including direct eye contact, three-quarter profile, side profile, looking downward, resting the face against one hand, or turning toward the light. Keep the face as the clear visual focus, leaving enough breathing room around the head so no hair, forehead, chin or shoulders are awkwardly cropped.
Color palette: deep black, dark brown, muted skin tones and warm golden amber light only. Avoid bright background colours, cool neon tones or oversaturated orange lighting.
Quality: ultra HD, photorealistic skin, crisp facial details, realistic pores, natural hair strands, controlled highlights, strong shadow detail, premium cinematic photography, visually striking and scroll-stopping. Preserve the exact likeness of the uploaded reference while applying only the dramatic`,
  },
  {
    id: '36',
    title: `Saindo da floricultura`,
    category: `Lifestyle`,
    image: img('36'),
    prompt: `Using the uploaded reference image, create a cinematic editorial photograph of the same person, preserving their exact facial features, identity, hair, beard, eyes, skin, body and natural proportions from the reference. Single frame.
The person is stepping out of a small flower shop during a light drizzle in the late afternoon, carrying a paper-wrapped bouquet of orange flowers and adjusting their coat while looking toward someone off-frame.
The shot is taken from inside a stopped bus, photographed through two layers of wet glass. Build five layers of depth: blurred raindrops close to the lens; urban reflections in red and amber; the dark frame of the window; the perfectly recognisable protagonist; the warm interior of the flower shop behind them.
Use a 50mm-equivalent lens, soft blue rain light, an amber glow spilling from the shop, an almost imperceptible frontal fill light and a subtle golden rim light on the hair.
Preserve skin pores, individual beard strands, hair reacting to the humidity, fabric fibers, water marks on the glass, physically coherent reflections and fine analog grain.
Keep the framing slightly imperfect and candid, like a real photograph captured through the window. Moody atmospheric color grade, cool blue tones with warm amber accents, cinematic contrast, shallow depth of field, hyper-realistic skin, no plastic skin, no over-smoothing.`,
  },
  {
    id: '37',
    title: `Retrato de beleza`,
    category: `Editorial & Moda`,
    image: img('37'),
    prompt: `Using the uploaded reference image, create a hyper-realistic beauty close-up portrait of the same person, preserving their exact facial features, identity and likeness from the reference. Extremely natural skin texture with fine visible pores, a healthy subtle sheen and a satin finish, with no artificial or plastic-looking skin. Preserve small natural variations in the skin to maximise realism. Loose hair strands should look real, fine and gently lit by natural light. Preserve individual hair strands, eyebrows, eyelashes and every fine detail wherever the light touches. The expression conveys elegance, serenity and sophistication, with the head tilted slightly back and the gaze directed toward the camera. Lighting: warm natural light entering laterally from a window, creating soft shadows, delicate reflections on the skin, natural sheen in the hair and realistic catchlights in the eyes. The background is a clean neutral grey, softly blurred with no distractions. Captured with a professional full-frame camera, 85mm lens at f/1.4, ISO 100, HDR, absolutely precise focus on the eyes, shallow depth of field, beautiful optical bokeh, wide natural dynamic range and faithful color reproduction. 8K Ultra HD quality, luxury beauty editorial photography, real skin texture, individually visible hair strands, physically realistic lighting, extreme sharpness and a cinematic finish. Prioritise absolute photorealism: an image indistinguishable from a professional international beauty campaign, no AI appearance, no overly smooth skin, no facial deformations, no misaligned eyes, no artifacts, no excessive sharpening, preserving natural human proportions, realistic facial symmetry and maximum richness of detail.`,
  },
  {
    id: '38',
    title: `Mão no rosto`,
    category: `Editorial & Moda`,
    image: img('38'),
    prompt: `Using the uploaded reference image, create a hyper-realistic beauty editorial portrait of the same person, preserving their exact facial features, identity and likeness from the reference. Extremely natural skin texture with fine visible pores, a luminous satin finish and no artificial or plastic-looking skin. Preserve individual hair strands with natural texture and soft movement, gently lit and falling delicately over part of the face. Pose: one hand rests softly against the head, fingers through the hair, creating a spontaneous and elegant composition. The expression is calm and serene with a very subtle smile and the gaze directed toward the camera, head tilted slightly. Outfit: a structured chocolate-brown top with a clean straight neckline, paired with delicate layered gold accessories including large gold hoop earrings, a floral pendant and a long fine chain, for a modern sophisticated look. Lighting: warm natural late-afternoon light entering laterally from a window, creating soft realistic shadows on the face and neckline, warm reflections and a natural sheen on the skin, with realistic catchlights in the eyes. The background is a clean neutral grey, minimalist and softly blurred with no distractions. Captured with a professional full-frame camera, 85mm lens at f/1.8, ISO 100, HDR, absolutely precise focus on the eyes, shallow depth of field and natural optical bokeh. 8K quality, extreme sharpness, faithful colors, high dynamic range, realistic skin texture, individually defined hair strands and a professional photographic finish. Prioritise absolute realism: no artificial-intelligence appearance, no overly smooth skin, no facial deformations, no misaligned eyes, no deformed hands or fingers, no artifacts, no excessive sharpening, no CGI, preserving natural human proportions and an aesthetic indistinguishable from a professional luxury beauty and fashion editorial.`,
  },
  {
    id: '39',
    title: `Moda em parede de concreto`,
    category: `Editorial & Moda`,
    image: img('39'),
    prompt: `Using the uploaded reference image, create a hyper-realistic luxury fashion editorial portrait of the same person, preserving their exact facial features, identity and likeness from the reference. Natural skin texture with a satin finish, luminous but realistic, with fine visible pores and no artificial or plastic-looking skin. Preserve individual hair strands with extremely natural texture, falling softly and framing the face. Serious, elegant and confident expression, looking directly toward the camera.
Outfit: an oversized white cotton dress shirt worn off the shoulders, intentionally draped low so both shoulders are fully exposed, elegantly revealing part of the collarbone and neckline. The premium fabric shows natural folds, a relaxed drape and a slightly crumpled texture, reinforcing a contemporary fashion look.
Accessory: a single minimalist small gold cross pendant resting softly against the neckline.
The person stands close to an exposed raw concrete wall in warm grey tones with a subtly rough texture, while the rest of the environment stays dark, creating depth and an intimate mood. The background is minimalist, blurred and free of distractions.
Lighting: warm golden late-afternoon light (golden hour) as the main source, entering laterally from the camera-left, creating a dramatic sculpting effect with soft shadows across the shoulders and chest. The light forms soft geometric shadows across one shoulder and part of the shirt, as if passing through a window or venetian blinds. The lit side of the face shows warm golden tones while the opposite side falls into soft shadow, preserving facial detail and volume.
Framing: medium close-up from roughly the bust up, camera at eye level for a natural elegant perspective, composition following the rule of thirds with the face in the upper portion of the image.
Captured with a Canon EOS R5, Canon RF 85mm f/1.2 USM lens, 85mm focal length, f/1.8 aperture, ISO 100, 1/400s shutter speed, white balance adjusted to the warm golden-hour light (approximately 5200K). Shallow depth of field, softly blurred background with natural bokeh, absolutely precise focus on the eyes.
8K HDR quality, skin with visible pores, individually defined hair strands, natural sheen on the lips, richly detailed shirt fabric, cinematic contrast, warm tones, wide dynamic range, extreme sharpness, no artificial appearance, no over-smoothing, no anatomical distortions. Luxury fashion editorial aesthetic with a premium finish and sophisticated atmosphere.`,
  },
  {
    id: '40',
    title: `Terno preto de corpo inteiro`,
    category: `Executivo`,
    image: img('40'),
    prompt: `Create a premium, ultra-realistic low-key studio portrait of the same person from the uploaded reference image, preserving their natural facial identity, skin tone, age, hairstyle and existing facial hair without adding or removing any features.
Dress them in a sharply tailored matte-black three-piece suit with a fitted waistcoat, a crisp white dress shirt and a slim black tie.
Pose them standing confidently against a seamless deep-black background with both hands relaxed inside the trouser pockets, body slightly angled and head turned toward camera-left while looking calmly off-camera. Keep the expression serious, composed and naturally confident with relaxed facial muscles.
Frame the portrait from mid-thigh upward with the full head visible and clean headroom.
Use soft directional lighting from the upper camera-left side to illuminate the face, shirt collar and suit edges while maintaining rich shadows and visible black fabric texture.
Capture at eye level with an 85mm lens, shallow depth of field, high-contrast luxury editorial styling and realistic skin detail with natural pores.
Clean composition without text or logos, 8K resolution, hyper-realistic skin, no plastic skin, no over-smoothing.`,
  },
  {
    id: '41',
    title: `Olhar de lado, luz interna`,
    category: `Editorial & Moda`,
    image: img('41'),
    prompt: `Using the uploaded reference image, create an ultra-realistic candid portrait of the same person, preserving their exact facial identity, hairstyle, beard and overall appearance as accurately as possible. Seated indoors, captured in a spontaneous and natural moment. The person wears dark sunglasses and a loose white shirt with an open collar, looking slightly to the side with a calm, introspective expression. Medium close-up composition, three-quarter side-profile angle, seated posture, relaxed body language. The subject is partially framed through soft, blurred foreground elements such as leaves and the edge of a doorway, creating natural depth and an intimate observational feeling. Warm late-afternoon sunlight entering from the side, soft highlights on the face and shirt, deep cinematic shadows, dark elegant interior background. Shallow depth of field, creamy bokeh, realistic skin texture with natural pores, natural facial hair, subtle film grain, muted warm color grading, premium editorial lifestyle photography, 85mm lens at f/1.8, highly detailed, photorealistic, no plastic skin, no over-smoothing.`,
  },
  {
    id: '42',
    title: `Camisa retrô na cozinha`,
    category: `Lifestyle`,
    image: img('42'),
    prompt: `Using the uploaded reference image, create a photo of the same person, preserving their exact facial features, identity and likeness from the reference. Shot on a disposable camera, Kodak Gold 200 film, heavy grain, light leaks on the edges, slight overexposure.
The person wears a retro London 1980s home football jersey, standing alone in a kitchen at a house party, leaning against the counter, with blurred people in the background.
Warm tungsten light, looking at the camera with a subtle smile, washed-out warm tones, authentic 35mm film photography aesthetic, candid snapshot feel.`,
  },
  {
    id: '43',
    title: `Agachado com estátua`,
    category: `Criativo`,
    image: img('43'),
    prompt: `Using the uploaded reference image, create a photorealistic portrait of the same person, preserving their exact facial features, identity and likeness from the reference. The person crouches low with one knee bent, sharply in focus amid a motion-blurred urban crowd, looking up at the camera with an intense stare, the Christ the Redeemer statue towering directly above them. They wear an oversized cream zip hoodie and wide corduroy pants. The camera is angled from a very low position looking sharply upward at roughly 60 degrees, emphasizing the imposing scale of the statue overhead. Every person in the crowd around them is rendered in strong radial motion blur streaking outward from the center, while the subject alone remains crisp and still. Warm-toned color grade with soft haze, sharp contrast, hyper-realistic skin with visible pores and fine detail, photorealistic, premium editorial streetwear photography, no plastic skin, no over-smoothing.`,
  },
  {
    id: '44',
    title: `Editorial de moda`,
    category: `Editorial & Moda`,
    image: img('44'),
    prompt: `Using the uploaded reference image as the only identity and body reference, create a hyper-photorealistic luxury fashion editorial portrait of the same person, preserving their exact facial identity, skin tone, facial proportions, hairstyle, hairline, body shape and all recognizable physical features. Automatically adapt the styling to suit the person. Pose and framing: vertical three-quarter portrait against a clean light-gray studio background. The person stands upright with a confident posture, body slightly angled, head turned with an elegant side-looking gaze, one hand raised near the collar or tie while the opposite hand rests inside the trouser pocket. Soft studio lighting with subtle shadows and a bright clean background. Gender-adaptive formal styling: if the person reads as male, dress them in a premium dark navy double-breasted suit with structured shoulders, refined peak lapels, elegant metallic buttons, matching tailored trousers, a crisp white dress shirt and a dark navy or black tie. If the person reads as female, dress them in a sophisticated dark navy double-breasted pantsuit with a naturally fitted waist, structured shoulders, refined lapels, tasteful metallic buttons, matching tailored trousers and a crisp white blouse or formal shirt, with a tie only if it suits the look, otherwise a clean open-collar shirt. The tailoring must fit the person's natural body proportions without changing their physique, with realistic fabric folds, seams, button placement, lapel structure and shirt cuffs. Natural skin texture with visible pores and subtle imperfections, realistic hair strands, accurate hands and anatomically correct fingers, detailed suit fabric, professional studio lighting, premium magazine-quality color grading, no plastic skin, no over-smoothing. No text, no logo, no watermark, no additional person, no distorted hands, no altered identity, no exaggerated body proportions.`,
  },
  {
    id: '45',
    title: `Apontando para a tela`,
    category: `Autoridade`,
    image: img('45'),
    prompt: `Using the uploaded reference image, create a personal-branding and digital-marketing style photographic portrait of the same person, preserving their exact facial features, identity and likeness from the reference, conveying friendliness, confidence, credibility and professionalism. The person stands, leaning slightly forward, looking directly into the camera with a wide, natural smile. They hold a smartphone in a vertical position with one arm extended toward the camera, so the device stands out prominently in the foreground of the image. The smartphone screen is completely black, clean and reflection-free, working as an empty space to later insert apps, ads, websites or promotional materials. With the other hand, they point directly at the smartphone screen, visually reinforcing the focus of the communication. They wear a dark denim long-sleeve shirt with a modern fit, front buttons and a structured collar, creating a sophisticated, contemporary and approachable look. The expression conveys enthusiasm, warmth and confidence. Natural realistic skin texture, preserving the exact facial features of the reference without altering proportions. The background is fully smooth in a light-gray tone, minimalist and clean, offering ample negative space for inserting text, logos or graphic elements. Lighting is soft and diffused, produced by large studio softboxes, creating very delicate shadows, excellent facial definition and uniform illumination. The smartphone stays perfectly lit with well-defined edges and a fully smooth screen to make future edits easy. Shot with a professional full-frame camera, 85mm lens at f/2.2, ISO 100, 1/200s, 8K quality, shallow depth of field, extremely precise focus on the eyes, slight natural blur on the smartphone due to perspective, high dynamic range (HDR), balanced contrast, natural colors, high sharpness and a premium editorial finish. Vertical high-standard corporate portrait, modern, minimalist, elegant and timeless. Ultra-realistic, preserving the exact facial features of the reference without altering proportions or facial characteristics. Keep natural skin texture, premium lighting, a professional photographic finish and a sophisticated look, ideal for marketing campaigns, social media, ads and personal branding, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '46',
    title: `Comemorando com punhos cerrados`,
    category: `Autoridade`,
    image: img('46'),
    prompt: `Using the uploaded reference image, create a personal-branding, modern editorial style photographic portrait of the same person, preserving their exact facial features, identity and likeness from the reference, conveying energy, determination, enthusiasm and confidence. The person stands, body leaning slightly forward, with both fists clenched close to the chest in a gesture of celebration and victory. The facial expression is intense, with an open, vibrant smile conveying motivation, strength and achievement. They wear a premium basic t-shirt in a dark graphite tone with a modern fit and impeccable drape, combined with dark smart-casual tailored trousers. As the only accessory, a classic analog wristwatch, keeping a minimalist and contemporary look. Natural realistic skin texture, preserving the exact facial features of the reference without altering proportions. The setting is a photographic studio with a minimalist dark-gray background. Diagonal beams of light cross the background, creating a dramatic and cinematic effect, adding depth and visual impact without distracting from the portrait. Cinematic lighting produced by large studio softboxes, with a main side light and soft fill light, creating elegant shadows, excellent facial definition and balanced contrast. Shot with a professional full-frame camera, 85mm lens at f/2.0, ISO 100, 1/250s, 8K quality, shallow depth of field, extremely precise focus on the eyes, high dynamic range (HDR), soft contrast, natural colors, high sharpness and a premium editorial finish. Vertical high-standard personal-branding portrait, modern, minimalist, elegant and timeless. Ultra-realistic, preserving the exact facial features of the reference without altering proportions or facial characteristics. Keep natural skin texture, premium lighting and a professional photographic finish, ideal for marketing campaigns, brand positioning, social media and visual identity, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '47',
    title: `Três dedos em destaque`,
    category: `Autoridade`,
    image: img('47'),
    prompt: `Using the uploaded reference image, create a personal-branding, modern editorial style photographic portrait of the same person, preserving their exact facial features, identity and likeness from the reference, conveying confidence, warmth, authenticity and professionalism. The person stands, leaning slightly forward, looking directly into the camera with a discreet, welcoming smile. One arm is extended toward the camera in a gesture holding up three fingers, creating a strong effect of perspective and depth. The hand is in the foreground, slightly blurred due to the depth of field, while the face stays perfectly sharp. The other hand rests naturally in the trouser pocket, conveying a relaxed and self-assured posture. They wear a premium basic black t-shirt with an impeccable fit, combined with black trousers, creating a modern, minimalist monochromatic look. As the only accessory, a discreet metal wristwatch. Natural realistic skin texture, preserving the exact facial features of the reference without altering proportions. The background is fully black, smooth and minimalist, providing ample negative space and making the subject stand out completely. Lighting is soft and diffused, produced by large studio softboxes, with the main light positioned at approximately 45 degrees, complemented by a soft fill light, creating delicate shadows, excellent facial definition and balanced contrast. Shot with a professional full-frame camera, 85mm lens at f/2.0, ISO 100, 1/200s, 8K quality, shallow depth of field, extremely precise focus on the eyes, slight natural blur on the hand in the foreground to reinforce the sense of depth, high dynamic range (HDR), balanced contrast, natural colors, high sharpness and a premium editorial finish. Vertical high-standard personal-branding portrait, modern, minimalist, elegant and timeless. Ultra-realistic, preserving the exact facial features of the reference without altering proportions or facial characteristics. Keep natural skin texture, premium lighting and a professional photographic finish, ideal for digital marketing, social media, advertising campaigns and visual identity, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '48',
    title: `Apontando com confiança`,
    category: `Autoridade`,
    image: img('48'),
    prompt: `Using the uploaded reference image, create a personal-branding and premium corporate style photographic portrait of the same person, preserving their exact facial features, identity and likeness from the reference, conveying friendliness, authority, credibility and professionalism. The person stands, slightly turned to the side, smiling spontaneously and looking directly into the camera. They wear a modern-cut navy-blue tailored blazer combined with a light-blue open-collar dress shirt, no tie, for an elegant, contemporary look ideal for professional positioning. The pose is dynamic and communicative: one arm is raised with the index finger pointing to one side of the image, while the other hand also points in the same direction, creating a perfect composition to highlight text, offers, calls to action or graphic elements in advertising campaigns. The expression conveys confidence, warmth and approachability. Natural realistic skin texture, preserving the exact facial features of the reference without altering proportions. The background is fully white, clean and minimalist, offering ample negative space for inserting titles, logos, banners or promotional text. Lighting is soft and diffused, produced by large studio softboxes, creating very delicate shadows, excellent facial definition and a premium editorial finish. Shot with a professional full-frame camera, 85mm lens at f/2.2, ISO 100, 1/200s, 8K quality, shallow depth of field, extremely precise focus on the eyes, high dynamic range (HDR), balanced contrast, natural colors and high sharpness. Vertical high-standard luxury corporate portrait, minimalist, modern, elegant and timeless. Ultra-realistic, preserving the exact facial features of the reference without altering proportions or facial characteristics. Keep natural skin texture, premium lighting and a professional photographic finish, ideal for marketing campaigns, ads, social media, personal branding and institutional materials, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '49',
    title: `Tipografia em cena`,
    category: `Criativo`,
    image: img('49'),
    prompt: `Using the uploaded reference image, create an ultra-realistic cinematic portrait poster of the same person, preserving their exact facial features, identity and likeness from the reference. Centered headshot with the shoulders visible and a calm, powerful expression.
Use dramatic studio lighting with a soft key light and subtle rim lighting for depth and contrast. The background should be dark matte black or charcoal with a luxury cinematic feel.
Place very large, tall, condensed vertical typography behind and above the head of the subject in a stretched editorial style, partially hidden by the subject, with the text Reading "YOUR NAME". The typography should be metallic gold with a subtle foil shine.
Dress the subject in a refined elegant outfit such as a black tailored suit or an elegant modern formal look, naturally suited to the person.
Style the image as a classy luxury editorial poster with deep black and gold tones, ultra-realistic skin detail with natural pores, shallow depth of field, cinematic color grading and high-resolution professional photography, no plastic skin, no over-smoothing.Obs: alterar o YOUR NAME pelo seu NOME`,
  },
  {
    id: '50',
    title: `Caminhando com o retrato`,
    category: `Criativo`,
    image: img('50'),
    prompt: `Using the uploaded reference image, create an ultra-premium minimalist sports poster featuring the same person, preserving their exact facial features, identity and likeness from the reference. The person walks forward in an elegant all-black outfit: black jacket, polo shirt, tailored trousers and white sneakers, confident body language.
A massive black-and-white side-profile portrait of the same person dominates the background with sharp facial details, realistic skin texture, natural expression and cinematic depth.
Bold vertical typography is creatively integrated through the portrait using modern cutout techniques, with the text reading "[NOME AQUI]".
Clean white background with striking red geometric accents. Luxury magazine-cover aesthetic, premium branding style, modern editorial layout, cinematic lighting, subtle shadows, realistic depth, professional advertising campaign look, Nike-inspired sports poster, ultra-realistic photography, crisp details, high contrast, premium typography, powerful composition, sophisticated graphic design, 4K Ultra HD, sharp focus, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.Obs: alterar o NOME`,
  },
  {
    id: '51',
    title: `Rosto dividido, metade pintada`,
    category: `Criativo`,
    image: img('51'),
    prompt: `Using the uploaded reference image, create a high-resolution, close-up cinematic portrait of the same person, using the reference for their bone structure, skin tone and likeness, preserving their identity. The face is split into two distinct halves down the vertical center: one bare, one painted.
Both sides of the face share the same expression: a subtle, slight smile with the corners of the mouth barely turned up, calm but unsettling, quietly ironic and faintly sinister, like a restrained horror-movie smile that hints at barely-contained menace beneath a composed surface. The eyes are intense and knowing.
One half shows the person's natural, un-made-up appearance carrying that subtle eerie smile. The other half reveals the Joker persona: pale ghost-white greasepaint skin, a smeared crimson-red smile that follows and extends the natural subtle smile, bleeding slightly past the lip line onto the cheek, a sharp blue diamond shape stamped above and around the eye, and a smudge of red across the bridge of the nose, all rendered in the gritty, lo-fi, hand-applied theatrical makeup style of Joker (2019), not the clean comic-book version.
The two halves are separated ONLY by where the white greasepaint makeup starts, as a natural edge of paint on the skin. There must be NO black line, NO drawn line, NO border, NO divider and NO stripe down the middle of the face — just bare skin transitioning directly into the painted makeup.
Background: dark, grimy, out of focus, Gotham-esque shadow with no distracting detail.
Lighting: harsh, directional, high-contrast chiaroscuro lighting that emphasizes skin pores, sweat and the texture of the makeup.
Color grading: desaturated overall, with the red smile and blue diamond popping as the only vivid colors.
Mood: psychological duality and quiet menace, an ironic calm hiding barely-contained chaos. Photorealistic, 35mm film grain, shallow depth of field, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing. Apply the Joker makeup on the painted half regardless of the subject's gender.
Negative: no black line down the center, no drawn dividing line, no border or stripe splitting the face, no fragmentation or crack effect, no sad or depressed expression, no blank empty stare.--------------`,
  },
  {
    id: '52',
    title: `Terno no deserto lendo jornal`,
    category: `Criativo`,
    image: img('52'),
    prompt: `Using the uploaded reference image, create a luxury editorial fashion portrait of the same person, preserving their exact face, hairstyle, identity and body proportions from the reference. The person sits on a simple black folding camping chair in the middle of a vast empty desert, wearing an expensive tailored black suit, white dress shirt, black tie, polished black leather shoes and dark sunglasses. They sit with one leg crossed, calmly reading an unfolded newspaper with a perfectly composed, emotionless expression. Behind them, an abandoned vintage American sedan is completely engulfed in flames, with huge cinematic orange flames wrapping around the entire vehicle, glowing embers, heat distortion and thick black smoke rising hundreds of feet into the sky. The calm subject against the violent destruction creates a dramatic "calm inside chaos" contrast. Warm desert tones, muted cinematic color grading, soft overcast afternoon light, editorial photography, luxury magazine-cover aesthetic, realistic smoke and fire simulation, volumetric lighting, shallow depth of field, 85mm lens, ultra-detailed, photorealistic, strong visible analog film grain and heavy photographic noise across the whole image for a grainy vintage film look, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '53',
    title: `Dinheiro e carro de luxo`,
    category: `Automotivo`,
    image: img('53'),
    prompt: `Using the uploaded reference image, create an ultra-realistic cinematic studio portrait of the same person, preserving their exact facial features, identity and likeness from the reference. The person leans back casually against the front of a glossy yellow luxury sports car (Ferrari-style supercar), full-body composition, wearing a zip-up sweatshirt hoodie, dark baggy streetwear trousers and sneakers, no cap, arms crossed over the chest holding a thick stack of banded US dollar bills, head tilted slightly down, calm and confident posture. Clean overexposed white studio background with a bright blown-out glow, strong backlight behind the subject and car creating a soft rim-light halo around the edges. Thick soft white smoky haze drifting through the scene from the bright background, wrapping around the subject and car for a dreamy atmospheric fog effect. Glossy wet reflective floor mirroring the car and subject, slightly darkened subject front for depth, high contrast, deep cinematic shadows, professional studio lighting, dramatic and premium mood. Hyper-realistic skin with natural pores, crisp fabric and car-paint detail, ultra-realistic, high detail, 4K, no plastic skin, no over-smoothing.`,
  },
  {
    id: '54',
    title: `Estúdio 50mm cinza claro`,
    category: `Estúdio`,
    image: img('54'),
    prompt: `Using the uploaded reference image, create an ultra-realistic studio portrait of the same person, preserving their exact facial features, identity and likeness from the reference. Chest-up centered composition with vertical framing, the subject occupying most of the frame against a plain light-gray seamless background.
Eye-level camera angle with a natural 50mm lens, f/2, ISO 100, 1/125s. Body turned slightly to the side with shoulders angled, head gently rotated toward the camera, direct gaze and a subtle confident smile.
The person is dressed formally in professional political attire: a well-tailored dress shirt (or a suit with an open-collar shirt), clean, elegant and modern campaign styling in solid neutral colors, no flag graphics on the clothing.
They are holding a full-size fabric Brazilian flag (green field, yellow diamond, blue circle with white stars) in their hands, gathered against the chest with realistic folds, soft fabric texture and natural gravity, clearly a separate piece of cloth being held, never printed or blended into the clothing.
Clean indoor studio environment, soft diffused key light from camera-left with gentle fill producing smooth natural shadows and subtle catchlights, shallow depth of field with soft background separation.
Ultra-realistic photography, 4K detail, extreme sharpness, high micro-detail, fine texture, clean edges, high micro-contrast, noise-free, natural rendering, DSLR-level detail, professional lens rendering, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '55',
    title: `Perfil 85mm em estúdio`,
    category: `Estúdio`,
    image: img('55'),
    prompt: `Using the uploaded reference image, create an ultra-realistic professional studio portrait of the same person, preserving their exact facial features, identity and likeness from the reference. Tight composition framed from just below the chest upward, vertical composition, plain light-gray seamless background. Eye-level camera angle with a professional 85mm portrait lens, f/2, ISO 100, 1/125s.
The subject is shown mostly in side profile, body and face turned to one side, chin gently raised, neck naturally elongated, head tilted slightly upward as if looking toward a brighter future. The eyes are directed upward into the distance with an expression of hope, confidence, determination and optimism, a genuine warm smile brightening the face.
The person is dressed formally in professional political attire: a well-tailored dress shirt or a suit with an open-collar shirt, clean, elegant and modern campaign styling in solid neutral colors, no flag graphics on the clothing.
They are holding a full-size fabric Brazilian flag (green field, yellow diamond, blue circle with white stars) in their hands, held up against the chest and shoulder with realistic flowing folds, soft fabric texture and natural gravity, clearly a separate piece of cloth being held, gently reacting to a soft breeze without excessive movement.
Professional indoor studio with a plain light-gray seamless background, designed so it can be easily replaced in post-production. Soft diffused key light from camera-left with gentle fill producing smooth natural shadows, bright catchlights, flattering skin tones and subtle rim lighting to define the facial profile.
Shallow depth of field with soft background separation. Ultra-realistic photography, 4K detail, extreme sharpness, high micro-detail, fine texture, clean edges, high micro-contrast, noise-free, natural rendering, DSLR-level detail, professional lens rendering, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '56',
    title: `Retrato de campanha`,
    category: `Autoridade`,
    image: img('56'),
    prompt: `Using the uploaded reference image, create an ultra-realistic cinematic studio portrait of the same person, preserving their exact facial features, identity and likeness from the reference. Waist-up vertical composition against a plain light-gray seamless background, eye-level to slightly low camera angle with a 50mm lens, f/2, ISO 100, 1/125s.
The person is dressed formally in professional political attire: a well-tailored dress shirt or a suit with an open-collar shirt, clean elegant modern campaign styling in solid neutral colors, no flag graphics on the clothing.
They raise a large full-size fabric Brazilian flag (green field, yellow diamond, blue circle with white stars) high with both hands, the flag fully open and unfurled above and behind their head, spread wide and flowing dramatically as if caught in a strong triumphant wind, with realistic billowing folds and soft fabric texture, clearly a separate piece of cloth being held.
Vibrant, energetic and celebratory mood, proud confident expression with a genuine warm smile, looking forward with determination and optimism.
Clean indoor studio environment, soft diffused key light from camera-left with gentle fill, bright catchlights, subtle rim lighting separating the subject and flag from the background, shallow depth of field.
Ultra-realistic photography, 4K detail, extreme sharpness, high micro-detail, fine texture, clean edges, high micro-contrast, noise-free, natural rendering, DSLR-level detail, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '57',
    title: `Perfil na sombra`,
    category: `Editorial & Moda`,
    image: img('57'),
    prompt: `Using the uploaded reference image, create an ultra-realistic cinematic side-profile portrait of the same person, preserving their exact identity, face shape, hairstyle, skin tone, natural proportions and realistic expression from the reference. The person is shown from behind and slightly from the side, turning the head to the right in a clean profile pose. The mood is quiet, mysterious, premium and editorial. The outfit should suit the person's style: a dark minimal jacket, black structured coat, premium casual blazer or clean monochrome outerwear that fits naturally. No visible logos, no bright patterns, no unnecessary accessories. If glasses suit the person, use subtle dark-frame glasses with realistic lens reflection; otherwise no glasses. The styling must feel natural, modern and cinematic. Lighting: dark charcoal/black studio background, strong white rim light from behind and above, highlighting the hair edges, ear, neckline and shoulder contour. The face remains mostly in shadow with a thin highlight on the nose, cheekbone and lashes. Very dramatic contrast, soft haze in the background, realistic hair strands glowing under the backlight, deep shadows, refined cinematic atmosphere. Camera: close side-profile framing from the shoulders upward, 70mm-85mm lens look, shallow depth of field, realistic editorial photography, dark moody tones, subtle film grain, premium portrait lighting, natural posture, sharp profile silhouette, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '58',
    title: `Camisa gola mandarim`,
    category: `Executivo`,
    image: img('58'),
    prompt: `Using the uploaded reference image, create an ultra-realistic cinematic studio portrait of the same person, preserving their exact facial features, identity and likeness from the reference. Medium close-up shot, direct eye contact with the camera, subtle confident expression, black minimalist mandarin-collar shirt, shoulders slightly turned, head angled toward the camera. Clean studio background with a smooth purple and magenta gradient, professional portrait photography composition, subject positioned slightly off-center, shallow depth of field, perfect facial focus, ultra-detailed skin texture with natural pores, realistic facial-hair detail and realistic eyes. Soft key light from front-left, magenta rim light from rear-right, subtle purple fill light, cinematic color separation, smooth transitions between shadows and highlights, premium editorial lighting. Luxury fashion campaign aesthetic, modern refined portrait, dramatic yet elegant atmosphere, photorealistic rendering, volumetric lighting, realistic subsurface skin scattering, high dynamic range, sharp focus, premium color grading. Shot on a Sony A7R V, 85mm lens, f/1.8, studio photography, ultra-detailed, 8K, masterpiece, cinematic depth, award-winning portrait photography, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '59',
    title: `Moletom com zíper`,
    category: `Estúdio`,
    image: img('59'),
    prompt: `Using the uploaded reference image, create a cinematic editorial fashion portrait of the same person, preserving their exact facial features, identity and likeness from the reference. Use a tight vertical portrait crop from the upper torso to the head. Position the person slightly right of center with the shoulders angled and head turned toward the camera in a three-quarter profile pose. Add a subtle head tilt and a serious, confident, introspective expression, with the gaze directed slightly past the camera. Maintain any glasses and facial hair from the reference. Emphasize a sharp jawline, defined cheekbones, realistic skin texture with visible pores and natural highlights. Style the hair with a slightly messy, textured look. Dress the person in a black or very dark charcoal knit zip-up sweater made from heavy ribbed fabric, slim fit with a high collar partially zipped, creating a modern, minimalist appearance. Use dramatic cinematic lighting with a strong directional key light from the front-left. Keep fill light minimal to allow deep shadows, and add a subtle rim light along the jawline and shoulders for separation. The lighting should be soft yet directional, with high contrast and controlled skin highlights. Place the person against a smooth dark-red to burgundy gradient studio backdrop with soft diffusion. Leave subtle negative space on the left side of the frame and maintain strong subject-background separation. Shot on an 85mm portrait lens with a wide-aperture look (f/1.8-f/2.8), producing high facial sharpness and a smooth, creamy background blur. Preserve clean studio quality, minimal noise, rich shadows and controlled highlights. Color palette: deep red, burgundy, black and warm slightly desaturated skin tones. Apply cinematic color grading with warm shadows, a subtle red cast, enhanced midtone contrast, muted saturation and a very subtle vignette. Style: luxury fashion portrait, cinematic editorial photography, high-end magazine aesthetic, intense, refined, dramatic mood, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing. No text, logos, graphics, watermarks or typography.`,
  },
  {
    id: '60',
    title: `Xícara de café, olhar para cima`,
    category: `Lifestyle`,
    image: img('60'),
    prompt: `Using the uploaded reference image, create an ultra-realistic 8K DSLR fashion portrait of the same person, preserving their exact facial identity, facial structure, jawline, hairstyle, beard, skin tone, lips, nose, ears and facial proportions from the reference. 85mm lens, high-angle top-down shot from directly above a zebra crossing. The person looks up at the camera with a calm, confident expression. They wear an oversized black heavyweight T-shirt, washed charcoal-grey wide-leg ripped jeans, white Air Force 1 sneakers, matte-black rectangular sunglasses, a thin silver chain, a silver bracelet on the wrist and a silver stud earring. They hold a bright red takeaway coffee cup with a white lid in one hand, the other hand inside a pocket. Natural daylight, soft shadows, HDR, realistic asphalt and zebra crossing, premium streetwear aesthetic, lifelike skin texture with natural pores, ultra-sharp focus. No AI look, no blur, no distortion, no plastic skin, no over-smoothing.`,
  },
  {
    id: '61',
    title: `Cabine telefônica de Londres`,
    category: `Viagem`,
    image: img('61'),
    prompt: `Using the uploaded reference image, create an ultra-realistic cinematic photo of the same person, preserving their exact facial features, identity and likeness from the reference, posing casually beside a classic red London telephone booth, with Big Ben visible in the background. Full-body shot, eye-level angle, natural daylight. The person leans slightly against the phone booth, one leg relaxed forward, looking upward with a confident and elegant expression, wearing a stylish casual outfit with dark sunglasses. London street architecture surrounds the scene, soft clouds in a blue sky, iconic urban atmosphere. High detail, realistic skin tones with natural pores, sharp focus on the subject, balanced composition with strong color contrast between the red phone booth and the neutral city tones, professional travel photography style, no plastic skin, no over-smoothing.`,
  },
  {
    id: '62',
    title: `Cristo Redentor, Rio`,
    category: `Viagem`,
    image: img('62'),
    prompt: `Using the uploaded reference image, create an ultra-realistic cinematic photo of the same person, preserving their exact facial features, identity and likeness from the reference, wearing dark sunglasses, standing in front of the Christ the Redeemer statue in Rio de Janeiro. Low-angle shot looking upward, highlighting the statue's outstretched arms in the background. The person leans casually against a stone railing, wearing a vibrant Hawaiian shirt and casual summer shorts, chin slightly raised toward the sun. Bright daylight under a clear blue sky. Confident and stylish pose, realistic lighting, sharp details, natural colors, professional travel photography aesthetic with strong depth and scale, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '63',
    title: `Castelo do parque temático`,
    category: `Viagem`,
    image: img('63'),
    prompt: `Using the uploaded reference image, create an ultra-realistic travel portrait of the same person, preserving their exact facial features, identity and likeness from the reference, posing alone in front of a magical fairytale theme-park castle during daytime. Full-body shot, eye-level angle, classic tourist photo framing and composition. The person stands confidently on the pathway, relaxed and joyful posture, a slight smile and natural expression, looking toward the camera, wearing a stylish casual outfit with sunglasses. Bright blue sky with scattered clouds, vivid castle colors (pink, blue and gold), well-maintained gardens and fences around the castle. Soft natural daylight illuminating the face and clothes evenly. Magical, cheerful atmosphere, vibrant colors, professional travel photography style, high realism, sharp focus, cinematic color grading, shallow depth of field keeping the castle detailed but subtly softened, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '64',
    title: `Diner neon anos 90 I`,
    category: `Automotivo`,
    image: img('64'),
    prompt: `Using the uploaded reference image, transform the same person into a nostalgic late-night 1990s disposable-film photograph, preserving their exact facial structure, hairstyle, facial proportions, eye shape, lips, nose, skin tone, body proportions and overall identity with extremely high consistency.
The person sits casually on the hood of a slightly weathered vintage American sedan in a rain-soaked parking lot outside a retro chrome diner, a glowing red-and-teal neon diner sign lit up behind them, colorful neon reflections spread across the wet asphalt, other classic cars parked nearby, palm trees and softly illuminated storefront windows in the dark background. Relaxed casual outfit: a vintage bomber jacket over a white t-shirt, faded loose denim jeans and worn sneakers, holding a fountain-drink cup, looking away naturally in a candid unposed moment.
Light the scene with a harsh direct on-camera flash that brightly illuminates the person while the surroundings stay naturally dark, with warm sodium streetlights and subtle neon glow, realistic flash falloff.
Authentic Kodak Gold 200 / Fujifilm Superia film look, warm nostalgic skin tones, soft muted contrast, gentle highlight bloom. Heavy visible 35mm film grain and strong analog noise across the whole image, dust particles, scratches, faded film borders, slight lens softness, chromatic imperfections, subtle disposable-camera distortion and a small date timestamp in the corner, gritty authentic vintage look. Shot on a 35mm disposable camera with direct flash at night, nostalgic cinematic realism.`,
  },
  {
    id: '65',
    title: `Diner neon anos 90 II`,
    category: `Automotivo`,
    image: img('65'),
    prompt: `Using the uploaded reference image, transform the same person into a nostalgic late-night 1990s disposable-film photograph, preserving their exact facial structure, hairstyle, facial proportions, eye shape, lips, nose, skin tone, body proportions and overall identity with extremely high consistency.
The person leans casually against the front of a slightly weathered vintage American car in an almost empty rain-soaked parking lot at night, a glowing neon diner or coffee-shop sign lit up behind them, warm interior windows and an "OPEN" neon sign in the background, red and orange neon reflections across the wet pavement, sodium-vapor streetlights overhead. Relaxed casual outfit: an oversized navy half-zip sweatshirt or hoodie, faded loose denim jeans and white sneakers, hands resting in the lap, looking away naturally in a candid unposed moment.
Light the scene with a harsh direct on-camera flash that brightly illuminates the person while the surroundings stay naturally dark, realistic flash falloff, subtle neon ambient color.
Authentic Kodak Gold 200 / Fujifilm Superia film look, warm nostalgic skin tones, soft muted contrast, gentle highlight bloom. Heavy visible 35mm film grain and strong analog noise across the whole image, dust particles, scratches, faded film borders, slight lens softness, chromatic imperfections, subtle disposable-camera distortion and a small date timestamp in the corner, gritty authentic vintage look. Shot on a 35mm disposable camera with direct flash at night, nostalgic cinematic realism.`,
  },
  {
    id: '66',
    title: `Retrato de estúdio`,
    category: `Estúdio`,
    image: img('66'),
    prompt: `Using the uploaded reference image, create a premium cinematic poster-style portrait of the same person, preserving their exact facial features, identity and likeness from the reference, in a clean beige studio environment. A large side-profile portrait of the person dominates the background, occupying approximately 70-75% of the frame height, facing left with a calm, confident expression. Behind the large portrait, add strong horizontal motion-blur streaks extending toward the right side, creating a dynamic sense of movement. In the foreground, place a smaller full-body version of the same person standing in front of the larger portrait, occupying approximately 30-35% of the frame height, wearing stylish beige-tan casual clothing: a relaxed overshirt/jacket, light-wash loose-fit jeans and casual sneakers, with modern transparent eyeglasses. Both hands are casually tucked into the trouser pockets. The stance is relaxed and confident, one leg crossed naturally in front of the other, leaning slightly, looking slightly toward the brand text area rather than directly at the camera. Place a large modern branding text element behind the foreground figure, partially obscured by the body, using the word "Bergamo" in bold futuristic typography. The text should feel integrated into the design, with subtle transparency and layered depth effects. Add minimal geometric UI-style design elements and soft translucent panels around the text area for a contemporary creative-director look. Soft editorial lighting, luxury fashion campaign aesthetic, high-end digital poster design, ultra-detailed facial features, sharp focus on the subject, subtle shadows beneath the standing figure, clean background, premium color grading, realistic textures, professional photography, modern creative branding artwork. No logos, no watermarks, no extra text except the branding word, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.
OBS; ALTERAR O NAME`,
  },
  {
    id: '67',
    title: `Caminhando na praia`,
    category: `Lifestyle`,
    image: img('67'),
    prompt: `Using the uploaded reference image, create a premium minimalist cinematic editorial poster featuring the same person, preserving their exact facial features, identity and likeness from the reference, solitary at the beach during golden hour, combining motion blur, monochrome cinematic frames and warm earthy tones into a luxury magazine-style composition. The design blends photography and graphic layout for a contemplative, emotional storytelling aesthetic. The background is a smooth matte warm taupe/sand-beige (#9c856f) canvas with subtle paper texture and soft gradients. A glowing golden sunset sits near the upper-right corner, casting warm atmospheric light across the composition. Dominating the left side is a large semi-transparent motion-blurred silhouette of the same person walking toward the foreground, intentionally heavily blurred with realistic horizontal motion streaks, creating the feeling of passing time and fading memories, overlapping the frames for depth and visual continuity. Floating vertically on the right side are three perfectly aligned landscape-format rectangular photographs, each with clean white borders and subtle drop shadows, resembling printed photographs suspended in space. Top frame: a cinematic black-and-white photograph, the person standing near crashing ocean waves on a rocky shoreline, captured from behind at a slight three-quarter angle, wearing a loose white linen shirt with sleeves rolled up and relaxed white trousers, strong ocean wind moving the fabric, foamy waves crashing against large rocks, a hazy coastline fading into the distance, moody monochrome tones with soft atmospheric mist. Middle frame: a wide black-and-white landscape photograph, the same person standing still among large coastal rocks, back facing the camera, looking toward the open sea, natural relaxed posture, highly detailed rock textures, soft diffused overcast light, calm cinematic composition. Bottom frame: a black-and-white cinematic photograph, the person slowly walking into shallow ocean water, small waves gently surrounding the feet, a wide open horizon, strong emotional solitude, beautiful reflections across the wet sand, minimal composition. Behind the floating photographs appears a softly blurred golden-hour beach scene, warm reflections shimmering across wet sand, small distant silhouettes of beachgoers along the shoreline, dark foreground rocks anchoring the lower-right corner, subtle atmospheric haze for cinematic depth. Graphic design style: minimalist editorial poster, luxury magazine layout, contemporary gallery design, fine-art photographic collage, floating print aesthetic, balanced negative space, modern geometric composition, soft paper texture, muted earthy color palette. Photography style: ultra-realistic cinematic photography, fine-art editorial aesthetic, golden-hour lighting, soft volumetric sunlight, natural haze, photorealistic ocean, authentic human proportions, highly detailed rocks, natural fabric movement, realistic water reflections, HDR, 85mm lens, shallow depth of field, soft atmospheric perspective, creamy tonal transitions, film-like monochrome grading in the frames, ultra-detailed, award-winning editorial photography, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '68',
    title: `Pôster de dupla exposição`,
    category: `Criativo`,
    image: img('68'),
    prompt: `Using the uploaded reference image, create a surreal double-exposure poster of the same person, preserving their exact facial features, identity and likeness from the reference, shown in side profile occupying a large part of the composition. Inside the person's silhouette, reveal an abandoned coastal city at dawn, with buildings partially covered by vegetation, wet streets, small waves washing into the avenue and a lone figure walking toward the horizon. The transition between the face and the landscape should be gradual, organic and photographically convincing. The eyes, nose, mouth, hair and facial contour must remain clearly recognizable, while the city emerges only within the shadow areas of the silhouette. Add small birds crossing the boundary between the person and the environment, as if the memory were physically escaping from the portrait. Off-white background, soft side lighting, controlled contrast, film texture, a color palette of graphite, petrol blue, beige and small golden reflections. Insert only one short, discreet line of text at the bottom reading "BergamoCreators". Avoid a hard facial cutout, a landscape simply pasted over the face, excessive elements, overly colorful surrealism, decorative typography or any alteration of the identity. Sophisticated editorial finish, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.
OBS; ALTERAR O NAME`,
  },
  {
    id: '69',
    title: `Pôster revista 5 painéis`,
    category: `Editorial & Moda`,
    image: img('69'),
    prompt: `Using the uploaded reference image, create a premium contemporary editorial collage poster featuring the same person consistently appearing in five stylish portraits, preserving their exact facial features, identity and likeness from the reference across every panel. The composition follows a clean modern magazine layout with rounded rectangular panels stacked vertically on a minimalist light-gray textured background, luxury fashion campaign aesthetic inspired by high-end editorial photography.
The central subject is a full-color cutout portrait with a thick white sticker-style outline and a subtle soft drop shadow, placed slightly overlapping all surrounding panels to create depth and a layered collage effect. The remaining four supporting panels are rendered entirely in high-contrast black-and-white, creating dramatic contrast while keeping the center image in vibrant color.
Very important: each of the five panels must show a completely different pose, angle and framing, never repeating the same photo twice, so all five feel like distinct shots from the same photoshoot.
Center portrait (main focus, in color): the person standing casually, smiling warmly toward the left side of the frame, wearing a dusty-rose / muted-mauve linen shirt with sleeves rolled neatly to the elbows and the top buttons open, a slim silver chain layered with a black beaded necklace, black glossy rectangular sunglasses, one hand casually inside the trouser pocket, relaxed posture, natural genuine smile. The cutout has a thick white sticker border, smooth rounded edges, subtle soft shadow and a realistic cut-paper appearance.
Top panel (black-and-white): wide cinematic crop, a close-up portrait of the same person leaning casually against a textured concrete wall, head slightly turned toward the camera, soft confident smile, background beautifully blurred.
Middle panel (black-and-white): medium portrait, the same person sitting thoughtfully, one hand resting on the chin, looking away into the distance, natural contemplative expression.
Lower-middle panel (black-and-white): profile portrait, the person laughing naturally, head tilted slightly backward, beautiful candid expression, strong side lighting, creamy monochrome tones.
Bottom panel (black-and-white): full-body walking portrait, the person walking confidently toward the camera, one hand inside the pocket, relaxed shoulders, luxury street-fashion look, background softly blurred.
Overall design: rounded rectangle panels with a large corner radius, equal white spacing between every panel, minimal modern layout, magazine editorial composition, luxury carousel aesthetic, premium fashion branding, clean visual hierarchy, soft shadows, perfect alignment.
Photography style: ultra-realistic editorial fashion photography, luxury campaign aesthetic, natural skin texture, perfect identity consistency across every panel, 85mm portrait lens, f/1.8 aperture, HDR, soft diffused daylight, shallow depth of field, creamy bokeh, realistic fabric folds, highly detailed, sharp sunglasses reflections, photorealistic skin pores, premium cinematic color grading, ultra-detailed, award-winning editorial photography, no plastic skin, no over-smoothing.
Negative prompt: low quality, blurry face, inconsistent identity, duplicate identical photos, repeated same pose, duplicate person, bad anatomy, extra fingers, distorted sunglasses, over-sharpening, noisy background, watermark, logo, text, poor cutout edges, jagged outline, low resolution, cartoon style, AI artifacts, oversaturated colors, incorrect proportions.`,
  },
  {
    id: '70',
    title: `Streetwear oversized`,
    category: `Urbano`,
    image: img('70'),
    prompt: `Using the uploaded reference image, use the same person with exact facial identity, preserving their face shape, eyes, nose, lips, skin tone and all unique facial features with 100% identity accuracy. The person stands in a cool, confident, natural photo pose facing the camera, relaxed and composed, wearing an oversized trendy t-shirt, relaxed-fit cargo pants and fashionable sneakers, one hand relaxed at the side, a calm confident expression looking straight at the camera. The person's own pose is normal, stylish and photogenic.
Behind them, drawn directly on the plain concrete wall, a playful hand-drawn doodle sketch of the same person mimics them but in an exaggerated funny pose, pulling a silly face, goofy grin and comical body language, sketched in a loose black scribble style, creating a humorous contrast between the calm realistic person and the goofy doodle version. Only the doodle is silly; the real person stays composed and cool.
Cinematic lighting, ultra-realistic photography, high contrast, detailed skin texture, realistic fabric folds, clean minimal composition, shallow depth of field, premium editorial fashion style, 85mm lens, natural color grading, 8K ultra-HD quality.
STRICT IDENTITY LOCK: do not alter or beautify the face; preserve the exact facial identity from the reference image, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '71',
    title: `Cavalo preto em P&B I`,
    category: `Editorial & Moda`,
    image: img('71'),
    prompt: `Using the uploaded reference image, create an ultra-detailed cinematic black-and-white fine-art editorial portrait of the same person, preserving their exact facial features, identity and likeness from the reference. The person stands calmly in an open grassy field beside a majestic black horse, gently stroking the horse's neck or muzzle with one hand in a tender, connected moment, a calm introspective expression, quiet dominance and inner gravity. Wearing minimalist utilitarian fashion: an oversized dark padded jacket over a dark hoodie, relaxed-fit dark trousers and black leather boots. The black horse stands beside them, head lowered slightly, symbolizing strength, instinct and controlled power. Environment: open grassy field with soft rolling hills and a distant hazy landscape, no urban elements, quiet isolated contemplative atmosphere. Natural diffused daylight under an overcast sky, soft shadows, low contrast, even tonal range. Eye-level to slightly low camera angle, 50mm cinematic portrait lens, moderate depth of field with the person and horse in focus and the background gently blurred. Black-and-white color palette with deep blacks, soft grays and muted highlights, stoic restrained powerful mood, fine-art editorial aesthetic, photorealistic, high-quality monochrome grading, subtle film grain, soft contrast, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '72',
    title: `Cavalo preto em P&B II`,
    category: `Editorial & Moda`,
    image: img('72'),
    prompt: `Using the uploaded reference image, create an ultra-detailed cinematic black-and-white fine-art editorial portrait of the same person, preserving their exact facial features, identity and likeness from the reference. Close intimate composition: the person rests their face gently against the black horse's head, cheek to cheek, eyes softly closed or looking down, a tender and peaceful connected moment between human and animal, quiet emotion and inner gravity. Wearing minimalist utilitarian fashion: a dark padded jacket over a dark hoodie. The majestic black horse presses its head calmly toward the person, symbolizing strength, instinct and a deep bond. Environment: open grassy field with soft rolling hills and a distant hazy landscape, no urban elements, quiet contemplative atmosphere. Natural diffused daylight under an overcast sky, soft shadows, low contrast, even tonal range. Eye-level camera, 85mm cinematic portrait lens, shallow depth of field focusing on the two faces together, background softly blurred. Black-and-white color palette with deep blacks, soft grays and muted highlights, stoic emotional powerful mood, fine-art editorial aesthetic, photorealistic, high-quality monochrome grading, subtle film grain, soft contrast, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '73',
    title: `Vidro estilhaçado`,
    category: `Criativo`,
    image: img('73'),
    prompt: `Using the uploaded reference image, create a hyper-detailed cinematic poster of the same person, preserving their exact facial features, identity and likeness from the reference, maintaining 100% consistency. The scene is shown through shattered glass fragments with realistic details of flying glass shards. Place only 6 large fragments; the rest should be small and in shattered detail.
The central face is serious and intense, looking straight ahead, while multiple distorted expressions of the same person appear in the broken glass pieces around them — some smiling, some snarling, some screaming.
Show only the upper chest and up, including the shirt and face. No cracks on the central face itself, just realistic pores on the skin. Do not place any glass fragment in front of the central face — only around the edges.
Emphasize ultra-realistic skin texture, pores, subtle wrinkles and high-contrast lighting. Add sharp reflections, cracked-glass refractions with subtle rainbow prism edges, and crisp clean edges on every shard.
Dark, dramatic background reminiscent of a professional photography studio. Clean image without distortions, errors or anomalies, hyper-realistic skin with natural pores, no plastic skin, no over-smoothing.`,
  },
  {
    id: '74',
    title: `Cartoon anos 80`,
    category: `Criativo`,
    image: img('74'),
    prompt: `A 2D Saturday-morning cartoon portrait of the same person, preserving their recognizable facial identity and likeness from the reference but rendered in the style of 1980s television animation. Shown from the shoulders up, bold heroic facial proportions, sharp jawline, dramatic cel shading, thick black outlines, vibrant saturated colors, dynamic facial expression, highly stylized cartoon rendering, centered composition, solid gray background, flat minimalist backdrop with no additional elements.`,
  },
  {
    id: '75',
    title: `Caricatura exagerada`,
    category: `Criativo`,
    image: img('75'),
    prompt: `A 2D animated cartoon caricature of the same person, preserving their recognizable facial identity and likeness from the reference but pushed into a wild, exaggerated comedy cartoon style like classic 1990s Nickelodeon and Ren &amp; Stimpy animation. Shown from the shoulders up, extreme comedic rubber-hose distortion, huge bulging googly eyes bugging way out, an enormous wide-open screaming grin with oversized teeth and a floppy tongue, stretched and squashed zany proportions, sweat droplets flying off, exaggerated wrinkles and manic energy, hilarious over-the-top facial expression. Bold thick wobbly black outlines, super-saturated flat cartoon colors, gross-out comedy cartoon aesthetic, bouncy lively rendering, centered portrait, solid bright yellow background, clean single-color backdrop.`,
  },
  {
    id: '76',
    title: `Gravura vintage de terno`,
    category: `Criativo`,
    image: img('76'),
    prompt: `Using the uploaded reference image as the main identity of the character, preserve the facial likeness 100% without changing the face shape, bone structure, skin tone, eyes, eyebrows, nose, lips, ears, jawline, skin texture, beard (if any) or hairstyle. Prioritise facial likeness over artistic interpretation. Create a premium editorial illustration poster in a black-and-white ink-engraving style. The character wears a formal black suit, white shirt and black tie, with a serious, cold, commanding expression and a sharp gaze toward the camera. Position the face on the right half only, filling about 60-70% of the frame, while the left side is left as white negative space for a minimalist, elegant feel. The entire illustration is built using engraving, cross-hatching and fine line-etching technique, with thousands of thin lines following the contours of the face to form volume, shadow, skin texture, hair, beard and clothing. Avoid a smooth digital-painting look; all detail is built from black ink lines like a classic printmaking illustration. The background is smooth textured white paper with ink-splatter effects, black paint flecks, abstract brush strokes and randomly scattered ink grain that still feels elegant. High contrast between the black ink and the white background creates a dramatic mood. On the left side of the poster, add large typography in a condensed sans-serif font, capital letters, in black, reading \\"BERGAMO\\". Arrange the text horizontally with wide letter spacing so it looks like a premium film poster. Add a few small lines of fictional movie-credit text in the lower-left as a decorative editorial element, without distracting from the main focus on the face. The overall composition should feel like a premium thriller film poster, magazine editorial and fine-art print, balancing detailed illustration with empty space. Visual style: black-and-white ink engraving, cross-hatching illustration, fine line etching, vintage printmaking, high contrast, editorial movie poster, minimalist composition, ink-splatter texture, premium typography, luxury poster design, hyper-detailed line art, ultra-sharp, museum quality, 8K Ultra HD.
OBS; ALTERAR O NAME`,
  },
  {
    id: '77',
    title: `Sentado na sacada`,
    category: `Lifestyle`,
    image: img('77'),
    prompt: `An illustration of the same person, preserving their recognizable facial identity and likeness from the reference, in a clean, modern, flat-color digital art style. The scene depicts the person relaxed, sitting on a low balcony wall, looking out at the sky, with large background text reading "BERGAMO". They wear a loose-fitting t-shirt, black loose trousers and modern white sneakers. Beside them are two terracotta pots filled with vibrant orange flowers. The background shows a calm blue sky with soft, stylized white clouds. The lighting is warm and golden, casting distinct, crisp shadows. The overall aesthetic is minimalist, trendy and peaceful, with a balanced color palette of black, teal and bright orange.
OBS; ALTERAR O NAME`,
  },
  {
    id: '78',
    title: `Ilustração em papel recortado`,
    category: `Criativo`,
    image: img('78'),
    prompt: `Using the uploaded reference image, convert the same person into a soft, handcrafted paper-cut layered illustration style, preserving their recognizable identity and likeness, inspired by papercraft diorama aesthetics. Use smooth rounded shapes, simplified cute character proportions and minimal facial details (dot eyes, blush cheeks) to create a warm, charming look. Apply stacked paper layers with visible depth, subtle shadows between layers and clean cut edges that resemble laser-cut cardstock. Add a distinct white outer outline layer surrounding the character, resembling a thick sticker border or white cut-paper backing, clearly separating the character from the background; this white layer should feel like an intentional paper layer, not a glow. Use a darker pastel color palette with deep muted blues, navy, dark greens and rich warm neutrals, balanced and calming. Lighting should feel soft, diffused and even, enhancing the dimensional paper layers without harsh contrast. Textures should appear matte and tactile, like thick art paper or craft foam. Overall mood: cozy, wholesome, gentle and storybook-like, with a playful yet polished handcrafted feel suitable for modern illustration, children's books or decorative art.`,
  },
  {
    id: '79',
    title: `Personagem 3D animado I`,
    category: `Criativo`,
    image: img('79'),
    prompt: `Using the uploaded reference image, create a stylized 3D animated character portrait of the same person, preserving their recognizable facial identity and likeness from the reference, rendered from the shoulders up with highly exaggerated, disproportionate caricature proportions: a large compact head, a short neck, oversized rounded ears, a small rounded nose, thick sculpted eyebrows, oversized expressive eyes with tiny off-centered pupils, a broad geometric jawline and simplified facial features. The facial expression conveys a happy, friendly smile, with warm smiling eyes, subtly raised eyebrows and a slightly open smiling mouth showing teeth. Keep the person's own skin tone, hair and beard from the reference, adapted into the 3D style. Smooth handcrafted clay-like surfaces blend with premium matte silicone and ultra-soft velvet textures, enriched with subtle skin microtexture and finely sculpted short hair details. Soft warm gradients, glossy expressive eyes and refined matte finishes create strong visual contrast. Soft cinematic studio lighting with a broad diffused key light, gentle fill light, delicate rim lighting and smooth ambient shadows enhances the sculpted forms, tactile textures and exaggerated proportions. Centered composition, portrait cropped from the shoulders up, clean solid light-gray background, shallow depth of field, ultra-detailed premium stylized animated-film aesthetic with handcrafted sculptural quality and bold caricatured proportions.`,
  },
  {
    id: '80',
    title: `Personagem 3D cartoon`,
    category: `Criativo`,
    image: img('80'),
    prompt: `Using the uploaded reference image, create a stylized 3D cartoon character portrait of the same person, preserving their recognizable facial identity and likeness from the reference, rendered from the shoulders up with exaggerated, disproportionate facial proportions: a very long rounded nose, oversized circular eyes, small rounded ears, thick expressive eyebrows and an elongated head shape. The facial expression conveys worry, sadness and uncertainty, with raised inner eyebrows, wide eyes and a subtle downward-curved mouth. Soft fuzzy felt and velvet-like textures cover the entire character, with delicate fiber details and a handcrafted appearance. Keep the person's own skin tone, hair and beard from the reference, adapted into soft matte surfaces with subtle rosy shading for visual depth. Soft cinematic diffused lighting with gentle ambient shadows enhances the tactile materials. Centered composition, clean solid blue background, shallow depth of field, highly detailed animated-film style inspired by premium 3D family animation, charming handcrafted aesthetic, ultra-high quality.`,
  },
  {
    id: '81',
    title: `Personagem 3D animado II`,
    category: `Criativo`,
    image: img('81'),
    prompt: `Using the uploaded reference image, create a stylized 3D animated character portrait of the same person, preserving their recognizable facial identity and likeness from the reference, rendered from the shoulders up with highly exaggerated, disproportionate facial proportions: a large rounded head, oversized perfectly circular eyes, a tiny rounded nose, large rounded ears, a small open mouth forming a perfect "O" shape, and voluminous yarn-like hair sculpted into thick textured knitted strands gathered into symmetrical rounded tufts. The facial expression conveys surprise, amazement and innocent curiosity, with wide-open eyes, centered pupils, a perfectly rounded open mouth and relaxed expressive features. Crafted with handcrafted felt, knitted wool, crochet yarn, soft fabric and premium velvet-like textures, featuring visible fibers, fuzzy surfaces, delicate textile details, organic imperfections and rich tactile depth, like a handmade amigurumi doll. Keep the person's own skin tone, hair and beard from the reference, adapted into the knitted textile style with smooth gradients and refined matte finishes. Soft cinematic studio lighting with broad diffused illumination, gentle ambient shadows, subtle rim lighting and delicate highlights enhances the sculpted forms and highly detailed textile textures. Centered composition, portrait cropped from the shoulders up, clean solid mustard-yellow background, shallow depth of field, ultra-detailed premium handcrafted 3D animated-film aesthetic with whimsical exaggerated proportions and charming textile-inspired sculptural design.`,
  },
  {
    id: '82',
    title: `Mundo em blocos I`,
    category: `Games`,
    image: img('82'),
    prompt: `Using the uploaded reference image, keep the same person completely photorealistic and unchanged — preserving their exact face, hair, body, clothing and identity as a real human — while transforming the entire environment around them into an ultra-detailed Minecraft-inspired world. The person walks like a realistic explorer, stepping across mossy stone blocks over a clear blocky river, mid-stride and looking down at their footing, fully realistic. Everything around them is Minecraft: blocky water, moss-covered cube stones, pixelated cliffs and hills covered in blocky grass and trees, morning mist and fog, with blocky Minecraft animals (a chicken and a pig) on the banks. The person stays real and photographic while the whole world is made of realistic ray-traced Minecraft blocks. Moody cinematic adventure atmosphere, volumetric fog, ray tracing, realistic water reflections, atmospheric depth, Unreal Engine 5 quality rendering, highly detailed block textures, wide-angle lens, hyper-realistic skin with natural pores on the person, no plastic skin, no over-smoothing.`,
  },
  {
    id: '83',
    title: `Vale das montanhas em blocos`,
    category: `Games`,
    image: img('83'),
    prompt: `Using the uploaded reference image only as the identity source for the face, keep the person completely photorealistic and unchanged — preserving their exact face, hair and skin as a real human — and place them into a newly created scene. Generate the person as a realistic explorer walking casually along a stone path through a mountain valley village, resting one hand on a wooden fence, body turned slightly, looking off to the side with a calm expression, wearing a light beige hooded windbreaker jacket, dark relaxed trousers, white sneakers and a backpack, fully realistic and photographic.
Transform the entire surrounding environment into an ultra-detailed Minecraft-inspired world: blocky green terraced hills, pixelated cube trees, a blocky wooden fence along the path, cube-shaped white clouds in a blue sky, towering blocky cliffs with a blocky waterfall, a blocky alpine village with cube houses and a little church, a blocky river winding through the valley, and snow-capped pixelated mountains in the distance. The person stays real and photographic while the whole world is made of realistic ray-traced Minecraft blocks.
Epic cinematic composition, golden natural daylight, volumetric lighting, ray tracing, realistic shadows, atmospheric depth, Unreal Engine 5 quality rendering, highly detailed block textures, adventure travel photography, wide-angle lens, hyper-realistic skin with natural pores on the person, no plastic skin, no over-smoothing.`,
  },
  {
    id: '84',
    title: `Margem do lago em blocos`,
    category: `Games`,
    image: img('84'),
    prompt: `Using the uploaded reference image only as the identity source for the face, keep the person completely photorealistic and unchanged — preserving their exact face, hair and skin as a real human — and place them naturally into a newly created scene, fully integrated and grounded in the environment. Generate the person as a realistic traveler standing on a rocky lakeshore made of Minecraft blocks, their feet firmly planted on the blocky ground casting a realistic contact shadow, seen mostly from behind at a three-quarter angle, gazing out across a calm turquoise mountain lake, one hand adjusting a backpack strap, calm and contemplative, wearing a cozy cream sweatshirt, relaxed light-colored trousers, sneakers, a cap and a small crossbody backpack.
The person must feel truly present inside the world: the ambient daylight and the blue-green color of the lake reflect softly onto them, environmental light wraps around their body, their shadow falls naturally across the blocky ground, and the scale between the person and the blocks is believable, as if they are really standing there — not pasted on top.
Transform the entire surrounding environment into an ultra-detailed Minecraft-inspired world: a crystal-clear blocky turquoise lake with pixelated water reflections, blocky pine forests along the shore, massive blocky stone mountains and cliffs rising in the background, cube-shaped white clouds in a bright blue sky, and blocky rocks and grass along the shoreline framing the person in the foreground.
Epic cinematic composition, bright natural daylight, volumetric lighting, ray tracing, realistic water reflections, matching light direction on the person and the scene, atmospheric depth, Unreal Engine 5 quality rendering, highly detailed block textures, adventure travel photography, wide-angle lens, hyper-realistic skin with natural pores on the person, no plastic skin, no over-smoothing.`,
  },
  {
    id: '85',
    title: `Vitória épica no game`,
    category: `Games`,
    image: img('85'),
    prompt: `Using the uploaded reference image as the highest-priority facial reference, preserve the person's facial identity exactly — the viewer must instantly recognize them. Preserve their exact hairstyle, facial proportions, beard shadow, eyebrows, eye shape, nose, lips, jawline, skin texture, facial asymmetry and all unique facial characteristics. The person must remain completely photorealistic while naturally integrated into the Fortnite universe.
Create an epic Victory Royale celebration scene showing the person celebrating alongside their Fortnite squad after winning the match. The person occupies the center of the composition and is the undeniable focal point, standing slightly ahead of the group in a confident and victorious pose. The camera uses a wide-angle cinematic perspective that captures both the celebration and the surrounding Fortnite environment while keeping the person dominant in the frame.
Several iconic Fortnite characters are positioned around them performing popular victory emotes and dances, creating a fun, energetic and triumphant atmosphere without stealing focus from the person. Massive colorful fireworks explode across the sky above the group, filling the scene with vibrant bursts of light, glowing particles, sparks and celebratory effects. The entire environment is illuminated by dynamic colorful lighting generated by the fireworks, creating beautiful reflections and highlights on the characters and surroundings.
The Fortnite island stretches behind the squad with visible mountains, forests, rivers, cities and iconic landmarks bathed in warm evening light. Floating confetti, glowing effects, victory particles and subtle environmental details enhance the festive atmosphere. The composition should feel like the final victorious moment of an official Fortnite season trailer, capturing excitement, friendship, achievement and celebration.
Dynamic poses, realistic depth, cinematic lighting, atmospheric perspective, volumetric effects and vibrant Fortnite colors. Official Fortnite Chapter promotional artwork style, loading-screen quality, Unreal Engine 5 rendering, AAA game poster quality, professional key-art illustration, masterpiece composition, ultra-detailed textures, 8K resolution, legendary Victory Royale celebration, epic squad energy, maximum visual impact, hyper-realistic skin with natural pores on the person, no plastic skin, no over-smoothing.`,
  },
  {
    id: '86',
    title: `Cidade neon ao pôr do sol`,
    category: `Games`,
    image: img('86'),
    prompt: `Using the uploaded reference image, create a highly detailed 8K portrait poster of the same person, preserving their exact facial features, identity and likeness from the reference, in the visual style of modern open-world action video-game promotional artwork: a cinematic tropical-city atmosphere at sunset with a vibrant pink-and-purple neon sky, palm trees, a "VICE CITY" beachfront skyline, glowing neon signs reading "OCEAN DRIVE" and "HOTEL", a distant helicopter, and a glossy classic convertible car. The person sits confidently on the hood of the car, one arm resting on a knee, a calm charismatic confident expression, wearing trendy modern luxury streetwear — an oversized black t-shirt, chains, dark trousers and sneakers — stylish and photogenic with strong body language. Stylized illustrative textures, dramatic shadows, glossy highlights, glowing neon reflections on the wet street, palm-tree silhouettes and layered graphic effects.
Include the large cinematic title text "Grand Theft Auto VI" on the left side in the bold stylized neon typography of the official game poster, with the "VI" in a pink-and-blue gradient.
Cinematic neon lighting, realistic skin texture with natural pores, detailed fabric rendering, atmospheric reflections, depth-rich composition, balanced contrast, ultra-sharp clarity, stylized illustrative video-game poster rendering, vibrant modern color palette, premium poster layout, 8K, no plastic skin, no over-smoothing.`,
  },
  {
    id: '87',
    title: `Jet ski na cidade neon`,
    category: `Games`,
    image: img('87'),
    prompt: `Using the uploaded reference image, create a highly detailed 8K action poster of the same person, preserving their exact facial features, identity and likeness from the reference, in the visual style of modern open-world action video-game promotional artwork: a cinematic tropical-city atmosphere at sunset with a vibrant pink-and-purple neon sky, palm trees and a glowing "VICE CITY" beachfront skyline with neon signs. The person rides a jet ski at high speed across turquoise ocean water, water spraying dramatically around them, leaning into the motion with a confident charismatic grin and dynamic action body language, wearing trendy modern luxury streetwear — an open shirt or oversized tee, chains and sunglasses — stylish and photogenic. Luxury yachts, palm-tree silhouettes, distant city towers, a helicopter in the sky, glossy highlights, glowing neon reflections shimmering on the water and layered graphic effects.
Include the large cinematic title text "Grand Theft Auto VI" on one side in the bold stylized neon typography of the official game poster, with the "VI" in a pink-and-blue gradient.
Cinematic neon sunset lighting, realistic skin texture with natural pores, detailed rendering, atmospheric water reflections, motion energy, balanced contrast, ultra-sharp clarity, stylized illustrative video-game poster rendering, vibrant modern color palette, premium poster layout, 8K, no plastic skin, no over-smoothing.`,
  },
  {
    id: '88',
    title: `Cidade pós-apocalíptica`,
    category: `Criativo`,
    image: img('88'),
    prompt: `Using the uploaded reference image, create a raw, realistic documentary-style photograph of the same person, preserving their exact facial features, identity and likeness from the reference, as a real survivor standing in a deserted post-apocalyptic city street reclaimed by nature. Abandoned rusted cars, cracked asphalt with dead weeds and dry vines, crumbling grey buildings with broken windows, a heavy overcast colorless sky. The person wears worn dull survivor clothing in faded grey and muted earth tones, a canvas backpack and worn boots, aged and used but not filthy. Natural tired, hardened expression, candid and unposed. Shot on an old handheld camera in flat dull natural light, extremely low saturation almost desaturated to near black-and-white with only faint traces of color, cold grey lifeless color palette, bleak washed-out ashen tones, heavy visible photographic noise and coarse grain, imperfect amateur framing, dull hazy polluted air. Grim, bleak, dead post-apocalyptic atmosphere, looks like a real photo taken by a survivor, not a movie still, hyper-realistic skin with natural pores, pale and grimy, no plastic skin, no over-smoothing, no vivid colors, no cinematic glow.`,
  },
  {
    id: '89',
    title: `Retrato do cão Boxer`,
    category: `Pets`,
    image: img('89'),
    prompt: `Using the uploaded reference image of the dog, create a premium professional studio portrait of the same brown Boxer dog with black cheeks, preserving its exact appearance, markings and identity from the reference. Elegant pet-photography headshot, the Boxer sitting proudly and looking slightly off-camera with a calm, noble, attentive expression, ears relaxed. Clean dark charcoal gradient studio backdrop, soft professional key light from one side with gentle rim light sculpting the head and shoulders, luminous catchlights in the eyes. Hyper-realistic fur texture with visible individual hairs and natural sheen, detailed wet nose, expressive eyes, subtle drool-free muzzle detail, shallow depth of field, 85mm lens, rich cinematic color grading, award-winning pet editorial photography, ultra-detailed, no plastic look, no over-smoothing.`,
  },
  {
    id: '90',
    title: `Retrato com o cão`,
    category: `Pets`,
    image: img('90'),
    prompt: `Using the two uploaded reference images (the person and their dog), create a premium professional studio portrait of the same person together with their brown Boxer dog with black cheeks, preserving the exact facial identity and likeness of both from the references. The person crouches or sits close beside the Boxer, one arm gently around the dog, both facing the camera with warm, calm, confident expressions, a genuine bond between them. Clean dark charcoal gradient studio backdrop, soft professional key light with gentle rim light sculpting both subjects, luminous catchlights in the eyes of both. Hyper-realistic skin with natural pores on the person and detailed fur texture with individual hairs and natural sheen on the dog, expressive realistic eyes, shallow depth of field, 85mm lens, rich cinematic color grading, high-end editorial pet-and-owner photography, ultra-detailed, no plastic skin, no over-smoothing.`,
  },
];

export const BERGAMO_CATEGORIES: string[] = Array.from(new Set(BERGAMO_PROMPTS.map((p) => p.category))).sort((a, b) => a.localeCompare(b, 'pt-BR'));
