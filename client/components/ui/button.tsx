import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends Omit<HTMLMotionProps<"button">, "variant" | "size"> {
    variant?: "default" | "primary" | "secondary" | "warning" | "danger" | "surface" | "outline" | "ghost"
    size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <motion.button
                ref={ref}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96, y: 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-2xl font-black uppercase tracking-wider disabled:pointer-events-none disabled:opacity-50",
                    "btn-3d focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30",
                    {
                        "btn-3d-gray": variant === "default" || variant === "outline" || variant === "ghost",
                        "btn-3d-primary": variant === "primary",
                        "btn-3d-danger": variant === "danger",
                        "btn-3d-warning": variant === "warning",
                        "btn-3d-secondary": variant === "secondary",
                        "btn-3d-surface": variant === "surface",
                        "h-12 px-6 py-3 text-sm": size === "default",
                        "h-10 px-4 text-xs": size === "sm",
                        "h-14 px-8 text-base": size === "lg",
                        "h-12 w-12": size === "icon",
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
