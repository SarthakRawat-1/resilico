import networkx as nx
from typing import List, Dict

def build_community_graph(members: List, exposures: List) -> nx.DiGraph:
    G = nx.DiGraph()
    
    for member in members:
        G.add_node(
            member.id, 
            name=member.name,
            income=member.monthly_income,
            expenses=member.monthly_expenses,
            reserve=member.emergency_reserve,
            trust=member.trust_score,
            risk=member.risk_score
        )
        
    for exp in exposures:
        G.add_edge(
            exp.borrower_id, 
            exp.lender_id, 
            amount=exp.exposure_amount,
            probability=exp.repayment_probability
        )
        
    return G

def compute_degree_centrality(G: nx.DiGraph) -> Dict[int, float]:
    return nx.degree_centrality(G)

def compute_weighted_exposure(G: nx.DiGraph) -> Dict[int, float]:
    exposure = {}
    for node in G.nodes():
        total_in = sum([data['amount'] for u, v, data in G.in_edges(node, data=True)])
        exposure[node] = total_in
    return exposure

def compute_trust_propagation(G: nx.DiGraph) -> Dict[int, float]:
    try:
        pr = nx.pagerank(G, weight='probability')
        return pr
    except Exception:
        return {node: 0.0 for node in G.nodes()}

def compute_risk_concentration(G: nx.DiGraph) -> Dict[int, float]:
    risk = {}
    for node in G.nodes():
        node_data = G.nodes[node]
        reserve = node_data.get('reserve', 0)
        total_loaned_out = sum([data['amount'] for u, v, data in G.in_edges(node, data=True)])
        
        if reserve <= 0:
            risk[node] = 1.0 if total_loaned_out > 0 else 0.0
        else:
            risk[node] = min(1.0, total_loaned_out / reserve)
    return risk
