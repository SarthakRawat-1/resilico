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
    """
    Compute PageRank-based trust propagation through the network.
    Returns normalized scores between 0 and 1.
    """
    if G.number_of_nodes() == 0:
        return {}
    
    try:
        # Use weight parameter for weighted PageRank
        pr = nx.pagerank(G, weight='probability', alpha=0.85, max_iter=100)
        
        # Normalize to make values more readable (scale up from very small values)
        if pr:
            max_pr = max(pr.values()) if pr.values() else 1.0
            if max_pr > 0:
                pr = {node: (score / max_pr) for node, score in pr.items()}
        
        return pr
    except Exception as e:
        print(f"PageRank computation failed: {e}")
        # Return uniform distribution as fallback
        num_nodes = G.number_of_nodes()
        return {node: 1.0 / num_nodes for node in G.nodes()}

def compute_risk_concentration(G: nx.DiGraph) -> Dict[int, float]:
    """
    Compute risk concentration as the ratio of total money lent out to emergency reserves.
    Higher values indicate more risk (lending out more than reserves).
    """
    risk = {}
    for node in G.nodes():
        node_data = G.nodes[node]
        reserve = node_data.get('reserve', 0)
        
        # Sum of money this person has lent OUT (outgoing edges from borrower to lender)
        # In the graph, edges go from borrower -> lender, so we need OUT edges
        total_loaned_out = sum([data['amount'] for u, v, data in G.out_edges(node, data=True)])
        
        if reserve <= 0:
            # If no reserves, risk is maximum if they lent money, otherwise 0
            risk[node] = 1.0 if total_loaned_out > 0 else 0.0
        else:
            # Risk is ratio of loaned amount to reserves (can exceed 1.0)
            risk[node] = total_loaned_out / reserve
    
    return risk
