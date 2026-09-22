"use client";

import { useRouter } from "next/navigation";
import { FileUploader } from "@/components/shared/FileUploader";
import { linkFileToBuildProject } from "@/lib/actions/build";
import type { AtlasFile } from "@/lib/types/domain";

export function BuildWorkspaceUploader({ buildProjectId }: { buildProjectId: string }) {
  const router = useRouter();

  async function handleUploaded(file: AtlasFile) {
    await linkFileToBuildProject(buildProjectId, file.id);
    router.refresh();
  }

  return <FileUploader onUploaded={handleUploaded} />;
}
