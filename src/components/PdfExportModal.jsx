"use client";
import { useState, useEffect } from "react";

const HEADACHE_FIELDS_PDF = [
  { key: "intensity",        labelKey: "intensity",        fallback: "Intensity"         },
  { key: "attacks",          labelKey: "attacks",          fallback: "Attacks"           },
  { key: "durationMinutes",  labelKey: "duration",         fallback: "Duration"          },
  { key: "isMigraine",       labelKey: "migraine",         fallback: "Migraine"          },
  { key: "hasAura",          labelKey: "aura",             fallback: "Aura"              },
  { key: "nausea",           labelKey: "nausea",           fallback: "Nausea"            },
  { key: "lightSensitivity", labelKey: "lightSensitivity", fallback: "Light sensitivity" },
  { key: "soundSensitivity", labelKey: "soundSensitivity", fallback: "Sound sensitivity" },
  { key: "stress",           labelKey: "stress",           fallback: "Stress"            },
  { key: "sleepQuality",     labelKey: "sleepQuality",     fallback: "Sleep quality"     },
];

function formatDuration(mins, t) {
  if (!mins || mins <= 0) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const hLabel = t.hours ?? "h";
  const mLabel = t.minutes ?? "m";
  if (h > 0 && m > 0) return `${h}${hLabel} ${m}${mLabel}`;
  if (h > 0)           return `${h}${hLabel}`;
  return `${m}${mLabel}`;
}

function Toggle({ checked, onChange, label, color = "#4a7ab5" }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={onChange}
        style={{
          width: 36, height: 20, borderRadius: 10,
          background: checked ? color : "#c0d4ec",
          transition: "background 0.2s",
          position: "relative", flexShrink: 0,
        }}
      >
        <div style={{
          position: "absolute", top: 3,
          left: checked ? 19 : 3,
          width: 14, height: 14, borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          transition: "left 0.2s",
        }} />
      </div>
      <span className="text-sm" style={{ color: checked ? "#2d4a6e" : "#8aaacc" }}>{label}</span>
    </label>
  );
}

function DateInput({ label, value, onChange, min, max }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#8aaacc" }}>{label}</label>
      <input
        type="date" value={value} min={min} max={max}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 rounded-xl text-sm outline-none transition-all"
        style={{ background: "#f0f4f8", border: "1px solid rgba(74,122,181,0.2)", color: "#2d4a6e" }}
        onFocus={(e) => { e.target.style.borderColor = "#4a7ab5"; e.target.style.boxShadow = "0 0 0 3px rgba(74,122,181,0.1)"; }}
        onBlur={(e)  => { e.target.style.borderColor = "rgba(74,122,181,0.2)"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

export default function PdfExportModal({ open, onClose, patient, t }) {
  const allRecords = [...(patient?.records ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  const minDate    = allRecords[0]?.date ?? "";
  const maxDate    = allRecords[allRecords.length - 1]?.date ?? "";

  const [fromDate, setFromDate] = useState(() => {
    if (!maxDate) return "";
    const d = new Date(maxDate);
    d.setMonth(d.getMonth() - 4);
    return d.toISOString().slice(0, 10);
  });
  const [toDate,  setToDate]  = useState(maxDate);
  const [loading, setLoading] = useState(false);

  const [fields, setFields] = useState({
    intensity: true,
    symptoms:  true,
    migraine:  true,
    medicines: true,
    note:      true,
  });

  useEffect(() => {
    const d = new Date(maxDate || new Date());
    d.setMonth(d.getMonth() - 4);
    setFromDate(maxDate ? d.toISOString().slice(0, 10) : "");
    setToDate(maxDate);
  }, [minDate, maxDate]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const toggle = (key) => setFields((prev) => ({ ...prev, [key]: !prev[key] }));

  const filtered = allRecords.filter((r) => {
    if (fromDate && r.date < fromDate) return false;
    if (toDate   && r.date > toDate)   return false;
    return true;
  });

  const handleDownload = async () => {
    if (!filtered.length) return;
    setLoading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const W  = 210;
      const ML = 16, MR = 16;
      const CW = W - ML - MR;
      const ink   = [20, 30, 50];
      const mid   = [74, 106, 138];
      const light = [140, 170, 200];
      const rule  = [200, 215, 230];
      const shade = [240, 244, 248];
      let y = 0;

      const setFont = (size, style = "normal", color = ink) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", style);
        doc.setTextColor(...color);
      };
      const hline = (yy, lw = 0.2, color = rule) => {
        doc.setLineWidth(lw); doc.setDrawColor(...color);
        doc.line(ML, yy, W - MR, yy);
      };
      const vline = (xx, y1, y2) => {
        doc.setLineWidth(0.1); doc.setDrawColor(...rule);
        doc.line(xx, y1 + 0.5, xx, y2 - 0.5);
      };
      const box = (x, yy, w, h, fill) => {
        if (fill) { doc.setFillColor(...fill); doc.rect(x, yy, w, h, "F"); }
      };
      const drawFrame = () => {
        doc.setLineWidth(0.4); doc.setDrawColor(74, 122, 181);
        doc.rect(11, 11, W - 22, 275, "S");
        doc.setLineWidth(0.1); doc.setDrawColor(...rule);
        doc.line(14, 274, W - 14, 274);
      };
      const addPage = () => { doc.addPage(); drawFrame(); y = 44; };
      const checkY  = (need = 10) => { if (y + need > 270) addPage(); };

      // ── Header ─────────────────────────────────────────────
      drawFrame();
      setFont(18, "bold", ink);
      doc.text((t.appName ?? "Headache Calendar").toUpperCase(), ML, 26);
      setFont(7, "normal", light);
      doc.text(t.reportDate ?? "Date", W - MR, 20, { align: "right" });
      setFont(8, "bold", ink);
      doc.text(new Date().toLocaleDateString(), W - MR, 25, { align: "right" });
      setFont(7, "normal", mid);
      doc.text(`${patient.age ?? ""}`, W - MR, 30, { align: "right" });
      if (fromDate || toDate) {
        setFont(7, "normal", light);
        doc.text(`${fromDate ?? "–"}  →  ${toDate ?? "–"}`, ML, 30);
      }
      doc.setLineWidth(0.25); doc.setDrawColor(74, 122, 181);
      doc.line(ML, 33.5, W - MR, 33.5);
      y = 39;

      // ── Summary stats ───────────────────────────────────────
      const intensities  = filtered.map((r) => r.intensity ?? 0).filter((v) => v > 0);
      const avgIntensity = intensities.length
        ? Math.round(intensities.reduce((a, b) => a + b, 0) / intensities.length) : null;
      const migDays    = filtered.filter((r) => r.isMigraine).length;
      const medDays    = filtered.filter((r) => r.acuteMedicines?.length > 0).length;
      const totalAtks  = filtered.reduce((s, r) => s + (r.attacks ?? 0), 0);

      const stats = [
        { label: t.daysRecorded   ?? "Days",       value: String(filtered.length) },
        { label: t.avgIntensity   ?? "Avg int.",    value: avgIntensity != null ? String(avgIntensity) : "–" },
        { label: t.migraine       ?? "Migraine",    value: String(migDays)  },
        { label: t.attacks        ?? "Attacks",     value: String(totalAtks) },
        { label: t.medicationDays ?? "Medication",  value: String(medDays) },
      ];
      const SW = CW / stats.length;
      box(ML, y, CW, 14, shade);
      stats.forEach(({ label, value }, i) => {
        const sx = ML + i * SW;
        setFont(6, "normal", light);
        doc.text(label, sx + SW / 2, y + 4, { align: "center" });
        setFont(9, "bold", ink);
        doc.text(value, sx + SW / 2, y + 10, { align: "center" });
        if (i > 0) vline(sx, y, y + 14);
      });
      y += 18;

      // ── Severity legend ─────────────────────────────────────
      const SCOLORS = [
        { label: t.noHeadache       ?? "None",     rgb: [118, 167, 212] },
        { label: t.severityMild     ?? "Mild",     rgb: [76,  193, 137] },
        { label: t.severityModerate ?? "Moderate", rgb: [255, 198, 89]  },
        { label: t.severityStrong   ?? "Strong",   rgb: [255, 116, 115] },
        { label: t.severityExtreme  ?? "Extreme",  rgb: [190, 56,  48]  },
      ];
      const bw = CW / SCOLORS.length;
      SCOLORS.forEach(({ label, rgb }, i) => {
        const bx = ML + i * bw;
        doc.setFillColor(...rgb); doc.rect(bx, y, bw, 5, "F");
        setFont(5.5, "normal", [255, 255, 255]);
        doc.text(label, bx + bw / 2, y + 3.5, { align: "center" });
      });
      y += 9;
      hline(y, 0.2, [74, 122, 181]);
      y += 4;

      // ── Column layout ───────────────────────────────────────
      const showSymptoms = fields.symptoms && fields.intensity;
      const showMeds     = fields.medicines;
      const showNote     = fields.note;

      const COL_DATE = { x: ML,      w: 16 };
      const COL_INT  = { x: ML + 16, w: 10 };
      const COL_ATT  = { x: ML + 26, w: 10 };
      const COL_DUR  = { x: ML + 36, w: 14 };
      let   xc       = ML + 50;
      const COL_SYM  = showSymptoms ? { x: xc, w: 44 } : null; if (showSymptoms) xc += 44;
      const COL_MED  = showMeds     ? { x: xc, w: 40 } : null; if (showMeds)     xc += 40;
      const COL_NOTE = showNote     ? { x: xc, w: W - MR - xc } : null;

      // Column headers
      const COLS = [
        { col: COL_DATE, label: t.date       ?? "Date"      },
        { col: COL_INT,  label: t.intensity  ?? "Int."      },
        { col: COL_ATT,  label: t.attacks    ?? "Att."      },
        { col: COL_DUR,  label: t.duration   ?? "Dur."      },
        { col: COL_SYM,  label: t.symptomLog ?? "Symptoms"  },
        { col: COL_MED,  label: t.medicines  ?? "Medicines" },
        { col: COL_NOTE, label: t.note       ?? "Notes"     },
      ];
      doc.setFillColor(74, 100, 140); doc.rect(ML, y, CW, 6, "F");
      COLS.forEach(({ col, label }) => {
        if (!col) return;
        setFont(6, "bold", [255, 255, 255]);
        doc.text(label, col.x + 1, y + 4.2);
      });
      y += 7;

      // ── Rows ────────────────────────────────────────────────
      const PAD_TOP  = 2;
      const PAD_SIDE = 1;
      const LINE_H   = 3.2;

      filtered.forEach((r, ri) => {
        const score = r.intensity ?? 0;
        const SCORE_RGB =
          score === 0 ? [118, 167, 212] :
          score === 1 ? [76,  193, 137] :
          score === 2 ? [255, 198, 89]  :
          score === 3 ? [255, 116, 115] :
                        [190, 56,  48];

        const usedMeds = (r.acuteMedicines ?? []).map((id, i) => {
          const med = (patient.medicines ?? []).find((m) => m.id === id);
          return `${med?.name ?? id}${r.acuteMedicinesDoses?.[i] ? ` ${r.acuteMedicinesDoses[i]}mg` : ""}`;
        });

        const visibleSymptoms = showSymptoms ? HEADACHE_FIELDS_PDF.filter(({ key }) => {
          const val = r[key];
          if (val == null) return false;
          if (typeof val === "boolean") return val;
          return val > 0;
        }) : [];

        const noteText  = showNote && r.note?.trim() ? r.note.trim() : "";
        const medText   = usedMeds.join(", ");
        const medSplit  = medText  ? doc.splitTextToSize(medText,  (COL_MED?.w  ?? 40) - PAD_SIDE * 2) : [];
        const noteSplit = noteText ? doc.splitTextToSize(noteText, (COL_NOTE?.w ?? 30) - PAD_SIDE * 2) : [];

        const symRows = Math.ceil(visibleSymptoms.length / 2);
        const bodyH   = Math.max(symRows * LINE_H, medSplit.length * LINE_H, noteSplit.length * LINE_H, 7) + PAD_TOP * 2;
        const noteH   = noteSplit.length > 0 ? noteSplit.length * LINE_H + PAD_TOP * 2 : 0;
        const rowH    = bodyH + noteH;

        checkY(rowH + 2);

        box(ML, y, CW, rowH, ri % 2 === 0 ? [248, 251, 254] : [255, 255, 255]);
        doc.setFillColor(...SCORE_RGB); doc.rect(ML, y, 2.5, bodyH, "F");

        const ty = y + PAD_TOP;

        // Date + migraine/aura tags
        setFont(7, "bold", ink);
        doc.text(r.date, COL_DATE.x + PAD_SIDE + 2.5, ty + 1);
        let tagY = ty + 4.5;
        if (fields.migraine && r.isMigraine) {
          setFont(5.5, "normal", [200, 60, 60]);
          doc.text(t.migraine ?? "Migraine", COL_DATE.x + PAD_SIDE + 2.5, tagY);
          tagY += 3.5;
        }
        if (fields.migraine && r.hasAura) {
          setFont(5.5, "normal", [160, 120, 0]);
          doc.text(t.aura ?? "Aura", COL_DATE.x + PAD_SIDE + 2.5, tagY);
        }

        // Intensity
        if (fields.intensity) {
          setFont(9, "bold", SCORE_RGB);
          doc.text(score > 0 ? String(score) : "–", COL_INT.x + COL_INT.w / 2, ty + 3, { align: "center" });
        }

        // Attacks + duration
        setFont(8, "normal", ink);
        doc.text(r.attacks > 0 ? String(r.attacks) : "–", COL_ATT.x + PAD_SIDE, ty + 3);
        setFont(7, "normal", ink);
        doc.text(formatDuration(r.durationMinutes, t) || "–", COL_DUR.x + PAD_SIDE, ty + 3);

        // Symptom pairs
        if (COL_SYM && visibleSymptoms.length > 0) {
          const pairW = (COL_SYM.w - PAD_SIDE * 3) / 2;
          visibleSymptoms.slice(0, 10).forEach(({ key, labelKey, fallback }, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            if (row >= 5) return;
            const lbl = (t[labelKey] ?? fallback).slice(0, 12);
            const val = r[key];
            const px  = COL_SYM.x + PAD_SIDE + col * (pairW + PAD_SIDE);
            const py  = ty + row * LINE_H;
            setFont(6.5, "normal", mid);
            doc.text(`${lbl}:`, px, py);
            setFont(6.5, "bold", ink);
            doc.text(typeof val === "boolean" ? (val ? "✓" : "") : String(val), px + pairW - 1, py, { align: "right" });
          });
        }

        // Medicines
        if (COL_MED && medSplit.length > 0) {
          setFont(6.5, "normal", ink);
          medSplit.forEach((ln, li) => doc.text(ln, COL_MED.x + PAD_SIDE, ty + li * LINE_H));
        }

        // Note band
        if (noteSplit.length > 0) {
          const ny = y + bodyH;
          setFont(6.5, "italic", [100, 130, 180]);
          noteSplit.forEach((ln, li) =>
            doc.text(ln, ML + PAD_SIDE + 3, ny + PAD_TOP * 0.8 + li * LINE_H),
          );
        }

        // Dividers
        [COL_INT, COL_ATT, COL_DUR, COL_SYM, COL_MED, COL_NOTE].forEach((col) => {
          if (col) vline(col.x, y, y + rowH);
        });
        hline(y + rowH, 0.1, rule);
        y += rowH;
      });

      hline(y, 0.2, [74, 122, 181]);

      // ── Footer ──────────────────────────────────────────────
      const pageCount = doc.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        setFont(6.5, "normal", light);
        doc.text(t.appName ?? "Headache Calendar", ML, 280);
        doc.text(`${p} / ${pageCount}`, W - MR, 280, { align: "right" });
        doc.text(new Date().toLocaleDateString(), W / 2, 280, { align: "center" });
      }

      doc.save(`headache-report-${fromDate ?? ""}-${toDate ?? ""}.pdf`);
      onClose();
    } catch (err) {
      console.error("PDF error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const fieldGroups = [
    {
      key: "intensity", label: t.intensity ?? "Intensity",
      children: [{ key: "symptoms", label: t.symptomLog ?? "All symptom fields" }],
    },
    { key: "migraine",  label: `${t.migraine ?? "Migraine"} / ${t.aura ?? "Aura"}` },
    { key: "medicines", label: t.medicines  ?? "Medicines" },
    { key: "note",      label: t.note       ?? "Notes"     },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-[400]"
        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <div
        className="fixed top-1/2 left-1/2 z-[401] rounded-2xl shadow-2xl overflow-hidden"
        style={{
          transform: "translate(-50%, -50%)",
          width: "min(480px, calc(100vw - 32px))",
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(74,122,181,0.2)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(74,122,181,0.12)" }}>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: "#8aaacc" }}>
              {t.downloadPdf ?? "Download PDF"}
            </p>
            <p className="text-lg font-bold" style={{ color: "#2d4a6e" }}>
              {t.appName ?? "Headache Calendar"}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-all"
            style={{ color: "#8aaacc" }}>✕</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Date range */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#8aaacc" }}>
              {(() => {
                if (!fromDate || !toDate) return t.lastFourMonths ?? "Period";
                const months = Math.max(1, Math.round(
                  (new Date(toDate).getFullYear() - new Date(fromDate).getFullYear()) * 12 +
                  (new Date(toDate).getMonth()    - new Date(fromDate).getMonth())
                ));
                return `${months} ${months === 1 ? (t.monthSingular ?? "month") : (t.months ?? "months")}`;
              })()}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <DateInput label={t.from ?? "From"} value={fromDate} onChange={setFromDate} max={toDate || maxDate} />
              <DateInput label={t.to   ?? "To"}   value={toDate}   onChange={setToDate}   min={fromDate || minDate} max={maxDate} />
            </div>
            <p className="text-xs mt-2" style={{ color: "#8aaacc" }}>
              {filtered.length} {t.entries ?? "entries"}
              {filtered.length === 0 && (
                <span className="ml-2" style={{ color: "#e05a5a" }}>— {t.noEntries ?? "No entries"}</span>
              )}
            </p>
          </div>

          {/* Field toggles */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#8aaacc" }}>
              {t.showIn ?? "Include in report"}
            </p>
            <div className="space-y-2.5">
              {fieldGroups.map(({ key, label, children }) => (
                <div key={key}>
                  <Toggle checked={fields[key]} onChange={() => toggle(key)} label={label} />
                  {children && fields[key] && (
                    <div className="ml-10 mt-2 space-y-2">
                      {children.map((child) => (
                        <Toggle key={child.key} checked={fields[child.key]} onChange={() => toggle(child.key)} label={child.label} color="#8aaacc" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between gap-3" style={{ borderTop: "1px solid rgba(74,122,181,0.12)" }}>
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: "rgba(74,122,181,0.08)", color: "#4a7ab5", border: "1px solid rgba(74,122,181,0.2)" }}>
            {t.cancel ?? "Cancel"}
          </button>
          <button onClick={handleDownload}
            disabled={loading || filtered.length === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #4a7ab5 0%, #2d4a6e 100%)", color: "#fff" }}>
            {loading
              ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <span>⬇</span>}
            {loading ? (t.loading ?? "…") : (t.downloadPdf ?? "Download PDF")}
          </button>
        </div>
      </div>
    </>
  );
}
