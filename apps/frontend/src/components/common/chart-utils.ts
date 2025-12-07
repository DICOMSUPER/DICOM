"use client";

/**
 * Format pie labels to show both count and percentage.
 * Supports entries with status/name/modality and count/value fields.
 */
export const formatPieLabel = (entry: any) => {
  const raw = entry.status || entry.name || entry.modality || "";
  const percent = entry.percent;
  const count = entry.count ?? entry.value ?? 0;
  if (!raw || percent === undefined || percent === null) return "";
  const label =
    typeof raw === "string"
      ? raw.charAt(0).toUpperCase() +
        raw.slice(1).toLowerCase().replace(/_/g, " ")
      : String(raw);
  return `${label}: ${count} (${(percent * 100).toFixed(0)}%)`;
};

/**
 * Format pie tooltips to show count and percentage alongside a prettified label.
 */
export const formatPieTooltip = (value: any, name: any, props: any) => {
  const nameStr = typeof name === "string" ? name : String(name || "");
  if (!nameStr) return [value, ""];
  const label =
    nameStr.charAt(0).toUpperCase() +
    nameStr.slice(1).toLowerCase().replace(/_/g, " ");
  const percent = props?.payload?.percent;
  const pctText =
    percent === undefined || percent === null
      ? ""
      : ` (${(percent * 100).toFixed(0)}%)`;
  return [`${value}${pctText}`, label];
};

