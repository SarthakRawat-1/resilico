from pydantic import BaseModel
from datetime import datetime

class SimulationConfig(BaseModel):
    weeks: int = 52
    scenario: str = "baseline"

class SimulationRunResponse(BaseModel):
    id: int
    scenario_name: str
    weeks: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class SimulationResultResponse(BaseModel):
    id: int
    run_id: int
    week: int
    member_id: int
    liquidity: float
    is_distressed: bool

    class Config:
        from_attributes = True

class StressTestConfig(BaseModel):
    scenario: str = "income_shock"
    weeks: int = 52
    iterations: int = 1
    shock_param: float = 30.0
