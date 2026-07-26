import AppPageShell from "../components/layout/AppPageShell";

export default function SettingsPage() {
  return (
    <AppPageShell
      eyebrow="PREFERENCES"
      title="Configure your workspace."
      description="Account details, routing preferences, display settings, and logout controls will live here."
    >
      <div className="app-page-shell-card">
        <strong>
          Settings route is ready
        </strong>

        <span>
          Profile and preference controls will
          be added after authentication and the
          dashboard are complete.
        </span>
      </div>
    </AppPageShell>
  );
}
