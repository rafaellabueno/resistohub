import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"
import { CheckIcon, ClipboardCopyIcon, Loader } from "lucide-react"

const buttonVariants = cva(
  "focus-visible:ring-ring inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        aqua: "bg-accent hover:bg-accent/90 focus:bg-accent/90 text-white shadow",

        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline:
          "border-input bg-background hover:bg-accent hover:text-accent-foreground border shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {loading && <Loader className="mr-2 animate-spin" />}
        {props.children}
      </Comp>
    )
  },
)
Button.displayName = "Button"

type CopyButtonProps = ButtonProps & { text: string }

const CopyButton = ({ text, ...props }: CopyButtonProps) => {
  const [copied, setCopied] = React.useState(false)
  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <Button
      {...props}
      size="icon"
      variant="ghost"
      onClick={() => {
        copyToClipboard(text?.toString())
      }}
    >
      {copied ? (
        <CheckIcon className="h-4 w-4" />
      ) : (
        <ClipboardCopyIcon className="h-4 w-4" />
      )}
    </Button>
  )
}

export { Button, buttonVariants, CopyButton }
