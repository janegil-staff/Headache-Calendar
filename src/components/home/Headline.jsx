import React from "react";
import Image from "next/image";

const Headline = ({ t, mounted }) => {
  return (
    <div className="w-full min-[900px]:w-auto min-[900px]:flex-1 min-[900px]:min-w-[300px] min-[900px]:max-w-[580px] text-center min-[900px]:text-left">
      {/* Logo */}
      <div className="flex justify-center min-[900px]:justify-start mb-5">
        <Image
          src="/logo.png"
          alt="Headache Calendar"
          width={72}
          height={72}
          style={{ borderRadius: 16, width: 72, height: "auto" }}
        />
      </div>

      <h1
        suppressHydrationWarning
        className="font-bold mb-3 leading-tight"
        style={{
          color: "#2d4a6e",
          fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        {mounted ? t.title : "Headache Calendar"}
      </h1>
      <p
        suppressHydrationWarning
        className="mb-8 leading-relaxed max-w-[460px] mx-auto min-[900px]:mx-0"
        style={{ color: "#4a6a8a", fontSize: "0.97rem" }}
      >
        {mounted ? t.subtitle : ""}
      </p>

      {/* Feature pills — only render after mount */}
      {mounted && (
        <div className="flex flex-wrap gap-2 justify-center min-[900px]:justify-start">
          {[
            { icon: "📅", label: t.featureCalendar ?? "Daily diary" },
            { icon: "💊", label: t.featureMeds     ?? "Medication tracking" },
            { icon: "📊", label: t.featureStats    ?? "Statistics & trends" },
            { icon: "🧠", label: t.featureMigraine ?? "Migraine detection" },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: "rgba(74,122,181,0.1)",
                color: "#3a6090",
                border: "1px solid rgba(74,122,181,0.2)",
              }}
            >
              <span>{icon}</span>
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Headline;