import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";

import ProgressBar from "./ProgressBar";
import StepInfo from "./StepInfo";
import StepSchedule from "./StepSchedule";
import StepCapacity from "./StepCapacity";

import { resourceService } from "../../services/resource.service";
import { workingHoursService } from "../../services/working-hours.service";

import type { CreateResourceForm } from "../../types/resource.types";

import {
  RESOURCE_STEPS,
  TOTAL_RESOURCE_STEPS,
} from "../../utils/resource.steps";
import { toast } from "sonner";
import { createEmptyWeek } from "../../utils/createEmptyWeek";
import { workingHoursToSchedule } from "../../utils/workingHoursToSchedule";

import { weekToWorkingHours }
from "../../utils/weekToWorkingHours";

import { getReservationDuration } from "../../utils/getReservationDuration";

interface Props {
  mode?: "create" | "edit";
  resourceId?: string;
}

export default function ResourceWizard({ mode = "create", resourceId }: Props) {
  const navigate = useNavigate();

  const { profile } = useAuth();

  const [step, setStep] = useState<number>(RESOURCE_STEPS.INFO);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<CreateResourceForm>({
  name: "",
  type: "football",
  capacity: 1,
  reservation_duration: 60,
  price: 0,
  deposit_amount: 0,
});

  const [week, setWeek] = useState(createEmptyWeek());

  useEffect(() => {
    if (mode !== "edit" || !resourceId) {
      return;
    }

    async function load() {
      try {
        setLoading(true);

        const resource = await resourceService.getById(resourceId);

        const hours = await workingHoursService.list(resourceId);

        setForm({
          name: resource.name,
          type: resource.type,
          capacity: resource.capacity,
          reservation_duration:
            getReservationDuration(resource.type),

          price: resource.price ?? 0,

          deposit_amount:
            resource.deposit_amount ?? 0,
        });

        setWeek(

            workingHoursToSchedule(hours)

        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [mode, resourceId]);

  function updateForm<K extends keyof CreateResourceForm>(
    key: K,
    value: CreateResourceForm[K],
  ) {
    setForm((prev) => {
      const next = {
        ...prev,
        [key]: value,
      };

      if (key === "type") {
        next.reservation_duration =
          getReservationDuration(
            value as CreateResourceForm["type"],
          );
      }

      return next;
    });
  }

  function nextStep() {
    if (step === RESOURCE_STEPS.INFO) {
      if (!form.name.trim()) {
        toast.error("Ingresá el nombre del recurso.");

        return;
      }
    }

    setStep((prev) => prev + 1);
  }

  function previousStep() {
    setStep((prev) => prev - 1);
  }

  async function handleSubmit() {

    const workingHours = weekToWorkingHours(week);
    const reservationDuration = getReservationDuration(form.type);

    if (!profile?.club_id) return;

    if (
      workingHours.every(
        (day) => !day.enabled
      )
    ) {
      toast.error(
        "Debés configurar al menos un día."
      );

      return;
    }

    try {
      setLoading(true);

      let resourceIdToSave = resourceId;

      if (mode === "create") {
        const resource = await resourceService.create(
          profile.club_id,
          {
            ...form,
            reservation_duration:
              reservationDuration,
            capacity:
              form.type === "gym"
                ? form.capacity
                : 1,
          },
        );

        resourceIdToSave = resource.id;
      } else {
        await resourceService.update(
          resourceId!,
          {
            ...form,
            reservation_duration:
              reservationDuration,
            capacity:
              form.type === "gym"
                ? form.capacity
                : 1,
          },
        );
      }
      
      await workingHoursService.save(resourceIdToSave! , workingHours);

      toast.success(
        mode === "create"
          ? "Recurso creado correctamente."
          : "Cambios guardados.",
      );

      navigate("/dashboard/resources");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("No se pudo crear el recurso.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl rounded-[var(--radius-card)] border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-[var(--shadow-card)]">
      <ProgressBar step={step} total={TOTAL_RESOURCE_STEPS} />

      {step === RESOURCE_STEPS.INFO && (
        <StepInfo
          name={form.name}
          type={form.type}
          onNameChange={(value) => updateForm("name", value)}
          onTypeChange={(value) => updateForm("type", value)}
          onNext={nextStep}
        />
      )}

      {step === RESOURCE_STEPS.SCHEDULE && (
        <StepSchedule
          value={week}
          onChange={setWeek}
          onBack={previousStep}
          onNext={nextStep}
        />
      )}

      {step === RESOURCE_STEPS.CAPACITY && (
        <StepCapacity
          type={form.type}
          capacity={form.capacity}
          price={form.price}
          depositAmount={form.deposit_amount}
          loading={loading}
          onCapacityChange={(value) =>
            updateForm("capacity", value)
          }
          onPriceChange={(value) =>
            updateForm("price", value)
          }
          onDepositAmountChange={(value) =>
            updateForm("deposit_amount", value)
          }
          onBack={previousStep}
          onSubmit={handleSubmit}
          mode={mode}
        />
      )}
    </div>
  );
}
