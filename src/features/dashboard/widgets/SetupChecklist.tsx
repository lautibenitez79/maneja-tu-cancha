import Card from "@/components/ui/Card/index";

interface Props {

  hasResources: boolean;

  hasWorkingHours: boolean;

}

export default function SetupChecklist({

  hasResources,

  hasWorkingHours,

}: Props) {

  const items = [

    {
      title: "Crear primer recurso",
      done: hasResources,
    },

    {
      title: "Configurar horarios",
      done: hasWorkingHours,
    },

  ];

  return (

    <Card className="rounded-[var(--radius-card)] border bg-white p-8 shadow-[var(--shadow-card)]">

      <h3 className="text-xl font-semibold">

        Primeros pasos

      </h3>

      <div className="mt-6 space-y-5">

        {items.map(item => (

          <div
            key={item.title}
            className="flex items-center gap-4"
          >

            <div
              className={`
              flex
              h-6
              w-6
              items-center
              justify-center
              rounded-full
              ${
                item.done
                  ? "bg-green-500 text-white"
                  : "border"
              }
              `}
            >

              {item.done ? "✓" : ""}

            </div>

            <span>

              {item.title}

            </span>

          </div>

        ))}

      </div>

    </Card>

  );

}