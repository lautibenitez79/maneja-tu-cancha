import type {
  CreateReservationForm,
} from "../types/reservation.types";

export function validateReservation(

  form: CreateReservationForm,

) {

  if (

    form.customer_name.trim() === ""

  ) {

    throw new Error(

      "Ingresá el nombre del cliente.",

    );

  }

  if (

    form.customer_phone.trim() === ""

  ) {

    throw new Error(

      "Ingresá un teléfono.",

    );

  }

  if (

    form.customer_email.trim() === ""

  ) {

    throw new Error(

      "Ingresá un email.",

    );

  }

  if (
  
        form.starts_at >= form.ends_at
  
      ) {
  
        throw new Error(
  
          "La hora de fin debe ser mayor que la de inicio.",
  
        );
  
      }


}