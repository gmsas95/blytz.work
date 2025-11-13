"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const checkboxVariants = cva(
  "peer inline-flex h-4 w-4 shrink-0 rounded-sm border border-gray-600 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-yellow-400 data-[state=checked]:border-yellow-400",
  {
    variants: {
      variant: {
        default: "bg-gray-800/50 border-gray-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Checkbox = React.forwardRef<
  React.ElementRef<"input">,
  React.ComponentPropsWithoutRef<"input"> &
    VariantProps<typeof checkboxVariants>
>(({ className, ...props }, ref) => {
  return (
    <input
      type="checkbox"
      className={cn(checkboxVariants(), className)}
      ref={ref}
      data-slot="checkbox"
      {...props}
    />
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };