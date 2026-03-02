from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import Response
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models
from app.services.engines.graph import (
    build_community_graph, compute_degree_centrality, compute_risk_concentration
)
from app.services.analysis.stability import compute_stability_index
from app.services.analysis.policy import generate_recommendations
from app.services.infra.report import generate_pdf_report

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(tags=["Reports"])

@router.get("/report")
@limiter.limit("5/minute")
def download_report(request: Request, db: Session = Depends(get_db)):
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
    
    recs = generate_recommendations(
        default_rate=stability["components"]["default_rate"],
        cascade_depth=0,
        centrality=centrality,
        risk_concentration=risk_conc,
        stability_score=stability["stability_index"]
    )
    
    # Query actual stress test history from DB
    db_stress_results = (
        db.query(models.StressTestResult, models.SimulationRun)
        .join(models.SimulationRun, models.StressTestResult.run_id == models.SimulationRun.id)
        .order_by(models.SimulationRun.created_at.desc())
        .limit(10)
        .all()
    )
    stress_results = [
        {
            "scenario": run.scenario_name,
            "average_default_rate": st.average_default_rate,
            "worst_case_default_rate": st.worst_case_default_rate,
            "average_stability_score": st.stability_score,
        }
        for st, run in db_stress_results
    ]
    
    pdf_bytes = generate_pdf_report(
        stability_data=stability,
        stress_results=stress_results,
        recommendations=recs,
        member_count=len(members),
        exposure_count=len(exposures),
    )
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=resilico_stability_report.pdf"}
    )
