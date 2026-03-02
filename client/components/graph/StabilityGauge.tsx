"use client";

import React from "react";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface StabilityGaugeProps {
    score: number;
    size?: number;
}

export default function StabilityGauge({ score, size = 200 }: StabilityGaugeProps) {
    const clampedScore = Math.max(0, Math.min(100, score));
    const radius = (size - 20) / 2;
    const center = size / 2;
    // Arc from 225deg to -45deg (270deg sweep)
    const startAngle = 225;
    const sweepAngle = 270;
    const progress = (clampedScore / 100) * sweepAngle;

    const polarToCartesian = (angle: number) => {
        const rad = (angle * Math.PI) / 180;
        return {
            x: center + radius * Math.cos(rad),
            y: center - radius * Math.sin(rad),
        };
    };

    const describeArc = (start: number, sweep: number) => {
        const startPt = polarToCartesian(start);
        const endPt = polarToCartesian(start - sweep);
        const largeArc = sweep > 180 ? 1 : 0;
        return `M ${startPt.x} ${startPt.y} A ${radius} ${radius} 0 ${largeArc} 1 ${endPt.x} ${endPt.y}`;
    };

    let color = "var(--color-danger)";
    let label = "Critical";
    if (clampedScore >= 70) {
        color = "var(--color-primary)";
        label = "Stable";
    } else if (clampedScore >= 40) {
        color = "var(--color-warning)";
        label = "Caution";
    }

    return (
        <div className="flex flex-col items-center relative">
            <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.85}`}>
                {/* Background track */}
                <path
                    d={describeArc(startAngle, sweepAngle)}
                    fill="none"
                    stroke="#334155"
                    strokeWidth={12}
                    strokeLinecap="round"
                />
                {/* Progress arc */}
                <path
                    d={describeArc(startAngle, progress)}
                    fill="none"
                    stroke={color}
                    strokeWidth={12}
                    strokeLinecap="round"
                    style={{
                        filter: `drop-shadow(0 0 8px ${color}80)`,
                        transition: "d 0.8s ease-out, stroke 0.5s ease",
                    }}
                />
                {/* Score text background/labels only in SVG */}
                <text
                    x={center}
                    y={center + size * 0.12}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize={size * 0.07}
                    className="font-bold"
                    style={{ fontFamily: "var(--font-sans)" }}
                >
                    / 100
                </text>
            </svg>
            <span
                className="text-sm font-bold mt-1 px-3 py-1 rounded-full"
                style={{
                    color,
                    backgroundColor: `${color}20`,
                    border: `1px solid ${color}30`,
                }}
            >
                {label}
            </span>
            {/* HTML Overlay for AnimatedNumber to avoid SVG <text> re-rendering funkiness */}
            <div
                className="absolute flex items-center justify-center pointer-events-none"
                style={{
                    top: center - (size * 0.2),
                    left: 0,
                    right: 0,
                }}
            >
                <AnimatedNumber
                    value={clampedScore}
                    delay={0.1}
                    className="font-extrabold"
                    style={{
                        color,
                        fontSize: size * 0.2,
                        fontFamily: "var(--font-sans)",
                        lineHeight: 1
                    }}
                />
            </div>
        </div>
    );
}
