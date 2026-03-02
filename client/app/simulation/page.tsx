"use client";

import React, { useState } from "react";
import { useCommunityData } from "@/lib/useCommunityData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BouncyCard } from "@/components/ui/bouncy-card";
import { Button } from "@/components/ui/button";
import SimulationChart from "@/components/graph/SimulationChart";
import CascadeViewer from "@/components/graph/CascadeViewer";
import { Play, Loader2 } from "lucide-react";
import { useTutorial } from "@/hooks/useTutorial";

export default function SimulationPage() {
    const { members, simulationData, runSimulation, isLoading } = useCommunityData();
    const { startTutorial } = useTutorial();

    React.useEffect(() => {
        if (!isLoading && members.length > 0) {
            startTutorial();
        }
    }, [isLoading, members.length, startTutorial]);

    const [weeks, setWeeks] = useState(52);

    if (members.length === 0 && !isLoading) {
        return <div className="flex items-center justify-center h-64 text-slate-500 font-bold">No community data. Generate from Dashboard.</div>;
    }

    // Extract last cascade event from simulation
    const lastCascade = simulationData?.time_series
        ?.filter((s) => s.cascade)
        ?.map((s) => s.cascade)
        ?.pop() || null;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Liquidity Simulation</h1>
                <p className="text-gray-500 font-bold mt-2 text-lg">Run weekly time-step simulations and observe default cascades</p>
            </div>

            {/* Config */}
            <BouncyCard delay={0.1}>
                <Card className="simulation-timeline border-4 border-gray-200">
                    <CardContent className="pt-8">
                        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 justify-between">
                            <div className="w-full md:w-auto">
                                <label className="block text-sm text-gray-400 font-black uppercase tracking-wider mb-4">Duration</label>
                                <div className="flex items-center">
                                    <input
                                        type="range"
                                        min={4}
                                        max={104}
                                        value={weeks}
                                        onChange={(e) => setWeeks(Number(e.target.value))}
                                        className="w-full md:w-64 accent-secondary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-xl text-secondary font-extrabold ml-4 min-w-[5rem]">{weeks} wk</span>
                                </div>
                            </div>
                            <Button
                                variant="secondary"
                                onClick={() => runSimulation(weeks)}
                                disabled={isLoading || members.length === 0}
                                size="lg"
                                className="simulation-run-btn w-full md:w-auto shadow-sm text-lg"
                            >
                                {isLoading ? <Loader2 className="w-6 h-6 mr-2 animate-spin" /> : <Play className="w-6 h-6 mr-2" />}
                                START
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </BouncyCard>

            {/* Chart */}
            <BouncyCard delay={0.2}>
                <Card className="simulation-chart">
                    <CardHeader className="border-b-2 border-gray-100 mb-4 pb-4 bg-gray-50 rounded-t-2xl">
                        <CardTitle className="text-2xl">Liquidity Over Time</CardTitle>
                        <p className="text-sm font-bold text-gray-400 mt-1">
                            Total community liquidity vs. number of distressed members per week
                        </p>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <SimulationChart data={simulationData} />
                    </CardContent>
                </Card>
            </BouncyCard>

            {/* Cascade */}
            <BouncyCard delay={0.3}>
                <Card className="cascade-viewer">
                    <CardHeader className="border-b-2 border-gray-100 mb-4 pb-4 bg-gray-50 rounded-t-2xl">
                        <CardTitle className="text-2xl">Default Cascade Events</CardTitle>
                        <p className="text-sm font-bold text-gray-400 mt-1">
                            Step through the contagion propagation from the simulation
                        </p>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <CascadeViewer cascadeData={lastCascade} />
                    </CardContent>
                </Card>
            </BouncyCard>
        </div>
    );
}
