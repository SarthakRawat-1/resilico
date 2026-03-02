import networkx as nx
from typing import Dict, Any
from app.services.engines.graph import compute_risk_concentration

def compute_stability_index(
    members_state: Dict[int, Any],
    G: nx.DiGraph
) -> Dict[str, Any]:
    total = len(members_state)
    if total == 0:
        return {"stability_index": 0.0, "components": {}}

    distressed = sum(1 for s in members_state.values() if s.get("is_distressed", False))
    default_rate = distressed / total

    lcr_values = []
    for s in members_state.values():
        expenses = s.get("monthly_expenses", 1)
        if expenses > 0:
            lcr_values.append(min(s.get("liquid_assets", 0) / expenses, 3.0))
        else:
            lcr_values.append(3.0)
    avg_lcr = (sum(lcr_values) / len(lcr_values)) / 3.0

    risk_conc = compute_risk_concentration(G)
    avg_risk_conc = sum(risk_conc.values()) / max(len(risk_conc), 1)

    if G.number_of_nodes() > 1:
        num_scc = nx.number_strongly_connected_components(G)
        resilience = 1.0 - (num_scc / G.number_of_nodes())
    else:
        resilience = 0.0

    raw = (
        (1 - default_rate) * 0.4
        + avg_lcr * 0.3
        + (1 - avg_risk_conc) * 0.2
        + resilience * 0.1
    )

    stability_index = round(max(0, min(100, raw * 100)), 2)

    return {
        "stability_index": stability_index,
        "components": {
            "default_rate": round(default_rate, 4),
            "avg_liquidity_ratio": round(avg_lcr, 4),
            "risk_concentration_index": round(avg_risk_conc, 4),
            "network_resilience_score": round(resilience, 4),
        }
    }
