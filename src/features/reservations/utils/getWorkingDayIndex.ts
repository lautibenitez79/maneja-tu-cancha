export function getWorkingDayIndex(
  date: Date,
): number {

  const day = date.getDay();

  // JS:
  // Domingo = 0
  // Lunes = 1
  // ...

  // Nosotros:
  // Lunes = 0
  // ...
  // Domingo = 6

  return day === 0 ? 6 : day - 1;

}