"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={{ "--border-radius": "var(--radius)" } as React.CSSProperties}
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans text-body group-[.toaster]:rounded-md group-[.toaster]:border group-[.toaster]:border-gray-200 group-[.toaster]:bg-background group-[.toaster]:text-ink group-[.toaster]:shadow-none [.rm-admin-theme_&]:group-[.toaster]:shadow-lg",
          title: "ds-body font-medium",
          description: "ds-body group-[.toast]:text-gray-500",
          actionButton:
            "group-[.toast]:rounded-ds group-[.toast]:bg-primary group-[.toast]:text-label group-[.toast]:uppercase group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:rounded-ds group-[.toast]:bg-beige group-[.toast]:text-label group-[.toast]:uppercase group-[.toast]:text-ink",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
