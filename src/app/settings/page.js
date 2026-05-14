export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold text-primary">Settings</p>
        <h1 className="mt-2 text-4xl font-bold">App settings</h1>
        <p className="mt-3 text-muted">
          This page will store user goals, equipment, injuries, preferred days,
          preferred times, and calendar connection settings.
        </p>
      </div>
    </main>
  );
}
