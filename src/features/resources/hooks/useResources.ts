import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

import { resourceService } from "../services/resource.service";

import type { Resource } from "../types/resource.types";

export function useResources() {
  const { profile } = useAuth();

  const [resources, setResources] =
    useState<Resource[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function load() {
  if (!profile?.club_id) return;

  try {

    setLoading(true);

    const data =
      await resourceService.list(
        profile.club_id
      );

    setResources(data);

  } catch (error) {

    console.error(error);

  } finally {

    setLoading(false);

  }
}

  useEffect(() => {
    load();
  }, [profile]);

  return {
    resources,

    loading,

    refresh: load,
  };
}