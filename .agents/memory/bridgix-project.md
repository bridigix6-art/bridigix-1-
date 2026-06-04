---
name: Bridgix project structure
description: Stack, routing, key conventions for the Bridgix landing page artifact
---

# Bridgix Project

**Stack:** React + Vite (v7) + Tailwind v4 + Framer Motion + wouter router  
**Monorepo path:** `artifacts/bridgix`  
**Preview path:** `/` (root)

## Routing
- Uses wouter with `<WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>` in App.tsx
- Routes: `/` (Home), `/join` (JoinPage), catch-all NotFound
- Navigation with `useLocation` hook: `const [, navigate] = useLocation()`

## Key assets
- Henna M. photo: `pexels-mikhail-nilov-8730389_1780508877001.jpg`
- Halftone dark bg: `Screenshot_2026-06-02-12-14-14-817_com.android.chrome-edit_1780508877052.jpg`
- Bridgix logo: `logo-original_1780481869651.jpg`
- Blob sticker: `gradient-colors-with-blurry-effect-abstract-shape-element-png__1780481869559.jpg`

## Design conventions
- Brand colors: #1A7A4A (green), #34D399 (emerald), #F5C518 (gold), #d97706 (amber)
- No purple/pink in new sections (green+gold palette only)
- Gradient borders use `padding: "1px"; background: gradBorder; borderRadius` wrapper pattern
- ChatModal is a right-side drawer (440px wide, full height, slides from right)
- CTABanner overlaps footer with `rounded-t-[28px] rounded-b-none`

**Why:** These conventions were applied across a comprehensive redesign and must be maintained for visual consistency.
