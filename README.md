# Haqdaar — हक़दार

> *"Millions of families miss benefits they're entitled to because nobody tells them. Haqdaar tells them in their own language, and never guesses."*

**Haqdaar** ("rightful claimant") is a mobile-first web app that audits a whole family's eligibility for Indian government schemes. A person describes their family in Hindi or English, by voice or text, and Haqdaar uses a **deterministic rules engine** (never an LLM) to decide eligibility and show exactly what to do next.

## Architecture

```
User (phone, voice/text) → CloudFront + S3 → API Gateway HTTP API → Lambda (Python 3.12)
                                                                        ├─ Strands Agent → Bedrock (LLM: extract + explain)
                                                                        ├─ Eligibility Engine (JSON / Cedar policies)
                                                                        └─ DynamoDB (sessions, TTL 24h)
```

## AWS Services Used

| Service | Purpose |
|---|---|
| **Amazon S3 + CloudFront** | Static frontend hosting |
| **API Gateway (HTTP API)** | REST API with CORS and throttling |
| **AWS Lambda** | Serverless Python backend |
| **Amazon DynamoDB** | Session storage with 24h TTL |
| **Amazon Bedrock** | LLM for conversational fact extraction |
| **IAM** | Least-privilege access |
| **CloudWatch Logs** | Monitoring (7-day retention) |

**Open Source:** Strands Agents SDK, Cedar (`cedarpy`), AWS SAM CLI

## Repository Structure

```
├─ README.md, DECISIONS.md, VERIFICATION.md
├─ template.yaml              # AWS SAM
├─ Makefile
├─ backend/
│  ├─ app.py                  # Lambda handler + routing
│  ├─ agent.py                # Strands agent (+ mock for local dev)
│  ├─ models.py               # Pydantic models
│  ├─ store.py                # DynamoDB session store
│  ├─ engine/criteria.py      # Deterministic eligibility engine
│  ├─ catalog/schemes.json    # Scheme rules (single source of truth)
│  └─ tests/
├─ scripts/
│  └─ bedrock_smoke_test.py
└─ frontend/                  # Vite + React + TypeScript + Tailwind
   └─ src/ (App.tsx, i18n/, index.css)
```

## Run Locally

```bash
# Backend (mock mode, no AWS needed)
cd backend
pip install -r requirements.txt
python local_server.py

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## Deploy to AWS

```bash
sam build --use-container
sam deploy --guided
# Then build frontend with the API URL:
VITE_API_URL=<ApiUrl> npm run build --prefix frontend
aws s3 sync frontend/dist s3://<bucket> --delete
```

## Limitations

- All scheme rules are **PROVISIONAL** — see `VERIFICATION.md` for status per scheme.
- This is guidance, not a legal determination. Final eligibility is confirmed by the official office.
- Sessions auto-expire in 24 hours; no personal data is retained.
- Voice input requires Chrome/Android.

## What I Learned

*TODO: Fill in before submission.*

## Demo Video

*TODO: Link to 3-minute demo video.*
