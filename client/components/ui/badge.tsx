import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "primary" | "danger" | "warning" | "secondary"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full px-4 py-1.5 font-bold text-xs uppercase tracking-wider border-2",
                {
                    "bg-gray-100 text-gray-500 border-gray-200": variant === "default",
                    "bg-primary/20 text-primary-dark border-primary/30": variant === "primary",
                    "bg-danger/20 text-danger-dark border-danger/30": variant === "danger",
                    "bg-warning/20 text-warning-dark border-warning/30": variant === "warning",
                    "bg-secondary/20 text-secondary-dark border-secondary/30": variant === "secondary",
                },
                className
            )}
            {...props}
        />
    )
}

export { Badge }
