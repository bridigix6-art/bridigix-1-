---
name: Bridgix API server
description: Express API at artifacts/api-server, Groq LLM integration details
---

# Bridgix API Server

**Path:** `artifacts/api-server`  
**Port:** 8080  
**Chat route:** POST `/api/chat` (proxied by Vite frontend as `/api/chat`)

## Groq integration
- SDK: `groq-sdk` package
- Model: `llama-3.3-70b-versatile`
- Key: `GROQ_API_KEY` env var (shared, not a secret)
- When intake is complete the model returns exactly `INTAKE_COMPLETE` — frontend detects this and shows completion panel

## System prompt
- 10-question intake hierarchy for founder job requirements
- Conversational, not form-like; one question at a time
- Collects: company/stage, role, stack, ownership scope, team, previous attempts, bad hire criteria, timeline, budget, contact info

**Why:** Model was switched from OpenAI to Groq for speed. The INTAKE_COMPLETE sentinel is the handshake — do not change it without updating ChatModal.tsx detection logic.
