import copy
import random
from typing import Dict, Any, List
import networkx as nx

from app.services.engines.graph import build_community_graph
from app.services.engines.simulation import simulate_liquidity_week
from app.services.engines.cascade import propagate_default
from app.services.analysis.stability import compute_stability_index

def _build_state(members) -> Dict[int, Any]:
    return {
        m.id: {
            "name": m.name,
            "monthly_income": m.monthly_income,
            "monthly_expenses": m.monthly_expenses,
            "emergency_reserve": m.emergency_reserve,
            "liquid_assets": m.emergency_reserve,
            "is_distressed": False
        }
        for m in members
    }

def _run_single_simulation(members, exposures, weeks: int, state: Dict[int, Any]) -> Dict[str, Any]:
    for week in range(1, weeks + 1):
        step = simulate_liquidity_week(state, exposures)
        state = step["state"]
        if step["distressed"]:
            G = build_community_graph(members, exposures)
            cascade_res = propagate_default(step["distressed"], G, state)
            state = cascade_res["state"]

    total = len(state)
    defaults = sum(1 for s in state.values() if s["is_distressed"])
    default_rate = defaults / max(total, 1)

    G = build_community_graph(members, exposures)
    stability = compute_stability_index(state, G)

    return {
        "default_rate": default_rate,
        "defaults": defaults,
        "stability_score": stability["stability_index"],
        "final_state": state,
    }


def apply_income_shock(members, percentage: float):
    factor = 1 - (percentage / 100.0)
    for m in members:
        m.monthly_income *= factor

def apply_expense_spike(members, percentage: float):
    factor = 1 + (percentage / 100.0)
    for m in members:
        m.monthly_expenses *= factor

def apply_random_defaults(state: Dict[int, Any], count: int):
    healthy = [mid for mid, s in state.items() if not s["is_distressed"]]
    to_default = random.sample(healthy, min(count, len(healthy)))
    for mid in to_default:
        state[mid]["is_distressed"] = True
        state[mid]["liquid_assets"] = -1.0
    return to_default

def apply_targeted_shock(state: Dict[int, Any], G: nx.DiGraph):
    centrality = nx.degree_centrality(G)
    if not centrality:
        return []
    most_central = max(centrality, key=centrality.get)
    if most_central in state and not state[most_central]["is_distressed"]:
        state[most_central]["is_distressed"] = True
        state[most_central]["liquid_assets"] = -1.0
        return [most_central]
    return []


def run_stress_test(
    members, exposures, scenario: str, weeks: int = 52,
    iterations: int = 1, shock_param: float = 30.0
) -> Dict[str, Any]:
    results = []

    for _ in range(iterations):
        members_copy = copy.deepcopy(members)
        state = _build_state(members_copy)
        G = build_community_graph(members_copy, exposures)

        if scenario == "income_shock":
            apply_income_shock(members_copy, shock_param)
            state = _build_state(members_copy)
        elif scenario == "expense_spike":
            apply_expense_spike(members_copy, shock_param)
            state = _build_state(members_copy)
        elif scenario == "random_defaults":
            defaulted = apply_random_defaults(state, int(shock_param))
            if defaulted:
                cascade_res = propagate_default(defaulted, G, state)
                state = cascade_res["state"]
        elif scenario == "targeted_shock":
            defaulted = apply_targeted_shock(state, G)
            if defaulted:
                cascade_res = propagate_default(defaulted, G, state)
                state = cascade_res["state"]

        result = _run_single_simulation(members_copy, exposures, weeks, state)
        results.append(result)

    default_rates = [r["default_rate"] for r in results]
    stability_scores = [r["stability_score"] for r in results]

    return {
        "scenario": scenario,
        "iterations": iterations,
        "weeks": weeks,
        "shock_param": shock_param,
        "average_default_rate": round(sum(default_rates) / len(default_rates), 4),
        "worst_case_default_rate": round(max(default_rates), 4),
        "average_stability_score": round(sum(stability_scores) / len(stability_scores), 2),
        "worst_case_stability_score": round(min(stability_scores), 2),
    }
