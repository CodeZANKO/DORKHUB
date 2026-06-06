import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-sm border border-transparent bg-clip-padding text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all outline-none select-none focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default: "bg-primary text-background hover:bg-primary/80 shadow-[0_0_15px_rgba(0,255,148,0.1)]",
        outline:
          "border-border bg-background/20 hover:bg-surface hover:text-primary hover:border-primary/40",
        secondary:
          "bg-secondary text-background hover:bg-secondary/80 shadow-[0_0_15px_rgba(0,212,255,0.1)]",
        ghost:
          "hover:bg-surface hover:text-primary",
        destructive:
          "bg-error/10 text-error border-error/20 hover:bg-error/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4",
        xs: "h-6 px-2 text-[9px]",
        sm: "h-8 px-3 text-[10px]",
        lg: "h-11 px-6 text-xs",
        icon: "size-9",
        "icon-xs": "size-6",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
