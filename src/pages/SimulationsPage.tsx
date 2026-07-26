import AppPageShell from "../components/layout/AppPageShell";

export default function SimulationsPage() {
  return (
    <AppPageShell
      eyebrow="SIMULATION HISTORY"
      title="Review previous network runs."
      description="Saved simulations, comparisons, reruns, renaming, and deletion will appear here."
    >
      <div className="app-page-shell-card">
        <strong>
          Simulations route is ready
        </strong>

        <span>
          This page will use mock data first,
          then connect to the database after
          the backend is created.
        </span>
      </div>
    </AppPageShell>
  );
}
