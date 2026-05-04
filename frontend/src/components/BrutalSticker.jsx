import { cn } from "@lib/cn";

/** Sticker / chip label - small rotated tag. */
export default function BrutalSticker({ tone = "mustard", className, children }) {
  const tones = {
    mustard: "bg-mustard",
    mint: "bg-mint",
    sky: "bg-sky",
    pink: "bg-pink",
    lilac: "bg-lilac",
    cream: "bg-cream",
    ink: "bg-ink text-paper",
  };
  return (
    <span className={cn("brutal-sticker", tones[tone], className)}>
      {children}
    </span>
  );
}
