import networkx as nx
from typing import List, Dict, Any

def propagate_default(defaulting_members: List[int], G: nx.DiGraph, current_state: Dict[int, Any]) -> Dict[str, Any]:
    queue = list(defaulting_members)
    processed = set()
    cascade_depth = 0
    total_defaults = len(defaulting_members)
    loss_distribution: Dict[int, float] = {}
    contagion_edges = []
    
    while queue:
        current_batch = queue[:]
        queue = []
        
        for borrower_id in current_batch:
            if borrower_id in processed:
                continue
            processed.add(borrower_id)
            
            for u, lender_id, data in G.out_edges(borrower_id, data=True):
                exposure = data.get('amount', 0)
                
                if lender_id not in current_state:
                    continue
                    
                lender_state = current_state[lender_id]
                
                loss_distribution[lender_id] = loss_distribution.get(lender_id, 0) + exposure
                contagion_edges.append({"from": borrower_id, "to": lender_id, "loss": exposure})
                
                if not lender_state.get('is_distressed', False):
                    lender_state['liquid_assets'] -= exposure
                    
                    # Formal LCR: liquid_assets / total_upcoming_obligations
                    total_obligations = sum(
                        e_data.get('amount', 0) * 0.05
                        for _, _, e_data in G.in_edges(lender_id, data=True)
                    )
                    lcr = 999.0
                    if total_obligations > 0:
                        lcr = lender_state['liquid_assets'] / total_obligations
                    
                    if lcr < 1.0 or lender_state['liquid_assets'] < 0:
                        lender_state['is_distressed'] = True
                        queue.append(lender_id)
                        total_defaults += 1
                        
        if queue:
            cascade_depth += 1
            
    return {
        "cascade_depth": cascade_depth,
        "total_defaults": total_defaults,
        "processed_nodes": list(processed),
        "loss_distribution": loss_distribution,
        "contagion_graph_snapshot": contagion_edges,
        "state": current_state
    }

