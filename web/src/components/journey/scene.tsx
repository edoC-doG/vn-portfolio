'use client';

import { useEffect } from 'react';

/**
 * Starts the 3D engine once the page's elements are in the DOM. The engine (src/scene/journey.js, generated from
 * prototype/fly/app.js) runs when its module is first evaluated, so it starts once per page load; links in and out of
 * the journey are plain <a> elements, which reload the page, so it never has to be torn down.
 */
export function JourneyScene() {
  useEffect(() => {
    import('@/scene/journey').catch((e) => {
      console.error(e);
      document.documentElement.classList.add('nogl');
    });
  }, []);
  return null;
}
