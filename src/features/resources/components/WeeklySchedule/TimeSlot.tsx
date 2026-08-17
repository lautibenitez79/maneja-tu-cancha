interface Props {
  label: string;

  selected: boolean;

  variant?: "primary" | "secondary";

  onClick(): void;
}

export default function TimeSlot({
  label,

  selected,

  variant,

  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full

    rounded-xl

    border

    py-2

    text-sm

    font-medium

    transition-all

    duration-150

    hover:scale-[1.02]

    active:scale-95

        ${
          selected
            ? variant === "primary"
              ? "border-blue-600 bg-[var(--color-primary)] text-white"
              : "border-green-600 bg-green-600 text-white"
            : "bg-[var(--color-card)] hover:bg-[var(--color-hover)]"
        }
      `}
    >
      {label}
    </button>
  );
}
