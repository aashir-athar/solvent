# Solvent — Icon & Illustration Prompts (Nano Banana Pro)

Generate each asset with Nano Banana Pro (Gemini 3 Pro Image), then key out the flat
`#00FF00` background to a transparent PNG. Every prompt uses the same 3D Pixar style
anchor and the chroma-green background rule so extraction is clean. The subject never
contains `#00FF00`; brand greens are deep spruce / teal so they survive the key.

Brand palette: deep spruce green `#2F5D50`, warm off-white `#FAFAF8`, charcoal ink `#1A1C1B`.

Style anchor (in every prompt): "3D animated cartoon style, semi-realistic Pixar-inspired
look, realistic textures with cartoon proportions, cinematic lighting, warm color grading,
expressive characters, high-quality 3D render."

---

## App icon

```json
{
  "user_intent": "Solvent app icon: a calm calendar day that means freedom from debt.",
  "subject": "A single rounded 3D calendar tile in deep spruce green, one date circled with a soft spruce ring, a small confident check mark cut into the circled day; clean, friendly, premium; no text other than the implied date grid",
  "style": "3D animated cartoon style, semi-realistic Pixar-inspired look, realistic textures with cartoon proportions, cinematic lighting, warm color grading, expressive characters, high-quality 3D render",
  "palette": "deep spruce green #2F5D50, warm off-white #FAFAF8, charcoal ink #1A1C1B; absolutely no #00FF00 green anywhere in the subject",
  "composition": "single centered object, app-icon framing, generous even margin, slight top-down hero angle",
  "lighting": "soft warm key light upper-left, gentle fill, contained on the subject",
  "background": "solid flat chroma green #00FF00 background, completely flat, no gradient, no shadow, no texture, no glow, no bloom, no particles, no atmospheric haze, no rim light spillover",
  "aspect_ratio": "1:1",
  "negative_prompt": ["#00FF00 on the subject", "green spill", "glow", "bloom", "drop shadow on background", "text", "watermark", "extra objects", "AI plastic look"]
}
```

## Onboarding privacy (phone keyhole)

```json
{
  "user_intent": "Privacy promise: your money stays on your phone.",
  "subject": "A friendly 3D smartphone standing upright with a soft keyhole shape glowing gently inside the screen in warm off-white, a small spruce shield resting against its base; reassuring and calm",
  "style": "3D animated cartoon style, semi-realistic Pixar-inspired look, realistic textures with cartoon proportions, cinematic lighting, warm color grading, expressive characters, high-quality 3D render",
  "palette": "deep spruce green #2F5D50, warm off-white #FAFAF8, charcoal ink #1A1C1B; no #00FF00 in the subject",
  "composition": "single centered object, generous margin",
  "lighting": "soft warm key, gentle fill, contained on the subject",
  "background": "solid flat chroma green #00FF00 background, completely flat, no gradient, no shadow, no texture, no glow, no bloom, no particles, no atmospheric haze, no rim light spillover",
  "aspect_ratio": "1:1",
  "negative_prompt": ["#00FF00 on the subject", "green spill", "glow", "bloom", "drop shadow on background", "text", "watermark", "AI plastic look"]
}
```

## Empty state: no debts yet

```json
{
  "user_intent": "Empty debts list: nothing owed yet, a fresh start.",
  "subject": "A clean 3D credit card lying flat with a soft spruce plus-circle floating just above it, light and inviting; conveys add your first debt",
  "style": "3D animated cartoon style, semi-realistic Pixar-inspired look, realistic textures with cartoon proportions, cinematic lighting, warm color grading, expressive characters, high-quality 3D render",
  "palette": "deep spruce green #2F5D50, warm off-white #FAFAF8, charcoal ink #1A1C1B; no #00FF00 in the subject",
  "composition": "single centered grouping, generous margin",
  "lighting": "soft warm key, gentle fill",
  "background": "solid flat chroma green #00FF00 background, completely flat, no gradient, no shadow, no texture, no glow, no bloom, no particles, no atmospheric haze, no rim light spillover",
  "aspect_ratio": "1:1",
  "negative_prompt": ["#00FF00 on the subject", "green spill", "glow", "bloom", "drop shadow on background", "text", "watermark", "AI plastic look"]
}
```

## Milestone: paid off

```json
{
  "user_intent": "Celebration: the debt-free date is reached.",
  "subject": "A small 3D spruce-green flag planted on a soft rounded hill tile, a single calm check mark beside it; quietly triumphant, never loud",
  "style": "3D animated cartoon style, semi-realistic Pixar-inspired look, realistic textures with cartoon proportions, cinematic lighting, warm color grading, expressive characters, high-quality 3D render",
  "palette": "deep spruce green #2F5D50, warm off-white #FAFAF8, charcoal ink #1A1C1B; no #00FF00 in the subject",
  "composition": "single centered object, generous margin",
  "lighting": "soft warm key, gentle fill",
  "background": "solid flat chroma green #00FF00 background, completely flat, no gradient, no shadow, no texture, no glow, no bloom, no particles, no atmospheric haze, no rim light spillover",
  "aspect_ratio": "1:1",
  "negative_prompt": ["#00FF00 on the subject", "green spill", "glow", "bloom", "confetti particles", "drop shadow on background", "text", "watermark", "AI plastic look"]
}
```

## Insights (Pro)

```json
{
  "user_intent": "Insights: see where your interest goes.",
  "subject": "Three friendly 3D bar-chart bars of different heights in spruce green and off-white, with a small downward arrow tucked beside the tallest bar; clean and analytical but warm",
  "style": "3D animated cartoon style, semi-realistic Pixar-inspired look, realistic textures with cartoon proportions, cinematic lighting, warm color grading, expressive characters, high-quality 3D render",
  "palette": "deep spruce green #2F5D50, warm off-white #FAFAF8, charcoal ink #1A1C1B; no #00FF00 in the subject",
  "composition": "single centered grouping, generous margin",
  "lighting": "soft warm key, gentle fill",
  "background": "solid flat chroma green #00FF00 background, completely flat, no gradient, no shadow, no texture, no glow, no bloom, no particles, no atmospheric haze, no rim light spillover",
  "aspect_ratio": "1:1",
  "negative_prompt": ["#00FF00 on the subject", "green spill", "glow", "bloom", "drop shadow on background", "text", "watermark", "AI plastic look"]
}
```

## Scan a statement

```json
{
  "user_intent": "Add from a statement: read it on-device.",
  "subject": "A soft 3D paper receipt with a gentle spruce scan line crossing it, a tiny check mark where a balance is detected; tidy and trustworthy",
  "style": "3D animated cartoon style, semi-realistic Pixar-inspired look, realistic textures with cartoon proportions, cinematic lighting, warm color grading, expressive characters, high-quality 3D render",
  "palette": "deep spruce green #2F5D50, warm off-white #FAFAF8, charcoal ink #1A1C1B; no #00FF00 in the subject",
  "composition": "single centered object, generous margin",
  "lighting": "soft warm key, gentle fill",
  "background": "solid flat chroma green #00FF00 background, completely flat, no gradient, no shadow, no texture, no glow, no bloom, no particles, no atmospheric haze, no rim light spillover",
  "aspect_ratio": "1:1",
  "negative_prompt": ["#00FF00 on the subject", "green spill", "glow", "bloom", "drop shadow on background", "text", "watermark", "AI plastic look"]
}
```

---

### After generating

1. Key out the `#00FF00` background to transparency (Photoshop "Select Color Range", or any
   one-click background remover) and export PNG at the sizes below.
2. App icon: replace `assets/images/icon.png` and the `assets/expo.icon/` set; set the
   Android adaptive-icon and splash background to spruce `#2F5D50` (see `zero-to-deploy.md`,
   the `app.json` step).
3. Illustrations: drop into `assets/images/` and render through `expo-image`.
