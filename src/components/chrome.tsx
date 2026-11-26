"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLumina } from "@/lib/store";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/report", label: "Report Fault" },
  { href: "/track", label: "Track Ticket" },
  { href: "/dashboard", label: "Control Room" },
  { href: "/analytics", label: "Analytics" },
  { href: "/docs", label: "Docs & Viva" },
];

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-600 shadow-[0_0_28px_rgba(251,191,36,0.5)]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.2 1.1 2.2h5c0-1 .4-1.6 1.1-2.2A6 6 0 0 0 12 3Z" stroke="#1a1005" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 3v2M5.6 5.6l1.4 1.4M18.4 5.6 17 7" stroke="#1a1005" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#070b16]" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="font-display block text-[17px] font-700 font-bold tracking-tight text-white">
            Lumina<span className="text-amber-400">Track</span>
          </span>
          <span className="block text-[10.5px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            PRJ-118 · Grievance System
          </span>
        </span>
      )}
    </Link>
  );
}

export function Navbar() {
  const path = usePathname();
  const { session, logout } = useLumina();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#070b16]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => {
            const active = path === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-4 py-2 text-[13.5px] font-semibold transition ${
                  active
                    ? "bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.45)]"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {session ? (
            <div className="flex items-center gap-3 rounded-full border border-emerald-400/30 bg-emerald-400/10 py-1.5 pl-4 pr-1.5">
              <span className="text-xs font-semibold text-emerald-300">
                ● {session.name} · {session.role}
              </span>
              <button
                onClick={logout}
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white hover:bg-white/20"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/dashboard"
              className="rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-[13px] font-bold text-amber-300 hover:bg-amber-400 hover:text-black"
            >
              Admin Login
            </Link>
          )}
          <Link
            href="/report"
            className="rounded-full bg-amber-400 px-5 py-2.5 text-[13px] font-extrabold text-black shadow-[0_0_24px_rgba(251,191,36,0.5)] hover:bg-amber-300"
          >
            + Report Fault
          </Link>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 text-white lg:hidden"
          aria-label="Menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>
      {open && (
        <div className="border-t border-white/10 bg-[#0a0f20] px-4 pb-5 pt-3 lg:hidden">
          <div className="grid gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                  path === l.href ? "bg-amber-400 text-black" : "bg-white/5 text-slate-200"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/report"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-xl bg-amber-400 px-4 py-3 text-center text-sm font-extrabold text-black"
            >
              + Report Fault
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#05080f]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            LuminaTrack tracks every streetlight complaint from submission to closure —
            with location tagging, a guarded status workflow, photo proof and a public
            analytics dashboard. Built for PRJ-118 · Public Service Grievance Systems.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
            {["No database needed", "localStorage-first", "Vercel-ready", "CIA-secured", "CSV export"].map((t) => (
              <span key={t} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-slate-300">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-400">Citizen</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-300">
            <Link className="hover:text-amber-300" href="/report">Report a fault</Link>
            <Link className="hover:text-amber-300" href="/track">Track your ticket</Link>
            <Link className="hover:text-amber-300" href="/analytics">Public dashboard</Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-400">Project PRJ-118</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-300">
            <Link className="hover:text-amber-300" href="/dashboard">Control room login</Link>
            <Link className="hover:text-amber-300" href="/docs">Setup + test proof</Link>
            <Link className="hover:text-amber-300" href="/docs#viva">Viva Q&A</Link>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Student: Sudharshan Y PDKV · Reg 411623149042
            <br />
            Dept. Cyber · Individual project
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">
        LuminaTrack © 2026 · Sample / dummy data only · Confidentiality · Integrity · Availability
      </div>
    </footer>
  );
}
