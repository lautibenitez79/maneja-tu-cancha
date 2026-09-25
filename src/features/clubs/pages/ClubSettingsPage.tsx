import { useEffect, useState } from "react";
import { ImagePlus, Save } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { clubService, type ClubServiceKey } from "../services/club.service";

import type { Club } from "../types/club.types";
import Loading from "@/components/ui/Loading";

const SERVICE_OPTIONS: {
  value: ClubServiceKey;
  label: string;
}[] = [
  {
    value: "wifi",
    label: "Wi-Fi",
  },
  {
    value: "locker_room",
    label: "Vestuario",
  },
  {
    value: "parking",
    label: "Estacionamiento",
  },
  {
    value: "medical_aid",
    label: "Ayuda médica",
  },
  {
    value: "tournaments",
    label: "Torneos",
  },
  {
    value: "birthdays",
    label: "Cumpleaños",
  },
  {
    value: "grill",
    label: "Parrilla",
  },
  {
    value: "sports_school",
    label: "Escuelita deportiva",
  },
  {
    value: "schools",
    label: "Colegios",
  },
  {
    value: "bar_restaurant",
    label: "Bar / Restaurante",
  },
  {
    value: "quincho",
    label: "Quincho",
  },
  {
    value: "beelup",
    label: "Beelup",
  },
];

export default function ClubSettingsPage() {
  const { profile } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedServices, setSelectedServices] = useState<ClubServiceKey[]>(
    [],
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("Argentina");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadClub() {
      if (!profile?.club_id) {
        setLoading(false);
        return;
      }

      try {
        const [data, services] = await Promise.all([
          clubService.getClub(profile.club_id),
          clubService.getServices(profile.club_id),
        ]);

        if (!data) {
          throw new Error("No se encontró el complejo.");
        }

        setClub(data);

        setName(data.name ?? "");
        setPhone(data.phone ?? "");
        setEmail(data.email ?? "");
        setDescription(data.description ?? "");

        setAddress(data.address ?? "");
        setCity(data.city ?? "");
        setProvince(data.province ?? "");
        setCountry(data.country ?? "Argentina");

        setSelectedServices(services);
      } catch (error) {
        console.error(error);

        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo cargar el complejo.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadClub();
  }, [profile?.club_id]);

  function validateImage(file: File, label: string) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error(`${label}: usá JPG, PNG o WEBP.`);

      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(`${label}: el archivo no puede superar los 10 MB.`);

      return false;
    }

    return true;
  }

  function toggleService(service: ClubServiceKey) {
    setSelectedServices((current) => {
      if (current.includes(service)) {
        return current.filter((item) => item !== service);
      }

      return [...current, service];
    });
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();

    if (!club) return;

    if (
      !name.trim() ||
      !address.trim() ||
      !city.trim() ||
      !province.trim() ||
      !country.trim()
    ) {
      toast.error("Completá todos los datos obligatorios.");

      return;
    }

    try {
      setSaving(true);

      let updatedClub = await clubService.updateClub(club.id, {
        name,
        phone,
        email,
        description,
        address,
        city,
        province,
        country,
      });

      await clubService.setServices(club.id, selectedServices);

      if (logoFile) {
        if (!validateImage(logoFile, "Logo")) {
          return;
        }

        const logoUrl = await clubService.uploadClubAsset(
          club.id,
          logoFile,
          "logo",
        );

        updatedClub = {
          ...updatedClub,
          logo_url: logoUrl,
        };
      }

      if (bannerFile) {
        if (!validateImage(bannerFile, "Banner")) {
          return;
        }

        const bannerUrl = await clubService.uploadClubAsset(
          club.id,
          bannerFile,
          "banner",
        );

        updatedClub = {
          ...updatedClub,
          banner_url: bannerUrl,
        };
      }

      setClub(updatedClub);

      setLogoFile(null);
      setBannerFile(null);

      toast.success("Datos del complejo actualizados.");
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudieron guardar los cambios.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Loading />;
  }

  if (!club) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">{name}</h1>

        <p className="mt-2 text-[var(--color-muted)]">
          Administrá los datos y la imagen pública de tu complejo.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <section className="rounded-2xl border bg-[var(--color-card)] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h2 className="text-lg font-semibold">Datos del complejo</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium">Nombre</span>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border p-3"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">Teléfono</span>

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border p-3"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">Email</span>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border p-3"
              />
            </label>

            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-medium">Descripción</span>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-xl border p-3"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border bg-[var(--color-card)] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h2 className="text-lg font-semibold">Ubicación</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-medium">Dirección</span>

              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border p-3"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">Ciudad</span>

              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border p-3"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">Provincia</span>

              <input
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full rounded-xl border p-3"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">País</span>

              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border p-3"
                required
              >
                <option value="Argentina">Argentina</option>
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-2xl border bg-[var(--color-card)] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h2 className="text-lg font-semibold">Servicios del complejo</h2>

          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Seleccioná los servicios que ofrece tu complejo.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {SERVICE_OPTIONS.map((service) => {
              const selected = selectedServices.includes(service.value);

              return (
                <button
                  key={service.value}
                  type="button"
                  onClick={() => toggleService(service.value)}
                  className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "border-slate-200 bg-white hover:bg-black/5"
                  }`}
                >
                  <span className="font-medium">{service.label}</span>

                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                      selected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {selected ? "✓" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border bg-[var(--color-card)] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h2 className="text-lg font-semibold">Imágenes públicas</h2>

          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Estas imágenes se mostrarán en la página pública de reservas.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-medium">Logo</p>

              <div className="rounded-xl border p-4">
                {logoFile ? (
                  <img
                    src={URL.createObjectURL(logoFile)}
                    alt="Nuevo logo"
                    className="mx-auto h-32 w-32 rounded-2xl object-cover"
                  />
                ) : club.logo_url ? (
                  <img
                    src={club.logo_url}
                    alt={club.name}
                    className="mx-auto h-32 w-32 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-2xl bg-black/5">
                    <ImagePlus className="h-8 w-8 opacity-40" />
                  </div>
                )}

                <label className="mt-4 block cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-medium hover:bg-black/5">
                  Cambiar logo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;

                      if (file && validateImage(file, "Logo")) {
                        setLogoFile(file);
                      }
                    }}
                  />
                </label>
                <p className="mt-2 text-xs text-slate-500">
                  Recomendado: <span className="font-medium">800 × 800 px</span>{" "}
                  · formato cuadrado 1:1. PNG o WEBP si necesitás transparencia.
                </p>
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium">Banner</p>

              <div className="rounded-xl border p-4">
                {bannerFile ? (
                  <img
                    src={URL.createObjectURL(bannerFile)}
                    alt="Nuevo banner"
                    className="h-32 w-full rounded-xl object-cover"
                  />
                ) : club.banner_url ? (
                  <img
                    src={club.banner_url}
                    alt={`Banner de ${club.name}`}
                    className="h-32 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-xl bg-black/5">
                    <ImagePlus className="h-8 w-8 opacity-40" />
                  </div>
                )}

                <label className="mt-4 block cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-medium hover:bg-black/5">
                  Cambiar banner
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;

                      if (file && validateImage(file, "Banner")) {
                        setBannerFile(file);
                      }
                    }}
                  />
                </label>
                <p className="mt-2 text-xs text-slate-500">
                  Recomendado:{" "}
                  <span className="font-medium">1600 × 600 px</span> (proporción
                  8:3). Usá una imagen horizontal de buena calidad para obtener
                  el mejor resultado.
                </p>
              </div>
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-5 w-5" />

          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
