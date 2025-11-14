"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const skeletonVariants = cva(
  "animate-pulse rounded-md",
  {
    variants: {
      variant: {
        default: "bg-gray-700",
        text: "bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Skeleton({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof skeletonVariants>) {
  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      data-slot="skeleton"
      {...props}
    />
  );
}

export { Skeleton };