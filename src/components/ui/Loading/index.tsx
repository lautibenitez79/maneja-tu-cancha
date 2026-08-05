interface Props {

  text?: string;

}

export default function Loading({

  text = "Cargando...",

}: Props) {

  return (

    <div className="flex flex-col items-center justify-center py-20">

      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]" />

      <p className="mt-4 text-sm text-[var(--color-text)]">

        {text}

      </p>

    </div>

  );

}