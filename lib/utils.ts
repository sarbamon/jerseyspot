/**
 * Utility functions for date formatting across the application.
 */

/**
 * Formats a date string, Date object, or timestamp to DD/MM/YYYY format.
 * Example: 2026-09-13 -> "13/09/2026"
 */
export function formatDate(dateInput: string | Date | number | undefined | null): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Formats a date string, Date object, or timestamp to DD/MM/YYYY hh:mm AM/PM format.
 * Example: 2026-09-13T14:30:00 -> "13/09/2026, 02:30 PM"
 */
export function formatDateTime(dateInput: string | Date | number | undefined | null): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${day}/${month}/${year}, ${timeStr}`;
}
