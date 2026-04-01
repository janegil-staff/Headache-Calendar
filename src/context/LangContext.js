"use client";

import { createContext, useContext, useState } from "react";

const LangContext = createContext(null);

const SUPPORTED_LANGS = [
  "no", "en", "nl", "fr", "de", "it", "sv", "da", "fi", "es", "pl", "pt",
];

const DEFAULT_LANG = "no";

function detectLang() {
  if (typeof window === "undefined") return DEFAULT_LANG;
  const params = new URLSearchParams(window.location.search);
  const override = params.get("lang");
  if (override && SUPPORTED_LANGS.includes(override)) return override;
  const browser = navigator.language?.slice(0, 2);
  if (browser && SUPPORTED_LANGS.includes(browser)) return browser;
  return DEFAULT_LANG;
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(detectLang);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
