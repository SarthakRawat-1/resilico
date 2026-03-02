"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, RotateCcw } from "lucide-react";

interface CascadeEdge {
    from: number;
    to: number;
    loss: number;
}

interface CascadeData {
    depth: number;
    total_defaults: number;
    loss_distribution: Record<string, number>;
    contagion_graph: CascadeEdge[];
}

interface CascadeViewerProps {
    cascadeData: CascadeData | null;
}

export default function CascadeViewer({ cascadeData }: CascadeViewerProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const edges = cascadeData?.contagion_graph || [];
    const totalSteps = edges.length;

    useEffect(() => {
        if (!isPlaying || currentStep >= totalSteps) {
            setIsPlaying(false);
            return;
        }
        const timer = setTimeout(() => setCurrentStep((s) => s + 1), 600);
        return () => clearTimeout(timer);
    }, [isPlaying, currentStep, totalSteps]);

    const reset = () => { setCurrentStep(0); setIsPlaying(false); };

    if (!cascadeData || edges.length === 0) {
        return (
            <div className="text-center text-slate-500 py-8 font-medium">
                No cascade events in this simulation.
            </div>
        );
    }

    const visibleEdges = edges.slice(0, currentStep);
    const affectedNodes = new Set<number>();
    visibleEdges.forEach((e) => { affectedNodes.add(e.from); affectedNodes.add(e.to); });
    const totalLoss = visibleEdges.reduce((sum, e) => sum + e.loss, 0);

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={currentStep >= totalSteps}
                >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setCurrentStep((s) => Math.min(s + 1, totalSteps))}>
                    <SkipForward className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={reset}>
                    <RotateCcw className="w-4 h-4" />
                </Button>
                <span className="text-sm text-slate-400 ml-2 font-medium">
                    Step {currentStep} / {totalSteps}
                </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                    <p className="text-xs text-slate-500 font-bold uppercase">Cascade Depth</p>
                    <p className="text-xl font-extrabold text-danger">{cascadeData.depth}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                    <p className="text-xs text-slate-500 font-bold uppercase">Total Defaults</p>
                    <p className="text-xl font-extrabold text-warning">{cascadeData.total_defaults}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                    <p className="text-xs text-slate-500 font-bold uppercase">Loss So Far</p>
                    <p className="text-xl font-extrabold text-secondary">${totalLoss.toFixed(0)}</p>
                </div>
            </div>

            {/* Contagion flow */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
                {visibleEdges.map((edge, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-2 bg-danger/10 border border-danger/20 rounded-lg px-3 py-2 text-sm animate-in fade-in duration-300"
                    >
                        <span className="font-bold text-danger">Member {edge.from}</span>
                        <span className="text-slate-600">-&gt;</span>
                        <span className="font-bold text-warning">Member {edge.to}</span>
                        <span className="ml-auto font-mono text-danger-dark text-xs">
                            -${edge.loss.toFixed(0)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
