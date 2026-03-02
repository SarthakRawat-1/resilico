"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Activity, Network, FlaskConical, BarChart3, Users, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BouncyCard } from "@/components/ui/bouncy-card";

const FEATURES = [
    {
        icon: Users,
        title: "Community Modeling",
        desc: "Build detailed member profiles with income, expenses, and reserve data.",
        color: "bg-primary",
        ring: "ring-primary/30",
        accent: "text-primary",
    },
    {
        icon: Network,
        title: "Network Graph",
        desc: "Visualize lending relationships and identify systemic risk clusters.",
        color: "bg-secondary",
        ring: "ring-secondary/30",
        accent: "text-secondary",
    },
    {
        icon: Activity,
        title: "Liquidity Simulation",
        desc: "Run week-by-week simulations tracking cash flow and distress events.",
        color: "bg-warning",
        ring: "ring-warning/30",
        accent: "text-warning-dark",
    },
    {
        icon: FlaskConical,
        title: "Stress Testing",
        desc: "Monte Carlo scenarios: income shocks, random defaults, expense spikes.",
        color: "bg-danger",
        ring: "ring-danger/30",
        accent: "text-danger",
    },
    {
        icon: Shield,
        title: "Stability Index",
        desc: "A composite 0-100 score measuring your community's financial resilience.",
        color: "bg-cyan-500",
        ring: "ring-cyan-300/30",
        accent: "text-cyan-600",
    },
    {
        icon: BarChart3,
        title: "AI Recommendations",
        desc: "Get actionable policy suggestions powered by intelligent analysis.",
        color: "bg-purple-500",
        ring: "ring-purple-300/30",
        accent: "text-purple-600",
    },
];

function SkillNode({
    feature,
    index,
    isLast,
}: {
    feature: (typeof FEATURES)[number];
    index: number;
    isLast: boolean;
}) {
    const isLeft = index % 2 === 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: index * 0.08 }}
            className="relative flex flex-col items-center"
        >
            {/* Node row */}
            <div
                className={`flex items-center gap-8 w-full max-w-3xl ${isLeft ? "flex-row" : "flex-row-reverse"
                    }`}
            >
                {/* Icon bubble */}
                <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`shrink-0 w-20 h-20 rounded-full ${feature.color} flex items-center justify-center shadow-xl border-b-[6px] border-black/15 ring-8 ${feature.ring} cursor-pointer`}
                >
                    <feature.icon className="w-9 h-9 text-white" />
                </motion.div>

                {/* Text block */}
                <div className={`flex-1 ${isLeft ? "text-left" : "text-right"}`}>
                    <h3 className={`text-xl font-black ${feature.accent}`}>{feature.title}</h3>
                    <p className="text-gray-500 font-bold mt-1 leading-relaxed text-sm">
                        {feature.desc}
                    </p>
                </div>
            </div>

            {/* Connector dots */}
            {!isLast && (
                <div className="flex flex-col items-center py-3 gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                    <div className="w-2 h-2 rounded-full bg-gray-200" />
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                </div>
            )}
        </motion.div>
    );
}

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-50 overflow-hidden">
            {/* Navbar */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center justify-between px-6 md:px-16 py-5 bg-white border-b-4 border-gray-200"
            >
                <div className="flex items-center gap-3">
                    <Image
                        src="/logo.png"
                        alt="Resilico"
                        width={44}
                        height={44}
                        className="rounded-xl border-2 border-indigo-100 shadow-sm"
                    />
                    <span className="text-2xl font-extrabold text-indigo-900 tracking-tight">Resilico</span>
                </div>
                <a
                    href="https://vimeo.com/1169463987?share=copy&fl=sv&fe=ci"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all hover:opacity-80 border-b-4"
                    style={{ backgroundColor: "#19b7ea", borderColor: "#1196c0", color: "#fff" }}
                >
                    Watch Demo
                    <ArrowRight className="w-4 h-4" />
                </a>
            </motion.header>

            {/* Hero */}
            <section className="flex flex-col items-center text-center px-6 pt-16 md:pt-24 pb-12">
                <BouncyCard delay={0.1}>
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary/10 border-2 border-secondary/20 text-secondary-dark text-sm font-black uppercase tracking-wider mb-8">
                        <Shield className="w-4 h-4" />
                        Community Financial Stability Simulator
                    </div>
                </BouncyCard>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.25 }}
                    className="text-5xl md:text-7xl font-black tracking-tight leading-tight max-w-4xl text-gray-900"
                >
                    Simulate.{" "}
                    <span className="text-primary">Stress-Test.</span>
                    <br />
                    <span className="text-secondary">Stabilize.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="mt-6 text-lg md:text-xl text-gray-500 font-bold max-w-2xl leading-relaxed"
                >
                    Model your community&apos;s financial network, run liquidity simulations,
                    and discover vulnerabilities before they cascade into real-world crises.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.5 }}
                    className="mt-10 flex flex-col sm:flex-row gap-4"
                >
                    <Link href="/dashboard">
                        <Button variant="primary" size="lg" className="text-lg px-10 py-5 shadow-lg">
                            LAUNCH DASHBOARD
                            <ArrowRight className="w-5 h-5 ml-3" />
                        </Button>
                    </Link>
                </motion.div>

                {/* Scroll hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-16"
                >
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                    >
                        <ChevronDown className="w-8 h-8 text-gray-300" />
                    </motion.div>
                </motion.div>
            </section>

            {/* Skill Tree Path */}
            <section className="px-6 md:px-16 pb-24">
                <div className="max-w-5xl mx-auto flex flex-col items-center">
                    <BouncyCard delay={0.2}>
                        <h2 className="text-3xl font-black text-gray-800 text-center mb-12">
                            Your Path to Stability
                        </h2>
                    </BouncyCard>

                    {FEATURES.map((feature, index) => (
                        <SkillNode
                            key={feature.title}
                            feature={feature}
                            index={index}
                            isLast={index === FEATURES.length - 1}
                        />
                    ))}

                    {/* Final CTA at bottom of path */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
                        className="mt-10 flex flex-col items-center gap-4"
                    >
                        <div className="flex flex-col items-center py-3 gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                            <div className="w-2 h-2 rounded-full bg-gray-200" />
                            <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                        </div>
                        <Link href="/dashboard">
                            <Button variant="primary" size="lg" className="text-base px-8 shadow-lg">
                                START NOW
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t-4 border-gray-200 bg-white py-8 text-center text-gray-400 text-sm font-black uppercase tracking-wider">
                Built by Sarthak Rawat
            </footer>
        </div>
    );
}
