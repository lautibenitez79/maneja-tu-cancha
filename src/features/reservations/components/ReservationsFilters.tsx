import type {
  ReservationAttendanceFilter,
} from "../types/reservation-tracking.types";

interface ReservationsFiltersProps {
  date: string;
  attendance: ReservationAttendanceFilter;
  onDateChange: (date: string) => void;
  onAttendanceChange: (
    value: ReservationAttendanceFilter,
  ) => void;
}

export function ReservationsFilters({
  date,
  attendance,
  onDateChange,
  onAttendanceChange,
}: ReservationsFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border bg-[var(--color-card)] p-4 shadow-sm sm:grid-cols-2">
      <div className="min-w-0">
        <label
          htmlFor="reservation-date"
          className="mb-2 block text-sm font-medium"
        >
          Fecha
        </label>

        <input
          id="reservation-date"
          type="date"
          value={date}
          onChange={(event) =>
            onDateChange(event.target.value)
          }
          className="h-11 w-full min-w-0 rounded-xl border bg-transparent px-3 text-sm outline-none transition focus:ring-2 focus:ring-blue-500/30"
        />
      </div>

      <div className="min-w-0">
        <label
          htmlFor="reservation-attendance"
          className="mb-2 block text-sm font-medium"
        >
          Asistencia
        </label>

        <select
          id="reservation-attendance"
          value={attendance}
          onChange={(event) =>
            onAttendanceChange(
              event.target
                .value as ReservationAttendanceFilter,
            )
          }
          className="h-11 w-full min-w-0 rounded-xl border bg-[var(--color-card)] px-3 text-sm outline-none transition focus:ring-2 focus:ring-blue-500/30"
        >
          <option value="all">Todas</option>

          <option value="pending">
            Pendientes
          </option>

          <option value="attended">
            Asistieron
          </option>

          <option value="no_show">
            No asistieron
          </option>
        </select>
      </div>
    </div>
  );
}