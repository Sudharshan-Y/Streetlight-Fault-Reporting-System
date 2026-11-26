"use client";

import { Priority, Status, slaState, statusMeta, type Complaint } from "@/lib/lumina";

export function StatusBadge({ status }: { status: Status }) {
  const m = statusMeta(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide"
      style={{ background: `${m.color}22`, color: m.color, border: `1px solid ${m.color}55` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
      {m.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, string> = {
    Critical: "bg-red-500/15 text-red-300 border-red-500/40",
    High: "bg-orange-500/15 text-orange-300 border-orange-500/40",
    Medium: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    Low: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold uppercase ${map[priority]}`}>
      {priority}
    </span>
  );
}

export function SlaBadge({ c }: { c: Complaint }) {
  const s = slaState(c);
  const map = {
    breached: "bg-red-500/15 text-red-300 border-red-500/50",
    "due-soon": "bg-amber-500/15 text-amber-300 border-amber-500/50",
    "on-track": "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    done: "bg-slate-500/15 text-slate-300 border-slate-500/40",
  } as const;
  const label = { breached: "SLA breached", "due-soon": "Due soon", "on-track": "On track", done: "SLA closed" }[s];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${map[s]}`}>
      <span>◷</span> {label}
    </span>
  );
}

export function SectionHead({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-amber-400">{kicker}</p>
      <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h2>
      {sub && <p className="mt-2 text-sm leading-relaxed text-slate-400">{sub}</p>}
    </div>
  );
}

export function StatCard({ label, value, hint, accent = "#fbbf24" }: { label: string; value: string; hint: string; accent?: string }) {
  return (
    <div className="card-glass rounded-2xl p-5">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="font-display mt-1 text-3xl font-bold text-white" style={{ textShadow: `0 0 24px ${accent}44` }}>
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}

export function Empty({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-400/10 text-2xl">💡</div>
      <p className="font-display mt-4 text-lg font-bold text-white">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-400">{sub}</p>
    </div>
  );
}
