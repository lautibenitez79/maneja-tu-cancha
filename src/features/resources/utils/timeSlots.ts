export const TIME_SLOTS = Array.from(
  { length: 48 },
  (_, index) => {
    const hour = Math.floor(index / 2);
    const minute = index % 2 === 0 ? "00" : "30";

    return `${String(hour).padStart(2, "0")}:${minute}`;
  },
);

export const END_TIME = 48;