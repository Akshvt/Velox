import { cn } from "@lib/cn";

/**
 * Neo-Brutalist button.
 * Variants: default | primary | pink | mint | sky | ink
 */
export default function BrutalButton({
  as: Tag = "button",
  variant = "default",
  size = "md",
  className,
  children,
  ...rest
}) {
  const variants = {
    default: "",
    primary: "brutal-btn-primary",
    pink: "brutal-btn-pink",
    mint: "brutal-btn-mint",
    sky: "brutal-btn-sky",
    ink: "brutal-btn-ink",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "",
    lg: "px-7 py-3.5 text-base",
  };
  return (
    <Tag
      className={cn("brutal-btn", variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
