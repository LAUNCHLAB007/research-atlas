import { z } from "zod";

export const entryKindSchema = z.enum(["question", "thought", "observation", "idea", "link"]);

export const createEntrySchema = z.object({
  kind: entryKindSchema,
  title: z.string().trim().max(300).optional(),
  body: z.string().trim().min(1, "Write something before saving."),
  topicIds: z.array(z.string().uuid()).default([]),
});

export const sourceKindSchema = z.enum(["paper", "lecture", "course", "dataset", "website", "book", "video", "other"]);

export const createSourceSchema = z.object({
  kind: sourceKindSchema,
  title: z.string().trim().min(1, "Title is required."),
  url: z.string().trim().url().optional().or(z.literal("")),
  doi: z.string().trim().max(200).optional(),
  authors: z.string().trim().optional(), // comma-separated in the form, split before insert
  publication_year: z.coerce.number().int().min(1400).max(2200).optional(),
  provider: z.string().trim().max(200).optional(),
  citation: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const createTopicSchema = z.object({
  domain_id: z.coerce.number().int().min(1).max(5),
  parent_id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Name is required."),
  description: z.string().trim().optional(),
});

export const createClassroomSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().trim().optional(),
  learning_goal: z.string().trim().optional(),
});

export const createLectureSchema = z.object({
  classroom_id: z.string().uuid(),
  source_id: z.string().uuid(),
  position: z.coerce.number().int().default(0),
});

export const lectureStatusSchema = z.enum(["not_started", "learning", "completed", "revisit"]);

export const lectureNoteKindSchema = z.enum(["note", "question", "summary", "timestamp"]);

export const createLectureNoteSchema = z.object({
  lecture_id: z.string().uuid(),
  kind: lectureNoteKindSchema,
  body: z.string().trim().min(1, "Write a note before saving."),
  video_second: z.coerce.number().int().min(0).optional(),
});

export const researchStatusSchema = z.enum([
  "exploring",
  "literature_review",
  "planning",
  "active",
  "paused",
  "completed",
  "archived",
]);

export const createResearchProjectSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  question: z.string().trim().optional(),
  objective: z.string().trim().optional(),
  topicIds: z.array(z.string().uuid()).default([]),
});

export const createHypothesisSchema = z.object({
  project_id: z.string().uuid(),
  statement: z.string().trim().min(1, "Statement is required."),
  rationale: z.string().trim().optional(),
  falsification_criteria: z.string().trim().optional(),
});

export const createExperimentPlanSchema = z.object({
  project_id: z.string().uuid(),
  hypothesis_id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "Title is required."),
  objective: z.string().trim().optional(),
  model_or_material: z.string().trim().optional(),
  controls: z.string().trim().optional(),
  method: z.string().trim().optional(),
  measurement_plan: z.string().trim().optional(),
  analysis_plan: z.string().trim().optional(),
  resources: z.string().trim().optional(),
  safety_notes: z.string().trim().optional(),
});

export const notebookEntryKindSchema = z.enum([
  "literature",
  "observation",
  "decision",
  "method",
  "analysis",
  "reflection",
  "other",
]);

export const createNotebookEntrySchema = z.object({
  project_id: z.string().uuid(),
  kind: notebookEntryKindSchema,
  body: z.string().trim().min(1, "Write an entry before saving."),
});

export const createBuildBriefSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  problem_statement: z.string().trim().optional(),
  existing_approaches: z.string().trim().optional(),
  proposed_contribution: z.string().trim().optional(),
  required_knowledge: z.string().trim().optional(),
  available_resources: z.string().trim().optional(),
  prototype_scope: z.string().trim().optional(),
  success_criteria: z.string().trim().optional(),
  first_test_plan: z.string().trim().optional(),
});

export const buildKindSchema = z.enum(["software_ai", "engineering", "simulation", "experimental_concept", "hybrid"]);

export const createBuildProjectSchema = z.object({
  brief_id: z.string().uuid().optional(),
  research_project_id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "Title is required."),
  kind: buildKindSchema,
  purpose: z.string().trim().optional(),
  success_criteria: z.string().trim().optional(),
});

export const createPrototypeVersionSchema = z.object({
  build_project_id: z.string().uuid(),
  version_label: z.string().trim().min(1, "Version label is required."),
  design_notes: z.string().trim().optional(),
  change_summary: z.string().trim().optional(),
});

export const createBuildIssueSchema = z.object({
  build_project_id: z.string().uuid(),
  prototype_version_id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "Title is required."),
  observation: z.string().trim().optional(),
  attempted_fixes: z.string().trim().optional(),
});

export const createTestSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required."),
    research_project_id: z.string().uuid().optional(),
    experiment_plan_id: z.string().uuid().optional(),
    prototype_version_id: z.string().uuid().optional(),
    objective: z.string().trim().optional(),
    method: z.string().trim().optional(),
    success_criteria: z.string().trim().optional(),
  })
  .refine(
    (v) => v.experiment_plan_id || v.prototype_version_id || v.research_project_id,
    "Link the test to a research project, experiment plan, or prototype version."
  );

export const recordTestResultSchema = z.object({
  test_id: z.string().uuid(),
  observations: z.string().trim().optional(),
  analysis: z.string().trim().optional(),
  conclusion: z.string().trim().optional(),
  limitations: z.string().trim().optional(),
});

export const aiSessionModeSchema = z.enum([
  "explore",
  "teach",
  "quiz",
  "questions_only",
  "read",
  "research_critic",
  "design",
  "build",
  "debug",
  "test",
]);
