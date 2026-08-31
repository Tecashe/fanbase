import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[var(--neu-raised-sm)] hover:shadow-[var(--neu-raised)] hover:shadow-accent/20 active:shadow-[var(--neu-inset-sm)]',
        accent:
          'bg-accent text-accent-foreground shadow-[var(--neu-raised-sm)] hover:shadow-[var(--neu-raised)] hover:shadow-accent/30 active:shadow-[var(--neu-inset-sm)] border border-accent/30',
        neumorphic:
          'bg-card text-foreground shadow-[var(--neu-raised-sm)] hover:shadow-[var(--neu-raised)] active:shadow-[var(--neu-inset-sm)] border border-border/80',
        inset:
          'bg-background text-foreground shadow-[var(--neu-inset-sm)] border border-border/70',
        outline:
          'border border-border bg-card/60 shadow-[var(--neu-raised-xs)] hover:bg-card hover:shadow-[var(--neu-raised-sm)] text-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-[var(--neu-raised-xs)] hover:shadow-[var(--neu-raised-sm)]',
        ghost:
          'hover:bg-muted/70 hover:shadow-[var(--neu-raised-xs)] text-foreground/80 hover:text-foreground',
        destructive:
          'bg-destructive text-destructive-foreground shadow-[var(--neu-raised-sm)] hover:opacity-90 active:shadow-[var(--neu-inset-sm)]',
        link: 'text-accent underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 gap-2 px-4 text-sm',
        xs: 'h-7 gap-1 rounded-lg px-2.5 text-xs',
        sm: 'h-8 gap-1.5 rounded-lg px-3 text-xs',
        lg: 'h-12 gap-2.5 rounded-2xl px-6 text-base',
        icon: 'size-10 rounded-xl',
        'icon-sm': 'size-8 rounded-lg',
        'icon-lg': 'size-12 rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
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
