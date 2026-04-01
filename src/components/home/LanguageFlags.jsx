const flags = [
  { code: "en", emoji: "🇬🇧", label: "English"    },
  { code: "nl", emoji: "🇳🇱", label: "Nederlands"  },
  { code: "fr", emoji: "🇫🇷", label: "Français"    },
  { code: "de", emoji: "🇩🇪", label: "Deutsch"     },
  { code: "it", emoji: "🇮🇹", label: "Italiano"    },
  { code: "no", emoji: "🇳🇴", label: "Norsk"       },
  { code: "sv", emoji: "🇸🇪", label: "Svenska"     },
  { code: "da", emoji: "🇩🇰", label: "Dansk"       },
  { code: "fi", emoji: "🇫🇮", label: "Suomi"       },
  { code: "es", emoji: "🇪🇸", label: "Español"     },
  { code: "pl", emoji: "🇵🇱", label: "Polski"      },
  { code: "pt", emoji: "🇵🇹", label: "Português"   },
];

export default function LanguageFlags({ lang, setLang }) {
  return (
    <div className="flex gap-1 justify-center flex-wrap mb-3">
      {flags.map((f) => (
        <button
          key={f.code}
          title={f.label}
          onClick={() => setLang(f.code)}
          className="text-2xl leading-none px-1 py-0.5 rounded border-2 transition-all"
          style={{
            opacity: lang === f.code ? 1 : 0.55,
            borderColor: lang === f.code ? "#4a7ab5" : "transparent",
            transform: lang === f.code ? "scale(1.1)" : "scale(1)",
          }}
        >
          {f.emoji}
        </button>
      ))}
    </div>
  );
}
