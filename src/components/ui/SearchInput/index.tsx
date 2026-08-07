import Input from "../Input/index";

interface Props {

  value:string;

  onChange(value:string):void;

  placeholder?:string;

}

export default function SearchInput({

  value,

  onChange,

  placeholder="Buscar...",

}:Props){

  return(

    <Input

      value={value}

      placeholder={placeholder}

      onChange={e=>

        onChange(e.target.value)

      }

    />

  );

}