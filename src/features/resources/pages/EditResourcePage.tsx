import { useParams } from "react-router-dom";

import ResourceWizard from "../components/ResourceWizard";

export default function EditResourcePage() {
  const { id } = useParams();

  if (!id) {
    return <div>Recurso no encontrado.</div>;
  }

  return (
    <ResourceWizard
      mode="edit"
      resourceId={id}
    />
  );
}