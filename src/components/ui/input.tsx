import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Input — Prestige: square, 44px, 1px gray-300 border, ink on focus.
 * 16px text on phones (prevents iOS zoom), 14px from md up.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-input w-full rounded-none border border-gray-300 bg-white px-[13px] font-sans text-[16px] text-ink transition-colors duration-fast file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-ink/60 hover:border-gray-500 focus-visible:border-ink focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-body",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
