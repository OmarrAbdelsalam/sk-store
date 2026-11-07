import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Badge — Prestige: square chip, 11px Instrument Sans uppercase, 0.18em.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-none px-2 py-0.5 font-display text-[11px] font-normal uppercase leading-[18px] tracking-[0.18em] transition-colors",
  {
    variants: {
      variant: {
        /** Light chip — "New", "Sold out" (Prestige custom badge). */
        default: "bg-white text-ink/65",
        /** Sale red. */
        primary: "bg-accent-2 text-white",
        secondary: "bg-canvas text-ink",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-ink text-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
