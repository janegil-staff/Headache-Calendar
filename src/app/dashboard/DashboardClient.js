"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import { translations } from "@/lib/translations";

import CalendarPanel from "@/components/dashboard/CalendarPanel";
import DayDetailDrawer from "@/components/dashboard/DayDetailDrawer";
import MonthlySidebar from "@/components/dashboard/MonthlySidebar";

function parsePatientData() {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem("patientData");
  return raw ? JSON.parse(raw) : null;
}

export default function Dashboard() {
  const router   = useRouter();
  const { lang } = useLang();
  const t        = translations[lang] ?? translations.en;

  const [patient]                           = useState(() => parsePatientData());
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen]         = useState(false);

  const now = new Date();
  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const [filters, setFilters] = useState({
    medicines:  true,
    injections: true,
    migraine:   true,
    cluster:    false,
    notes:      true,
  });

  useEffect(() => { if (!patient) router.replace("/"); }, [patient, router]);
  if (!patient) return null;

  const records        = patient.records        ?? [];
  const headacheScores = patient.headacheScores ?? {};
  const medicines      = patient.medicines      ?? [];

  function toggleFilter(key) {
    setFilters((f) => {
      const next = { ...f, [key]: !f[key] };
      if (key === "migraine" && next.migraine) next.cluster  = false;
      if (key === "cluster"  && next.cluster)  next.migraine = false;
      return next;
    });
  }

  function handleDayClick(rec) { setSelectedRecord(rec); setDrawerOpen(true); }
  function closeDrawer()        { setDrawerOpen(false); setSelectedRecord(null); }

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 px-4 py-3 flex items-center justify-between relative z-20"
        style={{
          background: "linear-gradient(135deg, #4a7ab5 0%, #2d4a6e 100%)",
          boxShadow: "0 2px 16px rgba(45,74,110,0.3)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
            style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
            {patient.gender === "male" ? "♂" : patient.gender === "female" ? "♀" : "?"}
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">{t.appName ?? "Headache Calendar"}</p>
            <p className="text-white/60 text-xs">{records.length} {t.entries ?? "entries"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/log")}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg hover:opacity-80 transition-all"
            style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            {t.logTab ?? "Log"}
          </button>
          <button onClick={() => { sessionStorage.removeItem("patientData"); router.replace("/"); }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg hover:opacity-80 transition-all"
            style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {t.logout ?? "Sign out"}
          </button>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center overflow-y-auto p-4 lg:p-8 gap-4">
        <div>

          {/* ── Main card ─────────────────────────────────────────── */}
          <div
            className="flex flex-row"
            style={{
              borderRadius: 20,
              border: "1px solid rgba(74,122,181,0.18)",
              boxShadow: "0 20px 80px rgba(45,74,110,0.15), 0 8px 32px rgba(45,74,110,0.1)",
              overflow: "hidden",
            }}
          >
            {/* Left: calendar — fixed width */}
            <div className="flex flex-col" style={{ width: 284, flexShrink: 0, background: "#fff" }}>
              <div style={{ padding: "20px 20px 16px 20px" }}>
                <CalendarPanel
                  t={t}
                  records={records}
                  onDayClick={handleDayClick}
                  selectedDate={selectedRecord?.date}
                  viewYear={viewYear}
                  viewMonth={viewMonth}
                  onViewChange={(y, m) => { setViewYear(y); setViewMonth(m); }}
                  headacheScores={headacheScores}
                  filters={filters}
                  onToggleFilter={toggleFilter}
                />
              </div>

              {/* Summary + Log buttons */}
              <div style={{ padding: "0 20px 20px", display: "flex", gap: 8 }}>
                <button
                  onClick={() => router.push("/summary")}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all hover:opacity-90 active:scale-95"
                  style={{ fontSize: 13, color: "#fff", background: "linear-gradient(135deg, #4a7ab5 0%, #2d4a6e 100%)", boxShadow: "0 4px 16px rgba(74,122,181,0.35)" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                  {t.summaryTab ?? "Summary"}
                </button>
                <button
                  onClick={() => router.push("/log")}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all hover:opacity-90 active:scale-95"
                  style={{ fontSize: 13, color: "#fff", background: "linear-gradient(135deg, #4a7ab5 0%, #2d4a6e 100%)", boxShadow: "0 4px 16px rgba(74,122,181,0.35)" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  {t.logTab ?? "Log"}
                </button>
              </div>
            </div>

            {/* Right: sidebar — desktop only */}
            <div
              className="hidden lg:block overflow-y-auto"
              style={{
                width: 220,
                flexShrink: 0,
                background: "#fff",
                borderLeft: "1px solid rgba(74,122,181,0.1)",
                borderRadius: "0 20px 20px 0",
              }}
            >
              <MonthlySidebar
                t={t}
                records={records}
                viewYear={viewYear}
                viewMonth={viewMonth}
                headacheScores={headacheScores}
              />
            </div>
          </div>

          {/* Mobile: sidebar below card */}
          <div
            className="lg:hidden mt-4"
            style={{
              borderRadius: 20,
              border: "1px solid rgba(74,122,181,0.18)",
              boxShadow: "0 8px 32px rgba(45,74,110,0.1)",
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <MonthlySidebar
              t={t}
              records={records}
              viewYear={viewYear}
              viewMonth={viewMonth}
              headacheScores={headacheScores}
            />
          </div>

        </div>
      </main>

      {/* ── Day detail drawer ───────────────────────────────────────── */}
      <DayDetailDrawer
        t={t}
        open={drawerOpen}
        onClose={closeDrawer}
        record={selectedRecord}
        medicines={medicines}
      />

    </div>
  );
}