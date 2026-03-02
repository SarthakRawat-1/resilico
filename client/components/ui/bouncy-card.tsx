"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface BouncyCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
}

export function BouncyCard({
    children,
    delay = 0,
    direction = "up",
    className,
    ...props
}: BouncyCardProps) {
    const directionOffset = {
        up: { y: 40 },
        down: { y: -40 },
        left: { x: 40 },
        right: { x: -40 },
        none: { x: 0, y: 0 },
    };

    const initial = {
        opacity: 0,
        ...directionOffset[direction],
        scale: 0.95,
    };

    const animate = {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
    };

    return (
        <motion.div
            initial={initial}
            animate={animate}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: delay,
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}
