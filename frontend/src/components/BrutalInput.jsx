import { forwardRef } from "react";
import { cn } from "@lib/cn";

/** Neo-Brutalist text input. */
const BrutalInput = forwardRef(function BrutalInput(
  { className, ...rest },
  ref,
) {
  return (
    <input ref={ref} className={cn("brutal-input", className)} {...rest} />
  );
});

export default BrutalInput;
