// The single locked brand accent for Solvent: a deep, desaturated spruce green.
//
// Why not the obvious fintech moves. Navy-and-gold is the category reflex; the
// tier-two counter-reflex is an all-black "terminal" look; bright emerald reads as
// generic "money green". Spruce is calm growth toward freedom, distinct from all three.
// It is the ONLY accent in the app and it doubles as the positive / progress colour.
//
// 12-step scale in the Radix model (step 9 = solid accent, 11/12 = accent text),
// matching the shape of @mindees/tokens scales so it drops into the semantic layer.

import type { ColorScale } from '@mindees/tokens';

export const spruceLight: ColorScale = [
  '#f6faf8',
  '#ecf4f0',
  '#dbeae4',
  '#c9ded5',
  '#b4d1c5',
  '#9cc1b2',
  '#7cad9b',
  '#52917d',
  '#2f5d50', // brand solid
  '#284f44', // hover / pressed
  '#21433a', // accent text on light
  '#12241e',
] as const;

export const spruceDark: ColorScale = [
  '#0c1411',
  '#0f1b16',
  '#12251e',
  '#142d24',
  '#173529',
  '#1c4133',
  '#23503f',
  '#2e6650',
  '#3f8c75', // brand solid (lighter for dark substrate)
  '#48987f', // hover / pressed
  '#73b6a2', // accent text on dark
  '#c7e8dd',
] as const;

/** Near-white sits on the spruce solid in both themes (verified >= 3:1 for UI/large text).
 * Off-white, not pure white, per the anti-slop law. */
export const onSpruce = '#FCFCFC';
