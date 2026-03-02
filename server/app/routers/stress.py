from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models
from app.schemas.simulation import StressTestConfig
from app.services.analysis.stress import run_stress_test

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(tags=["Stress Testing"])

@router.post("/stress-test")
@limiter.limit("5/minute")
def run_stress_test_endpoint(request: Request, config: StressTestConfig, db: Session = Depends(get_db)):
    members = db.query(models.Member).all()
    exposures = db.query(models.Exposure).all()
    
    if not members:
        raise HTTPException(status_code=400, detail="No members in the community")
    
    if config.iterations < 1 or config.iterations > 1000:
        raise HTTPException(status_code=400, detail="Iterations must be between 1 and 1000")
    
    valid_scenarios = ["income_shock", "random_defaults", "expense_spike", "targeted_shock"]
    if config.scenario not in valid_scenarios:
        raise HTTPException(status_code=400, detail=f"Scenario must be one of {valid_scenarios}")
    
    result = run_stress_test(
        members=members,
        exposures=exposures,
        scenario=config.scenario,
        weeks=config.weeks,
        iterations=config.iterations,
        shock_param=config.shock_param
    )
    
    db_run = models.SimulationRun(scenario_name=config.scenario, weeks=config.weeks)
    db.add(db_run)
    db.commit()
    db.refresh(db_run)
    
    db_stress = models.StressTestResult(
        run_id=db_run.id,
        average_default_rate=result["average_default_rate"],
        worst_case_default_rate=result["worst_case_default_rate"],
        stability_score=result["average_stability_score"]
    )
    db.add(db_stress)
    db.commit()
    
    result["run_id"] = db_run.id
    return result

@router.post("/stress-test-async")
@limiter.limit("5/minute")
def run_async_stress_test(request: Request, config: StressTestConfig, db: Session = Depends(get_db)):
    members = db.query(models.Member).all()
    if not members:
        raise HTTPException(status_code=400, detail="No members in the community")
    if config.iterations < 1 or config.iterations > 1000:
        raise HTTPException(status_code=400, detail="Iterations must be between 1 and 1000")
    
    try:
        from app.services.infra.tasks import run_async_stress_test as celery_task
        task = celery_task.delay(config.scenario, config.weeks, config.iterations, config.shock_param)
        return {"task_id": task.id, "status": "PENDING"}
    except Exception:
        return run_stress_test_endpoint(request, config, db)

@router.get("/task-status/{task_id}")
@limiter.limit("30/minute")
def get_task_status(request: Request, task_id: str):
    try:
        from app.services.infra.celery import celery_app
        result = celery_app.AsyncResult(task_id)
        return {
            "task_id": task_id,
            "status": result.status,
            "result": result.result if result.ready() else None,
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Celery not configured")
