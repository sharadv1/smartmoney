# AI‑Driven Trading Journal — Product Requirements Document
**Version** 1.0 (living doc) | **Last updated** 2025‑04‑29  
**Author** sharad venkat

---

## 1 Purpose & Vision
Spreadsheets and broker exports make it tedious to capture trade rationale, manage partial exits, and review performance.  
The Trading Journal delivers a **zero‑code, AI‑assisted** workflow that:

* records every trade in seconds (manual form or CSV import)
* shows real‑time P/L, R‑multiple, and high‑water mark
* surfaces daily/weekly/monthly insights via calendar and KPI tiles
* auto‑generates plain‑language reviews so users improve faster


---

## 2 High‑Level Feature Map

| # | Page / Area | Core Elements |
|---|-------------|---------------|
| 1 | **Dashboard** | KPI tiles (Total P/L, Win‑rate, Avg R, Drawdown) • Month calendar P/L heat‑map • Recent‑trades table |
| 2 | **Trades** | Paginated, filterable list; filters: open/closed, win/loss, strategy, account, symbol, date‑range |
| 3 | **Journal** | Weekly entry with Weekly Plan & Weekly Review • Mon–Sun tabs each with Daily Plan/Review, KPI strip, closed‑trades list |
| 4 | **Trade Entry / Edit** | Modal form capturing rich metadata; live risk/reward panel; required fields enforced (instrument, entry date, entry price, qty, direction, stop, take‑profit, account, strategy) |
| 5 | **Settings** | CRUD for Instruments, Accounts, Strategies; data import/export; feature flags |

---

## 3 Goals & Success Metrics

| Goal | KPI | Target (MVP) |
|------|-----|--------------|
| Rapid entry & sync | Avg time to log a trade | ≤ 15 s |
| Accurate analytics | P/L discrepancy vs broker CSV | < 0.5 % |
| Insight generation | Trades with AI review | ≥ 90 % |
| Engagement | Weekly active users (alpha) | ≥ 50 |

---

## 4 Functional Requirements

### 4.1 Database Schema (Supabase / Postgres)

*Tables*

- **instruments** (id, symbol, description)  
- **accounts** (id, user_id FK, name, broker)  
- **strategies** (id, user_id FK, name, description)  
- **trades** (id, user_id FK, opened_at, instrument_id FK, direction, qty, entry_px, stop_px, take_px, account_id FK, strategy_id FK, notes, risk_total (generated), reward_total (generated), r_multiple (generated))  
- **trade_closures** (id, trade_id FK, closed_at, qty, price, fee, closure_type)  
- **journal_weeks** (id, user_id FK, week_start, weekly_plan, weekly_review)  
- **journal_days** (id, week_id FK, date, daily_plan, daily_review)

*Views / Functions* `v_daily_stats`, `v_weekly_stats`, `update_unrealized_pl()`

Row‑Level Security: all data scoped to the owner’s `user_id`.

### 4.2 API & Edge Functions
REST helpers via Supabase; Edge Function `price‑feed‑websocket` updates unrealized P/L; `/import/csv` function parses files and upserts trades & closures.

### 4.3 Trade Entry Requirements & Dynamic Risk/Reward
*Required fields:* instrument, entry datetime, entry price, quantity, direction, initial stop, take‑profit, account, strategy  
*Live panel while typing:*  ˜
Risk per‑unit, **Total risk $**, Reward per‑unit, **Total reward $**, **R‑multiple** (updates on every keystroke).  
Saved values persist to `trades` (`risk_total`, `reward_total`, `r_multiple`).
must be able to close trade with partial units; if any units remain open trade is still considered open but partially closed.  should be able to edit any and all partial closures. if a partial closure is deleted or the units are reduced in a way that the trade is no longer fully closed, it should return to an open state.
pl and r multiple are always calculated fields and should be based on user entered data like entry price, units, initial stop, and the contract specs ie tick size and tick value for futures.  calculated values should be centrally stored and shown in the ui wherever needed.  we should not have something like r multiple recalculated each time it needs to be shown on a different part of the ui.  it should only be recalculated when any of its inputs change.

### 4.4 Frontend (Next.js 14, App Router, TypeScript, shadcn/ui)
* Dashboard route (`/dashboard`) with KPI tiles, CalendarHeatmap, TradesTable.  
* Trades route (`/trades`) using TanStack DataTable with column filters & pagination.  
* Journal route (`/journal/[week]`) rendering WeeklyHeader + DayTabs; autosave on blur.  
* **TradeForm** component implements validation + live risk panel.  
* **Partial‑closure workflow:** Trade detail page ⇒ Close Position modal; quantity ≤ remaining; editing/deleting closures recalculates realized/unrealized P/L and can reopen the trade if units remain.  
* Responsive, dark/light theme, motion via Framer.

### 4.5 AI Services
OpenAI function call `analyzeTrade()` for post‑trade reviews; daily Edge job `patternDetector` writes findings to `insights`.

### 4.6 Dev‑Ops
Vercel frontend; Supabase Postgres; GitHub Actions (lint, test, build); preview URLs per PR.

---

## 5 Non‑Functional Requirements
Performance ≤ 200 ms TTFB; WCAG 2.1 AA accessibility; SOC‑2‑ready; scalable to 10 K trades ⁄ min.

---

## 6 Milestones

| Week | Deliverable |
|------|-------------|
| 1 | Schema + RLS in Supabase |
| 2 | Next.js scaffold deployed; auth working |
| 3 | Trade CRUD + live risk panel |
| 4 | Dashboard KPI tiles + calendar heat‑map |
| 5 | Journal pages + AI review function |
| 6 | Private beta & feedback loop |

---

## 7 Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Price feed mismatch inflates P/L | High | Single price source + nightly reconciliation |
| RLS misconfiguration | High | Automated tests + audit |
| AI feedback feels generic | Med | Prompt tuning with user examples |

---

## 8 Open Questions
1. Charting library preference (Recharts vs Visx)  
2. Scope and timing for automated performance & mindset analysis (Phase 2)  
3. Pricing model after beta (freemium vs one‑time)

---

*This file lives in Git and should be updated whenever scope changes.*
