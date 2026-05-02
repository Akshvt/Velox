import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Initialises Lenis smooth scroll and syncs it with GSAP's ticker so
 * ScrollTrigger animations stay perfectly in step. Mount once at the
 * application root.
 */
export function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Expose for debugging in dev.
    if (import.meta.env.DEV) {
      window.__lenis = lenis;
    }

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
}
