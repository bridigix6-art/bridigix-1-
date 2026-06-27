import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "@assets/Screenshot_2026-06-04-07-57-10-533_com.canva.editor-edit_17805_1780625194177.jpg";

const API_BASE = "/api";

interface CompletedIntake {
  id: string;
  session_id: string;
  email: string | null;
  screenshot_url: string | null;
  pdf_url: string | null;
  stage: string;
  confirmed_at: string;
  created_at: string;
}

interface Conversation {
  id: string;
  email: string;
  ip_address: string;
  user_agent: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Application {
  id: string;
  name: string;
  email: string;
  form_data: Record<string, unknown>;
  ip_address: string;
  created_at: string;
}

interface Stats {
  totalConversations: number;
  totalApplications: number;
  completedIntakes: number;
}

function formatDate(str: string) {
  return new Date(str).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function LoginScreen({ onLogin }: { onLogin: (pwd: string) => Promise<boolean> }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError("");
    const ok = await onLogin(password);
    if (!ok) setError("Incorrect password. Try again.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#08080A" }}>
      <div className="absolute inset-0" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.012) 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[400px] mx-4"
      >
        <div
          className="rounded-[24px] p-8"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[24px]" style={{ background: "linear-gradient(90deg, #1A7A4A, #34D399, #F5C518)" }} />
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl overflow-hidden mb-4" style={{ background: "rgba(26,122,74,0.15)", border: "1px solid rgba(52,211,153,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={logoImage} alt="Bridigix" style={{ width: "70%", height: "70%", objectFit: "contain" }} />
            </div>
            <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 22, color: "#FFFFFF", letterSpacing: "-0.02em", marginBottom: 4 }}>Admin Access</h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Bridigix internal dashboard</p>
          </div>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              placeholder="Enter admin password"
              autoFocus
              style={{
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${error ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.12)"}`,
                borderRadius: 12, padding: "14px 18px", color: "#FFFFFF",
                fontFamily: "'Inter', sans-serif", fontSize: 15, outline: "none", transition: "border-color 0.2s",
              }}
              onFocus={e => { if (!error) e.target.style.borderColor = "rgba(52,211,153,0.4)"; }}
              onBlur={e => { if (!error) e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
            />
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#ef4444", marginTop: -8 }}>
                {error}
              </motion.p>
            )}
            <button
              type="submit"
              disabled={loading || !password.trim()}
              style={{
                background: password.trim() && !loading ? "linear-gradient(135deg, #1A7A4A, #2A9D5C)" : "rgba(255,255,255,0.08)",
                border: "none", borderRadius: 12, padding: "14px",
                color: password.trim() && !loading ? "#FFFFFF" : "rgba(255,255,255,0.3)",
                fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 500,
                cursor: password.trim() && !loading ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                boxShadow: password.trim() && !loading ? "0 4px 16px rgba(26,122,74,0.35)" : "none",
              }}
            >
              {loading ? "Verifying..." : "Sign in"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-[16px] p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 38, fontWeight: 300, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1 }}>
        <span style={{ color }}>{value}</span>
      </p>
    </div>
  );
}

function CompletedIntakeCard({ intake }: { intake: CompletedIntake }) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="rounded-[14px] transition-all duration-200"
      style={{
        background: expanded ? "rgba(26,122,74,0.08)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${expanded ? "rgba(26,122,74,0.25)" : "rgba(255,255,255,0.07)"}`,
        overflow: "hidden",
      }}
    >
      {/* Row header */}
      <div className="p-4 flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(26,122,74,0.15)", border: "1px solid rgba(52,211,153,0.2)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(52,211,153,0.9)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M20 6L9 17L4 12"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#FFFFFF" }}>{intake.email || "No email"}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, background: "rgba(52,211,153,0.15)", color: "rgba(52,211,153,0.9)", borderRadius: 6, padding: "1px 7px" }}>
              Confirmed
            </span>
          </div>
          <div className="flex items-center gap-3">
            {intake.screenshot_url && (
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>📸 Screenshot</span>
            )}
            {intake.pdf_url && (
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>📄 PDF</span>
            )}
            {!intake.screenshot_url && !intake.pdf_url && (
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>No files yet</span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{formatDate(intake.confirmed_at)}</p>
          <p style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>
            {intake.session_id?.slice(0, 8)}…
          </p>
        </div>
        <svg
          style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.3s", color: "rgba(255,255,255,0.3)", flexShrink: 0, marginLeft: 4 }}
          width="14" height="14" viewBox="0 0 14 14" fill="none"
        >
          <path d="M2 4L7 9L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="p-5 flex flex-col gap-5">

              {/* Screenshot */}
              {intake.screenshot_url && !imgError && (
                <div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                    Conversation Screenshot
                  </p>
                  <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden", maxHeight: 420 }}>
                    <img
                      src={intake.screenshot_url}
                      alt="Conversation screenshot"
                      style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }}
                      onError={() => setImgError(true)}
                    />
                  </div>
                  <a
                    href={intake.screenshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(52,211,153,0.8)", marginTop: 6, display: "inline-block" }}
                  >
                    Open full image ↗
                  </a>
                </div>
              )}

              {intake.screenshot_url && imgError && (
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "14px 16px" }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Screenshot (signed URL may have expired)</p>
                  <a href={intake.screenshot_url} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(52,211,153,0.8)" }}>
                    Open screenshot ↗
                  </a>
                </div>
              )}

              {/* PDF */}
              {intake.pdf_url && (
                <div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                    Hiring Brief PDF
                  </p>
                  <a
                    href={intake.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      background: "rgba(26,122,74,0.12)", border: "1px solid rgba(26,122,74,0.25)",
                      borderRadius: 10, padding: "11px 20px",
                      fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(52,211,153,0.9)",
                      textDecoration: "none", transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(26,122,74,0.2)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(26,122,74,0.12)"; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                    Download Hiring Brief PDF
                  </a>
                </div>
              )}

              {!intake.screenshot_url && !intake.pdf_url && (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
                  No files were uploaded for this intake. This may be an older record or the upload failed.
                </p>
              )}

              {/* Meta */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 12 }}>
                <p style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
                  Session: {intake.session_id}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConversationCard({ conv, expanded, onClick }: { conv: Conversation; expanded: boolean; onClick: () => void }) {
  return (
    <div
      className="rounded-[14px] cursor-pointer transition-all duration-200"
      style={{
        background: expanded ? "rgba(26,122,74,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${expanded ? "rgba(26,122,74,0.18)" : "rgba(255,255,255,0.07)"}`,
        overflow: "hidden",
      }}
      onClick={onClick}
    >
      <div className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#FFFFFF" }}>{conv.email || "No email"}</span>
            {conv.status && (
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)", borderRadius: 5, padding: "1px 6px" }}>
                {conv.status}
              </span>
            )}
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
            {conv.ip_address || "—"}
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{formatDate(conv.updated_at)}</p>
        </div>
      </div>
    </div>
  );
}

function ApplicationCard({ app }: { app: Application }) {
  const [expanded, setExpanded] = useState(false);
  const formData = app.form_data as Record<string, unknown>;

  return (
    <div
      className="rounded-[14px] cursor-pointer transition-all duration-200"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(245,200,66,0.12)", border: "1px solid rgba(245,200,66,0.2)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(245,200,66,0.8)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#FFFFFF", display: "block" }}>{app.name || "No name"}</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{app.email}</span>
        </div>
        <div className="flex-shrink-0 text-right">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{formatDate(app.created_at)}</p>
          {typeof formData?.role === "string" && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(245,200,66,0.6)", marginTop: 2 }}>{formData.role}</p>
          )}
        </div>
        <svg
          style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.3s", color: "rgba(255,255,255,0.3)", flexShrink: 0, marginLeft: 4 }}
          width="14" height="14" viewBox="0 0 14 14" fill="none"
        >
          <path d="M2 4L7 9L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="p-4 grid grid-cols-2 gap-3">
              {Object.entries(formData ?? {}).map(([key, val]) => (
                <div key={key}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 2 }}>{key}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                    {Array.isArray(val) ? val.join(", ") : String(val ?? "—")}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<"intakes" | "conversations" | "applications">("intakes");
  const [intakes, setIntakes] = useState<CompletedIntake[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedConvId, setExpandedConvId] = useState<string | null>(null);
  const [setupRunning, setSetupRunning] = useState(false);

  const login = async (pwd: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/admin/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      if (res.ok) {
        setPassword(pwd);
        setAuthed(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const fetchData = useCallback(async () => {
    if (!authed || !password) return;
    setLoading(true);
    try {
      const headers = { "x-admin-password": password };
      const [intakeRes, convRes, appRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/admin/completed-intakes`, { headers }),
        fetch(`${API_BASE}/admin/conversations`, { headers }),
        fetch(`${API_BASE}/admin/applications`, { headers }),
        fetch(`${API_BASE}/admin/stats`, { headers }),
      ]);
      const [intakeData, convData, appData, statsData] = await Promise.all([
        intakeRes.json(), convRes.json(), appRes.json(), statsRes.json()
      ]);
      setIntakes(intakeData.intakes ?? []);
      setConversations(convData.conversations ?? []);
      setApplications(appData.applications ?? []);
      setStats(statsData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [authed, password]);

  const runSetup = async () => {
    setSetupRunning(true);
    try {
      await fetch(`${API_BASE}/admin/setup-db`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
      });
      await fetchData();
    } catch { /* ignore */ }
    setSetupRunning(false);
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  if (!authed) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <div className="min-h-screen" style={{ background: "#08080A" }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.012) 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }} />

      {/* Header */}
      <div className="relative border-b" style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
        <div className="max-w-[1100px] mx-auto px-6 flex items-center justify-between" style={{ height: 64 }}>
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Bridigix" style={{ width: 26, height: 26, objectFit: "contain" }} />
            <div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 15, color: "#FFFFFF" }}>Bridigix</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.35)", marginLeft: 8 }}>Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={runSetup}
              disabled={setupRunning}
              title="Create completed_intakes table if it doesn't exist"
              style={{
                background: "rgba(26,122,74,0.12)", border: "1px solid rgba(26,122,74,0.25)",
                borderRadius: 8, padding: "7px 14px", color: "rgba(52,211,153,0.8)",
                fontFamily: "'Inter', sans-serif", fontSize: 12, cursor: "pointer",
              }}
            >
              {setupRunning ? "Setting up..." : "Setup DB"}
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8, padding: "7px 14px", color: "rgba(255,255,255,0.55)",
                fontFamily: "'Inter', sans-serif", fontSize: 12, cursor: "pointer",
              }}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={() => setAuthed(false)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif", fontSize: 12, cursor: "pointer" }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="relative max-w-[1100px] mx-auto px-6 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <StatCard label="Completed Intakes" value={stats.completedIntakes} color="#34D399" />
            <StatCard label="Applications" value={stats.totalApplications} color="#F5C518" />
            <StatCard label="In-Progress Chats" value={stats.totalConversations} color="rgba(255,255,255,0.5)" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-[12px] w-fit" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {([
            ["intakes", `Completed Briefs (${intakes.length})`],
            ["conversations", `In-Progress (${conversations.length})`],
            ["applications", `Applications (${applications.length})`],
          ] as const).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                borderRadius: 9, padding: "8px 18px",
                background: tab === t ? "rgba(255,255,255,0.10)" : "transparent",
                border: tab === t ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                color: tab === t ? "#FFFFFF" : "rgba(255,255,255,0.40)",
                fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: tab === t ? 500 : 400,
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && intakes.length === 0 && conversations.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.3)" }}>Loading data...</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tab === "intakes" && (
              intakes.length === 0 ? (
                <div className="text-center py-16">
                  <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif", fontSize: 14, marginBottom: 8 }}>
                    No completed intakes yet.
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'Inter', sans-serif", fontSize: 12 }}>
                    Once a founder confirms their hiring brief, a screenshot and PDF will appear here. Make sure to click <strong style={{ color: "rgba(255,255,255,0.35)" }}>Setup DB</strong> first if this is a fresh deployment.
                  </p>
                </div>
              ) : (
                intakes.map(intake => <CompletedIntakeCard key={intake.id} intake={intake} />)
              )
            )}
            {tab === "conversations" && (
              conversations.length === 0 ? (
                <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif", fontSize: 14 }}>
                  No in-progress conversations.
                </div>
              ) : (
                conversations.map(conv => (
                  <ConversationCard
                    key={conv.id}
                    conv={conv}
                    expanded={expandedConvId === conv.id}
                    onClick={() => setExpandedConvId(expandedConvId === conv.id ? null : conv.id)}
                  />
                ))
              )
            )}
            {tab === "applications" && (
              applications.length === 0 ? (
                <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif", fontSize: 14 }}>
                  No applications yet.
                </div>
              ) : (
                applications.map(app => <ApplicationCard key={app.id} app={app} />)
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
