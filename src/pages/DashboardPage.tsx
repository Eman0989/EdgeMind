import AppPageShell from "../components/layout/AppPageShell";

export default function DashboardPage() {
  return (
    <AppPageShell
      eyebrow="CONTROL PLANE"
      title="Infrastructure overview."
      description="The real EdgeMind dashboard will show network health, request traffic, cache efficiency, latency, and routing activity."
    >
      <div className="app-page-shell-card">
        <strong>
          Dashboard route is ready
        </strong>

        <span>
          Authentication protection and real
          dashboard components will be added
          in later phases.
        </span>
      </div>
    </AppPageShell>
  );
}
