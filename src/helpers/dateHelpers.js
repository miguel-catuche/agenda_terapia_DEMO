// src/utils/dateHelpers.js
export const getDateForDay = (date, day) => {
  const daysNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const idx = daysNames.indexOf(day);
  const base = new Date(date);
  const dow = base.getDay();
  const offsetToMonday = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(base);
  monday.setDate(base.getDate() + offsetToMonday);
  const target = new Date(monday);
  target.setDate(monday.getDate() + idx);
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-${String(target.getDate()).padStart(2, "0")}`;
};
