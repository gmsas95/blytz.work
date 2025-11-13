import * as React from "react";
import { cn } from "./utils";

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number;
    max?: number;
  }
>(({ className, value = 0, max = 100, ...props }, ref) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div
      ref={ref}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-gray-700", className)}
      {...props}
    >
      <div
        className="h-full bg-yellow-400 transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
});

Progress.displayName = "Progress";

export { Progress };