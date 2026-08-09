import Modal from "@/components/ui/Modal";

import type {
  CalendarCell,
} from "@/features/calendar/types/calendar.types";

interface Props {

  open: boolean;

  cell: CalendarCell | null;

  onClose(): void;

}

export default function ReservationModal({

  open,

  cell,

  onClose,

}: Props) {

  if (!cell) {
    return null;
  }

  return (

    <Modal
      open={open}
      onClose={onClose}
      title="Reserva"
    >

      <div className="space-y-4">

        <p>

          Horario:

          <strong>

            {" "}

            {cell.hour}

          </strong>

        </p>

        <p>

          Estado:

          <strong>

            {" "}

            {cell.status}

          </strong>

        </p>

      </div>

    </Modal>

  );

}