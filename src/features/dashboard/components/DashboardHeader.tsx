import {
  PageHeader,
  ThemeToggle,
} from "@/components/ui";

export default function DashboardHeader() {

  return (

    <PageHeader

      title="Administrador de complejo"

      subtitle="Resumen general del complejo."

      action={<ThemeToggle />}

    />

  );

}