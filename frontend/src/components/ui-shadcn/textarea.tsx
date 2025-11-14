"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const textareaVariants = cva(
  "flex min-h-[60px] w-full rounded-md border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white placeholder-gray-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, variant, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(textareaVariants({ variant, className }))}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };