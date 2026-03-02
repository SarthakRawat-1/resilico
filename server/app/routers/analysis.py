from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session
import copy

from app.db.database import get_db
from app.db import models
from app.services.engines.graph import (
    build_community_graph, compute_degree_centrality,
    compute_weighted_exposure, compute_trust_propagation, compute_risk_concentration
)
from app.services.engines.cascade import propagate_default
from app.services.analysis.stability import compute_stability_index
from app.services.analysis.policy import generate_recommendations

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(tags=["Analysis"])

@router.get("/graph-metrics")
@limiter.limit("30/minute")
def get_graph_metrics(request: Request, db: Session = Depends(get_db)):
    members = db.query(models.Member).all()
    exposures = db.query(models.Exposure).all()
    
    G = build_community_graph(members, exposures)
    
    return {
        "degree_centrality": compute_degree_centrality(G),
        "weighted_exposure": compute_weighted_exposure(G),
        "trust_propagation": compute_trust_propagation(G),
        "risk_concentration": compute_risk_concentration(G)
    }

@router.get("/stability-score")
@limiter.limit("30/minute")
def get_stability_score(request: Request, db: Session = Depends(get_db)):
    members = db.query(models.Member).all()
    exposures = db.query(models.Exposure).all()
    
    if not members:
        raise HTTPException(status_code=400, detail="No members in the community")
    
    state = {
        m.id: {
            "monthly_income": m.monthly_income,
            "monthly_expenses": m.monthly_expenses,
            "emergency_reserve": m.emergency_reserve,
            "liquid_assets": m.emergency_reserve,
            "is_distressed": False
        }
        for m in members
    }
    
    G = build_community_graph(members, exposures)
    return compute_stability_index(state, G)

@router.get("/recommendations")
@limiter.limit("30/minute")
def get_recommendations(request: Request, db: Session = Depends(get_db)):
    members = db.query(models.Member).all()
    exposures = db.query(models.Exposure).all()
    
    if not members:
        raise HTTPException(status_code=400, detail="No members in the community")
    
    state = {
        m.id: {
            "monthly_income": m.monthly_income,
            "monthly_expenses": m.monthly_expenses,
            "emergency_reserve": m.emergency_reserve,
            "liquid_assets": m.emergency_reserve,
            "is_distressed": False
        }
        for m in members
    }
    
    G = build_community_graph(members, exposures)
    stability = compute_stability_index(state, G)
    centrality = compute_degree_centrality(G)
    risk_conc = compute_risk_concentration(G)
    
    # Compute actual cascade_depth by simulating default of most central node
    cascade_depth = 0
    if centrality:
        most_central = max(centrality, key=centrality.get)
        probe_state = copy.deepcopy(state)
        if most_central in probe_state and not probe_state[most_central]["is_distressed"]:
            probe_state[most_central]["is_distressed"] = True
            probe_state[most_central]["liquid_assets"] = -1.0
            cascade_result = propagate_default([most_central], G, probe_state)
            cascade_depth = cascade_result["cascade_depth"]
    
    recs = generate_recommendations(
        default_rate=stability["components"]["default_rate"],
        cascade_depth=cascade_depth,
        centrality=centrality,
        risk_concentration=risk_conc,
        stability_score=stability["stability_index"]
    )
    
    return {"recommendations": recs}
