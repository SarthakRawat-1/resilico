"use client";

import React, { useState } from "react";
import { useCommunityData } from "@/lib/useCommunityData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BouncyCard } from "@/components/ui/bouncy-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeInRow } from "@/components/ui/fade-in-row";
import { StressTestResult } from "@/lib/api";
import { Activity, AlertTriangle, Users, Target, Loader2, FlaskConical } from "lucide-react";
import { useTutorial } from "@/hooks/useTutorial";

const SCENARIOS = [
    {
        key: "income_shock" as const,
        label: "Income Shock",
        desc: "Reduce all member incomes by X%",
        icon: Activity,
        defaultParam: 30,
        paramLabel: "Reduction %",
        color: "danger" as const,
    },
    {
        key: "expense_spike" as const,
        label: "Expense Spike",
        desc: "Increase all member expenses by X%",
        icon: AlertTriangle,
        defaultParam: 50,
        paramLabel: "Increase %",
        color: "warning" as const,
    },
    {
        key: "random_defaults" as const,
        label: "Random Defaults",
        desc: "Force N random members into default",
        icon: Users,
        defaultParam: 5,
        paramLabel: "Members",
        color: "secondary" as const,
    },
    {
        key: "targeted_shock" as const,
        label: "Targeted Shock",
        desc: "Default the most central node in the network",
        icon: Target,
        defaultParam: 1,
        paramLabel: "N/A",
        color: "danger" as const,
    },
];

export default function StressTestPage() {
    const { members, runStressTest, isLoading } = useCommunityData();
    const { startTutorial } = useTutorial();

    React.useEffect(() => {
        if (!isLoading && members.length > 0) {
            startTutorial();
        }
    }, [isLoading, members.length, startTutorial]);

    const [params, setParams] = useState<Record<string, number>>({
        income_shock: 30,
        expense_spike: 50,
        random_defaults: 5,
        targeted_shock: 1,
    });
    const [iterations, setIterations] = useState(1);
    const [results, setResults] = useState<StressTestResult[]>([]);
    const [running, setRunning] = useState<string | null>(null);

    if (members.length === 0 && !isLoading) {
        return <div className="flex items-center justify-center h-64 text-slate-500 font-bold">No community data. Generate from Dashboard.</div>;
    }

    const handleRun = async (scenario: typeof SCENARIOS[number]) => {
        setRunning(scenario.key);
        const result = await runStressTest(scenario.key, params[scenario.key], iterations);
        if (result) {
            setResults((prev) => [result, ...prev]);
        }
        setRunning(null);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Stress Testing</h1>
                <p className="text-gray-500 font-bold mt-2 text-lg">Run predefined shock scenarios with Monte Carlo simulation</p>
            </div>

            {/* Monte Carlo Config */}
            <BouncyCard delay={0.1}>
                <Card className="monte-carlo-config border-4 border-gray-200 bg-gray-50">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
                            <div className="flex items-center gap-4">
                                <label className="text-sm text-gray-500 font-black uppercase tracking-wider">
                                    Monte Carlo Iterations
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={1000}
                                    value={iterations}
                                    onChange={(e) => setIterations(Math.max(1, Math.min(1000, Number(e.target.value))))}
                                    className="w-24 px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-800 text-lg font-bold font-mono focus:outline-none focus:border-secondary transition-colors"
                                />
                            </div>
                            <p className="text-sm font-bold text-gray-400">
                                Higher iterations = more accurate average, but slower.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </BouncyCard>

            {/* Scenario Cards */}
            <div className="scenario-cards grid grid-cols-1 md:grid-cols-2 gap-6">
                {SCENARIOS.map((scenario) => (
                    <BouncyCard key={scenario.key} delay={0.2} className="h-full">
                        <Card className={`scenario-${scenario.key.replace('_', '-')} flex flex-col justify-between h-full`}>
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl shadow-sm ${scenario.color === "danger" ? "bg-danger/10 text-danger" :
                                        scenario.color === "warning" ? "bg-warning/10 text-warning" :
                                            "bg-secondary/10 text-secondary"
                                        }`}>
                                        <scenario.icon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl text-gray-800">{scenario.label}</CardTitle>
                                        <p className="text-sm font-bold text-gray-400 mt-1">{scenario.desc}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 p-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
                                    {scenario.key !== "targeted_shock" ? (
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-400 font-black uppercase tracking-wider mb-2">
                                                {scenario.paramLabel}
                                            </label>
                                            <input
                                                type="number"
                                                value={params[scenario.key]}
                                                onChange={(e) => setParams({ ...params, [scenario.key]: Number(e.target.value) })}
                                                className="w-full sm:w-32 px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-800 text-lg font-bold font-mono focus:outline-none focus:border-secondary transition-colors"
                                            />
                                        </div>
                                    ) : <div className="flex-1"></div>}
                                    <Button
                                        variant={scenario.color === "warning" ? "warning" : scenario.color === "secondary" ? "secondary" : "danger"}
                                        size="default"
                                        onClick={() => handleRun(scenario)}
                                        disabled={running !== null}
                                        className="w-full sm:w-auto shadow-sm"
                                    >
                                        {running === scenario.key ? (
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        ) : (
                                            <FlaskConical className="w-5 h-5 mr-2" />
                                        )}
                                        RUN TEST
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </BouncyCard>
                ))}
            </div>

            {/* Results Table */}
            {results.length > 0 && (
                <BouncyCard delay={0.6}>
                    <Card className="stress-test-table overflow-hidden">
                        <CardHeader className="bg-gray-50 border-b-2 border-gray-100 pb-5">
                            <CardTitle className="text-2xl">Stress Test Results</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-base text-left">
                                    <thead className="text-xs text-gray-400 font-black uppercase tracking-wider bg-gray-50 border-b-2 border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4">Scenario</th>
                                            <th className="px-6 py-4">Iterations</th>
                                            <th className="px-6 py-4">Avg Default %</th>
                                            <th className="px-6 py-4">Worst Case %</th>
                                            <th className="px-6 py-4">Stability</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-2 divide-gray-100">
                                        {results.map((r, i) => (
                                            <FadeInRow key={i} delay={i * 0.05} className="text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <Badge variant={
                                                        r.average_default_rate > 0.3 ? "danger" :
                                                            r.average_default_rate > 0.1 ? "warning" : "primary"
                                                    } className="shadow-none">
                                                        {r.scenario}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 font-mono">{r.iterations}</td>
                                                <td className="px-6 py-4 font-mono">{(r.average_default_rate * 100).toFixed(1)}%</td>
                                                <td className="px-6 py-4 font-mono text-danger">{(r.worst_case_default_rate * 100).toFixed(1)}%</td>
                                                <td className="px-6 py-4 font-mono">{r.average_stability_score.toFixed(1)}</td>
                                            </FadeInRow>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </BouncyCard>
            )}
        </div>
    );
}
