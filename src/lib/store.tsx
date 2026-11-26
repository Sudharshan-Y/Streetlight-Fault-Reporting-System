"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Complaint, Status, checksum, seedComplaints, DEMO_ADMINS } from "./lumina";

const KEY = "luminatrack.prj118.v1";
const SESSION_KEY = "luminatrack.session.v1";

export interface Session {
  name: string;
  email: string;
  role: string;
}

interface Store {
  complaints: Complaint[];
  ready: boolean;
  session: Session | null;
  login: (email: string, pass: string) => string | null;
  logout: () => void;
  addComplaint: (c: Complaint) => void;
  updateStatus: (id: string, next: Status, by: string, note: string, extra?: Partial<Complaint>) => string | null;
  rateComplaint: (id: string, rating: number, feedback: string) => void;
  resetDemo: () => void;
  exportBackup: () => string;
  importBackup: (json: string) => string | null;
}

const Ctx = createContext<Store | null>(null);

function load(): Complaint[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Complaint[];
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch { /* corrupted → reseed */ }
  const seed = seedComplaints();
  try { localStorage.setItem(KEY, JSON.stringify(seed)); } catch { /* quota */ }
  return seed;
}

export function LuminaProvider({ children }: { children: React.ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setComplaints(load());
    try {
      const s = localStorage.getItem(SESSION_KEY);
      if (s) setSession(JSON.parse(s));
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(complaints)); } catch { /* quota full */ }
  }, [complaints, ready]);

  const value = useMemo<Store>(() => ({
    complaints,
    ready,
    session,
    login: (email, pass) => {
      const admin = DEMO_ADMINS.find(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.pass === pass
      );
      if (!admin) return "Invalid credentials. Try admin@lumina.city / admin123";
      const s: Session = { name: admin.name, email: admin.email, role: admin.role };
      setSession(s);
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch { /* ignore */ }
      return null;
    },
    logout: () => {
      setSession(null);
      try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
    },
    addComplaint: (c) => {
      c.integrity = checksum(c);
      setComplaints((prev) => [c, ...prev]);
    },
    updateStatus: (id, next, by, note, extra = {}) => {
      let err: string | null = null;
      setComplaints((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          const updated: Complaint = {
            ...c,
            ...extra,
            status: next,
            updatedAt: new Date().toISOString(),
            resolvedAt: next === "resolved" ? new Date().toISOString() : next === "closed" ? c.resolvedAt : null,
            history: [...c.history, { status: next, at: new Date().toISOString(), by, note }],
          };
          updated.integrity = checksum(updated);
          return updated;
        })
      );
      return err;
    },
    rateComplaint: (id, rating, feedback) => {
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, rating, feedback, updatedAt: new Date().toISOString() } : c))
      );
    },
    resetDemo: () => {
      const seed = seedComplaints();
      setComplaints(seed);
      try { localStorage.setItem(KEY, JSON.stringify(seed)); } catch { /* ignore */ }
    },
    exportBackup: () => JSON.stringify({ app: "LuminaTrack PRJ-118", exportedAt: new Date().toISOString(), complaints }, null, 2),
    importBackup: (json) => {
      try {
        const parsed = JSON.parse(json);
        const arr = Array.isArray(parsed) ? parsed : parsed.complaints;
        if (!Array.isArray(arr) || !arr.length) return "No complaints found in file.";
        if (!arr[0].id || !arr[0].status) return "File doesn't look like a LuminaTrack backup.";
        setComplaints(arr as Complaint[]);
        return null;
      } catch {
        return "Invalid JSON file.";
      }
    },
  }), [complaints, ready, session]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLumina(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLumina must be used inside LuminaProvider");
  return v;
}
