"use client";

// Lightweight SVG charts — zero dependencies, Vercel-friendly.

export function Donut({ items }: { items: { label: string; value: number; color: string }[] }) {
  const total = items.reduce((a, b) => a + b.value, 0) || 1;
  let acc = 0;
  const R = 54;
  const C = 2 * Math.PI * R;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative">
        <svg width="150" height="150" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="16" />
          {items.map((s, i) => {
            const frac = s.value / total;
            const dash = frac * C;
            const off = acc * C;
            acc += frac;
            return (
              <circle
                key={i}
                cx="70"
                cy="70"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth="16"
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-off + C * 0.25}
                strokeLinecap="butt"
                transform="rotate(-90 70 70)"
              />
            );
          })}
          <text x="70" y="66" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="800">
            {total}
          </text>
          <text x="70" y="84" textAnchor="middle" fill="#94a3b8" fontSize="10">
            tickets
          </text>
        </svg>
      </div>
      <div className="grid flex-1 gap-1.5 text-xs">
        {items.filter((x) => x.value > 0).map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className="flex-1">{s.label}</span>
            <b className="text-white">{s.value}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Bars({ items, max }: { items: { label: string; value: number; color?: string }[]; max?: number }) {
  const m = max ?? Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="grid gap-2.5">
      {items.map((b) => (
        <div key={b.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="max-w-[70%] truncate font-semibold text-slate-300">{b.label}</span>
            <b className="text-white">{b.value}</b>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(b.value / m) * 100}%`,
                background: b.color ?? "linear-gradient(90deg,#f59e0b,#fbbf24)",
                boxShadow: "0 0 12px rgba(251,191,36,0.5)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Trend({ items }: { items: { label: string; reported: number; resolved: number }[] }) {
  const max = Math.max(1, ...items.map((i) => Math.max(i.reported, i.resolved)));
  const W = 560;
  const H = 170;
  const P = 28;
  const X = (i: number) => P + (i * (W - P * 2)) / Math.max(1, items.length - 1);
  const Y = (v: number) => H - P - (v / max) * (H - P * 2);
  const line = (k: "reported" | "resolved") =>
    items.map((d, i) => `${i === 0 ? "M" : "L"}${X(i)},${Y(d[k])}`).join(" ");
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={P} x2={W - P} y1={Y(max * f)} y2={Y(max * f)} stroke="rgba(255,255,255,0.07)" strokeDasharray="4 4" />
        ))}
        <path d={line("reported")} fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
        <path d={line("resolved")} fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 0" opacity="0.9" />
        {items.map((d, i) => (
          <g key={i}>
            <circle cx={X(i)} cy={Y(d.reported)} r="4" fill="#fbbf24" stroke="#070b16" strokeWidth="2" />
            <circle cx={X(i)} cy={Y(d.resolved)} r="4" fill="#34d399" stroke="#070b16" strokeWidth="2" />
            {(i % 2 === 0 || items.length < 8) && (
              <text x={X(i)} y={H - 8} textAnchor="middle" fill="#64748b" fontSize="10">
                {d.label}
              </text>
            )}
          </g>
        ))}
      </svg>
      <div className="mt-2 flex gap-5 text-xs font-semibold">
        <span className="flex items-center gap-2 text-slate-300">
          <span className="h-2 w-6 rounded-full bg-amber-400" /> Reported
        </span>
        <span className="flex items-center gap-2 text-slate-300">
          <span className="h-2 w-6 rounded-full bg-emerald-400" /> Resolved
        </span>
      </div>
    </div>
  );
}

export function WardHeat({ items }: { items: { label: string; open: number; resolved: number; total: number }[] }) {
  return (
    <div className="grid gap-2">
      {items.map((w) => {
        const pct = w.total ? Math.round((w.resolved / w.total) * 100) : 0;
        return (
          <div key={w.label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
            <span className="w-20 shrink-0 text-xs font-bold text-slate-200">{w.label}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  background: pct >= 70 ? "#34d399" : pct >= 40 ? "#fbbf24" : "#f87171",
                }}
              />
            </div>
            <span className="w-24 shrink-0 text-right text-[11px] text-slate-400">
              <b className="text-white">{pct}%</b> · {w.open} open
            </span>
          </div>
        );
      })}
    </div>
  );
}
