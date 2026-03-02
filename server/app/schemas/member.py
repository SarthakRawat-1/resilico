from pydantic import BaseModel, Field

class MemberBase(BaseModel):
    name: str
    monthly_income: float = 0.0
    monthly_expenses: float = 0.0
    emergency_reserve: float = 0.0
    trust_score: float = Field(default=1.0, ge=0.0, le=1.0)
    risk_score: float = Field(default=0.0, ge=0.0, le=1.0)

class MemberCreate(MemberBase):
    pass

class MemberResponse(MemberBase):
    id: int
    
    class Config:
        from_attributes = True
