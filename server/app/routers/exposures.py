from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.db import models
from app.schemas.exposure import ExposureCreate, ExposureResponse

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(tags=["Exposures"])

@router.post("/exposure", response_model=ExposureResponse)
@limiter.limit("15/minute")
def create_exposure(request: Request, exposure: ExposureCreate, db: Session = Depends(get_db)):
    if exposure.lender_id == exposure.borrower_id:
        raise HTTPException(status_code=400, detail="A member cannot lend to themselves")
    
    lender = db.query(models.Member).filter(models.Member.id == exposure.lender_id).first()
    borrower = db.query(models.Member).filter(models.Member.id == exposure.borrower_id).first()
    if not lender or not borrower:
        raise HTTPException(status_code=400, detail="Lender or borrower not found")
        
    db_exposure = models.Exposure(**exposure.model_dump())
    db.add(db_exposure)
    db.commit()
    db.refresh(db_exposure)
    return db_exposure

@router.get("/exposure", response_model=List[ExposureResponse])
@limiter.limit("30/minute")
def get_exposures(request: Request, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Exposure).offset(skip).limit(limit).all()

@router.put("/exposure/{exposure_id}", response_model=ExposureResponse)
@limiter.limit("15/minute")
def update_exposure(request: Request, exposure_id: int, exposure: ExposureCreate, db: Session = Depends(get_db)):
    db_exposure = db.query(models.Exposure).filter(models.Exposure.id == exposure_id).first()
    if not db_exposure:
        raise HTTPException(status_code=404, detail="Exposure not found")
    if exposure.lender_id == exposure.borrower_id:
        raise HTTPException(status_code=400, detail="A member cannot lend to themselves")
    for key, value in exposure.model_dump().items():
        setattr(db_exposure, key, value)
    db.commit()
    db.refresh(db_exposure)
    return db_exposure

@router.delete("/exposure/{exposure_id}")
@limiter.limit("15/minute")
def delete_exposure(request: Request, exposure_id: int, db: Session = Depends(get_db)):
    db_exposure = db.query(models.Exposure).filter(models.Exposure.id == exposure_id).first()
    if not db_exposure:
        raise HTTPException(status_code=404, detail="Exposure not found")
    db.delete(db_exposure)
    db.commit()
    return {"message": f"Exposure {exposure_id} deleted"}
