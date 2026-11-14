# BUSINESS COMMAND

> **A personal operating environment for a nine-venture portfolio.**  
> Built for single-operator command, tracking, and understanding without becoming a heavyweight CRM or a joyless corporate admin system.

---

## Overview

Business Command is an executive operating layer that sits above customer-level CRMs. It provides a real-time portfolio pulse across nine ventures:

1. **CollabCreateNFC** (Active — Physical review cards & field sales)
2. **Website Package** (Active — £75/mo direct debit managed websites)
3. **Collab Create Recruitment** (Pending — Recruitment service & media)
4. **Super Power Project** (Pending — Creative community & empowerment venture)
5. **Collab Create AI** (Pending — AI voice agents & automation solutions)
6. **Rest Assured Pet Recovery** (Pending — Specialist pet search & rescue)
7. **Uber Eats Referrals** (Paused — Referral model; inactivity alerts suppressed)
8. **UK Utility Guys Partnership** (Pending — Commercial energy brokerage)
9. **Substack Writing** (Active — Operator publications & reflective essays)

---

## Visual Design System: Warm Modernism

- **Canvas (Background):** `#F6F1E8`
- **Ink (Typography):** `#252820`
- **Coral (Primary CTA & Focus):** `#E98569`
- **Marigold (Celebrations & Milestones):** `#E8BC57`
- **Sage (Success & Health):** `#769B83`
- **Cornflower (Planning & Informational):** `#7796C9`
- **Lilac (AI & Incubating Ventures):** `#C5A1C9`
- **Clay (Warm Secondary Accent):** `#D7A17C`
- **Typography:** Plus Jakarta Sans (headings), Inter (interface), Playfair Display (editorial quotes), Lucide icons.

---

## Core Features

- **Command Centre:** Daily briefing, localized live weather from Open-Meteo with cold-weather advisory (*"Maybe stick to the phone 🤭"*), rotating mindset quotes, portfolio scoreboard, business pulse, and *The Oracle* featuring Aristotle.
- **Universal Quick Capture:** Sub-second aggregate logging for Sales, Outreach Summaries (e.g. `"17 calls"` or `"5 hours field sales"` without CRM contact clutter), Tasks, Ideas, and Notes. Includes celebratory Web Audio chimes and confetti bursts.
- **My Businesses:** 9-venture directory and dedicated drilldown profiles with status controls (`Active`, `Development`, `Pending`, `Paused`, `Archived`), scoped ledgers, and activity feeds.
- **Commercial & Revenue Engine:** Strict data integrity distinguishing settled Cash Collected, contracted MRR (£150/mo), and user-stated snapshot estimates. No fabricated profits.
- **Execution Engine:** Tasks, milestones, and project delivery tracking with overdue warnings.
- **Inventory & Assets:** Physical stock tracker with explicit valuation disclosures (cost basis vs estimated retail).
- **Opportunity Board:** Idea laboratory with Kanban stages and an *Idea Roulette* random picker.
- **Audio Engine:** Non-intrusive HTML5 soundtrack player for Rod Wave's *LaCosa Nostra* with mute, volume, and browser-compliant gesture activation.
- **Reports & AI-Ready Export:** Print-optimized A4 PDF reports and instant CSV downloads designed for direct upload into ChatGPT or Claude.

---

## Technology Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS + custom CSS variables
- **Database:** SQLite via Better-SQLite3 with WAL mode, foreign keys, and audit logging (`data/business_command.db`).
- **Icons:** `lucide-react`
- **Sound & Effects:** Web Audio API synthesizer + `canvas-confetti`

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Start
```bash
npm run build
npm run start
```

### 4. Run Acceptance Tests
```bash
python scripts/test_acceptance.py
```

---

## License

Private working software intended for single-operator portfolio command.
