import AppleLogo from "../icons/AppleLogo";
import GooglePlayLogo from "../icons/GooglePlayLogo";

const APP_STORE_URL   = "https://apps.apple.com";
const GOOGLE_PLAY_URL = "https://play.google.com";

export default function StoreButtons() {
  return (
    <div className="flex gap-3 justify-center flex-wrap mb-5">
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 text-white rounded-xl px-5 py-2.5 transition-all hover:-translate-y-0.5"
        style={{
          background: "linear-gradient(135deg, #2d4a6e 0%, #4a7ab5 100%)",
          boxShadow: "0 4px 12px rgba(74,122,181,0.3)",
        }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 6px 18px rgba(74,122,181,0.45)"}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(74,122,181,0.3)"}
      >
        <AppleLogo />
        <span className="flex flex-col text-left">
          <span className="text-[0.58rem] text-white/60 uppercase tracking-wide">Download on the</span>
          <span className="text-sm font-bold">App Store</span>
        </span>
      </a>
      <a
        href={GOOGLE_PLAY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 text-white rounded-xl px-5 py-2.5 transition-all hover:-translate-y-0.5"
        style={{
          background: "linear-gradient(135deg, #2d4a6e 0%, #4a7ab5 100%)",
          boxShadow: "0 4px 12px rgba(74,122,181,0.3)",
        }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 6px 18px rgba(74,122,181,0.45)"}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(74,122,181,0.3)"}
      >
        <GooglePlayLogo />
        <span className="flex flex-col text-left">
          <span className="text-[0.58rem] text-white/60 uppercase tracking-wide">Get it on</span>
          <span className="text-sm font-bold">Google Play</span>
        </span>
      </a>
    </div>
  );
}
