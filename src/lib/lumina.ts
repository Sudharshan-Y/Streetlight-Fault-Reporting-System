// ─────────────────────────────────────────────────────────────
// LuminaTrack PRJ-118 · core domain engine (stateless, client-side)
// Citizen submission · tagging · workflow · proof · analytics
// ─────────────────────────────────────────────────────────────

export type Status =
  | "submitted"
  | "acknowledged"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "closed"
  | "rejected"
  | "reopened";

export type Priority = "Low" | "Medium" | "High" | "Critical";
export type Department =
  | "Electrical · North"
  | "Electrical · South"
  | "Maintenance · Civil"
  | "Safety · Emergency"
  | "Contractor · Night Patrol";

export interface HistoryEntry {
  status: Status;
  at: string;
  by: string;
  note: string;
}

export interface Complaint {
  id: string;
  citizenName: string;
  phone: string;
  email: string;
  ward: string;
  zone: string;
  street: string;
  poleId: string;
  landmark: string;
  lat: number;
  lng: number;
  issueType: string;
  description: string;
  priority: Priority;
  department: Department;
  status: Status;
  slaDue: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  assignedTo: string;
  photoBefore: string | null; // base64 data-url (proof upload)
  photoAfter: string | null;
  history: HistoryEntry[];
  rating: number | null;
  feedback: string;
  integrity: string; // checksum for CIA-integrity demo
}

export const STATUSES: { key: Status; label: string; color: string; desc: string }[] = [
  { key: "submitted", label: "Submitted", color: "#60a5fa", desc: "Received from citizen" },
  { key: "acknowledged", label: "Acknowledged", color: "#a78bfa", desc: "Verified by helpdesk" },
  { key: "assigned", label: "Assigned", color: "#f59e0b", desc: "Crew / department tagged" },
  { key: "in_progress", label: "In Progress", color: "#fb923c", desc: "Field work underway" },
  { key: "resolved", label: "Resolved", color: "#34d399", desc: "Fix done + proof uploaded" },
  { key: "closed", label: "Closed", color: "#94a3b8", desc: "Citizen confirmed / auto-close" },
  { key: "rejected", label: "Rejected", color: "#f87171", desc: "Duplicate / invalid" },
  { key: "reopened", label: "Reopened", color: "#f472b6", desc: "Citizen re-raised" },
];

// Allowed transitions (integrity guard — illegal jumps blocked)
export const TRANSITIONS: Record<Status, Status[]> = {
  submitted: ["acknowledged", "rejected"],
  acknowledged: ["assigned", "rejected"],
  assigned: ["in_progress", "rejected"],
  in_progress: ["resolved", "assigned"],
  resolved: ["closed", "reopened"],
  closed: ["reopened"],
  rejected: ["reopened"],
  reopened: ["acknowledged", "assigned"],
};

export const ISSUE_TYPES = [
  "Light not glowing (fused)",
  "Flickering / dim light",
  "Light stays ON in daytime",
  "Complete street outage",
  "Pole damaged / leaning / rusted",
  "Wire hanging / sparking",
  "Fixture cover broken / missing",
  "Timer / sensor fault",
] as const;

export const WARDS = [
  { ward: "Ward 01 · Marina North", zone: "Zone A · Coastal" },
  { ward: "Ward 02 · Marina South", zone: "Zone A · Coastal" },
  { ward: "Ward 03 · Market Junction", zone: "Zone A · Coastal" },
  { ward: "Ward 04 · Old Fort", zone: "Zone B · Central" },
  { ward: "Ward 05 · Central Station", zone: "Zone B · Central" },
  { ward: "Ward 06 · Lakeview", zone: "Zone B · Central" },
  { ward: "Ward 07 · University Gate", zone: "Zone C · North" },
  { ward: "Ward 08 · Hospital Road", zone: "Zone C · North" },
  { ward: "Ward 09 · Industrial Estate", zone: "Zone C · North" },
  { ward: "Ward 10 · Green Park", zone: "Zone D · South" },
  { ward: "Ward 11 · Airport Road", zone: "Zone D · South" },
  { ward: "Ward 12 · Riverside", zone: "Zone D · South" },
] as const;

export const CREWS = [
  "Crew N-1 · Ravi Kumar",
  "Crew N-2 · Deepa S",
  "Crew S-1 · Arun Prakash",
  "Crew S-2 · Meena K",
  "Safety Unit · Vikram Rao",
  "Contractor · BrightLine Co.",
] as const;

export const DEMO_ADMINS = [
  { email: "admin@lumina.city", pass: "admin123", name: "City Admin", role: "Administrator" },
  { email: "engineer@lumina.city", pass: "field123", name: "Field Engineer", role: "Field Engineer" },
];

// ── Smart triage helper (rule-based, explainable) ─────────────
export function triage(issueType: string, description: string): {
  priority: Priority;
  department: Department;
  slaHours: number;
  reasons: string[];
} {
  const text = `${issueType} ${description}`.toLowerCase();
  const reasons: string[] = [];
  let score = 0;

  if (/spark|wire|hanging|shock|fire|fallen|leaning|accident|dark.*highway|school|hospital/.test(text)) {
    score += 40;
    reasons.push("Safety-critical keywords (spark / wire / hospital / school) detected");
  }
  if (/complete.*outage|entire street|whole road|all lights/.test(text)) {
    score += 25;
    reasons.push("Whole-street outage affects many citizens");
  }
  if (/flicker|dim/.test(text)) {
    score += 10;
    reasons.push("Flickering indicates driver / voltage fault");
  }
  if (/daytime|stays on/.test(text)) {
    score += 5;
    reasons.push("Day-burning wastes energy — timer fault");
  }
  if (/pole.*damage|rusted|leaning|cover.*broken/.test(text)) {
    score += 15;
    reasons.push("Structural damage needs civil visit");
  }
  if (text.length > 160) {
    score += 5;
    reasons.push("Detailed description — faster diagnosis");
  }
  if (reasons.length === 0) reasons.push("Standard fused-lamp pattern");

  let department: Department = "Electrical · North";
  if (/spark|wire|shock|fire/.test(text)) department = "Safety · Emergency";
  else if (/pole|rusted|leaning|civil|cover/.test(text)) department = "Maintenance · Civil";
  else if (/outage|entire|whole/.test(text)) department = "Contractor · Night Patrol";
  else if (/sensor|timer/.test(text)) department = "Electrical · South";

  const priority: Priority = score >= 40 ? "Critical" : score >= 25 ? "High" : score >= 10 ? "Medium" : "Low";
  const slaHours = priority === "Critical" ? 12 : priority === "High" ? 24 : priority === "Medium" ? 48 : 72;
  reasons.push(`SLA set to ${slaHours}h for ${priority} priority`);
  return { priority, department, slaHours, reasons };
}

// ── Validation (integrity) ────────────────────────────────────
export function validateReport(input: {
  citizenName: string;
  phone: string;
  email: string;
  ward: string;
  street: string;
  issueType: string;
  description: string;
}): Record<string, string> {
  const e: Record<string, string> = {};
  if (!input.citizenName.trim() || input.citizenName.trim().length < 3)
    e.citizenName = "Enter full name (min 3 letters).";
  if (!/^[6-9]\d{9}$/.test(input.phone.replace(/\s/g, "")))
    e.phone = "Enter a valid 10-digit Indian mobile number.";
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email))
    e.email = "Email looks invalid.";
  if (!input.ward) e.ward = "Select a ward.";
  if (!input.street.trim() || input.street.trim().length < 3)
    e.street = "Enter street / area (min 3 chars).";
  if (!input.issueType) e.issueType = "Choose an issue type.";
  if (!input.description.trim() || input.description.trim().length < 20)
    e.description = "Describe the fault in at least 20 characters (helps triage).";
  return e;
}

// ── Helpers ───────────────────────────────────────────────────
export function genId(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `SL-2026-${n}`;
}

export function checksum(c: Partial<Complaint>): string {
  const s = `${c.id}|${c.phone}|${c.poleId}|${c.createdAt}|${c.issueType}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(8, "0").toUpperCase();
}

export function maskPhone(p: string): string {
  if (!p || p.length < 4) return "••••";
  return `••••••${p.slice(-4)}`;
}
export function maskEmail(e: string): string {
  if (!e || !e.includes("@")) return "—";
  const [u, d] = e.split("@");
  return `${u.slice(0, 2)}•••@${d}`;
}

export function statusMeta(s: Status) {
  return STATUSES.find((x) => x.key === s)!;
}

export function slaState(c: Complaint): "breached" | "due-soon" | "on-track" | "done" {
  if (c.status === "closed" || c.status === "resolved") return "done";
  const diff = new Date(c.slaDue).getTime() - Date.now();
  if (diff < 0) return "breached";
  if (diff < 12 * 3600 * 1000) return "due-soon";
  return "on-track";
}

export function timeAgo(iso: string): string {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

// ── Seed data (sample / dummy — no real citizens) ─────────────
function seedOne(
  i: number,
  name: string,
  phone: string,
  wardIdx: number,
  street: string,
  pole: string,
  issue: string,
  desc: string,
  status: Status,
  daysAgo: number,
  crew: string,
  rating: number | null = null
): Complaint {
  const w = WARDS[wardIdx];
  const { priority, department, slaHours } = triage(issue, desc);
  const created = new Date(Date.now() - daysAgo * 86400000 - i * 3600000).toISOString();
  const due = new Date(new Date(created).getTime() + slaHours * 3600000).toISOString();
  const flow: Status[] = ["submitted", "acknowledged", "assigned", "in_progress", "resolved", "closed"];
  const upto = flow.indexOf(status === "reopened" || status === "rejected" ? "submitted" : status);
  const history: HistoryEntry[] = [];
  const actors = ["Citizen portal", "Helpdesk · Priya", "Dispatcher", crew, crew, "Citizen portal"];
  const notes = [
    "Complaint registered with photo proof",
    "Details verified, ward + pole mapped",
    `Assigned to ${crew} (${department})`,
    "Crew on site — material issued",
    "Lamp replaced + lux test passed, after-photo uploaded",
    rating ? `Citizen rated ${rating}/5 — case closed` : "Auto-closed after 48h no-objection",
  ];
  for (let k = 0; k <= Math.max(upto, 0); k++) {
    history.push({
      status: flow[k],
      at: new Date(new Date(created).getTime() + k * 7 * 3600000).toISOString(),
      by: actors[k],
      note: notes[k],
    });
  }
  if (status === "rejected")
    history.push({ status: "rejected", at: due, by: "Helpdesk · Priya", note: "Duplicate of nearby ticket — merged" });
  if (status === "reopened")
    history.push({ status: "reopened", at: new Date().toISOString(), by: name, note: "Fault reappeared — re-raised" });

  const c: Complaint = {
    id: `SL-2026-${String(102400 + i * 137).slice(0, 6)}`,
    citizenName: name,
    phone,
    email: `${name.split(" ")[0].toLowerCase()}${i}@example.com`,
    ward: w.ward,
    zone: w.zone,
    street,
    poleId: pole,
    landmark: `Near ${street.split(",")[0]}`,
    lat: 13.0827 + (Math.sin(i * 3.3) * 0.045),
    lng: 80.2707 + (Math.cos(i * 2.1) * 0.05),
    issueType: issue,
    description: desc,
    priority,
    department,
    status,
    slaDue: due,
    createdAt: created,
    updatedAt: new Date(new Date(created).getTime() + (upto + 1) * 7 * 3600000).toISOString(),
    resolvedAt: ["resolved", "closed"].includes(status) ? due : null,
    assignedTo: upto >= 2 ? crew : "—",
    photoBefore: null,
    photoAfter: ["resolved", "closed"].includes(status) ? null : null,
    history,
    rating,
    feedback: rating ? "Light is working well now. Quick response!" : "",
    integrity: "",
  };
  c.integrity = checksum(c);
  return c;
}

export function seedComplaints(): Complaint[] {
  return [
    seedOne(1, "Kavitha R", "9841012345", 4, "Central Station Rd, Platform 2 side", "PL-CST-114", "Light not glowing (fused)", "Two lamps near the auto stand have been fused for 4 nights, complete darkness and unsafe for passengers.", "in_progress", 1, CREWS[0]),
    seedOne(2, "Mohammed Asif", "9790911223", 2, "Market Junction, Fish market lane", "PL-MKT-087", "Wire hanging / sparking", "Live wire hanging low over the footpath with visible sparking last night near the market entrance. Very dangerous for school children.", "assigned", 0, CREWS[4]),
    seedOne(3, "Divya S", "9942011887", 6, "University Gate, Hostel road", "PL-UNI-203", "Flickering / dim light", "Hostel road lamp flickers all night and goes dim, students feel unsafe walking back after library hours.", "resolved", 3, CREWS[1], 5),
    seedOne(4, "Ramesh K", "9840099881", 8, "Industrial Estate Phase II", "PL-IND-045", "Complete street outage", "Entire 400m stretch dark for 3 nights, lorries parking dangerously. All 6 poles dead — likely feeder fault.", "acknowledged", 0, "—"),
    seedOne(5, "Anitha P", "9003011224", 9, "Green Park 5th Cross", "PL-GPK-311", "Light stays ON in daytime", "Lamp burns even at noon daily, wasting power. Timer or photocell sensor must have failed.", "closed", 9, CREWS[2], 4),
    seedOne(6, "Suresh M", "9841277665", 3, "Old Fort, Palace back gate", "PL-OFT-019", "Pole damaged / leaning / rusted", "Pole leaning 20 degrees after lorry hit, base rusted and cracked. May fall in rain.", "in_progress", 2, CREWS[3]),
    seedOne(7, "Priya D", "9791009234", 7, "Hospital Road, Emergency gate", "PL-HSP-002", "Light not glowing (fused)", "Emergency gate approach fully dark, ambulances struggling at night. Needs urgent replacement.", "assigned", 0, CREWS[4]),
    seedOne(8, "Karthik N", "9840011228", 0, "Marina North, Loop road", "PL-MAR-501", "Fixture cover broken / missing", "Glass cover missing, rain water entering fixture near beach walkers path.", "submitted", 0, "—"),
    seedOne(9, "Lakshmi V", "9941002341", 10, "Airport Road service lane", "PL-AIR-120", "Timer / sensor fault", "Lights switch on 2 hours late every evening on service lane, erratic timer behaviour.", "resolved", 5, CREWS[5], 4),
    seedOne(10, "Arun J", "9841099002", 5, "Lakeview promenade", "PL-LKV-078", "Flickering / dim light", "Promenade lamps flicker badly, morning walkers complaining of headache and poor visibility.", "closed", 12, CREWS[0], 5),
    seedOne(11, "Nisha F", "9003008877", 11, "Riverside bund road", "PL-RVR-090", "Complete street outage", "Bund road dark after transformer burst, 8 poles affected near fishermen colony.", "reopened", 6, CREWS[5]),
    seedOne(12, "Vignesh T", "9790901234", 1, "Marina South, Lighthouse end", "PL-MAR-522", "Pole damaged / leaning / rusted", "Duplicate report of leaning pole already attended — merged.", "rejected", 4, "—"),
    seedOne(13, "Meera K", "9840204567", 6, "University Gate, Canteen curve", "PL-UNI-210", "Light not glowing (fused)", "Canteen curve lamp fused, curve is accident-prone without light.", "closed", 15, CREWS[1], 5),
    seedOne(14, "Dinesh R", "9942008899", 4, "Central Station, Parcel office", "PL-CST-121", "Wire hanging / sparking", "Cable bunch hanging after storm, sparking when buses pass. Cordoned temporarily.", "resolved", 4, CREWS[4], 5),
    seedOne(15, "Revathi S", "9841011990", 9, "Green Park 2nd Main", "PL-GPK-305", "Light stays ON in daytime", "Three lamps on 2nd main stay on all day since last maintenance.", "acknowledged", 1, "—"),
    seedOne(16, "Imran K", "9791113456", 2, "Market Junction, Bus stop", "PL-MKT-095", "Complete street outage", "Bus stop shelter and 100m road dark, pickpocket incidents reported. Needs priority.", "submitted", 0, "—"),
    seedOne(17, "Sowmya H", "9003022445", 7, "Hospital Road, Blood bank", "PL-HSP-010", "Flickering / dim light", "Blood bank street lamp dims every 10 minutes, CCTV footage also dark.", "in_progress", 1, CREWS[2]),
    seedOne(18, "Rajesh B", "9840088776", 3, "Old Fort, Clock tower", "PL-OFT-025", "Light not glowing (fused)", "Heritage clock tower uplight fused, tourists complaining. Lamp replaced, working.", "closed", 20, CREWS[3], 4),
  ];
}

// ── Analytics ─────────────────────────────────────────────────
export interface Analytics {
  total: number;
  open: number;
  resolved: number;
  closed: number;
  resolutionRate: number;
  avgDays: number;
  slaCompliance: number;
  breached: number;
  byStatus: { label: string; value: number; color: string }[];
  byWard: { label: string; open: number; resolved: number; total: number }[];
  byType: { label: string; value: number }[];
  byPriority: { label: string; value: number; color: string }[];
  trend: { label: string; reported: number; resolved: number }[];
}

export function computeAnalytics(list: Complaint[]): Analytics {
  const total = list.length;
  const closedLike = list.filter((c) => c.status === "closed" || c.status === "resolved");
  const open = total - closedLike.length;
  const byStatus = STATUSES.map((s) => ({
    label: s.label,
    value: list.filter((c) => c.status === s.key).length,
    color: s.color,
  }));
  const days = closedLike.map((c) => {
    const end = c.resolvedAt ? new Date(c.resolvedAt).getTime() : new Date(c.updatedAt).getTime();
    return Math.max(0.2, (end - new Date(c.createdAt).getTime()) / 86400000);
  });
  const avgDays = days.length ? days.reduce((a, b) => a + b, 0) / days.length : 0;
  const slaMet = closedLike.filter((c) =>
    c.resolvedAt ? new Date(c.resolvedAt).getTime() <= new Date(c.slaDue).getTime() : true
  ).length;
  const breached = list.filter((c) => slaState(c) === "breached").length;

  const byWard = WARDS.map((w) => {
    const items = list.filter((c) => c.ward === w.ward);
    const res = items.filter((c) => c.status === "closed" || c.status === "resolved").length;
    return { label: w.ward.split("·")[0].trim(), open: items.length - res, resolved: res, total: items.length };
  }).filter((x) => x.total > 0);

  const typeMap = new Map<string, number>();
  list.forEach((c) => typeMap.set(c.issueType, (typeMap.get(c.issueType) ?? 0) + 1));
  const byType = [...typeMap.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);

  const priColors: Record<Priority, string> = { Critical: "#f87171", High: "#fb923c", Medium: "#fbbf24", Low: "#34d399" };
  const byPriority = (["Critical", "High", "Medium", "Low"] as Priority[]).map((p) => ({
    label: p,
    value: list.filter((c) => c.priority === p).length,
    color: priColors[p],
  }));

  // last 10 days trend
  const trend: Analytics["trend"] = [];
  for (let d = 9; d >= 0; d--) {
    const day = new Date(Date.now() - d * 86400000);
    const key = day.toISOString().slice(0, 10);
    const label = day.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    trend.push({
      label,
      reported: list.filter((c) => c.createdAt.slice(0, 10) === key).length,
      resolved: list.filter((c) => (c.resolvedAt ?? "").slice(0, 10) === key).length,
    });
  }

  return {
    total,
    open,
    resolved: closedLike.length,
    closed: list.filter((c) => c.status === "closed").length,
    resolutionRate: total ? Math.round((closedLike.length / total) * 100) : 0,
    avgDays: Math.round(avgDays * 10) / 10,
    slaCompliance: closedLike.length ? Math.round((slaMet / closedLike.length) * 100) : 100,
    breached,
    byStatus,
    byWard,
    byType,
    byPriority,
    trend,
  };
}

// ── CSV export ────────────────────────────────────────────────
export function toCSV(list: Complaint[]): string {
  const rows = [
    ["Ticket", "Date", "Citizen", "Phone", "Ward", "Zone", "Street", "Pole", "Issue", "Priority", "Department", "Status", "Crew", "SLA Due", "Rating"].join(","),
    ...list.map((c) =>
      [c.id, c.createdAt.slice(0, 10), `"${c.citizenName}"`, c.phone, `"${c.ward}"`, `"${c.zone}"`, `"${c.street}"`, c.poleId, `"${c.issueType}"`, c.priority, `"${c.department}"`, c.status, `"${c.assignedTo}"`, c.slaDue.slice(0, 16).replace("T", " "), c.rating ?? ""].join(",")
    ),
  ];
  return rows.join("\n");
}

export function download(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Self-tests (Testing & Validation proof — runs in browser) ─
export interface SelfTest {
  id: string;
  group: string;
  name: string;
  run: () => { pass: boolean; detail: string };
}

export const SELF_TESTS: SelfTest[] = [
  {
    id: "T01", group: "Submission & Validation",
    name: "Rejects invalid mobile numbers",
    run: () => {
      const e = validateReport({ citizenName: "Test User", phone: "123", email: "", ward: "Ward 01 · Marina North", street: "Main Road", issueType: "Light not glowing (fused)", description: "This is a long enough description for testing." });
      return { pass: !!e.phone, detail: e.phone ?? "No error raised" };
    },
  },
  {
    id: "T02", group: "Submission & Validation",
    name: "Rejects short descriptions (<20 chars)",
    run: () => {
      const e = validateReport({ citizenName: "Test User", phone: "9841012345", email: "", ward: "Ward 01 · Marina North", street: "Main Road", issueType: "Light not glowing (fused)", description: "dark" });
      return { pass: !!e.description, detail: e.description ?? "No error raised" };
    },
  },
  {
    id: "T03", group: "Submission & Validation",
    name: "Accepts a fully valid report",
    run: () => {
      const e = validateReport({ citizenName: "Sudharshan Y", phone: "9841012345", email: "test@city.in", ward: "Ward 05 · Central Station", street: "Station Road", issueType: "Light not glowing (fused)", description: "Lamp near bus stop fused for two nights, road fully dark." });
      return { pass: Object.keys(e).length === 0, detail: Object.keys(e).length === 0 ? "0 errors" : JSON.stringify(e) };
    },
  },
  {
    id: "T04", group: "Smart Triage",
    name: "Flags sparking wire as Critical + Safety",
    run: () => {
      const t = triage("Wire hanging / sparking", "Live wire sparking over school footpath, children at risk");
      return { pass: t.priority === "Critical" && t.department === "Safety · Emergency", detail: `${t.priority} · ${t.department}` };
    },
  },
  {
    id: "T05", group: "Smart Triage",
    name: "Whole-street outage → High + Contractor",
    run: () => {
      const t = triage("Complete street outage", "Entire 400m street dark, all poles dead");
      return { pass: t.priority === "High" && t.department === "Contractor · Night Patrol", detail: `${t.priority} · ${t.department}` };
    },
  },
  {
    id: "T06", group: "Smart Triage",
    name: "Day-burning lamp → Low + SLA 72h",
    run: () => {
      const t = triage("Light stays ON in daytime", "Lamp burns at noon, timer fault");
      return { pass: t.priority === "Low" && t.slaHours === 72, detail: `${t.priority} · SLA ${t.slaHours}h` };
    },
  },
  {
    id: "T07", group: "Workflow Integrity",
    name: "Blocks illegal jump submitted → resolved",
    run: () => {
      const allowed = TRANSITIONS["submitted"].includes("resolved");
      return { pass: !allowed, detail: allowed ? "Jump allowed (BAD)" : "Jump blocked (GOOD)" };
    },
  },
  {
    id: "T08", group: "Workflow Integrity",
    name: "Allows reopen from closed (citizen right)",
    run: () => {
      const allowed = TRANSITIONS["closed"].includes("reopened");
      return { pass: allowed, detail: allowed ? "Reopen allowed" : "Reopen blocked" };
    },
  },
  {
    id: "T09", group: "Workflow Integrity",
    name: "Ticket ID format SL-2026-XXXXXX",
    run: () => {
      const id = genId();
      return { pass: /^SL-2026-\d{6}$/.test(id), detail: id };
    },
  },
  {
    id: "T10", group: "Confidentiality (CIA)",
    name: "PII masking hides phone + email",
    run: () => {
      const p = maskPhone("9841012345") === "••••••2345";
      const e = maskEmail("kavitha@gmail.com").startsWith("ka•••@");
      return { pass: p && e, detail: `${maskPhone("9841012345")} · ${maskEmail("kavitha@gmail.com")}` };
    },
  },
  {
    id: "T11", group: "Integrity (CIA)",
    name: "Checksum is stable + 8-hex format",
    run: () => {
      const seed = seedComplaints()[0];
      const h = checksum(seed);
      return { pass: /^[0-9A-F]{8}$/.test(h) && checksum(seed) === h, detail: h };
    },
  },
  {
    id: "T12", group: "Availability (CIA)",
    name: "Seed loads 18 demo records",
    run: () => {
      const s = seedComplaints();
      return { pass: s.length === 18, detail: `${s.length} records` };
    },
  },
  {
    id: "T13", group: "Analytics",
    name: "Resolution rate + SLA computed",
    run: () => {
      const a = computeAnalytics(seedComplaints());
      const ok = a.total === 18 && a.resolutionRate >= 0 && a.slaCompliance >= 0;
      return { pass: ok, detail: `${a.resolutionRate}% resolved · ${a.slaCompliance}% SLA` };
    },
  },
  {
    id: "T14", group: "Analytics",
    name: "CSV export has header + rows",
    run: () => {
      const csv = toCSV(seedComplaints());
      const lines = csv.split("\n");
      return { pass: lines.length === 19 && lines[0].startsWith("Ticket"), detail: `${lines.length - 1} data rows` };
    },
  },
];
