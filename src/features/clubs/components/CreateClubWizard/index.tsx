import { useState } from "react";

import ProgressBar from "./ProgressBar";
import StepName from "./StepName";
import StepContact from "./StepContact";
import StepLocation from "./StepLocation";
import StepSettings from "./StepSettings";

import { useAuth } from "@/hooks/useAuth";

import { clubService } from "../../services/club.service";

import type { CreateClubForm } from "../../types/create-club-form.types";

import { toast } from "sonner";

import {
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
} from "../../utils/wizard.validation";

import {
  TOTAL_STEPS,
  WIZARD_STEPS,
} from "../../utils/wizard.steps";

const initialForm: CreateClubForm = {
  name: "",

  phone: "",

  email: "",

  address: "",

  city: "",

  province: "",

  country: "Argentina",

  timezone: "America/Argentina/Buenos_Aires",

  currency: "ARS",
};

export default function CreateClubWizard() {
  const { refreshProfile } = useAuth();

  const [step, setStep] = useState<number>(WIZARD_STEPS.NAME);

  const [loading, setLoading] = useState(false);

  const [form, setForm] =
    useState<CreateClubForm>(initialForm);

  const updateForm = <
    K extends keyof CreateClubForm
  >(
    key: K,
    value: CreateClubForm[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const nextStep = () =>
    setStep((prev) => prev + 1);

  const previousStep = () =>
    setStep((prev) => prev - 1);

  const handleSubmit = async () => {
  if (!validateStep4(form)) return;

  try {
    setLoading(true);

    await clubService.createFirstClub(form);

    await refreshProfile();
  } catch (error) {
    console.error(error);
    toast.error(
      "No se pudo crear tu recurso."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="mx-auto max-w-xl space-y-10 rounded-[var(--radius-card)] border bg-white p-8 shadow-[var(--shadow-card)]">

      <ProgressBar
        step={step}
        total={TOTAL_STEPS}
      />

      {step === WIZARD_STEPS.NAME && (
        <StepName
          value={form.name}
          onChange={(value) =>
            updateForm("name", value)
          }
          onNext={() => {
            if (!validateStep1(form))
              return;

            nextStep();
          }}
        />
      )}

      {step === WIZARD_STEPS.CONTACT && (
        <StepContact
          phone={form.phone}
          email={form.email}
          onPhoneChange={(value) =>
            updateForm("phone", value)
          }
          onEmailChange={(value) =>
            updateForm("email", value)
          }
          onBack={previousStep}
          onNext={() => {
            if (!validateStep2(form))
              return;

            nextStep();
          }}
        />
      )}

      {step === WIZARD_STEPS.LOCATION && (
        <StepLocation
          address={form.address}
          city={form.city}
          province={form.province}
          country={form.country}
          onAddressChange={(value) =>
            updateForm("address", value)
          }
          onCityChange={(value) =>
            updateForm("city", value)
          }
          onProvinceChange={(value) =>
            updateForm(
              "province",
              value
            )
          }
          onCountryChange={(value) =>
            updateForm("country", value)
          }
          onBack={previousStep}
          onNext={() => {
            if (!validateStep3(form))
              return;

            nextStep();
          }}
        />
      )}

      {step === WIZARD_STEPS.SETTINGS && (
        <StepSettings
          timezone={form.timezone}
          currency={form.currency}
          loading={loading}
          onTimezoneChange={(value) =>
            updateForm(
              "timezone",
              value
            )
          }
          onCurrencyChange={(value) =>
            updateForm(
              "currency",
              value
            )
          }
          onBack={previousStep}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}