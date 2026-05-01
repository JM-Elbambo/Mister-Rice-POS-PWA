import { Timestamp } from "firebase/firestore";

export function formatDate(date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(
    typeof date === "string"
      ? new Date(date)
      : date instanceof Timestamp
        ? date.toDate()
        : date,
  );
}

export function formatDateTime(date) {
  const d =
    typeof date === "string"
      ? new Date(date)
      : date instanceof Timestamp
        ? date.toDate()
        : date;
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(d)
    .replace(", ", " ");
}

export function formatCurrency(amount) {
  return parseFloat(amount || 0).toFixed(2);
}

export function daysAgo(days) {
  return Timestamp.fromDate(new Date(Date.now() - days * 86400000));
}
