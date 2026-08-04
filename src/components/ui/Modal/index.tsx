import type { ReactNode } from "react";

interface Props {

  open: boolean;

  title: string;

  children: ReactNode;

  onClose(): void;

}

export default function Modal({

  open,

  title,

  children,

  onClose,

}: Props) {

  if (!open) return null;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-xl font-semibold">

            {title}

          </h2>

          <button

            onClick={onClose}

            className="text-2xl leading-none text-slate-500 hover:text-black"

          >

            ×

          </button>

        </div>

        {children}

      </div>

    </div>

  );

}