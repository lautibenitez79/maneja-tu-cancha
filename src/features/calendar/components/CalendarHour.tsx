interface Props{

    hour:string;

}

export default function CalendarHour({

    hour,

}:Props){

    return(

        <div

            className="flex h-14 items-center border-b px-4 font-medium"

        >

            {hour}

        </div>

    );

}