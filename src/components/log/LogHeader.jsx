"use client";
import { useState, useRef, useEffect } from "react";

export const FIELDS = [
  { key: "intensity",          tKey: "fieldIntensity",      fallback: "Pain intensity" },
  { key: "attacks",            tKey: "fieldAttacks",        fallback: "Attacks" },
  { key: "durationMinutes",    tKey: "fieldDuration",       fallback: "Duration" },
  { key: "isMigraine",         tKey: "fieldIsMigraine",     fallback: "Migraine" },
  { key: "hasAura",            tKey: "fieldHasAura",        fallback: "Aura" },
  { key: "hasClusterHeadache", tKey: "fieldCluster",        fallback: "Cluster headache" },
];

export function LogHeader({ t, filteredCount, onBack, onPdfOpen, selectedField, onFieldChange }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handle(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [dropdownOpen]);

  const activeField = FIELDS.find((f) => f.key === selectedField) ?? FIELDS[0];
  const activeLabel = t[activeField.tKey] ?? activeField.fallback;

  return (
    <header
      className="flex items-center justify-between px-6 py-4 relative"
      style={{
        background: "linear-gradient(135deg, #4a7ab5 0%, #2d4a6e 100%)",
        boxShadow: "0 2px 16px rgba(45,74,110,0.28)",
      }}
    >
      {/* Left: back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-sm font-semibold px-3 py-1.5 rounded-full transition-all hover:opacity-80"
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          {t.back ?? "← Back"}
        </button>
        <h1 className="text-lg font-bold" style={{ color: "#fff" }}>
          {t.headacheLog ?? "Headache Log"}
        </h1>
      </div>

      {/* Center: field selector dropdown */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        ref={dropdownRef}
        style={{ zIndex: 30 }}
      >
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:opacity-90 active:scale-95"
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "rgba(255,255,255,0.8)" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>
            {activeLabel}
          </span>
          <svg
            width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round"
            style={{
              transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.15s",
              flexShrink: 0,
            }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {dropdownOpen && (
          <div
            className="absolute top-full mt-1 left-1/2 -translate-x-1/2 rounded-xl overflow-hidden"
            style={{
              background: "#fff",
              border: "1px solid rgba(74,122,181,0.18)",
              boxShadow: "0 8px 24px rgba(45,74,110,0.2)",
              minWidth: 168,
              zIndex: 50,
            }}
          >
            {FIELDS.map((f) => {
              const label    = t[f.tKey] ?? f.fallback;
              const isActive = f.key === selectedField;
              return (
                <button
                  key={f.key}
                  onClick={() => { onFieldChange?.(f.key); setDropdownOpen(false); }}
                  className="w-full text-left px-3 py-2.5 flex items-center gap-2 transition-colors"
                  style={{
                    background: isActive ? "rgba(74,122,181,0.08)" : "transparent",
                    borderBottom: "1px solid rgba(74,122,181,0.06)",
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: isActive ? "#4a7ab5" : "rgba(74,122,181,0.25)" }}
                  />
                  <span style={{
                    fontSize: 11,
                    color: isActive ? "#4a7ab5" : "#4a5a6e",
                    fontWeight: isActive ? 700 : 400,
                  }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: entry count + PDF */}
      <div className="flex items-center gap-2">
        <span
          className="hidden md:inline text-xs px-3 py-1.5 rounded-full"
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          {filteredCount} {t.entries ?? "entries"}
        </span>
        <button
          onClick={onPdfOpen}
          disabled={filteredCount === 0}
          className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all hover:opacity-80 disabled:opacity-50 flex items-center gap-1.5"
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          ⬇ PDF
        </button>
      </div>
    </header>
  );
}
