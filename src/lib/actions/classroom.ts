"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createClassroomSchema,
  createLectureSchema,
  createLectureNoteSchema,
  lectureStatusSchema,
} from "@/lib/validation/schemas";
import { requireUser, runAction, ActionError } from "./shared";

const addLectureWithSourceSchema = z.object({
  classroom_id: z.string().uuid(),
  title: z.string().trim().min(1, "Title is required."),
  url: z.string().trim().url().optional().or(z.literal("")),
  provider: z.string().trim().max(200).optional(),
});

export async function addLectureWithSource(input: unknown) {
  return runAction(async () => {
    const parsed = addLectureWithSourceSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message ?? "Invalid lecture.");
    const { supabase } = await requireUser();

    const { data: source, error: sourceError } = await supabase
      .from("sources")
      .insert({
        kind: "lecture",
        title: parsed.data.title,
        url: parsed.data.url || null,
        provider: parsed.data.provider || null,
      })
      .select()
      .single();
    if (sourceError || !source) throw new ActionError(sourceError?.message ?? "Could not save the lecture source.");

    const { data: existingLectures } = await supabase
      .from("lectures")
      .select("position")
      .eq("classroom_id", parsed.data.classroom_id)
      .order("position", { ascending: false })
      .limit(1);
    const nextPosition = (existingLectures?.[0]?.position ?? -1) + 1;

    const { data: lecture, error: lectureError } = await supabase
      .from("lectures")
      .insert({
        classroom_id: parsed.data.classroom_id,
        source_id: source.id,
        position: nextPosition,
      })
      .select()
      .single();
    if (lectureError || !lecture) throw new ActionError(lectureError?.message ?? "Could not add lecture.");

    revalidatePath(`/classroom/${parsed.data.classroom_id}`);
    return lecture;
  });
}

export async function createClassroom(input: unknown) {
  return runAction(async () => {
    const parsed = createClassroomSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message ?? "Invalid classroom.");
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("classrooms")
      .insert({
        title: parsed.data.title,
        description: parsed.data.description || null,
        learning_goal: parsed.data.learning_goal || null,
      })
      .select()
      .single();
    if (error || !data) throw new ActionError(error?.message ?? "Could not create classroom.");
    revalidatePath("/classroom");
    return data;
  });
}

export async function addLecture(input: unknown) {
  return runAction(async () => {
    const parsed = createLectureSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message ?? "Invalid lecture.");
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("lectures")
      .insert({
        classroom_id: parsed.data.classroom_id,
        source_id: parsed.data.source_id,
        position: parsed.data.position,
      })
      .select()
      .single();
    if (error || !data) throw new ActionError(error?.message ?? "Could not add lecture.");
    revalidatePath(`/classroom/${parsed.data.classroom_id}`);
    return data;
  });
}

export async function setLectureStatus(lectureId: string, status: string, classroomId: string) {
  return runAction(async () => {
    const parsedStatus = lectureStatusSchema.safeParse(status);
    if (!parsedStatus.success) throw new ActionError("Invalid status.");
    const { supabase } = await requireUser();
    const { error } = await supabase
      .from("lectures")
      .update({
        status: parsedStatus.data,
        completed_at: parsedStatus.data === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", lectureId);
    if (error) throw new ActionError(error.message);
    revalidatePath(`/classroom/${classroomId}`);
    revalidatePath(`/classroom/lectures/${lectureId}`);
  });
}

export async function addLectureNote(input: unknown) {
  return runAction(async () => {
    const parsed = createLectureNoteSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message ?? "Invalid note.");
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("lecture_notes")
      .insert({
        lecture_id: parsed.data.lecture_id,
        kind: parsed.data.kind,
        body: parsed.data.body,
        video_second: parsed.data.video_second ?? null,
      })
      .select()
      .single();
    if (error || !data) throw new ActionError(error?.message ?? "Could not save note.");
    revalidatePath(`/classroom/lectures/${parsed.data.lecture_id}`);
    return data;
  });
}
