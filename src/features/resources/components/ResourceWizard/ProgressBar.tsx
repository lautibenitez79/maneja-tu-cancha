interface Props {

  step: number;

  total: number;

}

export default function ProgressBar({

  step,

  total,

}: Props) {

  const progress =
    (step / total) * 100;

  return (

    <div>

      <div className="mb-3 flex justify-between">

        <span className="text-sm text-[var(--color-muted)]">

          Paso {step} de {total}

        </span>

      </div>

      <div className="h-2 rounded-full bg-gray-200">

        <div

          className="h-2 rounded-full bg-[var(--color-primary)] transition-all"

          style={{

            width: `${progress}%`,

          }}

        />

      </div>

    </div>

  );

}