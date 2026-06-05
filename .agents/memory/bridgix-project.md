---
name: Bridigix project stack and routing
description: Frontend stack, routing, branding, and asset conventions for the Bridigix hiring platform
---

# Bridigix Project

**Brand name: Bridigix** (not "Bridgix" — note the extra 'i' — easy to miss)

**Stack:** React + Vite (v7) + Tailwind v4 + Framer Motion + wouter router  
**Monorepo path:** `artifacts/bridgix`  
**Preview path:** `/` (root)

## Routing
- Uses wouter with `<WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>` in App.tsx
- Routes: `/` (Home), `/join` (JoinPage with back button), `/admin` (AdminPage), catch-all NotFound

## Key assets (all imported via @assets/ alias)
- Logo (green gear): `Screenshot_2026-06-04-07-57-10-533_com.canva.editor-edit_17805_1780625194177.jpg`
- Henna M. photo: `pexels-mikhail-nilov-8730389_1780508877001_1780625194226.jpg`
- Halftone bg (RolesWePlace): `halftone-bg_1780625194240.jpg`
- Blob sticker: `gradient-colors-with-blurry-effect-abstract-shape-element-png__1780481869559.jpg`

## Supabase
- Frontend client: `src/lib/supabase.ts` (anon key hardcoded — public key, safe)
- Tables needed (create manually in Supabase dashboard):
  - `chat_conversations` (id UUID PK, email TEXT UNIQUE, messages JSONB, ip_address TEXT, user_agent TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
  - `join_applications` (id UUID PK, name TEXT, email TEXT, form_data JSONB, ip_address TEXT, created_at TIMESTAMPTZ)
- Admin panel at `/admin` — password: ADMIN_PASSWORD env var (currently "bridigix2025admin")

## Cookies / localStorage
- `bridigix_tz` — timezone string cookie (set on first visit, 1yr)
- `bridigix_visited` — visit tracking cookie
- `bridigix_chat` localStorage — chat session persistence

## Design conventions
- Brand colors: #1A7A4A (green), #34D399 (emerald), #F5C518 (gold)
- Nav: thinner pill nav that floats when scrolled; logo click scrolls to top
- ChatModal: full-screen overlay; greeting centered when no messages; first AI message = "Tell me a bit about what you're building"; last question = "who am I speaking with and where should I send the profiles?"
- AI persona: "Bridigix hiring partner" (not "Jordan")
- ProcessAccordion: AnimatePresence smooth height animation on open/close

**Why:** Comprehensive rebrand + feature build. Brand name mistake (Bridgix vs Bridigix) recurs — always check.
