import { createClient } from "@/lib/supabase/server";
import type { Classroom, Lecture, LectureNote, Source } from "@/lib/types/domain";

export async function listClassrooms(): Promise<Classroom[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classrooms")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as Classroom[];
}

export async function getClassroom(id: string): Promise<Classroom | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("classrooms").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Classroom | null;
}

export type LectureWithSource = Lecture & { source: Source };

export async function listLectures(classroomId: string): Promise<LectureWithSource[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lectures")
    .select("*, source:sources(*)")
    .eq("classroom_id", classroomId)
    .order("position");
  if (error) throw error;
  return data as unknown as LectureWithSource[];
}

export async function getLecture(id: string): Promise<LectureWithSource | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lectures")
    .select("*, source:sources(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as LectureWithSource | null;
}

export async function listLectureNotes(lectureId: string): Promise<LectureNote[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lecture_notes")
    .select("*")
    .eq("lecture_id", lectureId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as LectureNote[];
}

export async function listRecentLectures(limit = 5): Promise<LectureWithSource[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lectures")
    .select("*, source:sources(*)")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as unknown as LectureWithSource[];
}
