import TimeSlot from "./TimeSlot";

import { TIME_SLOTS } from "../../utils/timeSlots";

interface Props {
  primaryIndexes: number[];

  secondaryIndexes: number[];

  onSelect(index: number): void;
}

export default function TimeGrid({
  primaryIndexes,
  secondaryIndexes,
  onSelect,
}: Props) {
  return (
    <div className="grid gap-2">
      {TIME_SLOTS.map((hour, index) => {
        const isPrimary =
          primaryIndexes.includes(index);

        const isSecondary =
          secondaryIndexes.includes(index);

        return (
          <TimeSlot
            key={hour}
            label={hour}
            selected={
              isPrimary || isSecondary
            }
            variant={
              isPrimary
                ? "primary"
                : "secondary"
            }
            onClick={() =>
              onSelect(index)
            }
          />
        );
      })}

      {/* Límite final del día */}
      <TimeSlot
        label="24:00"
        selected={
          primaryIndexes.includes(48) ||
          secondaryIndexes.includes(48)
        }
        variant={
          primaryIndexes.includes(48)
            ? "primary"
            : "secondary"
        }
        onClick={() => onSelect(48)}
      />
    </div>
  );
}