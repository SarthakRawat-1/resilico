import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",
    headers: { "Content-Type": "application/json" },
});

export interface Member {
    id: number;
    name: string;
    monthly_income: number;
    monthly_expenses: number;
    emergency_reserve: number;
    trust_score: number;
    risk_score: number;
}

export interface Exposure {
    id: number;
    lender_id: number;
    borrower_id: number;
    exposure_amount: number;
    repayment_probability: number;
    last_payment_date: string | null;
}

export interface StabilityScore {
    stability_index: number;
    components: {
        default_rate: number;
        avg_liquidity_ratio: number;
        risk_concentration_index: number;
        network_resilience_score: number;
    };
}

export interface Recommendation {
    title: string;
    impact_score: number;
    explanation: string;
}

export interface SimulationTimeSeries {
    run_id: number;
    scenario: string;
    weeks: number;
    time_series: Array<{
        week: number;
        total_liquidity: number;
        distressed_count: number;
        cascade: {
            depth: number;
            total_defaults: number;
            loss_distribution: Record<string, number>;
            contagion_graph: Array<{ from: number; to: number; loss: number }>;
        } | null;
    }>;
}

export interface GraphMetrics {
    degree_centrality: Record<string, number>;
    weighted_exposure: Record<string, number>;
    trust_propagation: Record<string, number>;
    risk_concentration: Record<string, number>;
}

export interface StressTestResult {
    scenario: string;
    iterations: number;
    weeks: number;
    shock_param: number;
    average_default_rate: number;
    worst_case_default_rate: number;
    average_stability_score: number;
    worst_case_stability_score: number;
    run_id: number;
}

export interface MemberCreate {
    name: string;
    monthly_income: number;
    monthly_expenses: number;
    emergency_reserve: number;
    trust_score: number;
    risk_score: number;
}

export interface ExposureCreate {
    lender_id: number;
    borrower_id: number;
    exposure_amount: number;
    repayment_probability: number;
}

export const cfssApi = {
    // Community
    seedCommunity: async (count: number = 50) => {
        const res = await api.post(`/community?member_count=${count}`);
        return res.data;
    },
    deleteCommunity: async () => {
        const res = await api.delete("/community");
        return res.data;
    },

    // Members CRUD
    getMembers: async (): Promise<Member[]> => {
        const res = await api.get("/member?limit=200");
        return res.data;
    },
    createMember: async (data: MemberCreate): Promise<Member> => {
        const res = await api.post("/member", data);
        return res.data;
    },
    updateMember: async (id: number, data: MemberCreate): Promise<Member> => {
        const res = await api.put(`/member/${id}`, data);
        return res.data;
    },
    deleteMember: async (id: number) => {
        const res = await api.delete(`/member/${id}`);
        return res.data;
    },

    // Exposures CRUD
    getExposures: async (): Promise<Exposure[]> => {
        const res = await api.get("/exposure?limit=500");
        return res.data;
    },
    createExposure: async (data: ExposureCreate): Promise<Exposure> => {
        const res = await api.post("/exposure", data);
        return res.data;
    },
    updateExposure: async (id: number, data: ExposureCreate): Promise<Exposure> => {
        const res = await api.put(`/exposure/${id}`, data);
        return res.data;
    },
    deleteExposure: async (id: number) => {
        const res = await api.delete(`/exposure/${id}`);
        return res.data;
    },

    // Analysis
    getStabilityScore: async (): Promise<StabilityScore> => {
        const res = await api.get("/stability-score");
        return res.data;
    },
    getRecommendations: async (): Promise<{ recommendations: Recommendation[] }> => {
        const res = await api.get("/recommendations");
        return res.data;
    },
    getGraphMetrics: async (): Promise<GraphMetrics> => {
        const res = await api.get("/graph-metrics");
        return res.data;
    },

    // Simulation
    runSimulation: async (weeks: number = 52, scenario: string = "baseline"): Promise<SimulationTimeSeries> => {
        const res = await api.post("/simulate", { weeks, scenario });
        return res.data;
    },

    // Stress Testing
    runStressTest: async (
        scenario: "income_shock" | "expense_spike" | "random_defaults" | "targeted_shock",
        shock_param: number,
        iterations: number = 1,
        weeks: number = 52,
    ): Promise<StressTestResult> => {
        const res = await api.post("/stress-test", { scenario, weeks, iterations, shock_param });
        return res.data;
    },

    // Report
    getReport: async (): Promise<Blob> => {
        const res = await api.get("/report", { responseType: "blob" });
        return res.data;
    },
};
