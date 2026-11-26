"use client";

import { useMemo, useRef, useState } from "react";
import { useLumina } from "@/lib/store";
import {
  CREWS, STATUSES, TRANSITIONS, computeAnalytics, download, maskPhone, timeAgo, toCSV,
  type Complaint, type Status,
} from "@/lib/lumina";
import { Donut, Trend } from "@/components/charts";
import { PriorityBadge, SlaBadge, StatusBadge } from "@/components/ui";

export default function DashboardPage() {
  const lum = useLumina();
  const { complaints, ready, session, login, logout, updateStatus, resetDemo, exportBackup, importBackup } = lum;

  // login form
  const [email, setEmail] = useState("admin@lumina.city");
  const [pass, setPass] = useState("admin123");
  const [loginErr, setLoginErr] = useState("");

  // filters
  const [q, setQ] = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [fPri, setFPri] = useState("all");
  const [fWard, setFWard] = useState("all");
  const [fDept, setFDept] = useState("all");
  const [sort, setSort] = useState<"new" | "sla" | "pri">("new");
  const [sel, setSel] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [crew, setCrew] = useState<string>(CREWS[0]);
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const a = useMemo(() => computeAnalytics(complaints), [complaints]);

  const filtered = useMemo(() => {
    let list = [...complaints];
    const needle = q.trim().toLowerCase();
    if (needle)
      list = list.filter((c) =>
        [c.id, c.citizenName, c.street, c.poleId, c.issueType, c.phone, c.ward].join(" ").toLowerCase().includes(needle)
      );
    if (fStatus !== "all") list = list.filter((c) => c.status === fStatus);
    if (fPri !== "all") list = list.filter((c) => c.priority === fPri);
    if (fWard !== "all") list = list.filter((c) => c.ward === fWard);
    if (fDept !== "all") list = list.filter((c) => c.department === fDept);
    const priRank: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    list.sort((x, y) => {
      if (sort === "sla") return new Date(x.slaDue).getTime() - new Date(y.slaDue).getTime();
      if (sort === "pri") return priRank[x.priority] - priRank[y.priority];
      return new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime();
    });
    return list;
  }, [complaints, q, fStatus, fPri, fWard, fDept, sort]);

  const selected: Complaint | null = complaints.find((c) => c.id === sel) ?? null;

  function flash(m: string) {
    setToast(m);
    setTimeout(() => setToast(""), 2600);
  }

  function doTransition(next: Status) {
    if (!selected || !session) return;
    if (!note.trim() && !["acknowledged", "assigned"].includes(next)) {
      flash("Add a note for the audit trail first.");
      return;
    }
    const extra: Partial<Complaint> = {};
    if (next === "assigned") {
      extra.assignedTo = crew;
      extra.department = selected.department;
    }
    updateStatus(selected.id, next, `${session.role} · ${session.name}`, note.trim() || `Moved to ${next}`, extra);
    setNote("");
    flash(`${selected.id} → ${next}`);
  }

  async function resolveWithProof(file?: File) {
    if (!selected || !session) return;
    let after: string | null = null;
    if (file) {
      after = await new Promise((res) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.readAsDataURL(file);
      });
    }
    updateStatus(selected.id, "resolved", `${session.role} · ${session.name}`, note.trim() || "Fix completed + after-photo uploaded", { photoAfter: after });
    setNote("");
    flash(`${selected.id} resolved with proof ✓`);
  }

  if (!ready) return <main className="mx-auto max-w-6xl px-4 py-16 text-center text-slate-400">Loading control room…</main>;

  // ── LOGIN GATE (Confidentiality) ──
  if (!session) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-amber-400">Control room · role gate</p>
            <h1 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl">Staff only beyond this point.</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Citizen PII (phone, email, names) is masked on public pages. Full records unlock
              only after staff login — that&apos;s the <b className="text-slate-200">Confidentiality</b> half
              of our CIA story. Demo creds are pre-filled so evaluators pass in one click.
            </p>
            <div className="mt-5 grid gap-2 text-xs">
              {[
                ["Administrator", "admin@lumina.city / admin123 — full control, exports, reset"],
                ["Field Engineer", "engineer@lumina.city / field123 — update + resolve"],
              ].map(([r, d]) => (
                <div key={r} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <span className="rounded-full bg-amber-400/15 px-3 py-1 text-[11px] font-extrabold text-amber-300">{r}</span>
                  <code className="font-mono text-[11px] text-slate-300">{d}</code>
                </div>
              ))}
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const err = login(email, pass);
              setLoginErr(err ?? "");
              if (!err) flash("Welcome to the control room ✓");
            }}
            className="card-glass-strong h-fit rounded-3xl p-7"
          >
            <h2 className="font-display text-lg font-bold text-white">🔐 Staff login</h2>
            <label className="mt-4 block text-xs font-bold text-slate-300">Official email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/70" />
            <label className="mt-4 block text-xs font-bold text-slate-300">Password</label>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/70" />
            {loginErr && <p className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-200">{loginErr}</p>}
            <button className="mt-5 w-full rounded-2xl bg-amber-400 px-6 py-3.5 text-sm font-extrabold text-black hover:bg-amber-300">
              Unlock control room →
            </button>
            <p className="mt-3 text-center text-[11px] text-slate-500">Sessions persist locally · Logout anytime · No secrets in code</p>
          </form>
        </div>
      </main>
    );
  }

  // ── CONTROL ROOM ──
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* header */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-amber-400">Control room · {session.role}</p>
          <h1 className="font-display mt-1 text-2xl font-bold text-white sm:text-3xl">
            {a.open} open · {a.breached} SLA-breached · {a.resolutionRate}% resolved
          </h1>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <button onClick={() => download(`luminatrack-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(filtered), "text/csv")} className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-2.5 text-xs font-extrabold text-emerald-200 hover:bg-emerald-400 hover:text-black">
            ⬇ CSV ({filtered.length})
          </button>
          <button onClick={() => download(`luminatrack-backup.json`, exportBackup(), "application/json")} className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10">
            Backup JSON
          </button>
          <button onClick={() => fileRef.current?.click()} className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10">
            Restore
          </button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const err = importBackup(await f.text());
            flash(err ?? "Backup restored ✓");
          }} />
          <button onClick={() => { if (confirm("Reset to 18 demo tickets? Your local reports will be replaced.")) { resetDemo(); flash("Demo data restored"); } }} className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10">
            Reset demo
          </button>
          <button onClick={logout} className="rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20">
            Logout
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-emerald-400/40 bg-[#0a1420]/95 px-6 py-3 text-sm font-bold text-emerald-200 shadow-2xl">
          {toast}
        </div>
      )}

      {/* KPI + mini charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card-glass rounded-3xl p-5">
          <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Status split</p>
          <div className="mt-3"><Donut items={a.byStatus} /></div>
        </div>
        <div className="card-glass rounded-3xl p-5 lg:col-span-2">
          <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">10-day reported vs resolved</p>
          <div className="mt-3"><Trend items={a.trend} /></div>
        </div>
      </div>

      {/* filters */}
      <div className="card-glass mt-4 rounded-3xl p-4">
        <div className="grid gap-2.5 md:grid-cols-6">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 ID, name, street, pole…" className="rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400/70 md:col-span-2" />
          {[
            { v: fStatus, s: setFStatus, opts: ["all", ...STATUSES.map((x) => x.key)], label: "Status" },
            { v: fPri, s: setFPri, opts: ["all", "Critical", "High", "Medium", "Low"], label: "Priority" },
            { v: fDept, s: setFDept, opts: ["all", "Electrical · North", "Electrical · South", "Maintenance · Civil", "Safety · Emergency", "Contractor · Night Patrol"], label: "Dept" },
            { v: sort, s: setSort as (v: string) => void, opts: ["new", "sla", "pri"], label: "Sort" },
          ].map((f) => (
            <select key={f.label} value={f.v} onChange={(e) => f.s(e.target.value)} className="rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-[13px] font-semibold text-white outline-none">
              <option value={f.opts[0]}>{f.label}: all</option>
              {f.opts.slice(1).map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          <select value={fWard} onChange={(e) => setFWard(e.target.value)} className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs font-semibold text-white outline-none">
            <option value="all">Ward: all 12</option>
            {[...new Set(complaints.map((c) => c.ward))].map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
          <span className="ml-auto text-xs text-slate-500">Showing <b className="text-white">{filtered.length}</b> of {complaints.length} · click a row to act</span>
        </div>
      </div>

      {/* table */}
      <div className="card-glass-strong mt-4 overflow-hidden rounded-3xl">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-widest text-slate-400">
                <th className="px-5 py-4">Ticket</th>
                <th className="px-4 py-4">Fault / location</th>
                <th className="px-4 py-4">Priority</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">SLA</th>
                <th className="px-4 py-4">Crew</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => { setSel(c.id); setNote(""); }}
                  className={`cursor-pointer border-b border-white/5 transition hover:bg-amber-400/[0.06] ${sel === c.id ? "bg-amber-400/[0.08]" : ""}`}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-mono font-bold text-amber-200">{c.id}</p>
                    <p className="text-[11px] text-slate-500">{timeAgo(c.createdAt)} · {c.citizenName} · {maskPhone(c.phone)}</p>
                  </td>
                  <td className="max-w-[260px] px-4 py-3.5">
                    <p className="truncate font-bold text-white">{c.issueType}</p>
                    <p className="truncate text-[11px] text-slate-400">{c.ward} · {c.street} · {c.poleId}</p>
                  </td>
                  <td className="px-4 py-3.5"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-4 py-3.5"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3.5"><SlaBadge c={c} /></td>
                  <td className="max-w-[150px] truncate px-4 py-3.5 text-slate-300">{c.assignedTo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="px-6 py-10 text-center text-sm text-slate-400">No tickets match these filters.</p>}
      </div>

      {/* detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setSel(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="scrollbar-thin h-full w-full max-w-xl overflow-y-auto border-l border-white/15 bg-[#0a0f20] p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-lg font-bold text-amber-300">{selected.id}</p>
                <p className="mt-0.5 text-sm font-bold text-white">{selected.issueType}</p>
                <p className="text-xs text-slate-400">{selected.street} · {selected.ward} · Pole {selected.poleId}</p>
              </div>
              <button onClick={() => setSel(null)} className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 text-slate-300 hover:bg-white/10">✕</button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge status={selected.status} />
              <PriorityBadge priority={selected.priority} />
              <SlaBadge c={selected} />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-[13px] leading-relaxed text-slate-300">
              <p><b className="text-white">Citizen:</b> {selected.citizenName} · {selected.phone} · {selected.email || "—"}</p>
              <p className="mt-1"><b className="text-white">Report:</b> {selected.description}</p>
              <p className="mt-1"><b className="text-white">Dept:</b> {selected.department} · <b className="text-white">Crew:</b> {selected.assignedTo}</p>
              <p className="mt-1"><b className="text-white">SLA due:</b> {new Date(selected.slaDue).toLocaleString("en-IN")} · <b className="text-white">Checksum:</b> #{selected.integrity}</p>
            </div>

            {/* workflow actions */}
            <div className="mt-5 rounded-2xl border border-amber-400/25 bg-amber-400/[0.05] p-4">
              <p className="text-xs font-extrabold uppercase tracking-widest text-amber-300">⚙ Status workflow (guarded)</p>
              <p className="mt-1 text-[12px] text-slate-400">
                From <b className="text-white">{selected.status}</b> you may move to:{" "}
                <b className="text-amber-200">{TRANSITIONS[selected.status].join(" · ") || "—"}</b>
              </p>
              {(selected.status === "submitted" || selected.status === "acknowledged" || selected.status === "reopened") && (
                <div className="mt-3">
                  <label className="text-xs font-bold text-slate-300">Assign crew (for “assigned”)</label>
                  <select value={crew} onChange={(e) => setCrew(e.target.value)} className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-white">
                    {CREWS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              )}
              <label className="mt-3 block text-xs font-bold text-slate-300">Audit note (stored in timeline)</label>
              <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Crew dispatched with 2× 45W LED + ladder" className="mt-1.5 w-full resize-none rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400/70" />
              <div className="mt-3 grid grid-cols-2 gap-2">
                {TRANSITIONS[selected.status].filter((s) => s !== "resolved").map((n) => (
                  <button key={n} onClick={() => doTransition(n)} className="rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-[13px] font-extrabold text-white hover:border-amber-400/60 hover:bg-amber-400/10">
                    → {n.replace("_", " ")}
                  </button>
                ))}
              </div>
              {(selected.status === "in_progress" || selected.status === "assigned") && (
                <div className="mt-2 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-3">
                  <p className="text-xs font-bold text-emerald-200">Resolve needs after-photo proof:</p>
                  <label className="mt-2 block cursor-pointer rounded-xl bg-emerald-400 px-4 py-2.5 text-center text-[13px] font-extrabold text-black hover:bg-emerald-300">
                    📸 Resolve with after-photo
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => resolveWithProof(e.target.files?.[0])} />
                  </label>
                  <button onClick={() => resolveWithProof(undefined)} className="mt-2 w-full rounded-xl border border-emerald-400/40 px-4 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-400/10">
                    Resolve without photo (lux-test ref)
                  </button>
                </div>
              )}
            </div>

            {/* history */}
            <p className="mt-5 text-xs font-extrabold uppercase tracking-widest text-slate-400">Audit timeline</p>
            <div className="mt-2 grid gap-2">
              {selected.history.map((h, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[12.5px]">
                  <b style={{ color: STATUSES.find((s) => s.key === h.status)?.color }}>{h.status}</b>
                  <span className="text-slate-400"> · {new Date(h.at).toLocaleString("en-IN")} · {h.by}</span>
                  <p className="mt-0.5 text-slate-300">{h.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
