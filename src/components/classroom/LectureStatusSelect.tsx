"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLectureStatus } from "@/lib/actions/classroom";
import type { LectureStatus } from "@/lib/types/domain";

const OPTIONS: LectureStatus[] = ["not_started", "learning", "completed", "revisit"];

export function LectureStatusSelect({
  lectureId,
  classroomId,
  status,
}: {
  lectureId: string;
  classroomId: string;
  status: LectureStatus;
}) {
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as LectureStatus;
        setValue(next);
        startTransition(async () => {
          await setLectureStatus(lectureId, next, classroomId);
          router.refresh();
        });
      }}
      className="rounded-lg border border-border bg-panel px-2.5 py-1.5 text-sm capitalize outline-none focus:border-accent"
    >
      {OPTIONS.map((o) => (
        <option key={o} value={o}>
          {o.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}
