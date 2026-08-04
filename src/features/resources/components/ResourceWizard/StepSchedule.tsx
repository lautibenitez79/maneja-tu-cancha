import WeeklySchedule from "../WeeklySchedule";

import type {
  DaySchedule,
} from "../../types/schedule.types";

interface Props {

  value: DaySchedule[];

  onChange(
    value: DaySchedule[]
  ): void;

  onBack(): void;

  onNext(): void;

}

export default function StepSchedule({

  value,

  onChange,

  onBack,

  onNext,

}: Props) {

  return (

    <div className="space-y-8">

      <div>

        <h1 className="text-3xl font-bold">

          Horarios

        </h1>

        <p className="mt-2 text-gray-500">

          Seleccioná los horarios en los que este recurso estará disponible.

        </p>

      </div>

      <WeeklySchedule

        value={value}

        onChange={onChange}

      />

      <div className="flex gap-4">

        <button

          onClick={onBack}

          className="w-full rounded-lg border py-3"

        >

          Atrás

        </button>

        <button

          onClick={onNext}

          className="w-full rounded-lg bg-[var(--color-primary)] py-3 text-white"

        >

          Continuar

        </button>

      </div>

    </div>

  );

}