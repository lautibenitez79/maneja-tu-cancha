import {
  PageHeader,
  ThemeToggle,
} from "@/components/ui";

export default function DashboardHeader() {

  return (

    <PageHeader

      title="Dashboard"

      subtitle="Resumen general del complejo."

      action={<ThemeToggle />}

    />

  );

}