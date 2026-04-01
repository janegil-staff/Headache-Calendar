"use client";

function pad(n) { return String(n).padStart(2, "0"); }

function getMonthRecords(records, year, month) {
  const prefix = `${year}-${pad(month + 1)}`;
  return (records ?? []).filter((r) => r.date?.startsWith(prefix));
}

function SideRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid rgba(74,122,181,0.07)" }}>
      <div className="flex items-center gap-2">
        {icon && (
          <img
            src={icon}
            alt=""
            style={{ width: 16, height: 16, flexShrink: 0 }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        )}
        <span style={{ fontSize: 11, color: "#4a6a8a" }}>{label}</span>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#2d4a6e" }}>{value}</span>
    </div>
  );
}

export default function MonthlySidebar({ t, records, viewYear, viewMonth, headacheScores }) {
  const monthRecs = getMonthRecords(records, viewYear, viewMonth);
  const total     = monthRecs.length;

  const attacks      = monthRecs.reduce((s, r) => s + (r.attacks ?? 0), 0);
  const totalMins    = monthRecs.reduce((s, r) => s + (r.durationMinutes ?? 0), 0);
  const totalIntensity = monthRecs.reduce((s, r) => s + (r.intensity ?? 0), 0);
  const migDays      = monthRecs.filter((r) => r.isMigraine).length;
  const auraDays     = monthRecs.filter((r) => r.hasAura).length;
  const medDays      = monthRecs.filter((r) => r.acuteMedicines?.length > 0).length;
  const recordedNoH  = monthRecs.filter((r) => !r.intensity || r.intensity === 0).length;
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const noHDays      = daysInMonth - (monthRecs.length - recordedNoH);

  const severityCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  monthRecs.forEach((r) => {
    const s = r.intensity ?? 0;
    if (s >= 1) severityCounts[Math.min(s, 4)]++;
  });

  const hoursDisplay = `${Math.ceil(totalMins / 60)} ${t.hours ?? 'hours'}`;

  const daysLabel = t.days ?? "days";

  return (
    <div style={{ padding: "20px 16px 20px 8px" }}>
      <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#4a7ab5" }}>
        {t.monthSummary ?? "This month"}
      </p>

      {/* Monthly intensity total badge */}
      <div className="rounded-xl p-3 mb-3 text-center" style={{ background: "rgba(74,122,181,0.06)", border: "1px solid rgba(74,122,181,0.12)" }}>
        <p style={{ fontSize: 10, color: "#8aaacc", marginBottom: 2 }}>{t.monthIntensity ?? "Monthly intensity"}</p>
        <p style={{ fontSize: 24, fontWeight: 800, color: "#2d4a6e", lineHeight: 1 }}>{totalIntensity}</p>
        <p style={{ fontSize: 10, color: "#8aaacc", marginTop: 2 }}>{total} {t.entries ?? "entries"}</p>
      </div>

      {/* Severity rows */}
      <SideRow icon="/icons/ico_intensity_no.png"       label={t.noHeadache       ?? "No headache"} value={`${noHDays} ${daysLabel}`}           />
      <SideRow icon="/icons/ico_intensity_mild.png"     label={t.severityMild     ?? "Mild"}        value={`${severityCounts[1]} ${daysLabel}`} />
      <SideRow icon="/icons/ico_intensity_moderate.png" label={t.severityModerate ?? "Moderate"}    value={`${severityCounts[2]} ${daysLabel}`} />
      <SideRow icon="/icons/ico_intensity_serious.png"  label={t.severityStrong   ?? "Strong"}      value={`${severityCounts[3]} ${daysLabel}`} />
      <SideRow icon="/icons/ico_migraine.svg" label={t.migraine ?? "Migraine"} value={`${migDays} ${daysLabel}`} />
      <SideRow icon="/icons/ico_aura.svg" label={t.aura ?? "Aura"} value={`${auraDays} ${daysLabel}`} />

      {/* Stats rows */}
      <div className="mt-2">
        <SideRow icon="/icons/ico_attacks.png"            label={t.attacks           ?? "Attacks"}         value={attacks}                       />
        <SideRow icon="/icons/ico_duration.svg"           label={t.hoursWithHeadache ?? "Hours w/ headache"} value={hoursDisplay}                />
        <SideRow icon="/icons/ico_injection.png"          label={t.injections        ?? "Injections"}      value={`0 ${daysLabel}`}              />
        <SideRow icon="/icons/ico_intensity_medicine.png" label={t.medicationDays    ?? "Medication"}      value={`${medDays} ${daysLabel}`}     />
      </div>
    </div>
  );
}