"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLumina } from "@/lib/store";
import { computeAnalytics, maskPhone, timeAgo } from "@/lib/lumina";
import { StatusBadge, PriorityBadge, SectionHead, StatCard } from "@/components/ui";

const HERO_IMG =
  "https://images.pexels.com/photos/39796387/pexels-photo-39796387.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";

export default function HomePage() {
  const { complaints, ready } = useLumina();
  const a = useMemo(() => computeAnalytics(complaints), [complaints]);
  const recent = complaints.slice(0, 6);

  return (
    <main>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="grid-bg absolute inset-0" />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `url(${HERO_IMG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            maskImage: "linear-gradient(180deg, black 20%, transparent 85%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b16]/60 via-[#070b16]/80 to-[#070b16]" />
        {/* lamp glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2">
          <div className="beam absolute inset-0" />
          <div className="glow-dot animate-flicker absolute left-1/2 top-6 h-5 w-5 -translate-x-1/2 rounded-full bg-amber-300" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-16 sm:px-6 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-amber-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Live · {ready ? complaints.length : "—"} tickets in system
            </div>
            <h1 className="font-display mt-6 text-[clamp(2.2rem,6vw,4.2rem)] font-bold leading-[1.02] tracking-tight text-white">
              Every dark street,
              <br />
              <span className="text-glow bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                lit back to life.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-slate-300">
              LuminaTrack is the city&apos;s streetlight fault reporting system — citizens report
              in 60 seconds with photo proof, the control room triages by ward &amp; department,
              and everyone watches the fix happen live.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/report"
                className="w-full rounded-2xl bg-amber-400 px-8 py-4 text-[15px] font-extrabold text-black shadow-[0_0_40px_rgba(251,191,36,0.5)] hover:bg-amber-300 sm:w-auto"
              >
                🚨 Report a faulty light
              </Link>
              <Link
                href="/track"
                className="w-full rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-[15px] font-bold text-white backdrop-blur hover:bg-white/10 sm:w-auto"
              >
                Track my ticket →
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold text-slate-400">
              <span className="rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10">✓ 60-sec reporting</span>
              <span className="rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10">✓ Photo proof</span>
              <span className="rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10">✓ SLA-tracked workflow</span>
              <span className="rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10">✓ No login needed</span>
            </div>
          </div>

          {/* live stats */}
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Tickets tracked" value={String(a.total)} hint={`${a.open} still open`} />
            <StatCard label="Resolution rate" value={`${a.resolutionRate}%`} hint="resolved + closed" accent="#34d399" />
            <StatCard label="Avg. fix time" value={`${a.avgDays}d`} hint="submission → resolution" accent="#60a5fa" />
            <StatCard label="SLA compliance" value={`${a.slaCompliance}%`} hint={`${a.breached} breached now`} accent="#f472b6" />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <SectionHead
          kicker="Submission → Closure"
          title="From complaint to closure in 5 visible steps"
          sub="Required feature: citizen submission · location/department tagging · guarded status workflow · proof upload · analytics."
        />
        <div className="mt-8 grid gap-3 md:grid-cols-5">
          {[
            { n: "01", t: "Citizen reports", d: "Ward, pole ID, issue type + photo proof. Ticket ID issued instantly.", e: "📝" },
            { n: "02", t: "Smart triage", d: "Auto priority, department & SLA from keywords. Helpdesk verifies.", e: "🧠" },
            { n: "03", t: "Crew assigned", d: "Tagged to Electrical / Maintenance / Safety / Contractor crew.", e: "👷" },
            { n: "04", t: "Fix + proof", d: "Crew uploads after-photo. Illegal status jumps are blocked.", e: "📸" },
            { n: "05", t: "Citizen closes", d: "Rating + feedback. Reopen allowed if fault returns.", e: "✅" },
          ].map((s) => (
            <div key={s.n} className="card-glass group rounded-2xl p-5 transition hover:-translate-y-1 hover:border-amber-400/40">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{s.e}</span>
                <span className="font-display text-xs font-bold text-amber-400/80">{s.n}</span>
              </div>
              <p className="font-display mt-3 text-[15px] font-bold text-white">{s.t}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-400">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE FEED + CIA ── */}
      <section className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-5">
        <div className="card-glass-strong rounded-3xl p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-white">🔴 Live public feed <span className="text-xs font-semibold text-slate-400">(PII masked)</span></h3>
            <Link href="/analytics" className="text-xs font-bold text-amber-300 hover:text-amber-200">Open dashboard →</Link>
          </div>
          <div className="mt-4 grid gap-2.5">
            {recent.map((c) => (
              <Link
                key={c.id}
                href={`/track?id=${c.id}`}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-amber-400/40 hover:bg-white/[0.06]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">
                    {c.id} · {c.issueType}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-400">
                    {c.ward} · {c.street} · by {c.citizenName.split(" ")[0]} ({maskPhone(c.phone)}) · {timeAgo(c.createdAt)}
                  </p>
                </div>
                <PriorityBadge priority={c.priority} />
                <StatusBadge status={c.status} />
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card-glass-strong h-full rounded-3xl bg-gradient-to-b from-amber-400/[0.08] to-transparent p-6">
            <h3 className="font-display text-lg font-bold text-white">🛡️ CIA — built-in, not bolted on</h3>
            <p className="mt-1 text-xs text-slate-400">Your viva-ready security story (also enforced in code).</p>
            <div className="mt-4 grid gap-3">
              {[
                { t: "Confidentiality", d: "Role gate for control room · public feed masks phone/email · demo creds, zero secrets in code.", c: "#60a5fa" },
                { t: "Integrity", d: "Strict validation · guarded transitions (no submitted→resolved jumps) · audit timeline + checksum per ticket.", c: "#34d399" },
                { t: "Availability", d: "100% offline-first localStorage · works with no backend · 1-click JSON backup + CSV export · Vercel static-ready.", c: "#fbbf24" },
              ].map((x) => (
                <div key={x.t} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm font-extrabold" style={{ color: x.c }}>{x.t}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-slate-300">{x.d}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link href="/dashboard" className="rounded-xl bg-amber-400 px-4 py-3 text-center text-sm font-extrabold text-black hover:bg-amber-300">
                Control Room
              </Link>
              <Link href="/docs" className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-center text-sm font-bold text-white hover:bg-white/10">
                Docs + Viva Q&A
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <section className="mt-14 overflow-hidden border-y border-white/10 bg-black/40 py-4">
        <div className="marquee flex w-max gap-8 whitespace-nowrap text-[13px] font-bold text-slate-300">
          {[0, 1].map((k) => (
            <div key={k} className="flex gap-8">
              {["12 WARDS COVERED", "4 ZONES · 5 DEPARTMENTS", "SLA: 12–72H BY PRIORITY", "PHOTO PROOF MANDATORY", "PUBLIC ANALYTICS", "PRJ-118 · SUDHARSHAN Y PDKV"].map((t) => (
                <span key={t} className="flex items-center gap-8">
                  <span>{t}</span>
                  <span className="text-amber-400">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-400/15 via-[#0d1327] to-[#0d1327] p-8 sm:p-12">
          <div className="glow-dot absolute right-10 top-8 hidden h-4 w-4 rounded-full bg-amber-300 sm:block" />
          <h2 className="font-display max-w-xl text-2xl font-bold text-white sm:text-4xl">
            See a dark lamp? Light up the city in under a minute.
          </h2>
          <p className="mt-3 max-w-lg text-sm text-slate-300">
            No account needed. Your ticket gets a tracking ID, an SLA deadline and a public
            timeline — backed by photo proof at both ends.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/report" className="rounded-2xl bg-amber-400 px-7 py-3.5 text-center text-sm font-extrabold text-black hover:bg-amber-300">
              Start a report now
            </Link>
            <Link href="/docs#demo" className="rounded-2xl border border-white/20 px-7 py-3.5 text-center text-sm font-bold text-white hover:bg-white/10">
              🎬 2-min demo script
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
