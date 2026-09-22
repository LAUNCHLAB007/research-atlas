"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AtlasFile } from "@/lib/types/domain";

const BUCKET = "research-atlas-private";

export function FileUploader({ onUploaded }: { onUploaded: (file: AtlasFile) => void }) {
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStatus("uploading");
    setError(null);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setStatus("error");
      setError("You must be signed in to upload files.");
      return;
    }

    const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
    if (uploadError) {
      setStatus("error");
      setError(uploadError.message);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("atlas_files")
      .insert({
        storage_path: path,
        filename: file.name,
        mime_type: file.type || null,
        byte_size: file.size,
      })
      .select()
      .single();

    if (insertError || !data) {
      setStatus("error");
      setError(insertError?.message ?? "Could not record the uploaded file.");
      return;
    }

    setStatus("idle");
    onUploaded(data as AtlasFile);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
        disabled={status === "uploading"}
        className="block w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-accent-hover"
      />
      {status === "uploading" && <p className="mt-1 text-xs text-text-secondary">Uploading…</p>}
      {status === "error" && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
