-- Research Atlas | Supabase PostgreSQL schema v1
-- Run once in a NEW Supabase project SQL Editor. Auth users are created by Supabase Auth.
-- Private by default. Application must authenticate; never expose service_role to clients.
create extension if not exists pgcrypto;

create or replace function public.atlas_touch() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create table public.learning_domains (
 id smallint primary key check (id between 1 and 5), name text not null unique, description text not null
);
insert into public.learning_domains(id,name,description) values
(1,'Neuroscience & Cognition','Neurons, synapses, neural circuits, memory, learning, cognition and neurotechnology'),
(2,'Biological Sciences','Cell and molecular biology, genetics, epigenetics, biochemistry, physiology and systems biology'),
(3,'Aging & Regenerative Science','Biological aging, senescence, stem cells, tissue repair, reprogramming, drug discovery and biotechnology'),
(4,'AI & Computational Science','Programming, statistics, machine learning, bioinformatics, simulation and scientific computing'),
(5,'Engineering & Technology','Mechanical design, sensors, robotics, control, biomedical engineering and scientific instrumentation');

create table public.topics (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 domain_id smallint not null references public.learning_domains(id), parent_id uuid references public.topics(id) on delete set null,
 name text not null check(length(trim(name))>0), description text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(id,user_id), unique(id,user_id,domain_id), check(parent_id is distinct from id)
);
-- Parent and child topics must belong to the same user and domain.
alter table public.topics add constraint topics_parent_owner_domain_fk foreign key(parent_id,user_id,domain_id) references public.topics(id,user_id,domain_id) deferrable initially immediate;

create table public.entries (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 kind text not null check(kind in ('question','thought','observation','idea','link')),
 title text, body text not null check(length(trim(body))>0), original_body text not null check(length(trim(original_body))>0),
 provenance text not null default 'user' check(provenance in ('user','ai_suggestion','source_excerpt')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id)
);
create table public.entry_revisions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 entry_id uuid not null, previous_body text not null, changed_at timestamptz not null default now(),
 foreign key(entry_id,user_id) references public.entries(id,user_id) on delete cascade
);
create or replace function public.atlas_entry_revision() returns trigger language plpgsql as $$
begin
 if new.body is distinct from old.body then
   insert into public.entry_revisions(user_id,entry_id,previous_body) values(old.user_id,old.id,old.body);
 end if;
 new.original_body=old.original_body; return new;
end $$;
create trigger entries_revision before update on public.entries for each row execute function public.atlas_entry_revision();

create table public.sources (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 kind text not null check(kind in ('paper','lecture','course','dataset','website','book','video','other')),
 title text not null, url text, doi text, authors text[], publication_year integer check(publication_year between 1400 and 2200),
 provider text, citation text, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id)
);
create table public.classrooms (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 title text not null, description text, learning_goal text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id)
);
create table public.lectures (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 classroom_id uuid not null, source_id uuid not null, position integer not null default 0,
 status text not null default 'not_started' check(status in ('not_started','learning','completed','revisit')),
 completed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(classroom_id,user_id) references public.classrooms(id,user_id) on delete cascade,
 foreign key(source_id,user_id) references public.sources(id,user_id) on delete restrict, unique(id,user_id), unique(classroom_id,source_id)
);
create table public.lecture_notes (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 lecture_id uuid not null, kind text not null default 'note' check(kind in ('note','question','summary','timestamp')),
 body text not null, video_second integer check(video_second>=0), created_at timestamptz not null default now(),
 foreign key(lecture_id,user_id) references public.lectures(id,user_id) on delete cascade, unique(id,user_id)
);
create table public.concepts (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 name text not null, explanation text, understanding_status text not null default 'new' check(understanding_status in ('new','learning','understood','revisit')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id)
);
create table public.research_projects (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 title text not null, question text, objective text, current_focus text,
 status text not null default 'exploring' check(status in ('exploring','literature_review','planning','active','paused','completed','archived')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id)
);
create table public.hypotheses (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 project_id uuid not null, statement text not null, rationale text, falsification_criteria text,
 status text not null default 'proposed' check(status in ('proposed','under_review','tested','revised','retired')),
 revision integer not null default 1 check(revision>0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,user_id) references public.research_projects(id,user_id) on delete cascade, unique(id,user_id)
);
create table public.experiment_plans (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 project_id uuid not null, hypothesis_id uuid, title text not null, objective text, model_or_material text, variables jsonb not null default '{}'::jsonb,
 controls text, method text, measurement_plan text, analysis_plan text, resources text, safety_notes text,
 approval_status text not null default 'not_required_or_not_assessed' check(approval_status in ('not_required_or_not_assessed','approval_required','pending','approved','rejected')),
 status text not null default 'draft' check(status in ('draft','planned','ready','superseded','cancelled')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,user_id) references public.research_projects(id,user_id) on delete cascade,
 foreign key(hypothesis_id,user_id) references public.hypotheses(id,user_id) on delete set null, unique(id,user_id)
);
create table public.notebook_entries (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 project_id uuid not null, kind text not null check(kind in ('literature','observation','decision','method','analysis','reflection','other')),
 body text not null, recorded_at timestamptz not null default now(), created_at timestamptz not null default now(),
 foreign key(project_id,user_id) references public.research_projects(id,user_id) on delete cascade, unique(id,user_id)
);
create table public.build_briefs (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 title text not null, problem_statement text, existing_approaches text, proposed_contribution text, required_knowledge text,
 available_resources text, prototype_scope text, success_criteria text, first_test_plan text,
 readiness_status text not null default 'exploring' check(readiness_status in ('exploring','needs_learning','ready_to_build','awaiting_supervision')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id)
);
create table public.build_projects (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 brief_id uuid, research_project_id uuid, title text not null,
 kind text not null check(kind in ('software_ai','engineering','simulation','experimental_concept','hybrid')),
 purpose text, requirements jsonb not null default '{}'::jsonb, success_criteria text,
 status text not null default 'concept' check(status in ('concept','designing','building','testing','paused','completed','archived')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(brief_id,user_id) references public.build_briefs(id,user_id) on delete set null,
 foreign key(research_project_id,user_id) references public.research_projects(id,user_id) on delete set null, unique(id,user_id)
);
create table public.prototype_versions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 build_project_id uuid not null, version_label text not null, design_notes text, change_summary text,
 status text not null default 'concept' check(status in ('concept','built','retired')),
 created_at timestamptz not null default now(), foreign key(build_project_id,user_id) references public.build_projects(id,user_id) on delete cascade,
 unique(build_project_id,version_label), unique(id,user_id)
);
create table public.build_issues (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 build_project_id uuid not null, prototype_version_id uuid, title text not null, observation text, attempted_fixes text,
 status text not null default 'open' check(status in ('open','investigating','resolved','wont_fix')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(build_project_id,user_id) references public.build_projects(id,user_id) on delete cascade,
 foreign key(prototype_version_id,user_id) references public.prototype_versions(id,user_id) on delete set null, unique(id,user_id)
);
create table public.tests (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 title text not null, research_project_id uuid, experiment_plan_id uuid, prototype_version_id uuid,
 objective text, method text, success_criteria text, status text not null default 'planned' check(status in ('planned','ready','in_progress','performed','analyzed','cancelled')),
 performed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(experiment_plan_id is not null or prototype_version_id is not null or research_project_id is not null),
 check(status not in ('performed','analyzed') or performed_at is not null),
 foreign key(research_project_id,user_id) references public.research_projects(id,user_id) on delete set null,
 foreign key(experiment_plan_id,user_id) references public.experiment_plans(id,user_id) on delete set null,
 foreign key(prototype_version_id,user_id) references public.prototype_versions(id,user_id) on delete restrict, unique(id,user_id)
);
create table public.test_results (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 test_id uuid not null, observations text, measurements jsonb not null default '{}'::jsonb,
 analysis text, conclusion text, limitations text, recorded_at timestamptz not null default now(),
 foreign key(test_id,user_id) references public.tests(id,user_id) on delete cascade, unique(id,user_id)
);
create or replace function public.atlas_result_guard() returns trigger language plpgsql as $$
begin
 if not exists(select 1 from public.tests where id=new.test_id and user_id=new.user_id and status in ('performed','analyzed') and performed_at is not null) then
 raise exception 'A result requires a performed test with performed_at'; end if;
 return new;
end $$;
create trigger result_guard before insert or update on public.test_results for each row execute function public.atlas_result_guard();

create table public.atlas_files (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 storage_path text not null, filename text not null, mime_type text, byte_size bigint check(byte_size>=0), checksum_sha256 text,
 created_at timestamptz not null default now(), unique(id,user_id), unique(storage_path),
 check(storage_path like user_id::text || '/%')
);
-- Explicit link tables allow cross-domain tagging without copying content.
create table public.topic_links (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 topic_id uuid not null, entry_id uuid, source_id uuid, concept_id uuid, research_project_id uuid, build_project_id uuid,
 check(num_nonnulls(entry_id,source_id,concept_id,research_project_id,build_project_id)=1),
 foreign key(topic_id,user_id) references public.topics(id,user_id) on delete cascade,
 foreign key(entry_id,user_id) references public.entries(id,user_id) on delete cascade,
 foreign key(source_id,user_id) references public.sources(id,user_id) on delete cascade,
 foreign key(concept_id,user_id) references public.concepts(id,user_id) on delete cascade,
 foreign key(research_project_id,user_id) references public.research_projects(id,user_id) on delete cascade,
 foreign key(build_project_id,user_id) references public.build_projects(id,user_id) on delete cascade
);
create table public.record_links (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 relationship text not null check(relationship in ('inspired_by','related_to','supports','challenges','uses','derived_from','documents','requires_learning')),
 entry_id uuid, source_id uuid, lecture_id uuid, concept_id uuid, research_project_id uuid, hypothesis_id uuid,
 experiment_plan_id uuid, notebook_entry_id uuid, build_brief_id uuid, build_project_id uuid, prototype_version_id uuid, test_id uuid, test_result_id uuid, file_id uuid,
 check(num_nonnulls(entry_id,source_id,lecture_id,concept_id,research_project_id,hypothesis_id,experiment_plan_id,notebook_entry_id,build_brief_id,build_project_id,prototype_version_id,test_id,test_result_id,file_id)=2),
 foreign key(entry_id,user_id) references public.entries(id,user_id) on delete cascade,
 foreign key(source_id,user_id) references public.sources(id,user_id) on delete cascade,
 foreign key(lecture_id,user_id) references public.lectures(id,user_id) on delete cascade,
 foreign key(concept_id,user_id) references public.concepts(id,user_id) on delete cascade,
 foreign key(research_project_id,user_id) references public.research_projects(id,user_id) on delete cascade,
 foreign key(hypothesis_id,user_id) references public.hypotheses(id,user_id) on delete cascade,
 foreign key(experiment_plan_id,user_id) references public.experiment_plans(id,user_id) on delete cascade,
 foreign key(notebook_entry_id,user_id) references public.notebook_entries(id,user_id) on delete cascade,
 foreign key(build_brief_id,user_id) references public.build_briefs(id,user_id) on delete cascade,
 foreign key(build_project_id,user_id) references public.build_projects(id,user_id) on delete cascade,
 foreign key(prototype_version_id,user_id) references public.prototype_versions(id,user_id) on delete cascade,
 foreign key(test_id,user_id) references public.tests(id,user_id) on delete cascade,
 foreign key(test_result_id,user_id) references public.test_results(id,user_id) on delete cascade,
 foreign key(file_id,user_id) references public.atlas_files(id,user_id) on delete cascade
);
create table public.ai_sessions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 mode text not null check(mode in ('explore','teach','quiz','questions_only','read','research_critic','design','build','debug','test')),
 title text, context jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), unique(id,user_id)
);
create table public.ai_messages (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 session_id uuid not null, role text not null check(role in ('user','assistant','system_note')),
 body text not null, created_at timestamptz not null default now(),
 foreign key(session_id,user_id) references public.ai_sessions(id,user_id) on delete cascade
);

-- Per-user isolation for every user-owned table. Users cannot forge another user_id.
do $$ declare t text; begin
 foreach t in array array['topics','entries','entry_revisions','sources','classrooms','lectures','lecture_notes','concepts','research_projects','hypotheses','experiment_plans','notebook_entries','build_briefs','build_projects','prototype_versions','build_issues','tests','test_results','atlas_files','topic_links','record_links','ai_sessions','ai_messages'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy %I on public.%I for select to authenticated using (user_id = (select auth.uid()))',t||'_select',t);
 execute format('create policy %I on public.%I for insert to authenticated with check (user_id = (select auth.uid()))',t||'_insert',t);
 execute format('create policy %I on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',t||'_update',t);
 execute format('create policy %I on public.%I for delete to authenticated using (user_id = (select auth.uid()))',t||'_delete',t);
 end loop;
end $$;
alter table public.learning_domains enable row level security;
create policy domains_read on public.learning_domains for select to authenticated using (true);
revoke insert,update,delete on public.learning_domains from anon,authenticated;

-- Private file storage: create bucket; paths MUST begin with the authenticated user's UUID + '/'.
insert into storage.buckets(id,name,public,file_size_limit) values ('research-atlas-private','research-atlas-private',false,52428800)
on conflict(id) do update set public=false;
create policy atlas_storage_select on storage.objects for select to authenticated
 using(bucket_id='research-atlas-private' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy atlas_storage_insert on storage.objects for insert to authenticated
 with check(bucket_id='research-atlas-private' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy atlas_storage_update on storage.objects for update to authenticated
 using(bucket_id='research-atlas-private' and (storage.foldername(name))[1]=(select auth.uid())::text)
 with check(bucket_id='research-atlas-private' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy atlas_storage_delete on storage.objects for delete to authenticated
 using(bucket_id='research-atlas-private' and (storage.foldername(name))[1]=(select auth.uid())::text);

-- Useful lookup indexes.
create index topics_user_domain_idx on public.topics(user_id,domain_id,parent_id);
create index entries_user_created_idx on public.entries(user_id,created_at desc);
create index sources_user_kind_idx on public.sources(user_id,kind);
create index lectures_classroom_idx on public.lectures(classroom_id,position);
create index notebook_project_date_idx on public.notebook_entries(project_id,recorded_at desc);
create index research_user_status_idx on public.research_projects(user_id,status);
create index builds_user_status_idx on public.build_projects(user_id,status);
create index tests_user_status_idx on public.tests(user_id,status);
create index topic_links_topic_idx on public.topic_links(topic_id);
create index record_links_user_idx on public.record_links(user_id);
create index ai_messages_session_idx on public.ai_messages(session_id,created_at);
create index entries_search_idx on public.entries using gin(to_tsvector('english',coalesce(title,'')||' '||body));
create index sources_search_idx on public.sources using gin(to_tsvector('english',title||' '||coalesce(notes,'')));

-- Keep updated_at current on editable tables.
do $$ declare t text; begin
 foreach t in array array['topics','entries','sources','classrooms','lectures','concepts','research_projects','hypotheses','experiment_plans','build_briefs','build_projects','build_issues','tests'] loop
 execute format('create trigger %I before update on public.%I for each row execute function public.atlas_touch()',t||'_touch',t);
 end loop;
end $$;

-- Important implementation notes:
-- 1. Never allow clients to write learning_domains; its five rows are the approved top-level taxonomy.
-- 2. Create subtopics in topics and associate records with topic_links. For direct domain tags without subtopics, create a root topic per user/domain.
-- 3. Application should enforce that a linked hypothesis belongs to the experiment plan's research project,
--    and that a build issue's prototype version belongs to the issue's build project.
-- 4. record_links joins exactly two DIFFERENT entity TYPES; use separate records for multiple associations.
-- 5. Revisions for notebook entries, hypotheses, and experiment plans should be implemented as immutable versions before regulated or collaborative use.
-- 6. Private storage objects are protected by RLS; store only the object path in atlas_files, not public URLs.
-- 7. This schema does not execute AI, code, wet-lab experiments, or validate scientific claims.
