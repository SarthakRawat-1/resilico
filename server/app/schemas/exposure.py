from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ExposureBase(BaseModel):
    lender_id: int
    borrower_id: int
    exposure_amount: float
    repayment_probability: float = Field(default=1.0, ge=0.0, le=1.0)
    last_payment_date: Optional[datetime] = None

class ExposureCreate(ExposureBase):
    pass

class ExposureResponse(ExposureBase):
    id: int

    class Config:
        from_attributes = True
