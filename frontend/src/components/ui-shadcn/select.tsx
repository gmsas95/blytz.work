import * as React from "react";
import { cn } from "./utils";

const Select = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between rounded-md border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
Select.displayName = "Select";

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-600 bg-gray-800/95 backdrop-blur-lg p-1 text-gray-300 shadow-md",
      className
    )}
    {...props}
  />
));
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm text-gray-300 outline-none focus:bg-gray-700 focus:text-yellow-400",
      className
    )}
    {...props}
  />
));
SelectItem.displayName = "SelectItem";

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between rounded-md border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("block truncate text-sm text-gray-300", className)}
    {...props}
  />
));
SelectValue.displayName = "SelectValue";

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };