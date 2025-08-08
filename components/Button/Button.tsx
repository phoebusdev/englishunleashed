import { cva, type VariantProps } from "class-variance-authority"

import { twMerge } from "tailwind-merge"

const button = cva(
  [
    "justify-center",
    "inline-flex",
    "items-center",
    "rounded-full",
    "text-center",
    "transition-all",
    "duration-200",
    "font-medium",
    "shadow-md",
    "hover:shadow-lg",
  ],
  {
    variants: {
      intent: {
        primary: [
          "bg-gradient-primary", 
          "text-white", 
          "border-0",
          "hover:opacity-90",
          "hover:scale-[1.02]"
        ],
        secondary: [
          "bg-white",
          "text-gray-700", 
          "border",
          "border-gray-300",
          "hover:bg-gray-50",
          "dark:bg-gray-800",
          "dark:text-gray-300",
          "dark:border-gray-600",
          "dark:hover:bg-gray-700"
        ],
      },
      size: {
        sm: ["min-w-24", "h-10", "text-sm", "py-2", "px-4"],
        lg: ["min-w-36", "h-12", "text-base", "py-3", "px-6"],
      },
      underline: { true: ["underline"], false: [] },
    },
    defaultVariants: {
      intent: "primary",
      size: "lg",
    },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof button> {
  underline?: boolean
  href: string
}

export function Button({ className, intent, size, underline, ...props }: ButtonProps) {
  return (
    <a className={twMerge(button({ intent, size, className, underline }))} {...props}>
      {props.children}
    </a>
  )
}
