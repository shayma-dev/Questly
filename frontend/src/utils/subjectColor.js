// ==============================
// src/utils/subjectColor.js
// ==============================
export function subjectColor(subjectId) {
  const colors = [
    { bg: "#E5F0FF", border: "#B3D4FF", text: "#1E40AF" }, // blue
    { bg: "#EAF7EE", border: "#B3E5C1", text: "#166534" }, // green
    { bg: "#FFF4E5", border: "#FFD6B3", text: "#C2410C" }, // orange
    { bg: "#F3E8FF", border: "#D8B4FE", text: "#7C3AED" }, // purple
    { bg: "#FFE5EC", border: "#FFADC2", text: "#BE185D" }, // pink
    { bg: "#E6FFFA", border: "#99F6E4", text: "#0F766E" }, // teal
  ];
  const id = Number.parseInt(subjectId ?? 0, 10);
  const index = Number.isFinite(id) ? id % colors.length : 0;
  return colors[index];
}

export function subjectStyle(subjectId) {
  const c = subjectColor(subjectId);
  return {
    backgroundColor: c.bg,
    color: c.text,
    borderColor: c.border,
  };
}