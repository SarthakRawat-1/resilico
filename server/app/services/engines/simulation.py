from typing import List, Dict, Any

def simulate_liquidity_week(members_state: Dict[int, Any], exposures: List[Any]) -> Dict[str, Any]:
    distressed_nodes = []
    
    for m_id, state in members_state.items():
        if state['is_distressed']:
            continue

        weekly_income = state['monthly_income'] / 4.0
        weekly_expenses = state['monthly_expenses'] / 4.0
        
        state['liquid_assets'] += weekly_income
        state['liquid_assets'] -= weekly_expenses
        
        upcoming_obligations = 0.0
        
        for exp in exposures:
            if exp.borrower_id == m_id:
                due = exp.exposure_amount * 0.05
                upcoming_obligations += due
                
                if state['liquid_assets'] >= due:
                    state['liquid_assets'] -= due
                    lender_id = exp.lender_id
                    if lender_id in members_state and not members_state[lender_id]['is_distressed']:
                        members_state[lender_id]['liquid_assets'] += due
        
        operational_need = weekly_expenses + upcoming_obligations
        if state['liquid_assets'] > operational_need:
            state['emergency_reserve'] = state['liquid_assets'] - operational_need
        else:
            state['emergency_reserve'] = max(0, state['emergency_reserve'] - (operational_need - state['liquid_assets']))
        
        lcr = 999.0
        if upcoming_obligations > 0:
             lcr = state['liquid_assets'] / upcoming_obligations
        
        if lcr < 1.0 or state['liquid_assets'] < 0:
            state['is_distressed'] = True
            distressed_nodes.append(m_id)
            
    return {
        "distressed": distressed_nodes,
        "state": members_state
    }
