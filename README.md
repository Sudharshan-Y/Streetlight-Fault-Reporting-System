<div align="center">

<!-- Animated Waving & Glowing Header Banner -->
<a href="https://vercel.app">
  <img src="https://vercel.app" width="100%" alt="LuminaTrack Header" />
</a>

<!-- Animated Multi-Line Typing Banner -->
<a href="https://vercel.app">
  <img src="https://demolab.com⚡+60-Second+Citizen+Streetlight+Fault+Reporting;🛡️+Guarded+5-Step+Workflow+%26+CIA+Security+Built-In;📊+Real-Time+SLA+Tracking%2C+Photo+Proof+%26+Live+Analytics" alt="Animated Feature Ticker" />
</a>

<br/>

<!-- Prominent Live Demo Launch Button -->
<a href="https://vercel.app">
  <img src="https://shields.io🚀_LAUNCH_LIVE_DEMO-streetlight--fault--reporting--system--seven.vercel.app-FACC15?style=for-the-badge&labelColor=0F172A" alt="Launch Live Demo" />
</a>

<br/><br/>

<!-- Tech Stack Badges -->
<p align="center">
  <img src="https://shields.ioNext.js-App_Router-0F172A?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://shields.ioTypeScript-Strict-1E293B?style=flat-square&logo=typescript&logoColor=38BDF8" alt="TypeScript" />
  <img src="https://shields.ioTailwind_CSS-Motion_UI-0F172A?style=flat-square&logo=tailwind-css&logoColor=38BDF8" alt="Tailwind CSS" />
  <img src="https://shields.ioDrizzle_ORM-Schema_Ready-1E293B?style=flat-square&logo=drizzle&logoColor=C5F74F" alt="Drizzle ORM" />
  <img src="https://shields.ioDeployed_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=FACC15" alt="Vercel" />
</p>

<!-- Animated Glowing Pulse Divider -->
<img src="https://githubusercontent.com" width="100%" alt="Animated Divider" />

</div>

## ✨ Overview

**LuminaTrack (`PRJ-118`)** is a civic streetlight fault reporting and municipal grievance management platform built for speed, transparency, and verifiable resolution. Citizens report dark or malfunctioning streetlights in **under 60 seconds with zero login required**, attach before-photo proof, and receive an instant tracking ID with an SLA countdown—while the Control Room triages tickets across **12 wards, 4 zones, and 5 departments** through a **state-guarded workflow**.

🌐 **Live Deployment:** [https://vercel.app](https://vercel.app)

---

## 🎬 Live Demo Walkthrough (2-Minute Evaluation Flow)

Test the complete end-to-end grievance lifecycle directly on the [live site](https://vercel.app):

1. **Report a Fault ([`/report`](https://vercel.appreport))** — Choose a Ward & Zone, enter a Pole ID, select an issue category, attach before-photo evidence, and submit to generate an instant **Ticket ID** and **SLA deadline**.
2. **Verify PII Masking ([`/`](https://vercel.app))** — Return to the home dashboard to watch live KPI counters update and verify that citizen phone/email details are automatically redacted on the public feed.
3. **Control Room Triage ([`/dashboard`](https://vercel.appdashboard))** — Sign in with the built-in demo credentials, verify priority, assign a maintenance crew, upload after-photo proof, and advance status through guarded transitions.
4. **Track & Close ([`/track`](https://vercel.apptrack))** — Search your Ticket ID to inspect the checksum-verified audit timeline, compare before/after photos, and submit a closure rating (or reopen if the fault returns).
5. **Analytics & Export ([`/analytics`](https://vercel.appanalytics))** — Inspect ward-level SLA compliance charts and download a **1-click JSON backup or CSV export**.

---

## 🔄 Guarded State Machine & Workflow (`src/lib/lumina.ts`)

LuminaTrack enforces strict state transitions and blocks illegal shortcuts (such as jumping directly from `Submitted` to `Resolved` without crew dispatch and after-photo proof):

```mermaid
stateDiagram-v2
    direction LR

    [*] --> Submitted: 📝 Citizen Submits (/report)\n[Ward + Pole ID + Before-Photo]

    Submitted --> Triaged: 🧠 Smart Triage (/dashboard)\n[Auto-Priority + Dept + SLA Timer]
    Triaged --> Assigned: 👷 Crew Dispatched\n[Electrical / Safety / Contractor]
    Assigned --> Resolved: 📸 Fix + After-Photo Proof\n[Mandatory Image Attached]
    Resolved --> Closed: ✅ Citizen Confirms & Rates (/track)

    Closed --> Reopened: 🔄 Fault Returns\n[Citizen Reopens Ticket]
    Reopened --> Triaged: 🧠 Re-Triage & New SLA

    state "🚫 Blocked Illegal Jumps" as Blocked {
        Submitted --> Resolved: ❌ Rejected by State Guard
        Triaged --> Resolved: ❌ Rejected (No Crew/Proof)
    }

    classDef gold fill:#0f172a,stroke:#facc15,stroke-width:2px,color:#f8fafc
    classDef sky fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc
    classDef green fill:#0f172a,stroke:#22c55e,stroke-width:2px,color:#f8fafc
    classDef red fill:#1e1b1e,stroke:#ef4444,stroke-width:2px,color:#fca5a5

    class Submitted,Reopened gold
    class Triaged,Assigned sky
    class Resolved,Closed green
    class Blocked red
```

---

## 🧠 Smart Triage & SLA Priority Decision Matrix

Keywords and fault severity automatically classify incoming reports into SLA windows (12h–72h) and route them to the responsible municipal department:

```mermaid
flowchart LR
    Input["📝 Citizen Fault Report<br/>(12 Wards · 4 Zones)"] --> Engine{"🧠 Smart Triage Engine<br/>(Keyword & Severity Parser)"}

    Engine -->|"Sparking / Exposed Wire / Fall Risk"| P1["🔴 Critical Priority<br/>SLA: 12 Hours<br/>Dept: Emergency Safety"]
    Engine -->|"Dark Pole / Transformer / Feeder"| P2["🟠 High Priority<br/>SLA: 24 Hours<br/>Dept: Electrical Grid"]
    Engine -->|"Flickering / Dim Lamp / Timer"| P3["🟡 Medium Priority<br/>SLA: 48 Hours<br/>Dept: Routine Maintenance"]
    Engine -->|"Bent Arm / Cover Missing / Paint"| P4["🟢 Standard Priority<br/>SLA: 72 Hours<br/>Dept: Civil / Contractor"]

    style Input fill:#0f172a,stroke:#facc15,stroke-width:2px,color:#f8fafc
    style Engine fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#f8fafc
    style P1 fill:#2a1215,stroke:#ef4444,stroke-width:2px,color:#fecaca
    style P2 fill:#2a1a12,stroke:#f97316,stroke-width:2px,color:#fed7aa
    style P3 fill:#292512,stroke:#eab308,stroke-width:2px,color:#fef08a
    style P4 fill:#122a1c,stroke:#22c55e,stroke-width:2px,color:#bbf7d0
```

---

## 🔁 End-to-End Swimlane Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as 👤 Citizen (No Login)
    participant App as ⚡ LuminaTrack Store & Guard<br/>(lumina.ts + store.tsx)
    actor Operator as 🛡️ Control Room Operator<br/>(/dashboard)

    Citizen->>App: Submit Fault (Ward, Pole ID, Issue, Before-Photo)
    App->>App: Auto-classify Priority, Dept & SLA (12h–72h)
    App->>App: Generate Ticket ID + Integrity Checksum
    App-->>Citizen: Issue Ticket ID & Live SLA Countdown
    App-->>Citizen: Publish to Live Feed (Phone/Email PII Masked)

    Operator->>App: Authenticate via Role Gate
    Operator->>App: Verify Triage & Assign Crew (1 of 5 Depts)
    App->>App: Validate Transition & Append Audit Log

    Operator->>App: Upload After-Photo Proof & Mark Resolved
    alt Missing After-Photo or Skipped Step
        App-->>Operator: 🚫 Block Illegal State Transition
    else Valid Proof & Sequence
        App->>App: Update Checksum & Stop SLA Clock
        App-->>Citizen: Live Status Updated on /track
    end

    Citizen->>App: Inspect Before/After Photos & Submit Rating
    App->>App: Lock Ticket as Closed (Reopen Allowed if Needed)
```

---

## 🏗️ System Architecture & CIA Triad Security Blueprint

```mermaid
flowchart TB
    subgraph Client ["🌐 Next.js App Router Frontend (Vercel Edge)"]
        direction LR
        P1["🏠 /<br/>Live KPIs &<br/>PII-Masked Feed"]
        P2["🚨 /report<br/>60-Sec Fault<br/>Submission"]
        P3["🔍 /track<br/>Audit Timeline &<br/>Citizen Closure"]
        P4["🎛️ /dashboard<br/>Role-Gated<br/>Control Room"]
        P5["📊 /analytics<br/>Ward SLA Charts &<br/>CSV/JSON Export"]
    end

    subgraph Core ["⚙️ Core Engine & CIA Security Layer"]
        direction LR
        C1["🔒 Confidentiality<br/>• Role Gate Auth<br/>• PII Redaction<br/>• Zero Hardcoded Secrets"]
        C2["✅ Integrity<br/>• Guarded Transitions<br/>• Immutable Audit Log<br/>• Per-Ticket Checksum"]
        C3["⚡ Availability<br/>• Offline-First Store<br/>• 1-Click JSON Backup<br/>• CSV Export"]
    end

    subgraph Storage ["💾 Persistence Layer"]
        direction LR
        S1[("🗄️ Browser localStorage\n(Zero-Backend Mode)")]
        S2[("🐘 Drizzle ORM Schema\n(src/db/schema.ts)")]
    end

    Client ==> Core
    Core ==> S1
    Core -.->|"Scale-Ready"| S2

    style Client fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc
    style Core fill:#0f172a,stroke:#facc15,stroke-width:2px,color:#f8fafc
    style Storage fill:#0f172a,stroke:#22c55e,stroke-width:2px,color:#f8fafc
    style C1 fill:#1e293b,stroke:#38bdf8,color:#f8fafc
    style C2 fill:#1e293b,stroke:#facc15,color:#f8fafc
