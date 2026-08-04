import Input from "@/components/ui/Input/index";
import type { ResourceType } from "../../types/resource.types";

interface Props {

  name: string;

  type: ResourceType;

  onNameChange(value: string): void;

  onTypeChange(value: ResourceType): void;

  onNext(): void;

}

export default function StepInfo({

  name,

  type,

  onNameChange,

  onTypeChange,

  onNext,

}: Props) {

  return (

    <div className="space-y-8">

      <div>

        <h1 className="text-3xl font-bold">

          Nuevo recurso

        </h1>

        <p className="mt-2 text-gray-500">

          Comencemos con la información principal.

        </p>

      </div>

      <div className="space-y-5">

        <Input

          className="w-full rounded-lg border p-3"

          placeholder="Nombre"

          value={name}

          onChange={(e) =>
            onNameChange(e.target.value)
          }

        />

        <select

          className="w-full rounded-lg border p-3"

          value={type}

          onChange={(e) =>
            onTypeChange(
              e.target.value as ResourceType
            )
          }

        >

          <option value="football">

            Fútbol

          </option>

          <option value="padel">

            Pádel

          </option>

          <option value="tennis">

            Tenis

          </option>

          <option value="basket">

            Básquet

          </option>

          <option value="gym">

            Gimnasio

          </option>

          <option value="room">

            Sala

          </option>

        </select>

      </div>

      <button

        onClick={onNext}

        className="w-full rounded-lg bg-[var(--color-primary)] py-3 text-white"

      >

        Continuar

      </button>

    </div>

  );

}