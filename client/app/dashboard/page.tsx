"use client";

import React from "react";
import { useCommunityData } from "@/lib/useCommunityData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BouncyCard } from "@/components/ui/bouncy-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StabilityGauge from "@/components/graph/StabilityGauge";
import { Users, Wallet, AlertTriangle, ShieldCheck, Activity, RotateCcw, Loader2 } from "lucide-react";
import { useTutorial } from "@/hooks/useTutorial";

export default function DashboardPage() {
  const { isLoading, members, exposures, stability, recommendations, seedNewCommunity } = useCommunityData();
  const { startTutorial } = useTutorial();

  React.useEffect(() => {
    if (!isLoading && members.length > 0) {
      startTutorial();
    }
  }, [isLoading, members.length, startTutorial]);

  const score = stability?.stability_index || 0;
  const components = stability?.components;

  let statusVariant: "primary" | "warning" | "danger" = "danger";
  let statusText = "CRITICAL";
  if (score >= 70) { statusVariant = "primary"; statusText = "STABLE"; }
  else if (score >= 40) { statusVariant = "warning"; statusText = "CAUTION"; }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Executive Dashboard</h1>
          <p className="text-gray-500 font-bold mt-2">Community financial health at a glance</p>
        </div>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <Badge variant={statusVariant} className="px-5 py-2.5 text-sm shadow-sm">
            {statusVariant === "primary" && <ShieldCheck className="w-5 h-5 mr-2" />}
            {statusVariant === "warning" && <AlertTriangle className="w-5 h-5 mr-2" />}
            {statusVariant === "danger" && <Activity className="w-5 h-5 mr-2 animate-bounce" />}
            {statusText}
          </Badge>
          <Button
            variant="secondary"
            onClick={() => seedNewCommunity(50)}
            disabled={isLoading}
            className="shadow-sm"
          >
            <RotateCcw className={`w-5 h-5 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Regenerate
          </Button>
        </div>
      </div>

      {isLoading && members.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-6">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-xl font-extrabold text-gray-500 uppercase tracking-widest">Loading Data...</p>
        </div>
      ) : members.length === 0 ? (
        <Card className="text-center p-16 border-dashed border-4 border-gray-300 shadow-none bg-transparent">
          <CardTitle className="text-3xl mb-6 text-gray-400">No Community Data Ready</CardTitle>
          <Button variant="secondary" size="lg" onClick={() => seedNewCommunity(50)}>
            Generate Demo Community
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Metrics */}
          <div className="lg:col-span-2 space-y-8">
            <div className="quick-stats-section grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="stat-members bg-white border-2 border-gray-200">
                <CardContent className="pt-6">
                  <p className="text-xs text-gray-400 font-black uppercase tracking-wider mb-2">Members</p>
                  <p className="text-4xl font-extrabold text-gray-800">
                    <AnimatedNumber value={members.length} />
                  </p>
                  <Users className="w-8 h-8 text-secondary mt-4 opacity-80" />
                </CardContent>
              </Card>
              <Card className="stat-loans bg-white border-2 border-gray-200">
                <CardContent className="pt-6">
                  <p className="text-xs text-gray-400 font-black uppercase tracking-wider mb-2">Loans</p>
                  <p className="text-4xl font-extrabold text-gray-800">
                    <AnimatedNumber value={exposures.length} delay={0.1} />
                  </p>
                  <Wallet className="w-8 h-8 text-warning-dark mt-4 opacity-80" />
                </CardContent>
              </Card>
              <Card className="stat-default-rate bg-danger/5 border-2 border-danger/20">
                <CardContent className="pt-6">
                  <p className="text-xs text-danger font-black uppercase tracking-wider mb-2">Default Rate</p>
                  <p className="text-4xl font-extrabold text-danger-dark">
                    <AnimatedNumber value={(components?.default_rate || 0) * 100} format={(v) => `${v.toFixed(1)}%`} delay={0.2} />
                  </p>
                  <AlertTriangle className="w-8 h-8 text-danger mt-4 opacity-80" />
                </CardContent>
              </Card>
              <Card className="stat-resilience bg-primary/5 border-2 border-primary/20">
                <CardContent className="pt-6">
                  <p className="text-xs text-primary font-black uppercase tracking-wider mb-2">Resilience</p>
                  <p className="text-4xl font-extrabold text-primary-dark">
                    <AnimatedNumber value={(components?.network_resilience_score || 0) * 100} format={(v) => `${v.toFixed(0)}%`} delay={0.3} />
                  </p>
                  <ShieldCheck className="w-8 h-8 text-primary mt-4 opacity-80" />
                </CardContent>
              </Card>
            </div>

            {/* Stability Components */}
            <Card className="stability-breakdown-section">
              <CardHeader className="border-b-2 border-gray-100 mb-4">
                <CardTitle className="text-2xl">Stability Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: "Default Rate (40%)", value: 1 - (components?.default_rate || 0), color: "var(--color-danger)", bg: "bg-danger/20" },
                  { label: "Liquidity Ratio (30%)", value: components?.avg_liquidity_ratio || 0, color: "var(--color-secondary)", bg: "bg-secondary/20" },
                  { label: "Risk Concentration (20%)", value: 1 - (components?.risk_concentration_index || 0), color: "var(--color-warning)", bg: "bg-warning/20" },
                  { label: "Network Resilience (10%)", value: components?.network_resilience_score || 0, color: "var(--color-primary)", bg: "bg-primary/20" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-base font-bold mb-2">
                      <span className="text-gray-500">{item.label}</span>
                      <span className="text-gray-800">
                        <AnimatedNumber value={item.value * 100} format={(v) => `${v.toFixed(1)}%`} delay={0.4} />
                      </span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200 shadow-inner">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${item.value * 100}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Recommendations */}
            {recommendations.length > 0 && (
              <BouncyCard delay={0.6} direction="left">
                <Card className="top-recommendations-section">
                  <CardHeader className="border-b-2 border-gray-100 mb-4">
                    <CardTitle className="text-2xl">Top Policy Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recommendations.slice(0, 3).map((rec, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-gray-50 border-2 border-gray-200 flex flex-col sm:flex-row gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl border-2 border-gray-200 flex items-center justify-center text-secondary font-extrabold text-xl shadow-sm">
                          {i + 1}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-gray-800 text-lg">{rec.title}</h4>
                          <p className="text-sm font-bold text-gray-500 mt-1 leading-relaxed">{rec.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </BouncyCard>
            )}
          </div>

          {/* Right: Gauge */}
          <div className="overall-index-section space-y-8">
            <BouncyCard delay={0.3} direction="none" className="h-full">
              <Card className="h-full flex flex-col items-center justify-center border-4 border-indigo-100/50 bg-gradient-to-b from-white to-gray-50/50">
                <CardHeader className="text-center pb-0 mt-4">
                  <CardTitle className="text-2xl text-indigo-900 font-extrabold tracking-tight">Overall Health</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center items-center pt-8 pb-10 w-full relative">
                  <StabilityGauge score={score} size={280} />
                </CardContent>
              </Card>
            </BouncyCard>
          </div>
        </div>
      )}
    </div>
  );
}
