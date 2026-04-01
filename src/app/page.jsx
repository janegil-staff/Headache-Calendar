"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import { useSecretCode } from "@/hooks/useSecretCode";
import Headline from "@/components/home/Headline";
import ImportCard from "@/components/home/ImportCard";
import PhoneShowcase from "@/components/home/PhoneShowcase";
import HomeFooter from "@/components/home/HomeFooter";
import no from "./messages/no.json";
import en from "./messages/en.json";
import nl from "./messages/nl.json";
import fr from "./messages/fr.json";
import de from "./messages/de.json";
import it from "./messages/it.json";
import sv from "./messages/sv.json";
import da from "./messages/da.json";
import fi from "./messages/fi.json";
import es from "./messages/es.json";
import pl from "./messages/pl.json";
import pt from "./messages/pt.json";

const translations = { no, en, nl, fr, de, it, sv, da, fi, es, pl, pt };

const COUNTRIES = [
  { code: "no", label: "Norway",      flag: "🇳🇴" },
  { code: "en", label: "UK",          flag: "🇬🇧" },
  { code: "nl", label: "Netherlands", flag: "🇳🇱" },
  { code: "fr", label: "France",      flag: "🇫🇷" },
  { code: "de", label: "Germany",     flag: "🇩🇪" },
  { code: "it", label: "Italy",       flag: "🇮🇹" },
  { code: "sv", label: "Sweden",      flag: "🇸🇪" },
  { code: "da", label: "Denmark",     flag: "🇩🇰" },
  { code: "fi", label: "Finland",     flag: "🇫🇮" },
  { code: "es", label: "Spain",       flag: "🇪🇸" },
  { code: "pl", label: "Poland",      flag: "🇵🇱" },
  { code: "pt", label: "Portugal",    flag: "🇵🇹" },
];

export default function Home() {
  const { lang, setLang } = useLang();
  const router = useRouter();
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { input: code, handleChange } = useSecretCode();

  // After hydration, flip mounted → true so lang-dependent text switches in
  useEffect(() => {
    setMounted(true);
  }, []);

  // Both server and first client render use "no" — no mismatch
  const t = translations[mounted ? lang : "no"];

  const handleClick = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (data.valid) {
      sessionStorage.setItem("patientData", JSON.stringify(data.patient));
      router.push("/dashboard");
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0" />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, rgba(74,122,181,0.12) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(74,122,181,0.08) 0%, transparent 50%)`,
        }}
      />

      <main className="flex-1 flex flex-col min-[900px]:flex-row items-center min-[900px]:items-start justify-center gap-6 px-6 min-[900px]:px-12 pt-12 pb-6 relative z-10">
        {/* Left column */}
        <div className="flex flex-col gap-6 flex-1 min-[900px]:min-w-[300px] min-[900px]:max-w-[580px] w-full order-1 min-[900px]:order-1">
          <Headline t={t} mounted={mounted} />
          <div className="hidden min-[900px]:block">
            <PhoneShowcase t={t} />
          </div>
        </div>

        {/* Right column */}
        <div className="w-full min-[900px]:w-auto order-2 min-[900px]:order-2 flex flex-col gap-3">
          {/* Language dropdown */}
          <div className="relative w-full max-w-[400px] mx-auto min-[900px]:max-w-none min-[900px]:mx-0">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full appearance-none rounded-xl px-4 py-3 pr-10 text-sm font-medium cursor-pointer focus:outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(74,122,181,0.2)",
                color: "#2d4a6e",
                backdropFilter: "blur(8px)",
                boxShadow: "0 2px 8px rgba(74,122,181,0.08)",
              }}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.label}
                </option>
              ))}
            </select>
            <div
              className="pointer-events-none absolute inset-y-0 right-3 flex items-center"
              style={{ color: "#4a7ab5" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <ImportCard
            t={t}
            code={code}
            error={error}
            setError={setError}
            handleChange={handleChange}
            handleClick={handleClick}
          />
        </div>

        {/* Phone showcase mobile */}
        <div className="block min-[900px]:hidden w-full order-3">
          <PhoneShowcase t={t} />
        </div>
      </main>

      <HomeFooter t={t} lang={lang} setLang={setLang} />
    </div>
  );
}