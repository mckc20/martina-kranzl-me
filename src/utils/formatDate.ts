import { SITE } from "@/config";

const DATE_LOCALE = "de-AT";

export function formatGermanDate(
  date: string | Date,
  timezone: string | undefined = SITE.timezone
) {
  return new Intl.DateTimeFormat(DATE_LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: timezone,
  }).format(new Date(date));
}

export function formatGermanMonth(month: number) {
  return new Intl.DateTimeFormat(DATE_LOCALE, {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2020, month - 1, 1)));
}
