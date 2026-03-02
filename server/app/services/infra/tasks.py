from app.services.infra.celery import celery_app
from app.db.database import SessionLocal
from app.db import models
from app.services.analysis.stress import run_stress_test

@celery_app.task(bind=True, name="run_async_stress_test")
def run_async_stress_test(self, scenario: str, weeks: int, iterations: int, shock_param: float):
    db = SessionLocal()
    try:
        members = db.query(models.Member).all()
        exposures = db.query(models.Exposure).all()
        
        if not members:
            return {"error": "No members in the community"}
        
        result = run_stress_test(
            members=members,
            exposures=exposures,
            scenario=scenario,
            weeks=weeks,
            iterations=iterations,
            shock_param=shock_param,
        )
        
        db_run = models.SimulationRun(scenario_name=scenario, weeks=weeks)
        db.add(db_run)
        db.commit()
        db.refresh(db_run)
        
        db_stress = models.StressTestResult(
            run_id=db_run.id,
            average_default_rate=result["average_default_rate"],
            worst_case_default_rate=result["worst_case_default_rate"],
            stability_score=result["average_stability_score"],
        )
        db.add(db_stress)
        db.commit()
        
        result["run_id"] = db_run.id
        return result
    finally:
        db.close()
