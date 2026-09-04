import UserForm from "./UserForm";

import type { InviteUserData } from "../types/user.types";

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: InviteUserData) => Promise<void>;
  loading?: boolean;
}

export default function UserModal({
  open,
  onClose,
  onSubmit,
  loading = false,
}: UserModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-[var(--color-background)] p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-title)]">
            Agregar usuario
          </h2>

          <p className="mt-1 text-sm text-[var(--color-text)]">
            El usuario recibirá una invitación para crear su contraseña.
          </p>
        </div>

        <UserForm
          onSubmit={onSubmit}
          loading={loading}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}