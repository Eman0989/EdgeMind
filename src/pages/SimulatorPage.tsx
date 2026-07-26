import AppPageShell from "../components/layout/AppPageShell";

export default function SimulatorPage() {
  return (
    <AppPageShell
      eyebrow="CDN SIMULATOR"
      title="Model intelligent delivery."
      description="Configure origins, edge nodes, cache behavior, traffic volume, and routing priorities."
    >
      <div className="app-page-shell-card">
        <strong>
          Simulator route is ready
        </strong>

        <span>
          The simulation controls and result
          visualizations will be built after
          the main dashboard.
        </span>
      </div>
    </AppPageShell>
  );
}
