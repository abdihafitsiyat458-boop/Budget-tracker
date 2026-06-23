import { useState, useEffect, useRef } from "react";

const COLORS = {
  primary: "#1D9E75",
  primaryDark: "#0F6E56",
  primaryLight: "#E1F5EE",
  accent: "#378ADD",
  accentLight: "#E6F1FB",
  amber: "#EF9F27",
  amberLight: "#FAEEDA",
  red: "#E24B4A",
  redLight: "#FCEBEB",
  purple: "#7F77DD",
  purpleLight: "#EEEDFE",
  gray: "#888780",
  grayLight: "#F1EFE8",
  dark: "#2C2C2A",
  muted: "#5F5E5A",
};

const BUDGET_DATA = {
  totalBudget: 4200000000,
  spent: 2730000000,
  departments: [
    { name: "Infrastructure", allocated: 1200000000, spent: 820000000, color: COLORS.accent },
    { name: "Health & Welfare", allocated: 980000000, spent: 750000000, color: COLORS.primary },
    { name: "Education", allocated: 870000000, spent: 600000000, color: COLORS.purple },
    { name: "Public Safety", allocated: 650000000, spent: 390000000, color: COLORS.amber },
    { name: "Environment", allocated: 300000000, spent: 110000000, color: COLORS.primaryDark },
    { name: "Administration", allocated: 200000000, spent: 60000000, color: COLORS.gray },
  ],
};

const PROJECTS = [
  { id: 1, name: "Nairobi-Mombasa Highway Expansion", dept: "Infrastructure", budget: 450000000, spent: 312000000, status: "Active", start: "Jan 2024", end: "Dec 2025", progress: 69 },
  { id: 2, name: "County General Hospital Upgrade", dept: "Health & Welfare", budget: 180000000, spent: 95000000, status: "Active", start: "Mar 2024", end: "Jun 2025", progress: 53 },
  { id: 3, name: "Rural School Construction Phase II", dept: "Education", budget: 240000000, spent: 240000000, status: "Completed", start: "Feb 2023", end: "Jan 2024", progress: 100 },
  { id: 4, name: "Police Station Modernisation", dept: "Public Safety", budget: 75000000, spent: 20000000, status: "Planning", start: "Jul 2024", end: "Mar 2025", progress: 27 },
  { id: 5, name: "Solar Street Lighting Initiative", dept: "Environment", budget: 55000000, spent: 38000000, status: "Active", start: "Apr 2024", end: "Sep 2024", progress: 69 },
  { id: 6, name: "Digital County Records System", dept: "Administration", budget: 30000000, spent: 14000000, status: "Active", start: "May 2024", end: "Nov 2024", progress: 47 },
];

const OPINIONS = [
  { id: 1, name: "Mary W.", initials: "MW", dept: "Infrastructure", text: "The road expansion near Kasarani has improved traffic significantly. We need similar work on Eastern Bypass.", rating: 5, date: "Jun 10, 2024" },
  { id: 2, name: "James O.", initials: "JO", dept: "Health & Welfare", text: "Waiting times at the county clinic have improved but medicine shortages remain a persistent problem.", rating: 3, date: "Jun 8, 2024" },
  { id: 3, name: "Fatuma A.", initials: "FA", dept: "Education", text: "New classrooms in Pumwani are excellent. Teachers need better training resources alongside infrastructure.", rating: 4, date: "Jun 5, 2024" },
  { id: 4, name: "Peter N.", initials: "PN", dept: "Public Safety", text: "Pleased to see investment in public safety, but street lighting in estates must improve urgently.", rating: 3, date: "Jun 3, 2024" },
  { id: 5, name: "Achieng' R.", initials: "AR", dept: "Environment", text: "Solar lighting project has changed our neighbourhood. Extend this to Mathare and Kibera too.", rating: 5, date: "May 28, 2024" },
];

const fmt = (n) => `KSh ${(n / 1e6).toFixed(1)}M`;
const fmtB = (n) => `KSh ${(n / 1e9).toFixed(2)}B`;
const pct = (a, b) => Math.round((a / b) * 100);

function ProgressBar({ value, color = COLORS.primary, height = 6 }) {
  return (
    <div style={{ background: "#e8e8e5", borderRadius: 99, height, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(value, 100)}%`, height: "100%", background: color, borderRadius: 99, transition: "width .6s ease" }} />
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Active: { bg: COLORS.primaryLight, color: COLORS.primaryDark },
    Completed: { bg: COLORS.accentLight, color: "#185FA5" },
    Planning: { bg: COLORS.amberLight, color: "#854F0B" },
  };
  const s = map[status] || map.Planning;
  return <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 99 }}>{status}</span>;
}

function Stars({ rating }) {
  return (
    <span style={{ color: COLORS.amber, fontSize: 13 }}>
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

function Avatar({ initials, color = COLORS.primaryLight, textColor = COLORS.primaryDark }) {
  return (
    <div style={{ width: 38, height: 38, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500, fontSize: 13, color: textColor, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function DonutChart({ data, size = 160 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  const r = 60, cx = 80, cy = 80, stroke = 22;
  const slices = data.map((d) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return { ...d, d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, pct: Math.round((d.value / total) * 100) };
  });
  return (
    <svg width={size} height={size} viewBox="0 0 160 160">
      {slices.map((s, i) => (
        <path key={i} d={s.d} fill="none" stroke={s.color} strokeWidth={stroke} strokeLinecap="butt" />
      ))}
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize={12} fill={COLORS.muted}>Spent</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={18} fontWeight={500} fill={COLORS.dark}>{pct(BUDGET_DATA.spent, BUDGET_DATA.totalBudget)}%</text>
    </svg>
  );
}

function BarChart({ data }) {
  const maxVal = Math.max(...data.map((d) => d.allocated));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {data.map((d, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
            <span style={{ color: COLORS.dark, fontWeight: 500 }}>{d.name}</span>
            <span style={{ color: COLORS.muted }}>{fmt(d.spent)} / {fmt(d.allocated)}</span>
          </div>
          <div style={{ background: "#e8e8e5", borderRadius: 99, height: 10, overflow: "hidden", position: "relative" }}>
            <div style={{ width: `${(d.allocated / maxVal) * 100}%`, height: "100%", background: d.color + "33", borderRadius: 99, position: "absolute" }} />
            <div style={{ width: `${(d.spent / maxVal) * 100}%`, height: "100%", background: d.color, borderRadius: 99, position: "absolute", transition: "width .6s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ======================== PAGES ========================

function HomePage({ setPage }) {
  const remaining = BUDGET_DATA.totalBudget - BUDGET_DATA.spent;
  return (
    <div style={{ paddingBottom: "3rem" }}>
      {/* Hero */}
      <div style={{ padding: "4rem 0 3rem", borderBottom: "0.5px solid #e0dfd8", marginBottom: "2.5rem" }}>
        <p style={{ fontSize: 12, color: COLORS.primary, fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1.5 }}>Nairobi County · Fiscal Year 2024</p>
        <h1 style={{ fontSize: 42, fontWeight: 600, margin: "0 0 16px", color: COLORS.dark, lineHeight: 1.15, maxWidth: 620 }}>
          Where does your county's money go?
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 17, margin: "0 0 2rem", maxWidth: 540, lineHeight: 1.7 }}>
          Track every shilling of public spending across departments and projects — openly, in real time.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => setPage("projects")} style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "12px 24px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
            Explore projects →
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: "2.5rem" }}>
        {[
          { label: "Total Budget", val: fmtB(BUDGET_DATA.totalBudget), color: COLORS.dark },
          { label: "Spent to Date", val: fmtB(BUDGET_DATA.spent), color: COLORS.primary },
          { label: "Remaining", val: fmtB(remaining), color: COLORS.accent },
          { label: "Utilisation", val: `${pct(BUDGET_DATA.spent, BUDGET_DATA.totalBudget)}%`, color: COLORS.amber },
        ].map((m) => (
          <div key={m.label} style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 12, padding: "1.25rem 1.5rem" }}>
            <p style={{ fontSize: 11, color: COLORS.muted, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: .8 }}>{m.label}</p>
            <p style={{ fontSize: 24, fontWeight: 600, margin: 0, color: m.color }}>{m.val}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: "2.5rem" }}>
        <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 12, padding: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: 15, fontWeight: 500, color: COLORS.dark }}>Budget utilisation</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <DonutChart data={BUDGET_DATA.departments.map((d) => ({ value: d.spent, color: d.color }))} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {BUDGET_DATA.departments.map((d) => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                  <span style={{ color: COLORS.muted }}>{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 12, padding: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1.2rem", fontSize: 15, fontWeight: 500, color: COLORS.dark }}>Spend by department</h3>
          <BarChart data={BUDGET_DATA.departments} />
        </div>
      </div>

      {/* CTA strip */}
      <div style={{ background: COLORS.primaryLight, borderRadius: 12, padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 500, color: COLORS.primaryDark }}>
            {PROJECTS.filter(p => p.status === "Active").length} active projects this quarter
          </h3>
          <p style={{ margin: 0, color: COLORS.primaryDark, fontSize: 14 }}>
            Across {BUDGET_DATA.departments.length} departments · Updated daily
          </p>
        </div>
        <button onClick={() => setPage("projects")} style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
          View all projects →
        </button>
      </div>
    </div>
  );
}

function ProjectsPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const statuses = ["All", "Active", "Completed", "Planning"];
  const visible = PROJECTS.filter(p =>
    (filter === "All" || p.status === filter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.dept.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div style={{ padding: "2rem 0" }}>
      <h2 style={{ margin: "0 0 1.5rem", fontWeight: 500, fontSize: 22 }}>Projects</h2>
      <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." style={{ flex: 1, minWidth: 200, padding: "8px 12px", border: "0.5px solid #ccc", borderRadius: 8, fontSize: 14, outline: "none" }} />
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: "8px 16px", borderRadius: 8, border: `0.5px solid ${filter === s ? COLORS.primary : "#ccc"}`, background: filter === s ? COLORS.primaryLight : "#fff", color: filter === s ? COLORS.primaryDark : COLORS.muted, cursor: "pointer", fontSize: 13 }}>
            {s}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visible.map(p => (
          <div key={p.id} style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 12, padding: "1.25rem 1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: 15, color: COLORS.dark }}>{p.name}</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: COLORS.muted }}>{p.dept} · {p.start} – {p.end}</p>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: COLORS.muted, marginBottom: 8 }}>
              <span>Spent: <strong style={{ color: COLORS.dark }}>{fmt(p.spent)}</strong></span>
              <span>Budget: <strong style={{ color: COLORS.dark }}>{fmt(p.budget)}</strong></span>
              <span>Progress: <strong style={{ color: COLORS.primary }}>{p.progress}%</strong></span>
            </div>
            <ProgressBar value={p.progress} color={p.status === "Completed" ? COLORS.accent : p.status === "Planning" ? COLORS.amber : COLORS.primary} height={8} />
          </div>
        ))}
        {visible.length === 0 && <p style={{ color: COLORS.muted, textAlign: "center", padding: "2rem" }}>No projects match this filter.</p>}
      </div>
    </div>
  );
}

function ReportsPage() {
  const quarters = [
    { q: "Q1 2024", budget: 1050000000, spent: 680000000 },
    { q: "Q2 2024", budget: 1050000000, spent: 920000000 },
    { q: "Q3 2024", budget: 1050000000, spent: 780000000 },
    { q: "Q4 2024", budget: 1050000000, spent: 350000000 },
  ];
  return (
    <div style={{ padding: "2rem 0" }}>
      <h2 style={{ margin: "0 0 1.5rem", fontWeight: 500, fontSize: 22 }}>Reports</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: "2rem" }}>
        {quarters.map((q) => (
          <div key={q.q} style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 12, padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontWeight: 500, fontSize: 15, color: COLORS.dark }}>{q.q}</span>
              <span style={{ fontSize: 13, color: COLORS.muted }}>{pct(q.spent, q.budget)}% used</span>
            </div>
            <ProgressBar value={pct(q.spent, q.budget)} color={pct(q.spent, q.budget) > 85 ? COLORS.red : COLORS.primary} height={10} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: COLORS.muted }}>
              <span>Spent: {fmt(q.spent)}</span>
              <span>Budget: {fmt(q.budget)}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: "0 0 1.2rem", fontWeight: 500, fontSize: 15 }}>Department expenditure summary</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f7f6f2" }}>
              {["Department", "Allocated", "Spent", "Remaining", "% Used"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontWeight: 500, color: COLORS.muted, fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BUDGET_DATA.departments.map((d, i) => {
              const rem = d.allocated - d.spent;
              const u = pct(d.spent, d.allocated);
              return (
                <tr key={i} style={{ borderTop: "0.5px solid #eeede8" }}>
                  <td style={{ padding: "10px 12px" }}><span style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />{d.name}</span></td>
                  <td style={{ padding: "10px 12px", color: COLORS.muted }}>{fmt(d.allocated)}</td>
                  <td style={{ padding: "10px 12px", color: COLORS.dark, fontWeight: 500 }}>{fmt(d.spent)}</td>
                  <td style={{ padding: "10px 12px", color: rem < 0 ? COLORS.red : COLORS.muted }}>{fmt(rem)}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ background: u > 85 ? COLORS.redLight : COLORS.primaryLight, color: u > 85 ? "#A32D2D" : COLORS.primaryDark, padding: "2px 8px", borderRadius: 6, fontSize: 12 }}>{u}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {["Download PDF Report", "Export CSV Data"].map(btn => (
          <button key={btn} onClick={() => {
            if (btn === "Download PDF Report") {
              alert("📄 Your PDF report is being prepared.\n\nReport: Nairobi County Budget FY2024\nDepartments: All 6\nGenerated: " + new Date().toLocaleString() + "\n\nYour download will begin shortly.");
            } else {
              alert("📊 CSV export ready.\n\nFile: nairobi_county_budget_2024.csv\nRecords: " + (6 + 6) + " rows\nGenerated: " + new Date().toLocaleString() + "\n\nYour download will begin shortly.");
            }
          }} style={{ padding: "10px 20px", border: `0.5px solid ${COLORS.primary}`, borderRadius: 8, color: COLORS.primaryDark, background: COLORS.primaryLight, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
            ↓ {btn}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatisticsPage() {
  const completionRate = Math.round(PROJECTS.filter(p => p.status === "Completed").length / PROJECTS.length * 100);
  const avgProgress = Math.round(PROJECTS.reduce((s, p) => s + p.progress, 0) / PROJECTS.length);
  const overBudget = PROJECTS.filter(p => p.spent > p.budget).length;
  return (
    <div style={{ padding: "2rem 0" }}>
      <h2 style={{ margin: "0 0 1.5rem", fontWeight: 500, fontSize: 22 }}>Statistics</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: "2rem" }}>
        {[
          { label: "Completion rate", val: `${completionRate}%`, sub: "of all projects", color: COLORS.primary },
          { label: "Avg. progress", val: `${avgProgress}%`, sub: "active projects", color: COLORS.accent },
          { label: "Over budget", val: overBudget, sub: "projects flagged", color: COLORS.red },
          { label: "Departments", val: BUDGET_DATA.departments.length, sub: "receiving funds", color: COLORS.purple },
          { label: "Total projects", val: PROJECTS.length, sub: "this fiscal year", color: COLORS.amber },
          { label: "Citizens engaged", val: "2,847", sub: "opinions submitted", color: COLORS.primaryDark },
        ].map(m => (
          <div key={m.label} style={{ background: "#f7f6f2", borderRadius: 10, padding: "1rem 1.25rem" }}>
            <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: .5 }}>{m.label}</p>
            <p style={{ fontSize: 26, fontWeight: 500, margin: "0 0 2px", color: m.color }}>{m.val}</p>
            <p style={{ fontSize: 11, color: COLORS.muted, margin: 0 }}>{m.sub}</p>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: "0 0 1.2rem", fontWeight: 500, fontSize: 15 }}>Project status breakdown</h3>
        {[
          { status: "Active", count: PROJECTS.filter(p => p.status === "Active").length, color: COLORS.primary },
          { status: "Completed", count: PROJECTS.filter(p => p.status === "Completed").length, color: COLORS.accent },
          { status: "Planning", count: PROJECTS.filter(p => p.status === "Planning").length, color: COLORS.amber },
        ].map(s => (
          <div key={s.status} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ width: 80, fontSize: 13, color: COLORS.muted }}>{s.status}</span>
            <div style={{ flex: 1, background: "#e8e8e5", borderRadius: 99, height: 14, overflow: "hidden" }}>
              <div style={{ width: `${(s.count / PROJECTS.length) * 100}%`, height: "100%", background: s.color, borderRadius: 99 }} />
            </div>
            <span style={{ width: 24, fontSize: 13, fontWeight: 500, color: COLORS.dark }}>{s.count}</span>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 12, padding: "1.5rem" }}>
        <h3 style={{ margin: "0 0 1.2rem", fontWeight: 500, fontSize: 15 }}>Budget efficiency per department</h3>
        {BUDGET_DATA.departments.map((d, i) => {
          const eff = pct(d.spent, d.allocated);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ width: 120, fontSize: 13, color: COLORS.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</span>
              <div style={{ flex: 1 }}><ProgressBar value={eff} color={d.color} height={12} /></div>
              <span style={{ width: 36, fontSize: 13, fontWeight: 500, color: COLORS.dark }}>{eff}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoginModal({ onLogin, onClose }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    setTimeout(() => { setLoading(false); onLogin({ name: form.email.split("@")[0], role: "County Officer" }); }, 1000);
  };
  const handleRegister = () => {
    if (!form.name || !form.email || !form.password) { setError("Please fill in all fields."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    setLoading(true); setError("");
    setTimeout(() => { setLoading(false); onLogin({ name: form.name, role: "Citizen" }); }, 1000);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(44,44,42,0.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 400, position: "relative", boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", fontSize: 20, color: COLORS.muted, cursor: "pointer", lineHeight: 1 }}>✕</button>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ width: 42, height: 42, background: COLORS.primaryLight, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", fontSize: 20 }}>🔒</div>
          <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 500, color: COLORS.dark }}>Sign in to share your opinion</h2>
          <p style={{ margin: 0, fontSize: 13, color: COLORS.muted }}>Your voice matters — log in to leave feedback.</p>
        </div>
        <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", marginBottom: "1.2rem", border: "0.5px solid #e0dfd8" }}>
          {["login", "register"].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); }} style={{ flex: 1, padding: "8px", border: "none", background: tab === t ? COLORS.primary : "transparent", color: tab === t ? "#fff" : COLORS.muted, cursor: "pointer", fontSize: 13, fontWeight: tab === t ? 500 : 400 }}>
              {t === "login" ? "Sign in" : "Register"}
            </button>
          ))}
        </div>
        {tab === "register" && (
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" style={{ width: "100%", padding: "10px 12px", border: "0.5px solid #ccc", borderRadius: 8, fontSize: 14, marginBottom: 10, boxSizing: "border-box" }} />
        )}
        <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email address" type="email" style={{ width: "100%", padding: "10px 12px", border: "0.5px solid #ccc", borderRadius: 8, fontSize: 14, marginBottom: 10, boxSizing: "border-box" }} />
        <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Password" type="password" style={{ width: "100%", padding: "10px 12px", border: "0.5px solid #ccc", borderRadius: 8, fontSize: 14, marginBottom: 10, boxSizing: "border-box" }} />
        {tab === "register" && (
          <input value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Confirm password" type="password" style={{ width: "100%", padding: "10px 12px", border: "0.5px solid #ccc", borderRadius: 8, fontSize: 14, marginBottom: 10, boxSizing: "border-box" }} />
        )}
        {error && <p style={{ color: COLORS.red, fontSize: 13, margin: "0 0 10px" }}>{error}</p>}
        <button onClick={tab === "login" ? handleLogin : handleRegister} disabled={loading} style={{ width: "100%", padding: "11px", background: COLORS.primary, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .8 : 1 }}>
          {loading ? "Please wait..." : tab === "login" ? "Sign in" : "Create account"}
        </button>
        {tab === "login" && <p style={{ textAlign: "center", fontSize: 11, color: COLORS.muted, marginTop: 10, marginBottom: 0 }}>Demo: any email + password works</p>}
      </div>
    </div>
  );
}

function OpinionsPage({ user, onLogin }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ dept: "Infrastructure", text: "", rating: 4 });
  const [opinions, setOpinions] = useState(OPINIONS);
  const [filter, setFilter] = useState("All");
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleSubmit = () => {
    if (!form.text) return;
    const name = user.name;
    const initials = name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    setOpinions([{ id: Date.now(), name, initials, dept: form.dept, text: form.text, rating: form.rating, date: "Just now" }, ...opinions]);
    setForm({ dept: "Infrastructure", text: "", rating: 4 });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const depts = ["All", ...BUDGET_DATA.departments.map(d => d.name)];
  const visible = opinions.filter(o => filter === "All" || o.dept === filter);

  return (
    <div style={{ padding: "2rem 0" }}>
      {showLoginModal && <LoginModal onLogin={(u) => { onLogin(u); setShowLoginModal(false); }} onClose={() => setShowLoginModal(false)} />}
      <h2 style={{ margin: "0 0 1.5rem", fontWeight: 500, fontSize: 22 }}>Citizen opinions</h2>

      {/* Feedback form — gated */}
      {user ? (
        <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.2rem" }}>
            <Avatar initials={user.name[0].toUpperCase()} />
            <div>
              <p style={{ margin: 0, fontWeight: 500, fontSize: 14, color: COLORS.dark }}>{user.name}</p>
              <p style={{ margin: 0, fontSize: 12, color: COLORS.muted }}>{user.role} · sharing feedback</p>
            </div>
          </div>
          <select value={form.dept} onChange={e => setForm(f => ({ ...f, dept: e.target.value }))} style={{ width: "100%", padding: "9px 12px", border: "0.5px solid #ccc", borderRadius: 8, fontSize: 14, marginBottom: 12 }}>
            {BUDGET_DATA.departments.map(d => <option key={d.name}>{d.name}</option>)}
          </select>
          <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="Share your experience or suggestion about county spending..." style={{ width: "100%", padding: "9px 12px", border: "0.5px solid #ccc", borderRadius: 8, fontSize: 14, minHeight: 90, resize: "vertical", boxSizing: "border-box" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: COLORS.muted }}>Rating:</span>
              {[1,2,3,4,5].map(r => (
                <button key={r} onClick={() => setForm(f => ({ ...f, rating: r }))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: r <= form.rating ? COLORS.amber : "#ccc", padding: 0, lineHeight: 1 }}>★</button>
              ))}
            </div>
            <button onClick={handleSubmit} style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "9px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
              {submitted ? "✓ Submitted!" : "Submit feedback"}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 12, padding: "2rem", marginBottom: "1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
          <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 500, color: COLORS.dark }}>Sign in to share your opinion</h3>
          <p style={{ margin: "0 0 1.2rem", fontSize: 14, color: COLORS.muted }}>Join 2,847 citizens who have already shared their feedback on county spending.</p>
          <button onClick={() => setShowLoginModal(true)} style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "10px 28px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
            Sign in / Register →
          </button>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1.2rem" }}>
        {depts.map(d => (
          <button key={d} onClick={() => setFilter(d)} style={{ padding: "6px 14px", borderRadius: 99, border: `0.5px solid ${filter === d ? COLORS.primary : "#ccc"}`, background: filter === d ? COLORS.primaryLight : "#fff", color: filter === d ? COLORS.primaryDark : COLORS.muted, cursor: "pointer", fontSize: 12 }}>
            {d}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visible.map(o => (
          <div key={o.id} style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 12, padding: "1.25rem" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Avatar initials={o.initials} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div>
                    <span style={{ fontWeight: 500, fontSize: 14, color: COLORS.dark }}>{o.name}</span>
                    <span style={{ marginLeft: 10, fontSize: 12, background: COLORS.grayLight, color: COLORS.muted, padding: "2px 8px", borderRadius: 6 }}>{o.dept}</span>
                  </div>
                  <span style={{ fontSize: 11, color: COLORS.muted }}>{o.date}</span>
                </div>
                <Stars rating={o.rating} />
                <p style={{ margin: "6px 0 0", fontSize: 14, color: COLORS.muted, lineHeight: 1.6 }}>{o.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ======================== SHELL ========================

const NAV = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "reports", label: "Reports" },
  { id: "statistics", label: "Statistics" },
  { id: "opinions", label: "Citizen Opinions" },
];

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);

  const pages = {
    home: <HomePage setPage={setPage} />,
    projects: <ProjectsPage />,
    reports: <ReportsPage />,
    statistics: <StatisticsPage />,
    opinions: <OpinionsPage user={user} onLogin={(u) => setUser(u)} />,
  };

  return (
    <div style={{ minHeight: "100vh", fontFamily: "system-ui, sans-serif", background: "#f7f6f2" }}>
      {/* Top Navbar */}
      <header style={{ background: "#fff", borderBottom: "0.5px solid #e0dfd8", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          {/* Logo */}
          <button onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <div style={{ width: 32, height: 32, background: COLORS.primary, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>🏛️</div>
            <div style={{ textAlign: "left" }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: COLORS.dark, lineHeight: 1.2 }}>Nairobi County</p>
              <p style={{ margin: 0, fontSize: 11, color: COLORS.muted, lineHeight: 1.2 }}>Budget Tracker</p>
            </div>
          </button>

          {/* Desktop nav links */}
          <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {NAV.map(n => (
              <button
                key={n.id}
                onClick={() => setPage(n.id)}
                style={{
                  padding: "6px 14px",
                  border: "none",
                  background: page === n.id ? COLORS.primaryLight : "transparent",
                  color: page === n.id ? COLORS.primaryDark : COLORS.muted,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: page === n.id ? 600 : 400,
                  borderRadius: 8,
                  borderBottom: page === n.id ? `2px solid ${COLORS.primary}` : "2px solid transparent",
                  transition: "all .15s",
                }}
              >
                {n.label}
              </button>
            ))}
          </nav>

          {/* Right side: user or sign in */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 12, color: COLORS.primaryDark }}>
                  {user.name[0].toUpperCase()}
                </div>
                <span style={{ fontSize: 13, color: COLORS.dark, fontWeight: 500 }}>{user.name}</span>
                <button onClick={() => setUser(null)} style={{ fontSize: 12, color: COLORS.muted, background: "none", border: "0.5px solid #e0dfd8", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>Sign out</button>
              </div>
            ) : (
              <button onClick={() => setPage("opinions")} style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2rem" }}>
        {pages[page] || pages.home}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "0.5px solid #e0dfd8", marginTop: "4rem", padding: "1.5rem 2rem", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 12, color: COLORS.muted }}>
          © 2026 Nairobi County Government · Fiscal Transparency Portal · Data updated daily
        </p>
      </footer>
    </div>
  );
}
