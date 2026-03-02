from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.db import models
from app.schemas.member import MemberCreate, MemberResponse

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(tags=["Members"])

@router.post("/member", response_model=MemberResponse)
@limiter.limit("15/minute")
def create_member(request: Request, member: MemberCreate, db: Session = Depends(get_db)):
    db_member = models.Member(**member.model_dump())
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

@router.get("/member", response_model=List[MemberResponse])
@limiter.limit("30/minute")
def get_members(request: Request, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Member).offset(skip).limit(limit).all()

@router.put("/member/{member_id}", response_model=MemberResponse)
@limiter.limit("15/minute")
def update_member(request: Request, member_id: int, member: MemberCreate, db: Session = Depends(get_db)):
    db_member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")
    for key, value in member.model_dump().items():
        setattr(db_member, key, value)
    db.commit()
    db.refresh(db_member)
    return db_member

@router.delete("/member/{member_id}")
@limiter.limit("15/minute")
def delete_member(request: Request, member_id: int, db: Session = Depends(get_db)):
    db_member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")
    # Clean up related exposures
    db.query(models.Exposure).filter(
        (models.Exposure.lender_id == member_id) | (models.Exposure.borrower_id == member_id)
    ).delete(synchronize_session=False)
    db.delete(db_member)
    db.commit()
    return {"message": f"Member {member_id} deleted"}
