// Returns the deterministic coach text immediately, then upgrades to an on-device LLM
// rephrase if one is registered. The numbers are always correct: the engine produced the
// base text and the rephraser may not change figures. Degrades silently when no model.

import { useEffect, useState } from 'react';
import { getLlmRephraser } from '@/features/coach/runtime';
import { errorReporter } from '@/lib/errorReporter';

export function useCoachMessage(deterministic: string): { text: string; enhancing: boolean } {
  const [text, setText] = useState(deterministic);
  const [enhancing, setEnhancing] = useState(false);

  useEffect(() => {
    setText(deterministic);
    const rephraser = getLlmRephraser();
    if (!rephraser) return;

    let active = true;
    setEnhancing(true);
    rephraser
      .rephrase(deterministic)
      .then((out) => {
        if (active && out && out.trim().length > 0) setText(out);
      })
      .catch((error) => errorReporter.captureError(error, { scope: 'coach.rephrase' }))
      .finally(() => {
        if (active) setEnhancing(false);
      });

    return () => {
      active = false;
    };
  }, [deterministic]);

  return { text, enhancing };
}
