/**
 * Re-export the official @gsap/react hook from a single location so app
 * code imports `useGSAP` from "@hooks/useGSAP". This makes it trivial to
 * swap the implementation later or add cross-cutting defaults.
 */
export { useGSAP } from "@gsap/react";
