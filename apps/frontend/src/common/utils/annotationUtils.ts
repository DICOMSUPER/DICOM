export const COLOR_PALETTE = [
  // Primary Colors
  "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E", "#10B981",
  "#14B8A6", "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7",
  "#D946EF", "#EC4899", "#F43F5E",
  
  // Darker Variants
  "#DC2626", "#EA580C", "#D97706", "#CA8A04", "#65A30D", "#16A34A", "#059669",
  "#0D9488", "#0891B2", "#0284C7", "#2563EB", "#4F46E5", "#7C3AED", "#9333EA",
  "#C026D3", "#DB2777", "#E11D48",
  
  // Lighter/Pastel Variants
  "#FCA5A5", "#FDBA74", "#FCD34D", "#FDE047", "#BEF264", "#86EFAC", "#6EE7B7",
  "#5EEAD4", "#7DD3FC", "#93C5FD", "#A5B4FC", "#C4B5FD", "#DDD6FE", "#E9D5FF",
  "#F9A8D4", "#FDA4AF",
  
  // Neutral Options
  "#FFFFFF", "#F5F5F5", "#E5E5E5", "#D4D4D4", "#A3A3A3", "#737373",
  "#525252", "#404040", "#262626", "#171717", "#0A0A0A",
  "#CBD5E1", "#94A3B8", "#64748B", "#475569", "#334155", "#1E293B",
];

export const getColorForId = (
  id: string,
  palette: string[] = COLOR_PALETTE
): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palette.length;
  return palette[index];
};

export const parseColorCode = (colorCode?: string): string | null => {
  if (!colorCode) return null;
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorCode)) {
    return colorCode;
  }
  if (colorCode.startsWith("rgb")) {
    return colorCode;
  }
  return null;
};

export const formatAnnotationType = (type: string) => {
  return type
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const formatDate = (value?: string) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
};

