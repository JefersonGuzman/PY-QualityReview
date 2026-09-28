// Display helpers. Pure module.

// Dates use the time zone of the machine running the app, so a review written tonight
// does not show tomorrow's date. (Weekly trends are still grouped in UTC by the database.)
const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function formatDate(value: Date | string): string {
  return DATE.format(new Date(value));
}

export function formatAverage(value: number | null): string {
  return value === null ? "—" : value.toFixed(1);
}
