interface Props {

  title?: string;

  description?: string;

  children: React.ReactNode;

  className?: string;

}

export default function Section({

  title,

  description,

  children,

  className = "",

}: Props) {

  return (

    <section
      className={`space-y-6 ${className}`}
    >

      {(title || description) && (

        <div>

          {title && (

            <h2 className="text-xl font-semibold text-[var(--color-title)]">

              {title}

            </h2>

          )}

          {description && (

            <p className="mt-1 text-sm text-[var(--color-text)]">

              {description}

            </p>

          )}

        </div>

      )}

      {children}

    </section>

  );

}