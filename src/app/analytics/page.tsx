"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLumina } from "@/lib/store";
import { computeAnalytics, download, toCSV } from "@/lib/lumina";
import { Bars, Donut, Trend, WardHeat } from "@/components/charts";
import { SectionHead, StatCard } from "@/components/ui";

export default function AnalyticsPage() {
  const { complaints, ready } = useLumina();
  const a = useMemo(() => computeAnalytics(complaints), [complaints]);

  if (!ready) return <main className="mx-auto max-w-6xl px-4 py-16 text-center text-slate-400">Crunching numbers…</main>;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end gap-4">
        <SectionHead
          kicker="Report / dashboard · public transparency"
          title="City lighting health, live"
          sub="Every chart below is computed in-browser from the same tickets citizens file. Export it, audit it, show it in your viva."
        />
        <div className="ml-auto flex gap-2">
          <button onClick={() => download(`luminatrack-report-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(complaints), "text/csv")} className="rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-extrabold text-black hover:bg-amber-300">
            ⬇ Export CSV report
          </button>
          <Link href="/docs#tests" className="rounded-xl border border-white/20 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/10">
            Validation proof
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total complaints" value={String(a.total)} hint={`${a.open} open right now`} />
        <StatCard label="Resolution rate" value={`${a.resolutionRate}%`} hint={`${a.resolved} fixed`} accent="#34d399" />
        <StatCard label="Avg fix time" value={`${a.avgDays} days`} hint="filed → resolved" accent="#60a5fa" />
        <StatCard label="SLA compliance" value={`${a.slaCompliance}%`} hint={a.breached ? `${a.breached} breached — act now` : "zero breaches 🎉"} accent={a.breached ? "#f87171" : "#34d399"} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card-glass rounded-3xl p-6">
          <h3 className="font-display text-base font-bold text-white">Tickets by status</h3>
          <div className="mt-4"><Donut items={a.byStatus} /></div>
        </div>
        <div className="card-glass rounded-3xl p-6">
          <h3 className="font-display text-base font-bold text-white">Tickets by priority</h3>
          <div className="mt-4"><Donut items={a.byPriority} /></div>
          <p className="mt-3 rounded-xl bg-white/[0.04] px-4 py-2.5 text-xs leading-relaxed text-slate-400">
            SLA rule — <b className="text-red-300">Critical 12h</b> · <b className="text-orange-300">High 24h</b> ·{" "}
            <b className="text-amber-300">Medium 48h</b> · <b className="text-emerald-300">Low 72h</b>
          </p>
        </div>
        <div className="card-glass rounded-3xl p-6">
          <h3 className="font-display text-base font-bold text-white">Top fault types</h3>
          <div className="mt-4"><Bars items={a.byType.slice(0, 6).map((t, i) => ({ ...t, color: ["#fbbf24", "#fb923c", "#f472b6", "#a78bfa", "#60a5fa", "#34d399"][i % 6] }))} /></div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <div className="card-glass rounded-3xl p-6 lg:col-span-3">
          <h3 className="font-display text-base font-bold text-white">Reported vs resolved — last 10 days</h3>
          <div className="mt-4"><Trend items={a.trend} /></div>
        </div>
        <div className="card-glass rounded-3xl p-6 lg:col-span-2">
          <h3 className="font-display text-base font-bold text-white">Ward performance <span className="text-xs font-semibold text-slate-400">(% resolved)</span></h3>
          <div className="mt-4"><WardHeat items={a.byWard} /></div>
        </div>
      </div>

      {/* printable summary */}
      <div className="card-glass-strong mt-4 rounded-3xl p-6 sm:p-8">
        <h3 className="font-display text-lg font-bold text-white">📄 Viva-ready summary (read this aloud)</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          “Our system currently tracks <b className="text-white">{a.total} complaints</b> across{" "}
          <b className="text-white">{a.byWard.length} wards</b> with a{" "}
          <b className="text-emerald-300">{a.resolutionRate}% resolution rate</b> and an average fix time of{" "}
          <b className="text-white">{a.avgDays} days</b>. SLA compliance stands at{" "}
          <b className="text-amber-300">{a.slaCompliance}%</b>
          {a.breached ? <> with <b className="text-red-300">{a.breached} breached tickets</b> needing escalation</> : " with zero breaches"}.
          The commonest fault is <b className="text-white">{a.byType[0]?.label}</b> ({a.byType[0]?.value} cases).
          Every ticket carries photo proof, a guarded workflow and an audit timeline — covering
          confidentiality, integrity and availability end to end.”
        </p>
      </div>
    </main>
  );
}
