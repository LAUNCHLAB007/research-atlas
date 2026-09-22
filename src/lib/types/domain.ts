// Hand-authored domain types mirroring supabase/schema.sql.
// Keep field names and enums in sync with the SQL source of truth.

export type LearningDomainId = 1 | 2 | 3 | 4 | 5;

export interface LearningDomain {
  id: LearningDomainId;
  name: string;
  description: string;
}

export interface Topic {
  id: string;
  user_id: string;
  domain_id: LearningDomainId;
  parent_id: string | null;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export type EntryKind = "question" | "thought" | "observation" | "idea" | "link";
export type Provenance = "user" | "ai_suggestion" | "source_excerpt";

export interface Entry {
  id: string;
  user_id: string;
  kind: EntryKind;
  title: string | null;
  body: string;
  original_body: string;
  provenance: Provenance;
  created_at: string;
  updated_at: string;
}

export interface EntryRevision {
  id: string;
  user_id: string;
  entry_id: string;
  previous_body: string;
  changed_at: string;
}

export type SourceKind = "paper" | "lecture" | "course" | "dataset" | "website" | "book" | "video" | "other";

export interface Source {
  id: string;
  user_id: string;
  kind: SourceKind;
  title: string;
  url: string | null;
  doi: string | null;
  authors: string[] | null;
  publication_year: number | null;
  provider: string | null;
  citation: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Classroom {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  learning_goal: string | null;
  created_at: string;
  updated_at: string;
}

export type LectureStatus = "not_started" | "learning" | "completed" | "revisit";

export interface Lecture {
  id: string;
  user_id: string;
  classroom_id: string;
  source_id: string;
  position: number;
  status: LectureStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type LectureNoteKind = "note" | "question" | "summary" | "timestamp";

export interface LectureNote {
  id: string;
  user_id: string;
  lecture_id: string;
  kind: LectureNoteKind;
  body: string;
  video_second: number | null;
  created_at: string;
}

export type UnderstandingStatus = "new" | "learning" | "understood" | "revisit";

export interface Concept {
  id: string;
  user_id: string;
  name: string;
  explanation: string | null;
  understanding_status: UnderstandingStatus;
  created_at: string;
  updated_at: string;
}

export type ResearchStatus =
  | "exploring"
  | "literature_review"
  | "planning"
  | "active"
  | "paused"
  | "completed"
  | "archived";

export interface ResearchProject {
  id: string;
  user_id: string;
  title: string;
  question: string | null;
  objective: string | null;
  current_focus: string | null;
  status: ResearchStatus;
  created_at: string;
  updated_at: string;
}

export type HypothesisStatus = "proposed" | "under_review" | "tested" | "revised" | "retired";

export interface Hypothesis {
  id: string;
  user_id: string;
  project_id: string;
  statement: string;
  rationale: string | null;
  falsification_criteria: string | null;
  status: HypothesisStatus;
  revision: number;
  created_at: string;
  updated_at: string;
}

export type ApprovalStatus = "not_required_or_not_assessed" | "approval_required" | "pending" | "approved" | "rejected";
export type ExperimentPlanStatus = "draft" | "planned" | "ready" | "superseded" | "cancelled";

export interface ExperimentPlan {
  id: string;
  user_id: string;
  project_id: string;
  hypothesis_id: string | null;
  title: string;
  objective: string | null;
  model_or_material: string | null;
  variables: Record<string, unknown>;
  controls: string | null;
  method: string | null;
  measurement_plan: string | null;
  analysis_plan: string | null;
  resources: string | null;
  safety_notes: string | null;
  approval_status: ApprovalStatus;
  status: ExperimentPlanStatus;
  created_at: string;
  updated_at: string;
}

export type NotebookEntryKind = "literature" | "observation" | "decision" | "method" | "analysis" | "reflection" | "other";

export interface NotebookEntry {
  id: string;
  user_id: string;
  project_id: string;
  kind: NotebookEntryKind;
  body: string;
  recorded_at: string;
  created_at: string;
}

export type ReadinessStatus = "exploring" | "needs_learning" | "ready_to_build" | "awaiting_supervision";

export interface BuildBrief {
  id: string;
  user_id: string;
  title: string;
  problem_statement: string | null;
  existing_approaches: string | null;
  proposed_contribution: string | null;
  required_knowledge: string | null;
  available_resources: string | null;
  prototype_scope: string | null;
  success_criteria: string | null;
  first_test_plan: string | null;
  readiness_status: ReadinessStatus;
  created_at: string;
  updated_at: string;
}

export type BuildKind = "software_ai" | "engineering" | "simulation" | "experimental_concept" | "hybrid";
export type BuildStatus = "concept" | "designing" | "building" | "testing" | "paused" | "completed" | "archived";

export interface BuildProject {
  id: string;
  user_id: string;
  brief_id: string | null;
  research_project_id: string | null;
  title: string;
  kind: BuildKind;
  purpose: string | null;
  requirements: Record<string, unknown>;
  success_criteria: string | null;
  status: BuildStatus;
  created_at: string;
  updated_at: string;
}

export type PrototypeStatus = "concept" | "built" | "retired";

export interface PrototypeVersion {
  id: string;
  user_id: string;
  build_project_id: string;
  version_label: string;
  design_notes: string | null;
  change_summary: string | null;
  status: PrototypeStatus;
  created_at: string;
}

export type BuildIssueStatus = "open" | "investigating" | "resolved" | "wont_fix";

export interface BuildIssue {
  id: string;
  user_id: string;
  build_project_id: string;
  prototype_version_id: string | null;
  title: string;
  observation: string | null;
  attempted_fixes: string | null;
  status: BuildIssueStatus;
  created_at: string;
  updated_at: string;
}

export type TestStatus = "planned" | "ready" | "in_progress" | "performed" | "analyzed" | "cancelled";

export interface Test {
  id: string;
  user_id: string;
  title: string;
  research_project_id: string | null;
  experiment_plan_id: string | null;
  prototype_version_id: string | null;
  objective: string | null;
  method: string | null;
  success_criteria: string | null;
  status: TestStatus;
  performed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TestResult {
  id: string;
  user_id: string;
  test_id: string;
  observations: string | null;
  measurements: Record<string, unknown>;
  analysis: string | null;
  conclusion: string | null;
  limitations: string | null;
  recorded_at: string;
}

export interface AtlasFile {
  id: string;
  user_id: string;
  storage_path: string;
  filename: string;
  mime_type: string | null;
  byte_size: number | null;
  checksum_sha256: string | null;
  created_at: string;
}

export interface TopicLink {
  id: string;
  user_id: string;
  topic_id: string;
  entry_id: string | null;
  source_id: string | null;
  concept_id: string | null;
  research_project_id: string | null;
  build_project_id: string | null;
}

export type RecordRelationship =
  | "inspired_by"
  | "related_to"
  | "supports"
  | "challenges"
  | "uses"
  | "derived_from"
  | "documents"
  | "requires_learning";

export interface RecordLink {
  id: string;
  user_id: string;
  relationship: RecordRelationship;
  entry_id: string | null;
  source_id: string | null;
  lecture_id: string | null;
  concept_id: string | null;
  research_project_id: string | null;
  hypothesis_id: string | null;
  experiment_plan_id: string | null;
  notebook_entry_id: string | null;
  build_brief_id: string | null;
  build_project_id: string | null;
  prototype_version_id: string | null;
  test_id: string | null;
  test_result_id: string | null;
  file_id: string | null;
}

export type AiSessionMode =
  | "explore"
  | "teach"
  | "quiz"
  | "questions_only"
  | "read"
  | "research_critic"
  | "design"
  | "build"
  | "debug"
  | "test";

export interface AiSession {
  id: string;
  user_id: string;
  mode: AiSessionMode;
  title: string | null;
  context: Record<string, unknown>;
  created_at: string;
}

export interface AiMessage {
  id: string;
  user_id: string;
  session_id: string;
  role: "user" | "assistant" | "system_note";
  body: string;
  created_at: string;
}
