"use client";

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

export default function DrawerContent({ t, record, medicines, onClose }) {
  if (!record) return null;

  const score    = record.intensity ?? 0;
  const c        = SCORE_COLOR(score);
  const usedMeds = (record.acuteMedicines ?? []).map((id, i) => {
    const med = (medicines ?? []).find((m) => m.id === id);
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#8aaacc" }}>{record.date}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <div className="px-3 py-0.5 rounded-full text-xs font-bold"
              style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
              {SEVERITY_LABEL(score, t)}
            </div>
            {record.isMigraine         && <div className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(224,90,90,0.1)",    color: "#e05a5a", border: "1px solid rgba(224,90,90,0.3)"    }}>{t.migraine ?? "Migraine"}</div>}
            {record.hasAura            && <div className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(245,166,35,0.1)",   color: "#c07800", border: "1px solid rgba(245,166,35,0.3)"   }}>{t.aura ?? "Aura"}</div>}
            {record.hasClusterHeadache && <div className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(123,104,238,0.1)", color: "#7b68ee", border: "1px solid rgba(123,104,238,0.3)" }}>{t.cluster ?? "Cluster"}</div>}
          </div>
        </div>
        <button onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all hover:bg-black/5"
          style={{ color: "#8aaacc" }}>×</button>
      </div>

      {/* Attack + duration cards */}
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

      {/* Medicines */}
      {usedMeds.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#8aaacc" }}>{t.usedMedicines ?? "Medicines"}</p>
          <div className="space-y-1.5">
            {usedMeds.map((m, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "rgba(123,104,238,0.06)", border: "1px solid rgba(123,104,238,0.15)" }}>
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

      {/* Note */}
      {record.note?.trim() && (
        <div className="px-3 py-2.5 rounded-xl" style={{ background: "rgba(91,192,222,0.08)", border: "1px solid rgba(91,192,222,0.25)" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "#3a8aaa" }}>{t.note ?? "Note"}</p>
          <p className="text-sm" style={{ color: "#2d4a6e" }}>{record.note}</p>
        </div>
      )}
    </div>
  );
}