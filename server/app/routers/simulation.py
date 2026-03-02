from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models
from app.schemas.simulation import SimulationConfig
from app.services.engines.graph import build_community_graph
from app.services.engines.simulation import simulate_liquidity_week
from app.services.engines.cascade import propagate_default

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(tags=["Simulation"])

@router.post("/simulate")
@limiter.limit("5/minute")
def run_simulation(request: Request, config: SimulationConfig, db: Session = Depends(get_db)):
    
    members = db.query(models.Member).all()
    exposures = db.query(models.Exposure).all()
    
    if not members:
        raise HTTPException(status_code=400, detail="No members in the community")
    
    db_run = models.SimulationRun(scenario_name=config.scenario, weeks=config.weeks)
    db.add(db_run)
    db.commit()
    db.refresh(db_run)
    
    state = {
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
    
    history = []
    
    for week in range(1, config.weeks + 1):
        step_result = simulate_liquidity_week(state, exposures)
        state = step_result["state"]
        newly_distressed = step_result["distressed"]
        
        cascade_data = None
        if newly_distressed:
            G = build_community_graph(members, exposures)
            cascade_data = propagate_default(newly_distressed, G, state)
            state = cascade_data["state"]
        
        for m_id, s in state.items():
            db_result = models.SimulationResult(
                run_id=db_run.id,
                week=week,
                member_id=m_id,
                liquidity=s["liquid_assets"],
                is_distressed=s["is_distressed"]
            )
            db.add(db_result)
            
        history.append({
            "week": week,
            "total_liquidity": sum(s["liquid_assets"] for s in state.values()),
            "distressed_count": sum(1 for s in state.values() if s["is_distressed"]),
            "cascade": {
                "depth": cascade_data["cascade_depth"],
                "total_defaults": cascade_data["total_defaults"],
                "loss_distribution": cascade_data["loss_distribution"],
                "contagion_graph": cascade_data["contagion_graph_snapshot"]
            } if cascade_data else None
        })
    
    db.commit()
        
    return {
        "run_id": db_run.id,
        "scenario": config.scenario,
        "weeks": config.weeks,
        "time_series": history
    }
