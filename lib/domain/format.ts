// Display helpers. Pure module.

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export function formatDate(value: Date | string): string {
  return DATE.format(new Date(value));
}

export function formatAverage(value: number | null): string {
  return value === null ? "—" : value.toFixed(1);
}
