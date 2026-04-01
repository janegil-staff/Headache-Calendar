"use client";

export function LogSearch({ t, search, onSearch }) {
  return (
    <div className="px-6 pt-4 pb-2 max-w-3xl mx-auto w-full">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2"
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="rgba(74,122,181,0.5)" strokeWidth="2.5" strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={t.searchPlaceholder ?? "Search by note, medicine, score…"}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(74,122,181,0.18)",
            color: "#2d4a6e",
          }}
        />
        {search && (
          <button
            onClick={() => onSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: "rgba(74,122,181,0.5)" }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
