export function timestampToDateString(timestamp) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(timestamp.toDate());
}

export function formatCurrency(amount) {
  return parseFloat(amount || 0).toFixed(2);
}
