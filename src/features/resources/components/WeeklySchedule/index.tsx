import { useEffect, useMemo, useState } from "react";

import type { DaySchedule } from "../../types/schedule.types";

import { createEmptyWeek } from "../../utils/createEmptyWeek";

import DayColumn from "./DayColumn";

import { END_TIME, TIME_SLOTS } from "../../utils/timeSlots";

interface Props {
  value: DaySchedule[];

  onChange(value: DaySchedule[]): void;
}

const DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const SHORT_DAYS = [
  "Lun",
  "Mar",
  "Mié",
  "Jue",
  "Vie",
  "Sáb",
  "Dom",
];

function emptyRange() {
  return {
    start: null,
    end: null,
  };
}

function createSchedule(
  start: number,
  end: number,
): DaySchedule {
  return {
    primary: {
      start,
      end,
    },
    secondary: emptyRange(),
  };
}

function getInitialDays(value: DaySchedule[]) {
  return value
    .map((day, index) => ({
      index,
      enabled:
        day.primary.start !== null &&
        day.primary.end !== null,
    }))
    .filter((day) => day.enabled)
    .map((day) => day.index);
}

function getInitialRange(value: DaySchedule[]) {
  const first = value.find(
    (day) =>
      day.primary.start !== null &&
      day.primary.end !== null,
  );

  if (!first) {
    return {
      start: "",
      end: "",
    };
  }

  return {
    start: String(first.primary.start),
    end: String(first.primary.end),
  };
}

export default function WeeklySchedule({
  value,
  onChange,
}: Props) {
  const week =
    value.length
      ? value
      : createEmptyWeek();

  const [mobileMode, setMobileMode] = useState<
    "quick" | "individual"
  >("quick");

  const initialDays = useMemo(
    () => getInitialDays(week),
    [],
  );

  const initialRange = useMemo(
    () => getInitialRange(week),
    [],
  );

  const [selectedDays, setSelectedDays] =
    useState<number[]>(initialDays);

  const [startTime, setStartTime] =
    useState(initialRange.start);

  const [endTime, setEndTime] =
    useState(initialRange.end);

  const [fullDay, setFullDay] = useState(
    initialRange.start === "0" &&
      initialRange.end === String(END_TIME),
  );

  useEffect(() => {
    if (!value.length) {
      return;
    }

    setSelectedDays(
      getInitialDays(value),
    );

    const range = getInitialRange(value);

    setStartTime(range.start);
    setEndTime(range.end);

    setFullDay(
      range.start === "0" &&
        range.end === String(END_TIME),
    );
  }, [value]);

  function updateDay(
    index: number,
    next: DaySchedule,
  ) {
    const copy = [...week];

    copy[index] = next;

    onChange(copy);
  }

  function toggleDay(index: number) {
    setSelectedDays((current) =>
      current.includes(index)
        ? current.filter(
            (day) => day !== index,
          )
        : [...current, index],
    );
  }

  function handleFullDayChange(
    checked: boolean,
  ) {
    setFullDay(checked);

    if (checked) {
      setStartTime("0");
      setEndTime(String(END_TIME));
    }
  }

  function applyQuickSchedule() {
    if (!selectedDays.length) {
      return;
    }

    const start = fullDay
      ? 0
      : Number(startTime);

    const end = fullDay
      ? END_TIME
      : Number(endTime);

    if (
      Number.isNaN(start) ||
      Number.isNaN(end) ||
      end <= start
    ) {
      return;
    }

    const nextWeek = [...week];

    selectedDays.forEach((index) => {
      nextWeek[index] = createSchedule(
        start,
        end,
      );
    });

    onChange(nextWeek);
  }

  function clearQuickSchedule() {
    const nextWeek = [...week];

    selectedDays.forEach((index) => {
      nextWeek[index] = {
        primary: emptyRange(),
        secondary: emptyRange(),
      };
    });

    onChange(nextWeek);

    setSelectedDays([]);
    setStartTime("");
    setEndTime("");
    setFullDay(false);
  }

  const canApply =
    selectedDays.length > 0 &&
    (fullDay ||
      (startTime !== "" &&
        endTime !== "" &&
        Number(endTime) > Number(startTime)));

  return (
    <div>
      {/* DESKTOP / TABLET */}
      <div className="hidden md:block">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
          {DAYS.map((day, index) => (
            <DayColumn
              key={day}
              day={day}
              value={week[index]}
              onChange={(next) =>
                updateDay(index, next)
              }
            />
          ))}
        </div>
      </div>

      {/* MOBILE */}
      <div className="md:hidden">
        <div className="space-y-5">
          <div className="rounded-2xl border bg-[var(--color-card)] p-4">
            <div className="mb-4">
              <h3 className="font-semibold">
                Configuración rápida
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Elegí los días y aplicá el mismo
                horario de una sola vez.
              </p>
            </div>

            {/* MODO */}
            <div className="mb-5 grid grid-cols-2 rounded-xl border p-1">
              <button
                type="button"
                onClick={() =>
                  setMobileMode("quick")
                }
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  mobileMode === "quick"
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-slate-600"
                }`}
              >
                Rápido
              </button>

              <button
                type="button"
                onClick={() =>
                  setMobileMode("individual")
                }
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  mobileMode === "individual"
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-slate-600"
                }`}
              >
                Individual
              </button>
            </div>

            {mobileMode === "quick" ? (
              <div className="space-y-5">
                {/* DÍAS */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Días disponibles
                  </label>

                  <div className="grid grid-cols-4 gap-2">
                    {SHORT_DAYS.map(
                      (day, index) => {
                        const selected =
                          selectedDays.includes(
                            index,
                          );

                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() =>
                              toggleDay(index)
                            }
                            className={`rounded-xl border px-2 py-3 text-sm font-medium transition ${
                              selected
                                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                                : "bg-[var(--color-card)] text-slate-600"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>

                {/* HORARIO */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Horario
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="mb-1 block text-xs text-slate-500">
                        Desde
                      </span>

                      <select
                        value={startTime}
                        disabled={fullDay}
                        onChange={(event) =>
                          setStartTime(
                            event.target.value,
                          )
                        }
                        className="h-11 w-full rounded-xl border bg-[var(--color-card)] px-3 text-sm"
                      >
                        <option value="">
                          Seleccionar
                        </option>

                        {TIME_SLOTS.map(
                          (time, index) => (
                            <option
                              key={index}
                              value={index}
                            >
                              {time}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div>
                      <span className="mb-1 block text-xs text-slate-500">
                        Hasta
                      </span>

                      <select
                        value={endTime}
                        disabled={fullDay}
                        onChange={(event) =>
                          setEndTime(
                            event.target.value,
                          )
                        }
                        className="h-11 w-full rounded-xl border bg-[var(--color-card)] px-3 text-sm"
                      >
                        <option value="">
                          Seleccionar
                        </option>

                        {TIME_SLOTS.map(
                          (time, index) => (
                            <option
                              key={index}
                              value={index}
                            >
                              {time}
                            </option>
                          ),
                        )}

                        <option value={END_TIME}>
                          00:00
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 24 HORAS */}
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-3">
                  <input
                    type="checkbox"
                    checked={fullDay}
                    onChange={(event) =>
                      handleFullDayChange(
                        event.target.checked,
                      )
                    }
                    className="h-4 w-4"
                  />

                  <div>
                    <p className="text-sm font-medium">
                      Disponible las 24 horas
                    </p>

                    <p className="text-xs text-slate-500">
                      De 00:00 a 00:00
                    </p>
                  </div>
                </label>

                {/* APLICAR */}
                <button
                  type="button"
                  disabled={!canApply}
                  onClick={applyQuickSchedule}
                  className="w-full rounded-xl bg-[var(--color-primary)] py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Aplicar horario
                </button>

                {selectedDays.length > 0 && (
                  <button
                    type="button"
                    onClick={clearQuickSchedule}
                    className="w-full rounded-xl border py-3 text-sm font-medium"
                  >
                    Limpiar días seleccionados
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">
                  Configurá cada día por separado,
                  como en la versión de escritorio.
                </p>

                {DAYS.map((day, index) => (
                  <DayColumn
                    key={day}
                    day={day}
                    value={week[index]}
                    onChange={(next) =>
                      updateDay(index, next)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}