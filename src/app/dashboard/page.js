"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import { translations } from "@/lib/translations";

// ── helpers ───────────────────────────────────────────────────────────────────

function parsePatientData() {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem("patientData");
  return raw ? JSON.parse(raw) : null;
}

function pad(n) { return String(n).padStart(2, "0"); }

const SCORE_COLOR = (s) => {
  if (!s || s === 0) return { bg: "#e8f0f8", text: "#4a7ab5", border: "#c0d4ec" };
  if (s === 1) return { bg: "#4CC189", text: "#fff",    border: "#2e9e68" };
  if (s === 2) return { bg: "#FFC659", text: "#7a5200", border: "#c99500" };
  if (s === 3) return { bg: "#FF7473", text: "#fff",    border: "#cc4040" };
  return           { bg: "#BE3830", text: "#fff",    border: "#8a2020" };
};

const SEVERITY_LABEL = (s, t) => {
  if (!s || s === 0) return t?.severityNone     ?? "None";
  if (s === 1)       return t?.severityMild     ?? "Mild";
  if (s === 2)       return t?.severityModerate ?? "Moderate";
  if (s === 3)       return t?.severityStrong   ?? "Strong";
  return                    t?.severityExtreme  ?? "Extreme";
};

function getMonthRecords(records, year, month) {
  const prefix = `${year}-${pad(month + 1)}`;
  return (records ?? []).filter((r) => r.date?.startsWith(prefix));
}

// ── CalendarCell ──────────────────────────────────────────────────────────────

function CalendarCell({ day, rec, isToday, isSelected, onClick, headacheScores, filters }) {
  const dateStr = rec?.date;
  const score   = dateStr ? (headacheScores?.[dateStr] ?? (rec?.intensity > 0 ? rec.intensity : 0)) : 0;
  const c       = SCORE_COLOR(score);

  const showMed     = filters.medicines  && rec?.acuteMedicines?.length > 0;
  const showMig     = filters.migraine   && rec?.isMigraine;
  const showCluster = filters.cluster    && rec?.hasClusterHeadache;
  const showNote    = filters.notes      && rec?.note?.trim();

  const bg = isSelected ? "#2d4a6e" : rec ? c.bg : "#fff";
  const tc = isSelected ? "#fff"    : rec ? "#fff" : "#000";

  return (
    <div
      onClick={() => rec && onClick(rec)}
      style={{ position: "relative", width: 28, height: 28, cursor: rec ? "pointer" : "default" }}
      className="flex items-center justify-center select-none"
    >
      <div style={{
        width: 28, height: 28, borderRadius: 8, background: bg,
        border: isSelected
          ? "1.5px solid #2d4a6e"
          : isToday
          ? "1.5px solid #4a7ab5"
          : rec
          ? "1.5px solid transparent"
          : "1.5px solid #000",
        boxShadow: isSelected ? "0 2px 8px rgba(45,74,110,0.28)" : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 9, fontWeight: 600, color: tc, lineHeight: 1 }}>{day}</span>
      </div>
      {showMed     && <div style={{ position: "absolute", top: -3, right: -3, width: 8, height: 8, borderRadius: "50%", background: "#7b68ee", border: "1.5px solid #fff", zIndex: 10 }} />}
      {showMig     && <div style={{ position: "absolute", top: -3, left: -3,  width: 8, height: 8, borderRadius: "50%", background: "#e05a5a", border: "1.5px solid #fff", zIndex: 10 }} />}
      {showCluster && <div style={{ position: "absolute", bottom: -3, left: -3, width: 8, height: 8, borderRadius: "50%", background: "#f5a623", border: "1.5px solid #fff", zIndex: 10 }} />}
      {showNote    && <div style={{ position: "absolute", bottom: -3, right: -3, width: 8, height: 8, borderRadius: "50%", background: "#5bc0de", border: "1.5px solid #fff", zIndex: 10 }} />}
    </div>
  );
}

// ── FilterCheckbox ────────────────────────────────────────────────────────────

function FilterCheckbox({ checked, onChange, color, label }) {
  return (
    <div
      className="flex items-center gap-2 cursor-pointer select-none"
      onClick={onChange}
    >
      <div style={{
        width: 14, height: 14, borderRadius: 3, flexShrink: 0,
        border: `1.5px solid ${checked ? color : "#b0c4d8"}`,
        background: checked ? color : "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s ease",
      }}>
        {checked && (
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span style={{ fontSize: 10, color: checked ? "#2d4a6e" : "#8aaacc", fontWeight: checked ? 600 : 400 }}>{label}</span>
    </div>
  );
}

// ── MonthlySidebar ────────────────────────────────────────────────────────────

function MonthlySidebar({ t, records, viewYear, viewMonth, headacheScores }) {
  const monthRecs = getMonthRecords(records, viewYear, viewMonth);
  const total     = monthRecs.length;

  const attacks   = monthRecs.reduce((s, r) => s + (r.attacks ?? 0), 0);
  const totalMins = monthRecs.reduce((s, r) => s + (r.durationMinutes ?? 0), 0);
  const migDays   = monthRecs.filter((r) => r.isMigraine).length;
  const auraDays  = monthRecs.filter((r) => r.hasAura).length;
  const medDays   = monthRecs.filter((r) => r.acuteMedicines?.length > 0).length;
  const noHDays   = monthRecs.filter((r) => !r.intensity || r.intensity === 0).length;

  const severityCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  monthRecs.forEach((r) => {
    const s = r.intensity ?? 0;
    if (s >= 1) severityCounts[Math.min(s, 4)]++;
  });

  const avgIntensity = total > 0
    ? (monthRecs.reduce((s, r) => s + (r.intensity ?? 0), 0) / total).toFixed(1)
    : "—";

  const hoursDisplay = totalMins >= 60
    ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`
    : `${totalMins}m`;

  const daysLabel = t.days ?? "days";

  function SideRow({ icon, label, value }) {
    return (
      <div className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid rgba(74,122,181,0.07)" }}>
        <div className="flex items-center gap-2">
          {icon && <img src={icon} alt="" style={{ width: 16, height: 16, flexShrink: 0 }} />}
          <span style={{ fontSize: 11, color: "#4a6a8a" }}>{label}</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#2d4a6e" }}>{value}</span>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 16px 20px 8px" }}>
      <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#4a7ab5" }}>
        {t.monthSummary ?? "This month"}
      </p>

      <div className="rounded-xl p-3 mb-3 text-center" style={{ background: "rgba(74,122,181,0.06)", border: "1px solid rgba(74,122,181,0.12)" }}>
        <p style={{ fontSize: 10, color: "#8aaacc", marginBottom: 2 }}>{t.avgIntensity ?? "Avg intensity"}</p>
        <p style={{ fontSize: 24, fontWeight: 800, color: "#2d4a6e", lineHeight: 1 }}>{avgIntensity}</p>
        <p style={{ fontSize: 10, color: "#8aaacc", marginTop: 2 }}>{total} {t.entries ?? "entries"}</p>
      </div>

      <SideRow icon="/icons/ico_intensity_no.png"       label={t.noHeadache       ?? "No headache"} value={`${noHDays} ${daysLabel}`}           />
      <SideRow icon="/icons/ico_intensity_mild.png"     label={t.severityMild     ?? "Mild"}        value={`${severityCounts[1]} ${daysLabel}`} />
      <SideRow icon="/icons/ico_intensity_moderate.png" label={t.severityModerate ?? "Moderate"}    value={`${severityCounts[2]} ${daysLabel}`} />
      <SideRow icon="/icons/ico_intensity_serious.png"  label={t.severityStrong   ?? "Strong"}      value={`${severityCounts[3]} ${daysLabel}`} />
      <SideRow icon="/icons/ico_intensity_extreme.png"  label={t.severityExtreme  ?? "Extreme"}     value={`${severityCounts[4]} ${daysLabel}`} />

      <div className="mt-2">
        <SideRow label={t.attacks           ?? "Attacks"}    value={attacks}                        />
        <SideRow label={t.hoursWithHeadache ?? "Hours"}      value={hoursDisplay}                   />
        <SideRow label={t.migraine          ?? "Migraine"}   value={`${migDays} ${daysLabel}`}      />
        <SideRow label={t.aura              ?? "Aura"}       value={`${auraDays} ${daysLabel}`}     />
        <SideRow label={t.medicationDays    ?? "Medication"} value={`${medDays} ${daysLabel}`}      />
      </div>
    </div>
  );
}

// ── DayDetail ─────────────────────────────────────────────────────────────────

function DayDetail({ record, medicines, t, onClose }) {
  if (!record) return null;

  const score    = record.intensity ?? 0;
  const c        = SCORE_COLOR(score);
  const usedMeds = (record.acuteMedicines ?? []).map((id, i) => {
    const med = medicines?.find((m) => m.id === id);
    return {
      name:  med?.name ?? `Medicine ${id}`,
      dose:  record.acuteMedicinesDoses?.[i]     ?? null,
      times: record.acuteMedicinesUsedTimes?.[i] ?? null,
    };
  });

  const effectLabel = record.effect === 3 ? (t.effectStrong ?? "Strong effect")
    : record.effect === 2 ? (t.effectMild ?? "Mild effect")
    : record.effect === 1 ? (t.effectNone ?? "No effect") : null;
  const effectColor = record.effect === 3 ? "#4CC189" : record.effect === 2 ? "#FFC659" : "#FF7473";

  const durationHrs = record.durationMinutes
    ? `${Math.floor(record.durationMinutes / 60)}h ${record.durationMinutes % 60}m`
    : null;

  return (
    <div className="px-5 pb-6 pt-2">
      <div className="flex items-center justify-between mb-4">
        <div style={{ display: "inline-flex", flexDirection: "column" }}>
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#8aaacc" }}>{record.date}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <div className="px-3 py-0.5 rounded-full text-xs font-bold" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
              {SEVERITY_LABEL(score, t)}
            </div>
            {record.isMigraine         && <div className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(224,90,90,0.1)",    color: "#e05a5a", border: "1px solid rgba(224,90,90,0.3)"    }}>{t.migraine ?? "Migraine"}</div>}
            {record.hasAura            && <div className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(245,166,35,0.1)",   color: "#c07800", border: "1px solid rgba(245,166,35,0.3)"   }}>{t.aura ?? "Aura"}</div>}
            {record.hasClusterHeadache && <div className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(123,104,238,0.1)", color: "#7b68ee", border: "1px solid rgba(123,104,238,0.3)" }}>{t.cluster ?? "Cluster"}</div>}
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all hover:bg-black/5" style={{ color: "#8aaacc" }}>×</button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {record.attacks > 0 && (
          <div className="rounded-xl p-3 text-center" style={{ background: "rgba(74,122,181,0.06)", border: "1px solid rgba(74,122,181,0.12)" }}>
            <p className="text-xs" style={{ color: "#8aaacc" }}>{t.attacks ?? "Attacks"}</p>
            <p className="text-lg font-bold" style={{ color: "#2d4a6e" }}>{record.attacks}</p>
          </div>
        )}
        {durationHrs && (
          <div className="rounded-xl p-3 text-center" style={{ background: "rgba(74,122,181,0.06)", border: "1px solid rgba(74,122,181,0.12)" }}>
            <p className="text-xs" style={{ color: "#8aaacc" }}>{t.duration ?? "Duration"}</p>
            <p className="text-lg font-bold" style={{ color: "#2d4a6e" }}>{durationHrs}</p>
          </div>
        )}
      </div>

      {usedMeds.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#8aaacc" }}>{t.usedMedicines ?? "Medicines"}</p>
          <div className="space-y-1.5">
            {usedMeds.map((m, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(123,104,238,0.06)", border: "1px solid rgba(123,104,238,0.15)" }}>
                <span className="text-xs font-semibold flex-1" style={{ color: "#3a3a6e" }}>{m.name}</span>
                <div className="flex items-center gap-1.5">
                  {m.dose  && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(123,104,238,0.1)", color: "#7b68ee" }}>{m.dose}mg</span>}
                  {m.times && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(123,104,238,0.1)", color: "#7b68ee" }}>×{m.times}</span>}
                </div>
              </div>
            ))}
            {effectLabel && (
              <div className="flex items-center justify-between px-3 pt-1.5" style={{ borderTop: "1px solid rgba(123,104,238,0.1)" }}>
                <span className="text-xs" style={{ color: "#7a5a54" }}>{t.medicineSatisfaction ?? "Effect"}</span>
                <span className="text-xs font-semibold" style={{ color: effectColor }}>{effectLabel}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {record.note?.trim() && (
        <div className="px-3 py-2.5 rounded-xl" style={{ background: "rgba(91,192,222,0.08)", border: "1px solid rgba(91,192,222,0.25)" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "#3a8aaa" }}>{t.note ?? "Note"}</p>
          <p className="text-sm" style={{ color: "#2d4a6e" }}>{record.note}</p>
        </div>
      )}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang] ?? translations.en;

  const [patient]                           = useState(() => parsePatientData());
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen]         = useState(false);

  const [filters, setFilters] = useState({
    medicines:  true,
    injections: true,
    migraine:   true,
    cluster:    false,
    notes:      true,
  });

  const now = new Date();
  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  useEffect(() => { if (!patient) router.replace("/"); }, [patient, router]);
  if (!patient) return null;

  const records        = patient.records ?? [];
  const headacheScores = patient.headacheScores ?? {};
  const medicines      = patient.medicines ?? [];

  const recordMap = {};
  records.forEach((r) => { if (r.date) recordMap[r.date] = r; });

  const monthNames     = t.monthNames ?? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dayLetters     = (t.weekdays ?? ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]).map((d) => d.slice(0, 1));
  const todayStr       = now.toISOString().slice(0, 10);
  const daysInMonth    = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOffset = (() => { const d = new Date(viewYear, viewMonth, 1).getDay(); return d === 0 ? 6 : d - 1; })();
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const cells = [];
  for (let i = 0; i < firstDayOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  }
  function nextMonth() {
    const next = new Date(viewYear, viewMonth + 1, 1);
    if (next <= now) {
      if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
      else setViewMonth(viewMonth + 1);
    }
  }

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

  const calendarGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(7, 28px)",
    gap: 8,
    overflow: "visible",
  };

  const sidebarProps = { t, records, viewYear, viewMonth, headacheScores };

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Header ────────────────────────────────────────────────── */}
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

      {/* ── Body ──────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center overflow-y-auto p-4 lg:p-8 gap-4">
        <div>

          {/* ── Main card ───────────────────────────────────────── */}
          <div
            className="flex flex-row"
            style={{
              borderRadius: 20,
              border: "1px solid rgba(74,122,181,0.18)",
              boxShadow: "0 20px 80px rgba(45,74,110,0.15), 0 8px 32px rgba(45,74,110,0.1)",
              overflow: "hidden",
            }}
          >
            {/* Left: calendar */}
            <div className="flex flex-col" style={{ background: "#fff", width: 284, flexShrink: 0 }}>
              <div style={{ padding: "20px 20px 16px 20px" }}>

                {/* Month nav */}
                <div className="flex items-center justify-between mb-4">
                  <button onClick={prevMonth}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70 active:scale-95"
                    style={{ background: "rgba(74,122,181,0.1)" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4a7ab5" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#2d4a6e" }}>{monthNames[viewMonth]} {viewYear}</p>
                  <button onClick={nextMonth} disabled={isCurrentMonth}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
                    style={{ background: isCurrentMonth ? "transparent" : "rgba(74,122,181,0.1)", opacity: isCurrentMonth ? 0.3 : 1 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4a7ab5" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>

                {/* Day letters */}
                <div style={{ ...calendarGridStyle, marginBottom: 8 }}>
                  {dayLetters.map((l, i) => (
                    <span key={i} style={{ width: 28, textAlign: "center", fontSize: 9, fontWeight: 800, color: "rgba(74,122,181,0.45)", textTransform: "uppercase" }}>{l}</span>
                  ))}
                </div>

                {/* Day grid */}
                <div style={calendarGridStyle}>
                  {cells.map((day, idx) => {
                    if (day === null) return <div key={`e-${idx}`} style={{ width: 28, height: 28 }} />;
                    const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
                    return (
                      <CalendarCell
                        key={dateStr}
                        day={day}
                        rec={recordMap[dateStr]}
                        isToday={dateStr === todayStr}
                        isSelected={selectedRecord?.date === dateStr}
                        onClick={handleDayClick}
                        headacheScores={headacheScores}
                        filters={filters}
                      />
                    );
                  })}
                </div>

                {/* Filter checkboxes — replaces old legend */}
                <div className="mt-4 pt-3 flex flex-wrap gap-x-4 gap-y-2" style={{ borderTop: "1px solid rgba(74,122,181,0.1)" }}>
                  <FilterCheckbox checked={filters.medicines}  onChange={() => toggleFilter("medicines")}  color="#7b68ee" label={t.filterMedicines  ?? "Vis medisindager"}  />
                  <FilterCheckbox checked={filters.injections} onChange={() => toggleFilter("injections")} color="#3a9ad9" label={t.filterInjections ?? "Vis injeksjoner"}   />
                  <FilterCheckbox checked={filters.migraine}   onChange={() => toggleFilter("migraine")}   color="#e05a5a" label={t.filterMigraine   ?? "Vis migreneanfall"} />
                  <FilterCheckbox checked={filters.cluster}    onChange={() => toggleFilter("cluster")}    color="#f5a623" label={t.filterCluster    ?? "Vis klasehodepine"} />
                  <FilterCheckbox checked={filters.notes}      onChange={() => toggleFilter("notes")}      color="#5bc0de" label={t.filterNotes      ?? "Vis notater"}       />
                </div>
              </div>

              {/* Log button */}
              <div style={{ padding: "0 20px 20px 20px" }}>
                <button
                  onClick={() => router.push("/log")}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all hover:opacity-90 active:scale-95"
                  style={{ fontSize: 13, color: "#fff", background: "linear-gradient(135deg, #4a7ab5 0%, #2d4a6e 100%)", boxShadow: "0 4px 16px rgba(74,122,181,0.35)" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  {t.logTab ?? "Diary log"}
                </button>
              </div>
            </div>

            {/* Right: monthly sidebar — desktop only */}
            <div
              className="hidden lg:block flex-shrink-0 overflow-y-auto"
              style={{ width: 200, background: "#fff", borderLeft: "1px solid rgba(74,122,181,0.1)" }}
            >
              <MonthlySidebar {...sidebarProps} />
            </div>
          </div>

          {/* Mobile: monthly summary below */}
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
            <MonthlySidebar {...sidebarProps} />
          </div>

        </div>
      </main>

      {/* ── Day detail drawer ─────────────────────────────────────── */}
      <div className="fixed inset-0 z-40 lg:hidden"
        style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)", opacity: drawerOpen ? 1 : 0, pointerEvents: drawerOpen ? "auto" : "none", transition: "opacity 0.2s ease" }}
        onClick={closeDrawer} />
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden rounded-t-2xl overflow-y-auto"
        style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(74,122,181,0.2)", maxHeight: "80vh", transform: drawerOpen ? "translateY(0)" : "translateY(100%)", transition: "transform 0.3s cubic-bezier(0.32,0.72,0,1)" }}>
        <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-1" style={{ background: "rgba(74,122,181,0.2)" }} />
        <DayDetail record={selectedRecord} medicines={medicines} t={t} onClose={closeDrawer} />
      </div>

      <div className="hidden lg:block fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)", opacity: drawerOpen ? 1 : 0, pointerEvents: drawerOpen ? "auto" : "none", transition: "opacity 0.2s ease" }}
        onClick={closeDrawer} />
      <div className="hidden lg:block fixed top-1/2 left-1/2 z-50 rounded-2xl overflow-y-auto shadow-2xl"
        style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(74,122,181,0.2)", width: 420, maxHeight: "80vh", transform: drawerOpen ? "translate(-50%,-50%) scale(1)" : "translate(-50%,-50%) scale(0.96)", opacity: drawerOpen ? 1 : 0, pointerEvents: drawerOpen ? "auto" : "none", transition: "all 0.2s cubic-bezier(0.32,0.72,0,1)" }}>
        <DayDetail record={selectedRecord} medicines={medicines} t={t} onClose={closeDrawer} />
      </div>

    </div>
  );
}