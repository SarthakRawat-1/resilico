import { useState, useCallback, useEffect } from "react";
import { cfssApi, StabilityScore, Recommendation, GraphMetrics, SimulationTimeSeries, Member, Exposure, StressTestResult } from "./api";

export function useCommunityData() {
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);
    const [exposures, setExposures] = useState<Exposure[]>([]);
    const [stability, setStability] = useState<StabilityScore | null>(null);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [graphMetrics, setGraphMetrics] = useState<GraphMetrics | null>(null);
    const [simulationData, setSimulationData] = useState<SimulationTimeSeries | null>(null);

    const fetchAll = useCallback(async () => {
        setIsLoading(true);
        try {
            const [mems, exps] = await Promise.all([
                cfssApi.getMembers(),
                cfssApi.getExposures()
            ]);
            setMembers(mems);
            setExposures(exps);

            if (mems.length > 0) {
                const [score, recs, metrics] = await Promise.all([
                    cfssApi.getStabilityScore(),
                    cfssApi.getRecommendations(),
                    cfssApi.getGraphMetrics(),
                ]);
                setStability(score);
                setRecommendations(recs.recommendations);
                setGraphMetrics(metrics);
            } else {
                setStability(null);
                setRecommendations([]);
                setGraphMetrics(null);
                setSimulationData(null);
            }
        } catch (err) {
            console.error("Failed to fetch community data", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const seedNewCommunity = async (count: number = 50) => {
        setIsLoading(true);
        try {
            await cfssApi.seedCommunity(count);
            await fetchAll();
        } catch (err) {
            console.error("Failed to seed community", err);
            setIsLoading(false);
        }
    };

    const runSimulation = async (weeks: number = 52, scenario: string = "baseline") => {
        setIsLoading(true);
        try {
            const result = await cfssApi.runSimulation(weeks, scenario);
            setSimulationData(result);
        } catch (err) {
            console.error("Simulation failed", err);
        } finally {
            setIsLoading(false);
        }
    };

    const runStressTest = async (
        scenario: "income_shock" | "expense_spike" | "random_defaults" | "targeted_shock",
        param: number,
        iterations: number = 1
    ): Promise<StressTestResult | null> => {
        setIsLoading(true);
        try {
            const result = await cfssApi.runStressTest(scenario, param, iterations);
            // Refresh core data after stress test
            await fetchAll();
            return result;
        } catch (err) {
            console.error("Stress test failed", err);
            setIsLoading(false);
            return null;
        }
    };

    const downloadReport = async () => {
        setIsDownloading(true);
        try {
            const blob = await cfssApi.getReport();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "resilico_stability_report.pdf");
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to download report", err);
        } finally {
            setIsDownloading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return {
        isLoading,
        isDownloading,
        members,
        exposures,
        stability,
        recommendations,
        graphMetrics,
        simulationData,
        seedNewCommunity,
        fetchAll,
        runSimulation,
        runStressTest,
        downloadReport,
    };
}
