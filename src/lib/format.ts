export function money(value?: number): string {
  if (typeof value !== "number" || value === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function moneyWithCurrency(value?: number): string {
  if (typeof value !== "number" || value === 0) return "Free";
  return `${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} USD`;
}

export function compactNumber(value?: number): string {
  if (!value) return "0";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function fullNumber(value?: number): string {
  if (!value) return "0";
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDuration(minutes?: number): string {
  if (!minutes) return "0m";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
}

export function formatCourseLength(minutes?: number): string {
  if (!minutes) return "Self-paced";
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}h ${remaining}m` : `${hours} hours`;
}

export function splitDescription(description?: string): string[] {
  const text = description?.trim();
  if (!text) return [];
  return text
    .split(/\n{2,}|(?<=\.)\s+(?=[A-Z])/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
