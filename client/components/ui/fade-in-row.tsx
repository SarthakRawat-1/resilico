"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface FadeInRowProps extends HTMLMotionProps<"tr"> {
    delay?: number;
    children: React.ReactNode;
}

export function FadeInRow({ delay = 0, children, ...props }: FadeInRowProps) {
    return (
        <motion.tr
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: delay,
            }}
            {...props}
        >
            {children}
        </motion.tr>
    );
}
