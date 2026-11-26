"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLumina } from "@/lib/store";
import { maskPhone, statusMeta, STATUSES, timeAgo, type Complaint } from "@/lib/lumina";
import { PriorityBadge, SlaBadge, StatusBadge, Empty } from "@/components/ui";

function Stars({ value, onPick }: { value: number | null; onPick?: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onPick}
          onClick={() => onPick?.(n)}
          className={`text-2xl transition ${(value ?? 0) >= n ? "text-amber-400" : "text-slate-600"} ${onPick ? "hover:scale-125" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function Detail({ c }: { c: Complaint }) {
  const { updateStatus, rateComplaint } = useLumina();
  const [rating, setRating] = useState(c.rating);
  const [feedback, setFeedback] = useState(c.feedback);
  const [reopenNote, setReopenNote] = useState("");
  const [msg, setMsg] = useState("");

  const flow = STATUSES.filter((s) => !["rejected", "reopened"].includes(s.key));
  const idx = flow.findIndex((f) => f.key === c.status);
  const progress = c.status === "rejected" ? 0 : c.status === "reopened" ? 8 : Math.max(0, ((idx + 1) / flow.length) * 100);

  return (
    <div className="grid gap-5">
      {/* header */}
      <div className="card-glass-strong rounded-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={c.status} />
          <PriorityBadge priority={c.priority} />
          <SlaBadge c={c} />
          <span className="ml-auto text-xs text-slate-500">integrity #{c.integrity}</span>
        </div>
        <h1 className="font-display mt-4 text-2xl font-bold text-white sm:text-3xl">{c.id}</h1>
        <p className="mt-1 text-sm text-slate-300">{c.issueType} · {c.ward}</p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">{c.description}</p>

        {/* progress */}
        <div className="mt-6">
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-1 sm:grid-cols-6">
            {flow.map((f, i) => {
              const doneStep = idx >= 0 && i <= idx;
              return (
                <div key={f.key} className="text-center">
                  <div
                    className="mx-auto grid h-8 w-8 place-items-center rounded-full border text-xs font-bold"
                    style={{
                      borderColor: doneStep ? f.color : "rgba(255,255,255,0.15)",
                      background: doneStep ? `${f.color}26` : "transparent",
                      color: doneStep ? f.color : "#64748b",
                    }}
                  >
                    {doneStep ? "✓" : i + 1}
                  </div>
                  <p className="mt-1 text-[10px] font-bold" style={{ color: doneStep ? f.color : "#64748b" }}>{f.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* meta grid */}
        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {[
            { l: "Location", v: `${c.street}\n${c.ward} · ${c.zone}\nPole ${c.poleId} · ${c.landmark}` },
            { l: "Department & crew", v: `${c.department}\n${c.assignedTo}` },
            { l: "Timeline", v: `Filed ${timeAgo(c.createdAt)}\nSLA due ${new Date(c.slaDue).toLocaleString("en-IN")}${c.resolvedAt ? `\nFixed ${timeAgo(c.resolvedAt)}` : ""}` },
            { l: "Reporter (masked)", v: `${c.citizenName.split(" ")[0]} ••••\n${maskPhone(c.phone)}` },
          ].map((x) => (
            <div key={x.l} className="whitespace-pre-line rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">{x.l}</p>
              <p className="mt-1.5 font-semibold leading-relaxed text-slate-200">{x.v}</p>
            </div>
          ))}
        </div>

        {/* photos */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">📸 Before (citizen proof)</p>
            {c.photoBefore ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.photoBefore} alt="before" className="mt-2 h-44 w-full rounded-xl object-cover" />
            ) : (
              <p className="mt-2 rounded-xl bg-white/5 px-4 py-8 text-center text-xs text-slate-500">Seed demo ticket — photo proof attaches on new reports.</p>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">✅ After (crew proof)</p>
            {c.photoAfter ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.photoAfter} alt="after" className="mt-2 h-44 w-full rounded-xl object-cover" />
            ) : (
              <p className="mt-2 rounded-xl bg-white/5 px-4 py-8 text-center text-xs text-slate-500">
                {c.status === "resolved" || c.status === "closed" ? "Fix verified by lux test — photo archived." : "Will appear once the crew marks this resolved."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* timeline */}
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="card-glass rounded-3xl p-6 lg:col-span-3">
          <h2 className="font-display text-base font-bold text-white">🕓 Status timeline <span className="text-xs font-semibold text-slate-400">(audit trail — integrity)</span></h2>
          <div className="mt-4 grid gap-0">
            {c.history.map((h, i) => {
              const m = statusMeta(h.status);
              return (
                <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < c.history.length - 1 && <span className="absolute left-[13px] top-8 h-full w-px bg-white/15" />}
                  <span className="z-10 h-7 w-7 shrink-0 rounded-full border-2" style={{ borderColor: m.color, background: "#070b16" }}>
                    <span className="mx-auto mt-1 block h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
                  </span>
                  <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <b className="text-sm" style={{ color: m.color }}>{m.label}</b>
                      <span className="ml-auto text-[11px] text-slate-500">{new Date(h.at).toLocaleString("en-IN")}</span>
                    </div>
                    <p className="mt-1 text-[13px] text-slate-300">{h.note}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">by {h.by}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid content-start gap-5 lg:col-span-2">
          {/* rating */}
          <div className="card-glass rounded-3xl p-6">
            <h2 className="font-display text-base font-bold text-white">⭐ Citizen feedback</h2>
            {c.status === "resolved" || c.status === "closed" ? (
              <div className="mt-3">
                <Stars value={rating} onPick={setRating} />
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="How was the fix? (optional)"
                  className="mt-3 w-full resize-none rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400/70"
                />
                <button
                  onClick={() => { if (rating) { rateComplaint(c.id, rating, feedback); setMsg("Thanks! Your rating was saved locally."); } }}
                  className="mt-3 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-extrabold text-black hover:bg-amber-300"
                >
                  Save rating
                </button>
                {msg && <p className="mt-2 text-xs font-bold text-emerald-300">{msg}</p>}
              </div>
            ) : (
              <p className="mt-2 text-[13px] text-slate-400">Rating unlocks once the crew marks this ticket resolved.</p>
            )}
          </div>

          {/* reopen */}
          {(c.status === "closed" || c.status === "resolved") && (
            <div className="card-glass rounded-3xl border-pink-400/20 p-6">
              <h2 className="font-display text-base font-bold text-white">↩ Fault came back?</h2>
              <p className="mt-1 text-[13px] text-slate-400">Reopen within the integrity-guarded workflow.</p>
              <input
                value={reopenNote}
                onChange={(e) => setReopenNote(e.target.value)}
                placeholder="e.g. Lamp fused again last night"
                className="mt-3 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-pink-400/70"
              />
              <button
                onClick={() => {
                  if (reopenNote.trim().length < 8) { setMsg("Please describe the recurrence (min 8 chars)."); return; }
                  updateStatus(c.id, "reopened", c.citizenName, reopenNote.trim());
                  setMsg("Ticket reopened — control room notified.");
                }}
                className="mt-3 w-full rounded-xl border border-pink-400/50 bg-pink-400/10 px-4 py-3 text-sm font-extrabold text-pink-200 hover:bg-pink-400/20"
              >
                Reopen ticket
              </button>
              {msg && <p className="mt-2 text-xs font-bold text-pink-200">{msg}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TrackInner() {
  const params = useSearchParams();
  const { complaints, ready } = useLumina();
  const [q, setQ] = useState(params.get("id") ?? "");
  const [phone, setPhone] = useState("");

  const match = useMemo(() => {
    const id = q.trim().toLowerCase();
    if (!id) return null;
    return complaints.find((c) => c.id.toLowerCase() === id) ?? null;
  }, [q, complaints]);

  const mine = useMemo(() => {
    const p = phone.replace(/\s/g, "");
    if (p.length < 4) return [];
    return complaints.filter((c) => c.phone.includes(p)).slice(0, 12);
  }, [phone, complaints]);

  if (!ready) return <main className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-400">Loading tickets…</main>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-amber-400">Track module</p>
      <h1 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl">Track your ticket</h1>
      <p className="mt-2 text-sm text-slate-400">Enter the ID from your receipt (e.g. SL-2026-102400) or search by mobile number.</p>

      <div className="card-glass mt-6 rounded-3xl p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ticket ID — SL-2026-______"
            className="rounded-xl border border-white/15 bg-black/40 px-4 py-3.5 font-mono text-sm text-amber-200 placeholder:text-slate-500 outline-none focus:border-amber-400/70"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Or mobile number"
            inputMode="numeric"
            className="rounded-xl border border-white/15 bg-black/40 px-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400/70"
          />
          <Link href="/report" className="rounded-xl border border-white/20 px-5 py-3.5 text-center text-sm font-bold text-white hover:bg-white/10">
            + New report
          </Link>
        </div>

        {phone.trim().length >= 4 && !match && (
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Matching {mine.length} ticket(s) for “{phone}”</p>
            <div className="mt-2 grid gap-2">
              {mine.map((c) => (
                <button key={c.id} onClick={() => setQ(c.id)} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-left hover:border-amber-400/40">
                  <b className="font-mono text-sm text-amber-200">{c.id}</b>
                  <span className="text-xs text-slate-400">{c.issueType} · {timeAgo(c.createdAt)}</span>
                  <span className="ml-auto"><StatusBadge status={c.status} /></span>
                </button>
              ))}
              {mine.length === 0 && <Empty title="No tickets for that number" sub="Check the digits, or file a fresh report — it takes a minute." />}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        {match ? (
          <Detail c={match} />
        ) : q.trim() ? (
          <div className="mt-2">
            <Empty title="Ticket not found" sub={`No ticket “${q.trim()}” in this browser. IDs live in localStorage — try the demo IDs on the home feed, or check another device.`} />
            <p className="mt-3 text-center text-xs text-slate-500">Demo IDs look like SL-2026-102400 · SL-2026-102537 · SL-2026-102674 …</p>
          </div>
        ) : (
          <div className="card-glass mt-2 rounded-3xl p-6">
            <p className="text-sm font-bold text-white">Try a live demo ticket →</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {complaints.slice(0, 5).map((c) => (
                <button key={c.id} onClick={() => setQ(c.id)} className="rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2 font-mono text-xs font-bold text-amber-200 hover:bg-amber-400 hover:text-black">
                  {c.id}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-400">Loading…</main>}>
      <TrackInner />
    </Suspense>
  );
}
