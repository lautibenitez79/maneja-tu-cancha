import { useState } from "react";

import { Link } from "react-router-dom";

import { useResources } from "../hooks/useResources";

import { resourceService } from "../services/resource.service";

import { useNavigate } from "react-router-dom";

import ResourceList from "../components/ResourceList";

import ConfirmDialog from "@/components/ui/ConfirmDialog/index";
import type { Resource } from "../types/resource.types";
import { toast } from "sonner";
import Loading from "@/components/ui/Loading";
import Page from "@/components/ui/Page/index";
import Button from "@/components/ui/Button/index";


export default function ResourcesPage() {

  const {

    resources,

    loading,

    refresh,

  } = useResources();

  const [openDelete,setOpenDelete]= useState(false);

  const [resourceToDelete, setResourceToDelete] =
    useState<Resource | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  const navigate = useNavigate();

  async function handleDelete(id: string) {

    await resourceService.remove(id);

    refresh();

  }

  async function confirmDelete() {

    if (!resourceToDelete) return;

    try {

      setDeleting(true);

      await resourceService.remove(
        resourceToDelete.id
      );

      toast.success(
        "Recurso eliminado."
      );

      await refresh();

      setResourceToDelete(null);

    } finally {

      setDeleting(false);

    }

  }

  function handleEdit(id: string) {

    navigate(
      `/dashboard/resources/${id}/edit`
    );

  }

  if (loading) {

    return <Loading />;

  }

  return (

    // <div className="space-y-8">

    //   <div className="flex items-center justify-between">

    //     <h1 className="text-3xl font-bold">

    //       Recursos

    //     </h1>

    //

    //   </div>

    <Page
        title="Recursos"
        subtitle="Administrá todas las canchas y espacios deportivos."

        action={
            <Link

              to="/dashboard/resources/new"

              className="rounded-lg bg-[var(--color-primary)] px-5 py-3 text-white">

              Nuevo recurso
            </Link>
        }
    >
      <ResourceList
        resources={resources}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ConfirmDialog
        open={resourceToDelete !== null}
        title="Eliminar recurso"
        description={`¿Seguro que querés eliminar "${resourceToDelete?.name}"?`}
        loading={deleting}
        onCancel={() => setResourceToDelete(null)}
        onConfirm={confirmDelete}
      />

    </Page>

  );

}