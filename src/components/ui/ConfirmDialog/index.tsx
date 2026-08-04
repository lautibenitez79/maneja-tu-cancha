interface Props {
  open: boolean;

  title: string;

  description: string;

  loading?: boolean;

  onConfirm(): void;

  onCancel(): void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-md rounded-[var(--radius-card)] bg-white p-6 shadow-xl">

        <h2 className="text-xl font-semibold">
          {title}
        </h2>

        <p className="mt-3 text-slate-500">
          {description}
        </p>

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onCancel}
            className="rounded-xl border px-5 py-2"
          >
            Cancelar
          </button>

          <button
            disabled={loading}
            onClick={onConfirm}
            className="rounded-xl bg-red-600 px-5 py-2 text-white disabled:opacity-60"
          >
            {loading
              ? "Eliminando..."
              : "Eliminar"}
          </button>

        </div>

      </div>

    </div>
  );
}