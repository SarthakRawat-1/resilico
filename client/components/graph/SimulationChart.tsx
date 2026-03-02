"use client";

import React from "react";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";
import { SimulationTimeSeries } from "@/lib/api";

export default function SimulationChart({ data }: { data: SimulationTimeSeries | null }) {
    if (!data || !data.time_series) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-500 font-bold">
                No simulation data available. Run a simulation first.
            </div>
        );
    }

    const chartData = data.time_series.map((pt) => ({
        week: `W${pt.week}`,
        liquidity: pt.total_liquidity,
        distressed: pt.distressed_count,
    }));

    return (
        <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorLiquidity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorDistress" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis
                        dataKey="week"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 11, fontWeight: "bold" }}
                        dy={10}
                    />
                    <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 11 }}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                        dx={-10}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#ef4444", fontSize: 11 }}
                        dx={10}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #334155",
                            background: "#1e293b",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
                            color: "#e2e8f0",
                        }}
                        labelStyle={{ fontWeight: "bold", color: "#e2e8f0" }}
                    />
                    <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="liquidity"
                        name="Total Liquidity"
                        stroke="var(--color-secondary)"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorLiquidity)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: "var(--color-secondary)" }}
                    />
                    <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="distressed"
                        name="Distressed"
                        stroke="var(--color-danger)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorDistress)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
