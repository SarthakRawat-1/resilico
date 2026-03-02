"use client";

import React from "react";
import { useCommunityData } from "@/lib/useCommunityData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BouncyCard } from "@/components/ui/bouncy-card";
import dynamic from "next/dynamic";
import { useTutorial } from "@/hooks/useTutorial";

const NetworkGraph = dynamic(() => import("@/components/graph/NetworkGraph"), { ssr: false });

export default function NetworkPage() {
    const { members, exposures, graphMetrics, isLoading } = useCommunityData();
    const { startTutorial } = useTutorial();

    React.useEffect(() => {
        if (!isLoading && members.length > 0) {
            startTutorial();
        }
    }, [isLoading, members.length, startTutorial]);

    if (isLoading && members.length === 0) {
        return <div className="flex items-center justify-center h-64 text-slate-500 font-bold">Loading...</div>;
    }
    if (members.length === 0) {
        return <div className="flex items-center justify-center h-64 text-slate-500 font-bold">No community data. Generate from Dashboard.</div>;
    }

    const metricsDisplay = [
        {
            title: "Degree Centrality",
            data: graphMetrics?.degree_centrality,
            desc: "How connected each node is in the network",
        },
        {
            title: "Weighted Exposure",
            data: graphMetrics?.weighted_exposure,
            desc: "Total incoming exposure amount per member",
        },
        {
            title: "Trust Propagation",
            data: graphMetrics?.trust_propagation,
            desc: "PageRank-based trust score through the network",
        },
        {
            title: "Risk Concentration",
            data: graphMetrics?.risk_concentration,
            desc: "Ratio of exposure to reserves (higher = riskier)",
        },
    ];

    const topN = (data: Record<string, number> | undefined, n: number = 5) => {
        if (!data) return [];
        return Object.entries(data)
            .sort(([, a], [, b]) => b - a)
            .slice(0, n);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Network Graph</h1>
                <p className="text-gray-500 font-bold mt-2 text-lg">
                    Community financial exposure network. <span className="text-primary">Green = low risk</span>. <span className="text-danger">Red = high risk</span>. Size = reserves.
                </p>
            </div>

            <BouncyCard delay={0.1}>
                <Card className="network-graph-container overflow-hidden p-1 border-4 border-gray-200 bg-white">
                    <NetworkGraph members={members} exposures={exposures} height="500px" />
                </Card>
            </BouncyCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {metricsDisplay.map((metric, idx) => (
                    <BouncyCard delay={0.2 + (idx * 0.1)} key={metric.title}>
                        <Card className={`h-full ${metric.title === "Degree Centrality" ? "metric-centrality" :
                            metric.title === "Weighted Exposure" ? "metric-exposure" :
                                metric.title === "Trust Propagation" ? "metric-trust" : "metric-concentration"
                            }`}>
                            <CardHeader className="border-b-2 border-gray-100 pb-4">
                                <CardTitle className="text-xl">{metric.title}</CardTitle>
                                <p className="text-sm font-bold text-gray-400 mt-1">{metric.desc}</p>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="space-y-3">
                                    {topN(metric.data).map(([id, value], index) => {
                                        const member = members.find((m) => m.id.toString() === id);
                                        return (
                                            <div key={id} className="flex items-center justify-between text-base bg-gray-50 p-3 rounded-xl border-2 border-gray-200">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-black">
                                                        {index + 1}
                                                    </span>
                                                    <span className="text-gray-700 font-extrabold">
                                                        {member?.name || `Member ${id}`}
                                                    </span>
                                                </div>
                                                <span className="font-mono text-gray-500 font-bold tracking-wide">
                                                    {typeof value === "number" && value > 100
                                                        ? `$${value.toFixed(0)}`
                                                        : value.toFixed(4)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {topN(metric.data).length === 0 && (
                                        <div className="p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 text-center">
                                            <p className="text-sm font-bold text-gray-400">No data available</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </BouncyCard>
                ))}
            </div>
        </div>
    );
}
