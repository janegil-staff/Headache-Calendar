export const combineScore = (r) => {
  if (!r) return 0;
  return r.intensity ?? 1;
};

export const SCORE_COLOR = (score) => {
  if (!score || score <= 1) return { text: "#4a7ab5", bg: "#ddeaf8", border: "#a8c8ea" };
  if (score <= 2)           return { text: "#fff",    bg: "#4CC189", border: "#2e9e68" };
  if (score <= 3)           return { text: "#7a5200", bg: "#FFC659", border: "#c99500" };
  if (score <= 4)           return { text: "#fff",    bg: "#FF7473", border: "#cc4040" };
  return                           { text: "#fff",    bg: "#BE3830", border: "#8a2020" };
};

export const filterRecords = (records, search, patient, t) => {
  if (!search.trim()) return records;
  const q = search.toLowerCase();
  return records.filter((r) => {
    if (r.note?.toLowerCase().includes(q)) return true;

    const score = combineScore(r);
    if (String(score).includes(q)) return true;
    const scoreLabel =
      score <= 1 ? (t?.noPain     ?? "none")
      : score <= 2 ? (t?.mild     ?? "mild")
      : score <= 3 ? (t?.moderate ?? "moderate")
      : score <= 4 ? (t?.serious  ?? "serious")
      :               (t?.veryHigh ?? "extreme");
    if (scoreLabel.toLowerCase().includes(q)) return true;

    if (r.isMigraine && (t?.fieldIsMigraine ?? "migraine").toLowerCase().includes(q)) return true;
    if (r.hasAura    && (t?.fieldHasAura    ?? "aura").toLowerCase().includes(q))     return true;
    if (r.hasClusterHeadache && (t?.fieldCluster ?? "cluster").toLowerCase().includes(q)) return true;

    if (r.acuteMedicines?.some((id) => {
      const med = patient.medicines?.find((m) => m.id === id);
      return med?.name?.toLowerCase().includes(q);
    })) return true;

    return false;
  });
};

export const formatDuration = (mins, t) => {
  if (!mins || mins <= 0) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const hLabel = h === 1 ? (t?.hourSingular ?? "hr") : (t?.hours ?? "hrs");
  const mLabel = t?.minutes ?? "min";
  if (h > 0 && m > 0) return `${h}${hLabel} ${m}${mLabel}`;
  if (h > 0)           return `${h}${hLabel}`;
  return `${m}${mLabel}`;
};
