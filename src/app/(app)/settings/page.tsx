import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>

      <section className="rounded-[var(--radius-card)] border border-border bg-panel p-4">
        <h2 className="text-sm font-medium text-text-primary">Account</h2>
        <p className="mt-1 text-sm text-text-secondary">Signed in as {user?.email}</p>
        <form action={signOut} className="mt-3">
          <button type="submit" className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-error hover:border-error">
            Sign out
          </button>
        </form>
      </section>

      <section className="rounded-[var(--radius-card)] border border-border bg-panel p-4">
        <h2 className="text-sm font-medium text-text-primary">Privacy</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Every record here is private to your account, enforced by Supabase row-level security. Files live in a
          private storage bucket scoped to your user ID.
        </p>
      </section>

      <section className="rounded-[var(--radius-card)] border border-dashed border-border bg-panel p-4">
        <h2 className="text-sm font-medium text-text-primary">Export</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Structured export of your records and attachments is planned for a later phase.
        </p>
      </section>
    </div>
  );
}
