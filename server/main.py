from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.db.database import engine, Base
from app.routers import members, exposures, community, simulation, analysis, stress, reports

Base.metadata.create_all(bind=engine)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Resilico API",
    description="API for simulating and stress-testing financial stability in small communities.",
    version="0.1.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

import os

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routers
app.include_router(members.router)
app.include_router(exposures.router)
app.include_router(community.router)
app.include_router(simulation.router)
app.include_router(analysis.router)
app.include_router(stress.router)
app.include_router(reports.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Resilico API"}
