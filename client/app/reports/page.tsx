"use client";

import React from "react";
import { useCommunityData } from "@/lib/useCommunityData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BouncyCard } from "@/components/ui/bouncy-card";
import { Button } from "@/components/ui/button";
import StabilityGauge from "@/components/graph/StabilityGauge";
import { Download, Loader2 } from "lucide-react";
import { useTutorial } from "@/hooks/useTutorial";

export default function ReportsPage() {
    const { members, stability, recommendations, isDownloading, downloadReport, isLoading } = useCommunityData();
    const { startTutorial } = useTutorial();

    React.useEffect(() => {
        if (!isLoading && members.length > 0) {
            startTutorial();
        }
    }, [isLoading, members.length, startTutorial]);

    const components = stability?.components;
    const score = stability?.stability_index || 0;

    if (members.length === 0 && !isLoading) {
        return <div className="flex items-center justify-center h-64 text-slate-500 font-bold">No community data. Generate from Dashboard.</div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Reports & Policy</h1>
                    <p className="text-gray-500 font-bold mt-2 text-lg">Stability analysis, recommendations, and PDF export</p>
                </div>
                <Button
                    variant="secondary"
                    onClick={downloadReport}
                    disabled={isDownloading || members.length === 0}
                    className="export-btn shadow-sm"
                    size="lg"
                >
                    {isDownloading ? <Loader2 className="w-6 h-6 mr-2 animate-spin" /> : <Download className="w-6 h-6 mr-2" />}
                    EXPORT PDF
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gauge */}
                <BouncyCard delay={0.1}>
                    <Card className="stability-gauge border-4 border-gray-200">
                        <CardHeader className="bg-gray-50 border-b-2 border-gray-100 pb-5">
                            <CardTitle className="text-center text-2xl text-gray-800">Overall Score</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center pt-8 pb-8">
                            <StabilityGauge score={score} size={220} />
                        </CardContent>
                    </Card>
                </BouncyCard>

                {/* Components */}
                <BouncyCard delay={0.2} className="lg:col-span-2 h-full">
                    <Card className="stability-components border-4 border-gray-200 h-full">
                        <CardHeader className="bg-gray-50 border-b-2 border-gray-100 pb-4">
                            <CardTitle className="text-2xl text-gray-800">Stability Components</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                {[
                                    { label: "Repayment Rate", value: 1 - (components?.default_rate || 0), weight: "40%", color: "var(--color-primary)", bg: "bg-primary/10" },
                                    { label: "Liquidity Ratio", value: components?.avg_liquidity_ratio || 0, weight: "30%", color: "var(--color-secondary)", bg: "bg-secondary/10" },
                                    { label: "Risk Dispersion", value: 1 - (components?.risk_concentration_index || 0), weight: "20%", color: "var(--color-warning)", bg: "bg-warning/10" },
                                    { label: "Network Resilience", value: components?.network_resilience_score || 0, weight: "10%", color: "var(--color-cyan-500)", bg: "bg-cyan-500/10" },
                                ].map((item) => (
                                    <div key={item.label} className={`p-4 rounded-2xl border-2 border-gray-100 ${item.bg}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-sm text-gray-500 font-extrabold uppercase">{item.label}</p>
                                            <p className="text-xs text-gray-400 font-black px-2 py-1 bg-white rounded-lg border-2 border-gray-100 shadow-sm">{item.weight}</p>
                                        </div>
                                        <p className="text-3xl font-black text-gray-800 mt-2 mb-3">
                                            {(item.value * 100).toFixed(1)}%
                                        </p>
                                        <div className="h-3 bg-white border border-gray-200 shadow-inner rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${item.value * 100}%`, backgroundColor: item.color }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </BouncyCard>
            </div>

            {/* Recommendations */}
            <BouncyCard delay={0.3}>
                <Card className="ai-recommendations border-4 border-gray-200 pb-2">
                    <CardHeader className="bg-gray-50 border-b-2 border-gray-100 pb-4">
                        <CardTitle className="text-2xl text-gray-800">Policy Recommendations</CardTitle>
                        <p className="text-sm font-bold text-gray-400 mt-1">AI-generated steps to improve community health</p>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        {recommendations.length === 0 ? (
                            <div className="p-8 text-center border-4 border-dashed border-gray-200 rounded-3xl">
                                <p className="text-lg font-bold text-gray-400">No critical recommendations at this time.</p>
                            </div>
                        ) : (
                            recommendations.map((rec, i) => (
                                <div key={i} className="flex flex-col sm:flex-row gap-4 p-5 rounded-3xl bg-white border-4 border-gray-100 shadow-sm hover:border-blue-200 transition-colors">
                                    <div className="flex-shrink-0 w-16 h-16 bg-secondary/10 rounded-2xl border-4 border-secondary/20 flex items-center justify-center text-secondary font-black text-2xl shadow-inner">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                            <h4 className="font-black text-gray-800 text-xl">{rec.title}</h4>
                                            <span className="text-sm font-black px-3 py-1.5 rounded-xl border-2 shadow-sm border-secondary-dark bg-secondary text-white">
                                                IMPACT: {rec.impact_score}/10
                                            </span>
                                        </div>
                                        <p className="text-base text-gray-500 font-medium leading-relaxed mt-2">{rec.explanation}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </BouncyCard>
        </div>
    );
}
