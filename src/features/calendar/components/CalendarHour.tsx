interface Props {

  hour: string;

}

export default function CalendarHour({

  hour,

}: Props) {

  return (

    <div
      className="
        flex
        h-14
        items-center
        justify-end
        border-b
        border-r
        px-4
        text-sm
        font-medium
        text-slate-500
      "
    >

      {hour}

    </div>

  );

}