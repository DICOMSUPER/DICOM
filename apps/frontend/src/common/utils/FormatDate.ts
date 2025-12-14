
export function formatDateYMD(date?: Date | string): string {
  if (!date) return "Không có";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "Không hợp lệ";

  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDateVN(date?: Date | string): string {
  if (!date) return "Không có";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "Không hợp lệ";

  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}
