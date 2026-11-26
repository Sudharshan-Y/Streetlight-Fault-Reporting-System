"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useLumina } from "@/lib/store";
import { ISSUE_TYPES, WARDS, genId, triage, validateReport, type Complaint } from "@/lib/lumina";
import { PriorityBadge } from "@/components/ui";

function fileToDataUrl(file: File, maxKB = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, Math.sqrt((maxKB * 1024) / file.size));
      const w = Math.max(1, Math.round(img.width * Math.min(1, scale) * 0.7));
      const h = Math.max(1, Math.round(img.height * Math.min(1, scale) * 0.7));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function ReportPage() {
  const { addComplaint } = useLumina();
  const [form, setForm] = useState({
    citizenName: "",
    phone: "",
    email: "",
    ward: "",
    street: "",
    poleId: "",
    landmark: "",
    issueType: "",
    description: "",
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Complaint | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const wardZone = WARDS.find((w) => w.ward === form.ward)?.zone ?? "";
  const tri = useMemo(
    () => (form.issueType && form.description.length >= 8 ? triage(form.issueType, form.description) : null),
    [form.issueType, form.description]
  );

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, photo: "Only image files allowed." }));
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, photo: "Image must be under 5MB." }));
      return;
    }
    try {
      const url = await fileToDataUrl(f);
      setPhoto(url);
      setErrors((p) => {
        const n = { ...p };
        delete n.photo;
        return n;
      });
    } catch {
      setErrors((p) => ({ ...p, photo: "Could not read image. Try another file." }));
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateReport(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById("report-errors")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const t = triage(form.issueType || "Light not glowing (fused)", form.description);
    const now = new Date().toISOString();
    const c: Complaint = {
      id: genId(),
      citizenName: form.citizenName.trim(),
      phone: form.phone.replace(/\s/g, ""),
      email: form.email.trim(),
      ward: form.ward,
      zone: wardZone || "Zone B · Central",
      street: form.street.trim(),
      poleId: form.poleId.trim() || `PL-${form.ward.slice(5, 7)}-${Math.floor(100 + Math.random() * 899)}`,
      landmark: form.landmark.trim() || "—",
      lat: 13.0827 + (Math.random() - 0.5) * 0.08,
      lng: 80.2707 + (Math.random() - 0.5) * 0.09,
      issueType: form.issueType,
      description: form.description.trim(),
      priority: t.priority,
      department: t.department,
      status: "submitted",
      slaDue: new Date(Date.now() + t.slaHours * 3600000).toISOString(),
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
      assignedTo: "—",
      photoBefore: photo,
      photoAfter: null,
      history: [{ status: "submitted", at: now, by: "Citizen portal", note: `Registered via web · auto-triaged ${t.priority}/${t.department}` }],
      rating: null,
      feedback: "",
      integrity: "",
    };
    addComplaint(c);
    setDone(c);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const inputCls = (bad?: string) =>
    `w-full rounded-xl border bg-black/40 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20 ${
      bad ? "border-red-500/60" : "border-white/15"
    }`;

  if (done) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="card-glass-strong overflow-hidden rounded-3xl">
          <div className="bg-gradient-to-r from-emerald-500/25 to-amber-400/15 px-8 py-8 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-400 text-3xl shadow-[0_0_36px_rgba(52,211,153,0.6)]">✓</div>
            <h1 className="font-display mt-4 text-2xl font-bold text-white sm:text-3xl">Complaint registered!</h1>
            <p className="mt-1 text-sm text-slate-300">Your tracking ID — save it or screenshot this page.</p>
            <p className="font-display mx-auto mt-4 inline-block rounded-2xl border border-dashed border-amber-400/60 bg-black/50 px-8 py-3 text-2xl font-bold tracking-wider text-amber-300">
              {done.id}
            </p>
          </div>
          <div className="grid gap-3 px-8 py-6 text-sm sm:grid-cols-3">
            {[
              { l: "Priority", v: done.priority },
              { l: "Department", v: done.department },
              { l: "SLA deadline", v: new Date(done.slaDue).toLocaleString("en-IN") },
            ].map((x) => (
              <div key={x.l} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">{x.l}</p>
                <p className="mt-1 font-bold text-white">{x.v}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3 px-8 pb-8 sm:flex-row">
            <Link href={`/track?id=${done.id}`} className="flex-1 rounded-2xl bg-amber-400 px-6 py-3.5 text-center text-sm font-extrabold text-black hover:bg-amber-300">
              Track live status →
            </Link>
            <button
              onClick={() => { setDone(null); setForm({ citizenName: "", phone: "", email: "", ward: "", street: "", poleId: "", landmark: "", issueType: "", description: "" }); setPhoto(null); }}
              className="flex-1 rounded-2xl border border-white/20 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10"
            >
              File another complaint
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-amber-400">Citizen module · 60 seconds</p>
      <h1 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl">Report a streetlight fault</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-400">
        No account needed. Smart triage suggests priority + department live as you type.
        Data stays in this browser (localStorage) — zero backend, Vercel-friendly.
      </p>

      {Object.keys(errors).length > 0 && (
        <div id="report-errors" className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-200">
          <b>⚠ Please fix {Object.keys(errors).length} field(s):</b>
          <ul className="mt-1 list-disc pl-5">
            {Object.entries(errors).map(([k, v]) => <li key={k}>{v}</li>)}
          </ul>
        </div>
      )}

      <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="grid gap-5 lg:col-span-2">
          {/* citizen */}
          <div className="card-glass rounded-3xl p-6">
            <h2 className="font-display text-base font-bold text-white">👤 Your details <span className="text-xs font-semibold text-slate-400">(masked in public feed)</span></h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-300">Full name *</label>
                <input className={inputCls(errors.citizenName)} placeholder="e.g. Sudharshan Y" value={form.citizenName} onChange={(e) => set("citizenName", e.target.value)} />
                {errors.citizenName && <p className="mt-1 text-xs text-red-300">{errors.citizenName}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-300">Mobile (10-digit) *</label>
                <input className={inputCls(errors.phone)} placeholder="98410 12345" inputMode="numeric" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                {errors.phone && <p className="mt-1 text-xs text-red-300">{errors.phone}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-slate-300">Email (optional — for updates)</label>
                <input className={inputCls(errors.email)} placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                {errors.email && <p className="mt-1 text-xs text-red-300">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* location tagging */}
          <div className="card-glass rounded-3xl p-6">
            <h2 className="font-display text-base font-bold text-white">📍 Location / department tagging</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-300">Ward *</label>
                <select className={inputCls(errors.ward)} value={form.ward} onChange={(e) => set("ward", e.target.value)}>
                  <option value="">— Select ward —</option>
                  {WARDS.map((w) => <option key={w.ward} value={w.ward}>{w.ward} ({w.zone})</option>)}
                </select>
                {errors.ward && <p className="mt-1 text-xs text-red-300">{errors.ward}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-300">Zone (auto)</label>
                <input className={inputCls()} value={wardZone || "— select ward first —"} readOnly />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-300">Street / area *</label>
                <input className={inputCls(errors.street)} placeholder="e.g. Hospital Road, near bus stop" value={form.street} onChange={(e) => set("street", e.target.value)} />
                {errors.street && <p className="mt-1 text-xs text-red-300">{errors.street}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-300">Pole ID (if visible)</label>
                <input className={inputCls()} placeholder="e.g. PL-HSP-002 (auto if blank)" value={form.poleId} onChange={(e) => set("poleId", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-slate-300">Landmark</label>
                <input className={inputCls()} placeholder="e.g. Opposite blood bank gate" value={form.landmark} onChange={(e) => set("landmark", e.target.value)} />
              </div>
            </div>
          </div>

          {/* fault */}
          <div className="card-glass rounded-3xl p-6">
            <h2 className="font-display text-base font-bold text-white">💡 Fault details + proof upload</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-300">Issue type *</label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {ISSUE_TYPES.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => set("issueType", t)}
                      className={`rounded-xl border px-3 py-2.5 text-left text-[13px] font-semibold transition ${
                        form.issueType === t
                          ? "border-amber-400 bg-amber-400/15 text-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.3)]"
                          : "border-white/15 bg-white/[0.03] text-slate-300 hover:border-white/30"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {errors.issueType && <p className="mt-1 text-xs text-red-300">{errors.issueType}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-300">Description (min 20 chars) * <span className="font-semibold text-slate-500">{form.description.length}/500</span></label>
                <textarea rows={4} maxLength={500} className={`${inputCls(errors.description)} resize-none`} placeholder="What exactly is wrong? How long? How many poles? Any danger (sparking, school/hospital nearby)?" value={form.description} onChange={(e) => set("description", e.target.value)} />
                {errors.description && <p className="mt-1 text-xs text-red-300">{errors.description}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-300">Photo proof — “before” (JPG/PNG ≤ 5MB)</label>
                <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} className="hidden" />
                {!photo ? (
                  <button type="button" onClick={() => fileRef.current?.click()} className="grid w-full place-items-center rounded-2xl border border-dashed border-white/25 bg-white/[0.02] px-6 py-8 text-sm text-slate-300 hover:border-amber-400/60 hover:bg-amber-400/5">
                    <span className="text-3xl">📸</span>
                    <span className="mt-2 font-bold text-white">Tap to upload lamp photo</span>
                    <span className="mt-1 text-xs text-slate-500">Compressed in-browser · stored locally · never leaves your device</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/5 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt="proof" className="h-20 w-20 rounded-xl object-cover" />
                    <div className="flex-1 text-xs text-slate-300">
                      <p className="font-bold text-emerald-300">✓ Proof attached</p>
                      <p>Compressed & stored with ticket.</p>
                    </div>
                    <button type="button" onClick={() => setPhoto(null)} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20">Remove</button>
                  </div>
                )}
                {errors.photo && <p className="mt-1 text-xs text-red-300">{errors.photo}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* triage sidebar */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-glass-strong rounded-3xl border-amber-400/20 p-6">
            <h3 className="font-display text-base font-bold text-white">🧠 Smart triage <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-extrabold uppercase text-amber-300">live</span></h3>
            {!tri ? (
              <p className="mt-3 text-[13px] leading-relaxed text-slate-400">Pick an issue type and describe the fault — priority, department & SLA appear here instantly.</p>
            ) : (
              <div className="mt-4 grid gap-3">
                <div className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Priority</span>
                  <PriorityBadge priority={tri.priority} />
                </div>
                <div className="rounded-2xl bg-white/[0.04] px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Department</p>
                  <p className="mt-1 text-sm font-bold text-white">{tri.department}</p>
                </div>
                <div className="rounded-2xl bg-white/[0.04] px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">SLA</p>
                  <p className="mt-1 text-sm font-bold text-amber-300">⚡ {tri.slaHours} hours to fix</p>
                </div>
                <ul className="grid gap-1.5 text-[12px] leading-relaxed text-slate-300">
                  {tri.reasons.map((r) => <li key={r} className="flex gap-2"><span className="text-emerald-400">✓</span>{r}</li>)}
                </ul>
              </div>
            )}
            <button type="submit" className="mt-5 w-full rounded-2xl bg-amber-400 px-6 py-4 text-[15px] font-extrabold text-black shadow-[0_0_30px_rgba(251,191,36,0.45)] hover:bg-amber-300">
              Submit complaint →
            </button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-500">
              By submitting you agree the report + masked details may appear on the public transparency feed.
            </p>
          </div>
        </div>
      </form>
    </main>
  );
}
