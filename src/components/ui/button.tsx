import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button — DESIGN_SYSTEM.md › Buttons (Prestige): square, 44px, 13px Nunito
 * uppercase with 0.18em tracking. Never add rounded-* or a custom height.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none border border-transparent font-sans text-button font-normal uppercase transition-[background-color,color,border-color,opacity] duration-fast focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /** Solid ink — add to cart, checkout, submit. */
        default: "border-primary bg-primary text-white hover:border-night hover:bg-night",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        /** Ink outline. */
        outline: "border-ink bg-transparent text-ink hover:bg-ink hover:text-white",
        /** White surface. */
        secondary: "border-white bg-white text-ink hover:border-ink",
        /** Text / icon only — inherits the surrounding text color. */
        ghost: "bg-transparent hover:opacity-60",
        /** Underlined link. */
        link: "h-auto px-0 font-display text-label underline underline-offset-4 hover:opacity-70",
        /** Solid white on photography (Prestige slideshow). */
        overlay: "border-white bg-white text-ink hover:bg-transparent hover:text-white",
        /** White outline on a dark surface. */
        onPrimary: "border-white bg-transparent text-white hover:bg-white hover:text-ink",
      },
      size: {
        default: "h-button px-7",
        sm: "h-10 px-4",
        lg: "h-12 px-8",
        icon: "h-10 w-10 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
