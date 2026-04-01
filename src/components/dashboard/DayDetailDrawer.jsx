"use client";
import { useEffect } from "react";
import DrawerContent from "./DrawerContent";

const SHARED_STYLE = {
  background: "rgba(255,255,255,0.97)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(74,122,181,0.2)",
};

const BACKDROP_BASE = {
  background: "rgba(0,0,0,0.3)",
  backdropFilter: "blur(4px)",
  transition: "opacity 0.2s ease",
};

export default function DayDetailDrawer({ t, open, onClose, record, medicines }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!record) return null;

  const backdropStyle = (extra = {}) => ({
    ...BACKDROP_BASE,
    ...extra,
    opacity: open ? 1 : 0,
    pointerEvents: open ? "auto" : "none",
  });

  const contentProps = { t, record, medicines, onClose };

  return (
    <>
      {/* Mobile: slide up from bottom */}
      <div
        className="fixed inset-0 z-40 lg:hidden"
        style={backdropStyle()}
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden rounded-t-2xl overflow-y-auto"
        style={{
          ...SHARED_STYLE,
          maxHeight: "82vh",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.3s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-1" style={{ background: "rgba(74,122,181,0.2)" }} />
        <DrawerContent {...contentProps} />
      </div>

      {/* Desktop: centred modal */}
      <div
        className="hidden lg:block fixed inset-0 z-40"
        style={backdropStyle()}
        onClick={onClose}
      />
      <div
        className="hidden lg:block fixed top-1/2 left-1/2 z-50 rounded-2xl overflow-y-auto shadow-2xl"
        style={{
          ...SHARED_STYLE,
          width: 440,
          maxHeight: "82vh",
          transform: open
            ? "translate(-50%,-50%) scale(1)"
            : "translate(-50%,-50%) scale(0.96)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "all 0.2s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        <DrawerContent {...contentProps} />
      </div>
    </>
  );
}