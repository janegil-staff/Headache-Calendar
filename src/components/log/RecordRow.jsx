"use client";
import { combineScore, SCORE_COLOR, formatDuration } from "@/lib/log/logHelpers";
import { FIELDS } from "@/components/log/LogHeader";

const BAR_COLOR = (v) =>
  v <= 1 ? "#ddeaf8"
  : v <= 2 ? "#4CC189"
  : v <= 3 ? "#FFC659"
  : v <= 4 ? "#FF7473"
  : "#BE3830";

function ScoreBar({ value, max = 5 }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(74,122,181,0.12)", minWidth: 48 }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${((value - 1) / (max - 1)) * 100}%`, background: BAR_COLOR(value) }}
        />
      </div>
      <span className="text-xs font-semibold w-3 text-right tabular-nums" style={{ color: BAR_COLOR(value) }}>
        {value}
      </span>
    </div>
  );
}

function EffectLabel({ value, t }) {
  if (!value || value <= 0) return null;
  const label =
    value === 1 ? (t.effectNone   ?? "No effect")
    : value === 2 ? (t.effectMild ?? "Mild effect")
    : (t.effectStrong ?? "Strong effect");
  const color = value === 3 ? "#4CC189" : value === 2 ? "#FFC659" : "#FF7473";
  return <span className="text-xs font-semibold" style={{ color }}>{label}</span>;
}

function BoolBadge({ label, color = "#4a7ab5" }) {
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
    >
      {label}
    </span>
  );
}

export function RecordRow({ record, medicines, t, expanded, onToggle, isFirst, selectedField = "intensity" }) {
  const fieldDef   = FIELDS.find((f) => f.key === selectedField) ?? FIELDS[0];
  const fieldLabel = t[fieldDef.tKey] ?? fieldDef.fallback;

  const badgeScore  = combineScore(record);
  const badgeColors = SCORE_COLOR(badgeScore);

  const SEVERITY_LABELS = [
    t.severityNone     ?? "None",
    t.severityMild     ?? "Mild",
    t.severityModerate ?? "Moderate",
    t.severityStrong   ?? "Strong",
    t.severityExtreme  ?? "Extreme",
  ];

  // Badge label depends on selected field
  let badgeLabel;
  const isBoolField = ["isMigraine", "hasAura", "hasClusterHeadache"].includes(selectedField);
  if (isBoolField) {
    badgeLabel = record[selectedField] ? (t[fieldDef.tKey] ?? fieldDef.fallback) : null;
  } else if (selectedField === "attacks") {
    badgeLabel = record.attacks > 0 ? `${record.attacks}×` : null;
  } else if (selectedField === "durationMinutes") {
    badgeLabel = formatDuration(record.durationMinutes, t) || null;
  } else {
    badgeLabel = SEVERITY_LABELS[(badgeScore ?? 1) - 1] ?? SEVERITY_LABELS[0];
  }

  const usedMeds = (record.acuteMedicines ?? []).map((id, i) => {
    const med = medicines?.find((m) => m.id === id);
    return {
      id,
      name:  med?.name ?? `${t.medication ?? "Medicine"} ${id}`,
      dose:  record.acuteMedicinesDoses?.[i]     ?? null,
      times: record.acuteMedicinesUsedTimes?.[i] ?? null,
    };
  });

  const noteText = record.note?.trim();

  const rd  = new Date(record.date.slice(0, 4), record.date.slice(5, 7) - 1, record.date.slice(8, 10));
  const dow = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][rd.getDay()];
  const fmt = `${String(rd.getDate()).padStart(2, "0")}.${String(rd.getMonth() + 1).padStart(2, "0")}`;

  const durationLabel = formatDuration(record.durationMinutes, t);

  return (
    <div
      className="overflow-hidden transition-all"
      style={{
        background: expanded ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.88)",
        backdropFilter: "blur(12px)",
        borderTop: isFirst ? "none" : "1px solid rgba(74,122,181,0.1)",
        boxShadow: expanded ? "0 2px 12px rgba(74,122,181,0.08)" : "none",
      }}
    >
      {/* Compact row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-all hover:bg-black/[0.015]"
      >
        {/* Left: date + subtitles */}
        <div className="flex flex-col gap-0.5 min-w-0 flex-1 pr-3">
          <div className="flex items-center gap-2">
            <span className="font-bold tabular-nums shrink-0" style={{ color: "#7a9ab5", fontSize: 10, minWidth: 28 }}>{dow}</span>
            <span className="text-sm font-semibold shrink-0" style={{ color: "#2d4a6e" }}>{fmt}</span>
            {record.isMigraine && (
              <span className="text-xs font-semibold" style={{ color: "#4a7ab5" }}>
                {t.fieldIsMigraine ?? "Migraine"}
              </span>
            )}
            {record.hasAura && (
              <span className="text-xs font-semibold" style={{ color: "#7b68ee" }}>
                {t.fieldHasAura ?? "Aura"}
              </span>
            )}
          </div>
          {usedMeds.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap" style={{ paddingLeft: 36 }}>
              <span className="text-xs" style={{ color: "#7b68ee" }}>
                {usedMeds.map((m) => m.name).join(", ")}
              </span>
              {record.effect > 0 && <EffectLabel value={record.effect} t={t} />}
            </div>
          )}
          {noteText && (
            <p
              className="text-xs"
              style={{
                color: "#7a9aaa",
                paddingLeft: 36,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
              }}
            >
              {noteText}
            </p>
          )}
        </div>

        {/* Right: duration + badge + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          {durationLabel && (
            <span className="text-xs hidden sm:inline" style={{ color: "#7a9ab5" }}>
              ⏱ {durationLabel}
            </span>
          )}
          {record.attacks > 1 && (
            <span className="text-xs hidden sm:inline" style={{ color: "#7a9ab5" }}>
              {record.attacks}×
            </span>
          )}
          {badgeScore >= 1 && badgeLabel && (
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full"
              style={{
                background: badgeColors.bg,
                color: badgeColors.text,
                border: `1px solid ${badgeColors.border}`,
              }}
            >
              {badgeLabel}
            </span>
          )}
          <span
            className="transition-transform text-xs"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", color: "#7a9ab5", display: "inline-block" }}
          >
            ▾
          </span>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4" style={{ borderTop: "1px solid rgba(74,122,181,0.1)", paddingTop: 14 }}>

          {/* Core headache fields */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2.5" style={{ color: "#7a9ab5" }}>
              {t.headacheDetails ?? "Headache details"}
            </p>
            <div className="space-y-2">
              {/* Intensity bar */}
              {record.intensity > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs shrink-0" style={{ color: "#2d4a6e", width: 130 }}>
                    {t.fieldIntensity ?? "Pain intensity"}
                  </span>
                  <ScoreBar value={record.intensity} />
                </div>
              )}
              {/* Attacks */}
              {record.attacks > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs shrink-0" style={{ color: "#2d4a6e", width: 130 }}>
                    {t.fieldAttacks ?? "Attacks"}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: "#4a7ab5" }}>{record.attacks}</span>
                </div>
              )}
              {/* Duration */}
              {durationLabel && (
                <div className="flex items-center gap-2">
                  <span className="text-xs shrink-0" style={{ color: "#2d4a6e", width: 130 }}>
                    {t.fieldDuration ?? "Duration"}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: "#4a7ab5" }}>{durationLabel}</span>
                </div>
              )}
            </div>
          </div>

          {/* Boolean badges */}
          {(record.isMigraine || record.hasAura || record.hasClusterHeadache) && (
            <div className="flex flex-wrap gap-1.5">
              {record.isMigraine         && <BoolBadge label={t.fieldIsMigraine ?? "Migraine"}         color="#4a7ab5" />}
              {record.hasAura            && <BoolBadge label={t.fieldHasAura    ?? "Aura"}             color="#7b68ee" />}
              {record.hasClusterHeadache && <BoolBadge label={t.fieldCluster    ?? "Cluster headache"} color="#e07060" />}
            </div>
          )}

          {/* Medicines */}
          {usedMeds.length > 0 && (
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#7a9ab5" }}>
                {t.usedMedicines ?? "Medicines used"}
              </p>
              <div className="space-y-1.5">
                {usedMeds.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: "rgba(123,104,238,0.06)", border: "1px solid rgba(123,104,238,0.18)" }}
                  >
                    <span className="text-xs font-semibold flex-1" style={{ color: "#2d4a6e" }}>{m.name}</span>
                    <div className="flex items-center gap-1.5">
                      {m.dose  && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(123,104,238,0.1)", color: "#7b68ee" }}>{m.dose}mg</span>}
                      {m.times && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(123,104,238,0.1)", color: "#7b68ee" }}>{m.times}{t.timesUsed ?? "×"}</span>}
                    </div>
                  </div>
                ))}
                {record.effect > 0 && (
                  <div
                    className="flex items-center justify-between px-3 pt-2"
                    style={{ borderTop: "1px solid rgba(123,104,238,0.1)" }}
                  >
                    <span className="text-xs" style={{ color: "#4a5a6e" }}>
                      {t.medicineSatisfaction ?? "Effect"}
                    </span>
                    <EffectLabel value={record.effect} t={t} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Note */}
          {noteText && (
            <div
              className="px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(74,122,181,0.06)", border: "1px solid rgba(74,122,181,0.18)" }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: "#4a7ab5" }}>{t.note ?? "Note"}</p>
              <p className="text-sm" style={{ color: "#2d4a6e" }}>{noteText}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
