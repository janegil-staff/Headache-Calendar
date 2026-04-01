"use client";
import { useMemo } from "react";

// ── helpers ───────────────────────────────────────────────────────────────────

function pad(n) { return String(n).padStart(2, "0"); }

const SCORE_COLOR = (s) => {
  if (!s || s === 0) return { bg: "#76a7d4", text: "#fff", border: "#5a8fc0" };
  if (s === 1) return { bg: "#4CC189", text: "#fff",    border: "#2e9e68" };
  if (s === 2) return { bg: "#FFC659", text: "#7a5200", border: "#c99500" };
  if (s === 3) return { bg: "#FF7473", text: "#fff",    border: "#cc4040" };
  return           { bg: "#BE3830", text: "#fff",    border: "#8a2020" };
};

// ── DayCell ───────────────────────────────────────────────────────────────────

function DayCell({ day, rec, isToday, isSelected, onClick, headacheScores, filters }) {
  const dateStr = rec?.date;
  const score   = dateStr
    ? (headacheScores?.[dateStr] ?? (rec?.intensity > 0 ? rec.intensity : 0))
    : 0;
  const c = SCORE_COLOR(score);

  const showMed     = filters.medicines  && rec?.acuteMedicines?.length > 0;
  const showMig     = filters.migraine   && rec?.isMigraine;
  const showCluster = filters.cluster    && rec?.hasClusterHeadache;
  const showNote    = filters.notes      && rec?.note?.trim();
  const showAura    = filters.aura       && rec?.hasAura;

  const bg = isSelected ? "#2d4a6e" : !rec ? "#fff" : score === 0 ? "#76a7d4" : c.bg;
  const tc = isSelected ? "#fff"    : !rec ? "#000" : "#fff";

  return (
    <div
      onClick={() => rec && onClick(rec)}
      style={{ position: "relative", width: 32, height: 32, cursor: rec ? "pointer" : "default" }}
      className="flex items-center justify-center select-none"
    >
      <div style={{
        width: 32, height: 32, borderRadius: 9, background: bg,
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
      {showMig && (
        <div style={{
          position: "absolute",
          inset: -5,
          borderRadius: 13,
          border: "1.5px solid #e05a5a",
          pointerEvents: "none",
          zIndex: 5,
        }} />
      )}
      {showAura && (
        <div style={{ position: "absolute", bottom: -5, left: -3, width: 13, height: 13, borderRadius: "50%", overflow: "hidden", zIndex: 10 }}>
          <img src="/icons/ico_aura.svg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      {showMed && (
        <div style={{ position: "absolute", top: -5, right: -3, width: 13, height: 13, borderRadius: "50%", overflow: "hidden", zIndex: 10 }}>
          <img src="/icons/ico_intensity_medicine.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      
      {showCluster && (
        <div style={{ position: "absolute", bottom: -5, left: -3, width: 13, height: 13, borderRadius: "50%", overflow: "hidden", zIndex: 10 }}>
          <img src="/icons/ico_injection.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      {showNote && (
        <div style={{
          position: "absolute", bottom: -5, right: -3,
          width: 13, height: 13,
          background: "#fff",
          borderRadius: "50%",
          border: "1px solid #4a9eca",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 10,
        }}>
          <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
            <rect x="1" y="1" width="8" height="6" rx="1.5" fill="#4a9eca" />
            <polygon points="5.5,7 8,7 8,9.5" fill="#4a9eca" />
          </svg>
        </div>
      )}
    </div>
  );
}

// ── FilterCheckbox ────────────────────────────────────────────────────────────

function FilterCheckbox({ checked, onChange, color, label }) {
  return (
    <div className="flex items-center gap-2 cursor-pointer select-none" onClick={onChange}>
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
      <span style={{ fontSize: 10, color: checked ? "#2d4a6e" : "#8aaacc", fontWeight: checked ? 600 : 400 }}>
        {label}
      </span>
    </div>
  );
}

// ── CalendarPanel ─────────────────────────────────────────────────────────────

export default function CalendarPanel({
  t,
  records,
  onDayClick,
  selectedDate,
  viewYear,
  viewMonth,
  onViewChange,
  headacheScores,
  filters,
  onToggleFilter,
}) {
  const now  = new Date();
  const vy   = viewYear  ?? now.getFullYear();
  const vm   = viewMonth ?? now.getMonth();

  const monthNames     = t.monthNames ?? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dayLetters     = (t.weekdays  ?? ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]).map((d) => d.slice(0, 1));
  const todayStr       = now.toISOString().slice(0, 10);
  const daysInMonth    = new Date(vy, vm + 1, 0).getDate();
  const firstDayOffset = (() => { const d = new Date(vy, vm, 1).getDay(); return d === 0 ? 6 : d - 1; })();
  const isCurrentMonth = vy === now.getFullYear() && vm === now.getMonth();

  const recordMap = useMemo(() => {
    const map = {};
    (records ?? []).forEach((r) => { if (r.date) map[r.date] = r; });
    return map;
  }, [records]);

  function prevMonth() {
    if (vm === 0) onViewChange?.(vy - 1, 11);
    else          onViewChange?.(vy, vm - 1);
  }
  function nextMonth() {
    const next = new Date(vy, vm + 1, 1);
    if (next <= now) {
      if (vm === 11) onViewChange?.(vy + 1, 0);
      else           onViewChange?.(vy, vm + 1);
    }
  }

  const cells = [];
  for (let i = 0; i < firstDayOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(7, 32px)",
    gap: 14,
    overflow: "visible",
  };

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4" style={{ width: 308 }}>
        <button onClick={prevMonth}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70 active:scale-95"
          style={{ background: "rgba(74,122,181,0.1)" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4a7ab5" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#2d4a6e" }}>{monthNames[vm]} {vy}</p>
        <button onClick={nextMonth} disabled={isCurrentMonth}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
          style={{ background: isCurrentMonth ? "transparent" : "rgba(74,122,181,0.1)", opacity: isCurrentMonth ? 0.3 : 1 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4a7ab5" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      {/* Day letters */}
      <div style={{ ...gridStyle, marginBottom: 8 }}>
        {dayLetters.map((l, i) => (
          <span key={i} style={{ width: 28, textAlign: "center", fontSize: 9, fontWeight: 800, color: "rgba(74,122,181,0.45)", textTransform: "uppercase" }}>{l}</span>
        ))}
      </div>

      {/* Day grid */}
      <div style={gridStyle}>
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} style={{ width: 32, height: 32 }} />;
          const dateStr = `${vy}-${pad(vm + 1)}-${pad(day)}`;
          return (
            <DayCell
              key={dateStr}
              day={day}
              rec={recordMap[dateStr]}
              isToday={dateStr === todayStr}
              isSelected={dateStr === selectedDate}
              onClick={onDayClick}
              headacheScores={headacheScores}
              filters={filters}
            />
          );
        })}
      </div>

      {/* Filter checkboxes */}
      <div className="mt-4 pt-3 flex flex-wrap gap-x-4 gap-y-2" style={{ borderTop: "1px solid rgba(74,122,181,0.1)", width: 308 }}>
        <FilterCheckbox checked={filters.medicines}  onChange={() => onToggleFilter("medicines")}  color="#7b68ee" label={t.filterMedicines  ?? "Vis medisindager"}  />
        <FilterCheckbox checked={filters.injections} onChange={() => onToggleFilter("injections")} color="#3a9ad9" label={t.filterInjections ?? "Vis injeksjoner"}   />
        <FilterCheckbox checked={filters.migraine}   onChange={() => onToggleFilter("migraine")}   color="#e05a5a" label={t.filterMigraine   ?? "Vis migreneanfall"} />
        <FilterCheckbox checked={filters.cluster}    onChange={() => onToggleFilter("cluster")}    color="#f5a623" label={t.filterCluster    ?? "Vis klasehodepine"} />
        <FilterCheckbox checked={filters.notes}      onChange={() => onToggleFilter("notes")}      color="#5bc0de" label={t.filterNotes      ?? "Vis notater"}       />
        <FilterCheckbox checked={filters.aura}       onChange={() => onToggleFilter("aura")}       color="#FFC659" label={t.filterAura       ?? "Vis aura"}          />
      </div>
    </div>
  );
}