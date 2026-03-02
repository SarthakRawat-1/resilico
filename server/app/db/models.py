from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.db.database import Base

class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    monthly_income = Column(Float, default=0.0)
    monthly_expenses = Column(Float, default=0.0)
    emergency_reserve = Column(Float, default=0.0)
    trust_score = Column(Float, default=1.0)
    risk_score = Column(Float, default=0.0)

    loans_given = relationship("Exposure", foreign_keys="Exposure.lender_id", back_populates="lender")
    loans_received = relationship("Exposure", foreign_keys="Exposure.borrower_id", back_populates="borrower")


class Exposure(Base):
    __tablename__ = "exposures"

    id = Column(Integer, primary_key=True, index=True)
    lender_id = Column(Integer, ForeignKey("members.id"))
    borrower_id = Column(Integer, ForeignKey("members.id"))
    
    exposure_amount = Column(Float, default=0.0)
    repayment_probability = Column(Float, default=1.0)
    last_payment_date = Column(DateTime, nullable=True)

    lender = relationship("Member", foreign_keys=[lender_id], back_populates="loans_given")
    borrower = relationship("Member", foreign_keys=[borrower_id], back_populates="loans_received")


class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(Integer, primary_key=True, index=True)
    scenario_name = Column(String, default="baseline")
    weeks = Column(Integer, default=52)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    results = relationship("SimulationResult", back_populates="run")
    stress_results = relationship("StressTestResult", back_populates="run")


class SimulationResult(Base):
    __tablename__ = "simulation_results"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("simulation_runs.id"))
    week = Column(Integer)
    member_id = Column(Integer, ForeignKey("members.id"))
    
    liquidity = Column(Float)
    is_distressed = Column(Boolean, default=False)

    run = relationship("SimulationRun", back_populates="results")
    member = relationship("Member")


class StressTestResult(Base):
    __tablename__ = "stress_test_results"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("simulation_runs.id"))
    
    average_default_rate = Column(Float)
    worst_case_default_rate = Column(Float)
    stability_score = Column(Float)

    run = relationship("SimulationRun", back_populates="stress_results")
