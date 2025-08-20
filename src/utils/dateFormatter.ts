export function dateFormatter(isoString: string): string {
  if (!isoString) return ""; // Menangani jika data null atau undefined

  const tanggal = new Date(isoString);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC", // Gunakan UTC agar tidak terpengaruh timezone browser klien
  };

  return tanggal.toLocaleDateString("id-ID", options);
}
