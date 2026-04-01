import StoreButtons from "./StoreButtons";
import LanguageFlags from "./LanguageFlags";

export default function HomeFooter({ t, lang, setLang }) {
  return (
    <footer className="relative z-10 text-center pb-9 px-4">
      <p className="text-sm mb-1" style={{ color: "#6a8aaa" }}>{t.available}</p>
      <p className="text-sm mb-5" style={{ color: "#6a8aaa" }}>{t.download}</p>

      <StoreButtons />
      <LanguageFlags lang={lang} setLang={setLang} />

      <p className="text-xs mb-2" style={{ color: "#8aaacc" }}>
        Copyright 2026 - KBB Medic AS (org: 912 372 022)
      </p>
      <a
        href="mailto:post@kbbmedic.no"
        className="text-xs flex items-center justify-center gap-1.5 transition-colors hover:opacity-80"
        style={{ color: "#4a7ab5" }}
      >
        ✉ post@kbbmedic.no
      </a>
    </footer>
  );
}
