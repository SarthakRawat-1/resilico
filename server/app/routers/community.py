from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models
from app.db.seed import seed_demo_data

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(tags=["Community"])

@router.post("/community")
@limiter.limit("15/minute")
def create_community(request: Request, member_count: int = 50, db: Session = Depends(get_db)):
    if member_count < 10 or member_count > 200:
        raise HTTPException(status_code=400, detail="Member count must be between 10 and 200")
    return seed_demo_data(db, member_count)

@router.delete("/community")
@limiter.limit("15/minute")
def delete_community(request: Request, db: Session = Depends(get_db)):
    db.query(models.SimulationResult).delete()
    db.query(models.StressTestResult).delete()
    db.query(models.SimulationRun).delete()
    db.query(models.Exposure).delete()
    db.query(models.Member).delete()
    db.commit()
    return {"message": "Community data cleared"}
