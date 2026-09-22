export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          role: string
          session_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          role: string
          session_id: string
          user_id?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_session_id_user_id_fkey"
            columns: ["session_id", "user_id"]
            isOneToOne: false
            referencedRelation: "ai_sessions"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      ai_sessions: {
        Row: {
          context: Json
          created_at: string
          id: string
          mode: string
          title: string | null
          user_id: string
        }
        Insert: {
          context?: Json
          created_at?: string
          id?: string
          mode: string
          title?: string | null
          user_id?: string
        }
        Update: {
          context?: Json
          created_at?: string
          id?: string
          mode?: string
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      atlas_files: {
        Row: {
          byte_size: number | null
          checksum_sha256: string | null
          created_at: string
          filename: string
          id: string
          mime_type: string | null
          storage_path: string
          user_id: string
        }
        Insert: {
          byte_size?: number | null
          checksum_sha256?: string | null
          created_at?: string
          filename: string
          id?: string
          mime_type?: string | null
          storage_path: string
          user_id?: string
        }
        Update: {
          byte_size?: number | null
          checksum_sha256?: string | null
          created_at?: string
          filename?: string
          id?: string
          mime_type?: string | null
          storage_path?: string
          user_id?: string
        }
        Relationships: []
      }
      build_briefs: {
        Row: {
          available_resources: string | null
          created_at: string
          existing_approaches: string | null
          first_test_plan: string | null
          id: string
          problem_statement: string | null
          proposed_contribution: string | null
          prototype_scope: string | null
          readiness_status: string
          required_knowledge: string | null
          success_criteria: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          available_resources?: string | null
          created_at?: string
          existing_approaches?: string | null
          first_test_plan?: string | null
          id?: string
          problem_statement?: string | null
          proposed_contribution?: string | null
          prototype_scope?: string | null
          readiness_status?: string
          required_knowledge?: string | null
          success_criteria?: string | null
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          available_resources?: string | null
          created_at?: string
          existing_approaches?: string | null
          first_test_plan?: string | null
          id?: string
          problem_statement?: string | null
          proposed_contribution?: string | null
          prototype_scope?: string | null
          readiness_status?: string
          required_knowledge?: string | null
          success_criteria?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      build_issues: {
        Row: {
          attempted_fixes: string | null
          build_project_id: string
          created_at: string
          id: string
          observation: string | null
          prototype_version_id: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempted_fixes?: string | null
          build_project_id: string
          created_at?: string
          id?: string
          observation?: string | null
          prototype_version_id?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          attempted_fixes?: string | null
          build_project_id?: string
          created_at?: string
          id?: string
          observation?: string | null
          prototype_version_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "build_issues_build_project_id_user_id_fkey"
            columns: ["build_project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "build_projects"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "build_issues_prototype_version_id_user_id_fkey"
            columns: ["prototype_version_id", "user_id"]
            isOneToOne: false
            referencedRelation: "prototype_versions"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      build_projects: {
        Row: {
          brief_id: string | null
          created_at: string
          id: string
          kind: string
          purpose: string | null
          requirements: Json
          research_project_id: string | null
          status: string
          success_criteria: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brief_id?: string | null
          created_at?: string
          id?: string
          kind: string
          purpose?: string | null
          requirements?: Json
          research_project_id?: string | null
          status?: string
          success_criteria?: string | null
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          brief_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          purpose?: string | null
          requirements?: Json
          research_project_id?: string | null
          status?: string
          success_criteria?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "build_projects_brief_id_user_id_fkey"
            columns: ["brief_id", "user_id"]
            isOneToOne: false
            referencedRelation: "build_briefs"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "build_projects_research_project_id_user_id_fkey"
            columns: ["research_project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      classrooms: {
        Row: {
          created_at: string
          description: string | null
          id: string
          learning_goal: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          learning_goal?: string | null
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          learning_goal?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      concepts: {
        Row: {
          created_at: string
          explanation: string | null
          id: string
          name: string
          understanding_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          explanation?: string | null
          id?: string
          name: string
          understanding_status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          explanation?: string | null
          id?: string
          name?: string
          understanding_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      entries: {
        Row: {
          body: string
          created_at: string
          id: string
          kind: string
          original_body: string
          provenance: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          kind: string
          original_body: string
          provenance?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          kind?: string
          original_body?: string
          provenance?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      entry_revisions: {
        Row: {
          changed_at: string
          entry_id: string
          id: string
          previous_body: string
          user_id: string
        }
        Insert: {
          changed_at?: string
          entry_id: string
          id?: string
          previous_body: string
          user_id?: string
        }
        Update: {
          changed_at?: string
          entry_id?: string
          id?: string
          previous_body?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entry_revisions_entry_id_user_id_fkey"
            columns: ["entry_id", "user_id"]
            isOneToOne: false
            referencedRelation: "entries"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      experiment_plans: {
        Row: {
          analysis_plan: string | null
          approval_status: string
          controls: string | null
          created_at: string
          hypothesis_id: string | null
          id: string
          measurement_plan: string | null
          method: string | null
          model_or_material: string | null
          objective: string | null
          project_id: string
          resources: string | null
          safety_notes: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
          variables: Json
        }
        Insert: {
          analysis_plan?: string | null
          approval_status?: string
          controls?: string | null
          created_at?: string
          hypothesis_id?: string | null
          id?: string
          measurement_plan?: string | null
          method?: string | null
          model_or_material?: string | null
          objective?: string | null
          project_id: string
          resources?: string | null
          safety_notes?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id?: string
          variables?: Json
        }
        Update: {
          analysis_plan?: string | null
          approval_status?: string
          controls?: string | null
          created_at?: string
          hypothesis_id?: string | null
          id?: string
          measurement_plan?: string | null
          method?: string | null
          model_or_material?: string | null
          objective?: string | null
          project_id?: string
          resources?: string | null
          safety_notes?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          variables?: Json
        }
        Relationships: [
          {
            foreignKeyName: "experiment_plans_hypothesis_id_user_id_fkey"
            columns: ["hypothesis_id", "user_id"]
            isOneToOne: false
            referencedRelation: "hypotheses"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "experiment_plans_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      hypotheses: {
        Row: {
          created_at: string
          falsification_criteria: string | null
          id: string
          project_id: string
          rationale: string | null
          revision: number
          statement: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          falsification_criteria?: string | null
          id?: string
          project_id: string
          rationale?: string | null
          revision?: number
          statement: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          falsification_criteria?: string | null
          id?: string
          project_id?: string
          rationale?: string | null
          revision?: number
          statement?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hypotheses_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      learning_domains: {
        Row: {
          description: string
          id: number
          name: string
        }
        Insert: {
          description: string
          id: number
          name: string
        }
        Update: {
          description?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      lecture_notes: {
        Row: {
          body: string
          created_at: string
          id: string
          kind: string
          lecture_id: string
          user_id: string
          video_second: number | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          kind?: string
          lecture_id: string
          user_id?: string
          video_second?: number | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          kind?: string
          lecture_id?: string
          user_id?: string
          video_second?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lecture_notes_lecture_id_user_id_fkey"
            columns: ["lecture_id", "user_id"]
            isOneToOne: false
            referencedRelation: "lectures"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      lectures: {
        Row: {
          classroom_id: string
          completed_at: string | null
          created_at: string
          id: string
          position: number
          source_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          classroom_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          position?: number
          source_id: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          classroom_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          position?: number
          source_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lectures_classroom_id_user_id_fkey"
            columns: ["classroom_id", "user_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "lectures_source_id_user_id_fkey"
            columns: ["source_id", "user_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      notebook_entries: {
        Row: {
          body: string
          created_at: string
          id: string
          kind: string
          project_id: string
          recorded_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          kind: string
          project_id: string
          recorded_at?: string
          user_id?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          kind?: string
          project_id?: string
          recorded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notebook_entries_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      prototype_versions: {
        Row: {
          build_project_id: string
          change_summary: string | null
          created_at: string
          design_notes: string | null
          id: string
          status: string
          user_id: string
          version_label: string
        }
        Insert: {
          build_project_id: string
          change_summary?: string | null
          created_at?: string
          design_notes?: string | null
          id?: string
          status?: string
          user_id?: string
          version_label: string
        }
        Update: {
          build_project_id?: string
          change_summary?: string | null
          created_at?: string
          design_notes?: string | null
          id?: string
          status?: string
          user_id?: string
          version_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "prototype_versions_build_project_id_user_id_fkey"
            columns: ["build_project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "build_projects"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      record_links: {
        Row: {
          build_brief_id: string | null
          build_project_id: string | null
          concept_id: string | null
          entry_id: string | null
          experiment_plan_id: string | null
          file_id: string | null
          hypothesis_id: string | null
          id: string
          lecture_id: string | null
          notebook_entry_id: string | null
          prototype_version_id: string | null
          relationship: string
          research_project_id: string | null
          source_id: string | null
          test_id: string | null
          test_result_id: string | null
          user_id: string
        }
        Insert: {
          build_brief_id?: string | null
          build_project_id?: string | null
          concept_id?: string | null
          entry_id?: string | null
          experiment_plan_id?: string | null
          file_id?: string | null
          hypothesis_id?: string | null
          id?: string
          lecture_id?: string | null
          notebook_entry_id?: string | null
          prototype_version_id?: string | null
          relationship: string
          research_project_id?: string | null
          source_id?: string | null
          test_id?: string | null
          test_result_id?: string | null
          user_id?: string
        }
        Update: {
          build_brief_id?: string | null
          build_project_id?: string | null
          concept_id?: string | null
          entry_id?: string | null
          experiment_plan_id?: string | null
          file_id?: string | null
          hypothesis_id?: string | null
          id?: string
          lecture_id?: string | null
          notebook_entry_id?: string | null
          prototype_version_id?: string | null
          relationship?: string
          research_project_id?: string | null
          source_id?: string | null
          test_id?: string | null
          test_result_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "record_links_build_brief_id_user_id_fkey"
            columns: ["build_brief_id", "user_id"]
            isOneToOne: false
            referencedRelation: "build_briefs"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "record_links_build_project_id_user_id_fkey"
            columns: ["build_project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "build_projects"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "record_links_concept_id_user_id_fkey"
            columns: ["concept_id", "user_id"]
            isOneToOne: false
            referencedRelation: "concepts"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "record_links_entry_id_user_id_fkey"
            columns: ["entry_id", "user_id"]
            isOneToOne: false
            referencedRelation: "entries"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "record_links_experiment_plan_id_user_id_fkey"
            columns: ["experiment_plan_id", "user_id"]
            isOneToOne: false
            referencedRelation: "experiment_plans"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "record_links_file_id_user_id_fkey"
            columns: ["file_id", "user_id"]
            isOneToOne: false
            referencedRelation: "atlas_files"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "record_links_hypothesis_id_user_id_fkey"
            columns: ["hypothesis_id", "user_id"]
            isOneToOne: false
            referencedRelation: "hypotheses"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "record_links_lecture_id_user_id_fkey"
            columns: ["lecture_id", "user_id"]
            isOneToOne: false
            referencedRelation: "lectures"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "record_links_notebook_entry_id_user_id_fkey"
            columns: ["notebook_entry_id", "user_id"]
            isOneToOne: false
            referencedRelation: "notebook_entries"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "record_links_prototype_version_id_user_id_fkey"
            columns: ["prototype_version_id", "user_id"]
            isOneToOne: false
            referencedRelation: "prototype_versions"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "record_links_research_project_id_user_id_fkey"
            columns: ["research_project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "record_links_source_id_user_id_fkey"
            columns: ["source_id", "user_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "record_links_test_id_user_id_fkey"
            columns: ["test_id", "user_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "record_links_test_result_id_user_id_fkey"
            columns: ["test_result_id", "user_id"]
            isOneToOne: false
            referencedRelation: "test_results"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      research_projects: {
        Row: {
          created_at: string
          current_focus: string | null
          id: string
          objective: string | null
          question: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_focus?: string | null
          id?: string
          objective?: string | null
          question?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          current_focus?: string | null
          id?: string
          objective?: string | null
          question?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sources: {
        Row: {
          authors: string[] | null
          citation: string | null
          created_at: string
          doi: string | null
          id: string
          kind: string
          notes: string | null
          provider: string | null
          publication_year: number | null
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          authors?: string[] | null
          citation?: string | null
          created_at?: string
          doi?: string | null
          id?: string
          kind: string
          notes?: string | null
          provider?: string | null
          publication_year?: number | null
          title: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Update: {
          authors?: string[] | null
          citation?: string | null
          created_at?: string
          doi?: string | null
          id?: string
          kind?: string
          notes?: string | null
          provider?: string | null
          publication_year?: number | null
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      test_results: {
        Row: {
          analysis: string | null
          conclusion: string | null
          id: string
          limitations: string | null
          measurements: Json
          observations: string | null
          recorded_at: string
          test_id: string
          user_id: string
        }
        Insert: {
          analysis?: string | null
          conclusion?: string | null
          id?: string
          limitations?: string | null
          measurements?: Json
          observations?: string | null
          recorded_at?: string
          test_id: string
          user_id?: string
        }
        Update: {
          analysis?: string | null
          conclusion?: string | null
          id?: string
          limitations?: string | null
          measurements?: Json
          observations?: string | null
          recorded_at?: string
          test_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_results_test_id_user_id_fkey"
            columns: ["test_id", "user_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      tests: {
        Row: {
          created_at: string
          experiment_plan_id: string | null
          id: string
          method: string | null
          objective: string | null
          performed_at: string | null
          prototype_version_id: string | null
          research_project_id: string | null
          status: string
          success_criteria: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experiment_plan_id?: string | null
          id?: string
          method?: string | null
          objective?: string | null
          performed_at?: string | null
          prototype_version_id?: string | null
          research_project_id?: string | null
          status?: string
          success_criteria?: string | null
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          experiment_plan_id?: string | null
          id?: string
          method?: string | null
          objective?: string | null
          performed_at?: string | null
          prototype_version_id?: string | null
          research_project_id?: string | null
          status?: string
          success_criteria?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tests_experiment_plan_id_user_id_fkey"
            columns: ["experiment_plan_id", "user_id"]
            isOneToOne: false
            referencedRelation: "experiment_plans"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "tests_prototype_version_id_user_id_fkey"
            columns: ["prototype_version_id", "user_id"]
            isOneToOne: false
            referencedRelation: "prototype_versions"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "tests_research_project_id_user_id_fkey"
            columns: ["research_project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      topic_links: {
        Row: {
          build_project_id: string | null
          concept_id: string | null
          entry_id: string | null
          id: string
          research_project_id: string | null
          source_id: string | null
          topic_id: string
          user_id: string
        }
        Insert: {
          build_project_id?: string | null
          concept_id?: string | null
          entry_id?: string | null
          id?: string
          research_project_id?: string | null
          source_id?: string | null
          topic_id: string
          user_id?: string
        }
        Update: {
          build_project_id?: string | null
          concept_id?: string | null
          entry_id?: string | null
          id?: string
          research_project_id?: string | null
          source_id?: string | null
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_links_build_project_id_user_id_fkey"
            columns: ["build_project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "build_projects"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "topic_links_concept_id_user_id_fkey"
            columns: ["concept_id", "user_id"]
            isOneToOne: false
            referencedRelation: "concepts"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "topic_links_entry_id_user_id_fkey"
            columns: ["entry_id", "user_id"]
            isOneToOne: false
            referencedRelation: "entries"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "topic_links_research_project_id_user_id_fkey"
            columns: ["research_project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "topic_links_source_id_user_id_fkey"
            columns: ["source_id", "user_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "topic_links_topic_id_user_id_fkey"
            columns: ["topic_id", "user_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      topics: {
        Row: {
          created_at: string
          description: string | null
          domain_id: number
          id: string
          name: string
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain_id: number
          id?: string
          name: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          domain_id?: number
          id?: string
          name?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "learning_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_parent_owner_domain_fk"
            columns: ["parent_id", "user_id", "domain_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id", "user_id", "domain_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
