import Button from "../Button/index";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay)]">
      <div className="w-full max-w-md rounded-[var(--radius-card)] bg-[var(--color-card)] p-6 shadow-xl">
        <h2 className="text-xl font-semibold">
          {title}
        </h2>

        <p className="mt-3 text-slate-500">
          {description}
        </p>

        <div className="mt-8 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>

          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </div>
    </div>
  );
}