interface StepContactProps {
  phone: string;
  email: string;

  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;

  onBack: () => void;
  onNext: () => void;
}

export default function StepContact({
  phone,
  email,
  onPhoneChange,
  onEmailChange,
  onBack,
  onNext,
}: StepContactProps) {
  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-black">
          Información de contacto
        </h1>

        <p className="mt-2 text-gray-500">
          Estos datos se utilizarán para identificar tu complejo.
        </p>
      </div>

      <div className="space-y-5">

        <div className="space-y-2">
          <label className="text-sm font-medium text-black">
            Teléfono
          </label>

          <input
            className="w-full rounded-lg border p-3 text-black border-black"
            placeholder="+54 9 11..."
            value={phone}
            onChange={(e) =>
              onPhoneChange(e.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-black">
            Email
          </label>

          <input
            type="email"
            className="w-full rounded-lg border p-3 text-black border-black"
            placeholder="contacto@complejo.com"
            value={email}
            onChange={(e) =>
              onEmailChange(e.target.value)
            }
          />
        </div>

      </div>

      <div className="flex gap-4">

        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-lg border py-3 text-black"
        >
          Atrás
        </button>

        <button
          type="button"
          onClick={onNext}
          className="w-full rounded-lg bg-[var(--color-primary)] py-3 text-white"
        >
          Continuar
        </button>

      </div>

    </div>
  );
}