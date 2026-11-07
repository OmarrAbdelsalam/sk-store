import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center gap-4 rounded-md border-b border-gray-200 text-gray-500 [.rm-admin-theme_&]:gap-0 [.rm-admin-theme_&]:border-0 [.rm-admin-theme_&]:bg-muted [.rm-admin-theme_&]:p-1",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "-mb-px inline-flex h-full items-center justify-center whitespace-nowrap rounded-sm border-b border-transparent px-1 font-sans text-button uppercase transition-colors duration-fast hover:text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-ink data-[state=active]:text-ink [.rm-admin-theme_&]:mb-0 [.rm-admin-theme_&]:h-auto [.rm-admin-theme_&]:border-0 [.rm-admin-theme_&]:px-3 [.rm-admin-theme_&]:py-1.5 [.rm-admin-theme_&]:text-sm [.rm-admin-theme_&]:font-medium [.rm-admin-theme_&]:normal-case [.rm-admin-theme_&]:tracking-normal [.rm-admin-theme_&]:data-[state=active]:bg-background [.rm-admin-theme_&]:data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [.rm-admin-theme_&]:mt-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
