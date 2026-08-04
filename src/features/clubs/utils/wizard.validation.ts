import type { CreateClubForm } from "../types/create-club-form.types";

export function validateStep1(form: CreateClubForm) {
  return form.name.trim().length > 0;
}

export function validateStep2(form: CreateClubForm) {
  return (
    form.phone.trim().length > 0 &&
    form.email.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(form.email)
  );
}

export function validateStep3(form: CreateClubForm) {
  return (
    form.address.trim().length > 0 &&
    form.city.trim().length > 0 &&
    form.province.trim().length > 0 &&
    form.country.trim().length > 0
  );
}

export function validateStep4(form: CreateClubForm) {
  return (
    form.timezone.trim().length > 0 &&
    form.currency.trim().length > 0
  );
}