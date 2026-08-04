export const TIME_SLOTS = Array.from(
  { length: 32 },
  (_, index) => {

    const hour =
      Math.floor(index / 2) + 8;

    const minute =
      index % 2 === 0
        ? "00"
        : "30";

    return `${hour}:${minute}`;

  }
);