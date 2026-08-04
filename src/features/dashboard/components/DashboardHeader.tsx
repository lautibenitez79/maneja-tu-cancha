import { useAuth } from "@/hooks/useAuth";

export default function DashboardHeader() {
  const { profile } = useAuth();

  return (
    <div className="flex items-center justify-between">

      <div>

        <h1 className="text-3xl font-bold">
          ¡Bienvenido!
        </h1>

        <p className="mt-2 text-gray-500">
          {profile?.full_name}
        </p>

      </div>

    </div>
  );
}