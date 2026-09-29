// Formatting helpers for money, dates and durations (British English, GBP).

const pounds = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export const formatPounds = (amount: number | string) =>
  pounds.format(Number(amount));

const dayFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

// "29 Sep 2026"
export const formatDate = (value: string | Date) =>
  dayFormat.format(new Date(value));

// "29 Sep 2026, 14:00"
export const formatDateTime = (value: string | Date) =>
  `${formatDate(value)}, ${timeFormat.format(new Date(value))}`;

// "29 Sep 2026, 14:00–15:30", or both full dates if it spans midnight.
export const formatTimeRange = (start: string | Date, end: string | Date) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (startDate.toDateString() === endDate.toDateString()) {
    return `${formatDateTime(startDate)}–${timeFormat.format(endDate)}`;
  }
  return `${formatDateTime(startDate)} – ${formatDateTime(endDate)}`;
};

// 5400000 ms → "1 h 30 min"
export const formatDuration = (milliseconds: number) => {
  const totalMinutes = Math.max(Math.round(milliseconds / 60000), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
};
