"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const separatorVariants = cva(
  "shrink-0 bg-gray-600",
  {
    variants: {
      orientation: {
        horizontal: "h-[1px] w-full",
        vertical: "h-full w-[1px]",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);

const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof separatorVariants>
>(({ className, orientation, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(separatorVariants({ orientation }), className)}
    {...props}
  />
));
Separator.displayName = "Separator";

export { Separator };