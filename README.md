# Resilico 

**Community Financial Stability Simulator (CFSS)**

A full-stack web application that simulates and stress-tests the financial stability of small communities (10-200 members). Model systemic risk similar to how central banks stress-test financial institutions.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.13+-blue.svg)
![Next.js](https://img.shields.io/badge/next.js-16.1-black.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.133-009688.svg)

---

## 🎯 Overview

Resilico helps community financial organizations, microfinance institutions, and researchers understand and mitigate systemic risk in lending networks. By modeling members as nodes and loans as edges in a directed graph, the platform simulates liquidity flows, detects cascade failures, and provides AI-powered policy recommendations.

### Key Capabilities

- **Network Modeling** - Build detailed financial networks with member profiles and lending relationships
- **Liquidity Simulation** - Run week-by-week cash flow simulations tracking distress events
- **Cascade Detection** - Model how one default can trigger chain reactions through the network
- **Stress Testing** - Monte Carlo scenarios: income shocks, expense spikes, random/targeted defaults
- **Stability Scoring** - Composite 0-100 index measuring community financial resilience
- **AI Recommendations** - Intelligent policy suggestions powered by Groq AI

---

## Architecture

### Technology Stack

**Frontend**
- Next.js 16.1 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 for styling
- D3.js, Cytoscape, Recharts for visualizations
- Framer Motion for animations
- Axios for API communication

**Backend**
- FastAPI (Python 3.13+)
- SQLAlchemy ORM with PostgreSQL/SQLite
- NetworkX for graph analysis
- Celery + Redis for async processing
- ReportLab for PDF generation
- Groq API for AI recommendations

### Project Structure

```
resilico/
├── client/                 # Next.js frontend
│   ├── app/               # App router pages
│   │   ├── dashboard/     # Main dashboard
│   │   ├── data/          # Data management
│   │   ├── network/       # Network visualization
│   │   ├── simulation/    # Simulation interface
│   │   ├── stress-test/   # Stress testing
│   │   └── reports/       # Report generation
│   ├── components/        # Reusable UI components
│   ├── lib/              # API client & utilities
│   └── hooks/            # Custom React hooks
│
└── server/                # FastAPI backend
    ├── app/
    │   ├── db/           # Database models & seeding
    │   ├── schemas/      # Pydantic schemas
    │   ├── services/     # Business logic
    │   │   ├── engines/  # Core simulation engines
    │   │   ├── analysis/ # Stability & policy analysis
    │   │   └── infra/    # Celery tasks & reports
    │   └── routers/      # API endpoints
    └── main.py           # FastAPI application
```

---

## Getting Started

### Prerequisites

- Python 3.13+
- Node.js 18+
- PostgreSQL (optional, SQLite by default)
- Redis (optional, for async tasks)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/SarthakRawat-1/resilico.git
cd resilico
```

**2. Backend Setup**

```bash
cd server

# Install dependencies (using uv)
uv sync

# Or using pip
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
# (Tables auto-create on first run)

# Start the server
uv run uvicorn main:app --host 0.0.0.0 --port 8000
```

**3. Frontend Setup**

```bash
cd client

# Install dependencies
npm install

# Set environment variables
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000" > .env.local

# Start development server
npm run dev
```

**4. Optional: Redis & Celery (for async tasks)**

```bash
# Start Redis
redis-server

# Start Celery worker (in server directory)
cd server
celery -A app.services.infra.celery worker --loglevel=info
```

### Quick Start

1. Navigate to `http://localhost:3000`
2. Click "LAUNCH DASHBOARD"
3. Click "Generate Demo Community" to seed 50 members
4. Explore the dashboard, run simulations, and stress tests

---

## Core Features

### 1. Community Graph Engine

Build financial networks with detailed member profiles:

- **Members**: Income, expenses, emergency reserves, trust scores, risk scores
- **Exposures**: Lending relationships with amounts and repayment probabilities
- **Graph Metrics**: Degree centrality, weighted exposure, trust propagation, risk concentration

### 2. Liquidity Simulation

Discrete-time weekly simulation:

- Track income, expenses, and loan repayments
- Calculate Liquidity Coverage Ratio (LCR = liquid_assets / obligations)
- Identify distressed members (LCR < 1)
- Generate time-series data for visualization

### 3. Default Cascade Propagation

Model contagion effects:

- When a member defaults, lenders lose exposure amount
- Recursive propagation until system stabilizes
- Track cascade depth, total defaults, loss distribution
- Visualize contagion graph

### 4. Stress Testing

Four predefined scenarios with Monte Carlo support:

- **Income Shock**: Reduce all incomes by X%
- **Expense Spike**: Increase all expenses by Y%
- **Random Defaults**: Randomly default N members
- **Targeted Shock**: Default most central node

Run 1-1000 iterations to compute average and worst-case outcomes.

### 5. Stability Index

Composite score (0-100) measuring financial resilience:

```
Stability = (1 - default_rate) × 0.4
          + avg_liquidity_ratio × 0.3
          + (1 - risk_concentration) × 0.2
          + network_resilience × 0.1
```

### 6. AI Policy Recommendations

Rule-based engine enhanced by Groq AI:

- Emergency buffer increases
- Exposure caps on central nodes
- Diversification mandates
- Risk redistribution strategies
- Community stability alerts

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Sarthak Rawat**

---

**Built with ❤️ for community financial stability**