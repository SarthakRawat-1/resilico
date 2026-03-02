import random
from typing import List, Tuple
from sqlalchemy.orm import Session
from app.db import models

INCOME_BRACKETS = [
    (8000, 12000, 0.15),
    (12000, 20000, 0.25),
    (20000, 35000, 0.30),
    (35000, 60000, 0.20),
    (60000, 100000, 0.10),
]

FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan",
    "Krishna", "Ishaan", "Ananya", "Diya", "Priya", "Sneha", "Kavya", "Meera",
    "Riya", "Sakshi", "Pooja", "Neha", "Rahul", "Deepak", "Sunil", "Manoj",
    "Vikram", "Rohit", "Amit", "Sanjay", "Rajesh", "Mohan", "Lakshmi", "Geeta",
    "Sunita", "Rekha", "Kamla", "Savita", "Radha", "Suman", "Kiran", "Nandini",
    "Harish", "Ganesh", "Ramesh", "Suresh", "Dinesh", "Prakash", "Santosh",
    "Balaji", "Venkat", "Ravi",
]


def _pick_income() -> float:
    r = random.random()
    cumulative = 0.0
    for low, high, prob in INCOME_BRACKETS:
        cumulative += prob
        if r <= cumulative:
            return round(random.uniform(low, high), 2)
    return round(random.uniform(20000, 35000), 2)


def seed_demo_data(db: Session, member_count: int = 50) -> dict:
    db.query(models.SimulationResult).delete()
    db.query(models.StressTestResult).delete()
    db.query(models.SimulationRun).delete()
    db.query(models.Exposure).delete()
    db.query(models.Member).delete()
    db.commit()

    members = []
    names = random.sample(FIRST_NAMES, min(member_count, len(FIRST_NAMES)))
    while len(names) < member_count:
        names.append(f"Member_{len(names)+1}")

    for i in range(member_count):
        income = _pick_income()
        expense_ratio = random.uniform(0.5, 0.85)
        reserve_months = random.uniform(0.5, 4.0)

        member = models.Member(
            name=names[i],
            monthly_income=income,
            monthly_expenses=round(income * expense_ratio, 2),
            emergency_reserve=round(income * reserve_months, 2),
            trust_score=round(random.uniform(0.3, 1.0), 2),
            risk_score=round(random.uniform(0.0, 0.6), 2),
        )
        db.add(member)
        members.append(member)

    db.commit()
    for m in members:
        db.refresh(m)

    exposures_created = 0
    member_ids = [m.id for m in members]

    for lender in members:
        num_loans = random.randint(0, 3)
        potential_borrowers = [mid for mid in member_ids if mid != lender.id]
        borrowers = random.sample(potential_borrowers, min(num_loans, len(potential_borrowers)))

        for borrower_id in borrowers:
            exposure = models.Exposure(
                lender_id=lender.id,
                borrower_id=borrower_id,
                exposure_amount=round(random.uniform(1000, lender.monthly_income * 2), 2),
                repayment_probability=round(random.uniform(0.5, 0.98), 2),
            )
            db.add(exposure)
            exposures_created += 1

    db.commit()

    return {
        "members_created": member_count,
        "exposures_created": exposures_created,
    }
