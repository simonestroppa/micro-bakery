import { format } from "date-fns";
import { it } from "date-fns/locale";

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function formatDateTime(date: Date) {
  return format(date, "d MMM yyyy 'alle' HH:mm", { locale: it });
}

export function toDateTimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function minAllowedDateTime(minutesFromNow: number) {
  return toDateTimeLocalValue(new Date(Date.now() + minutesFromNow * 60_000));
}
