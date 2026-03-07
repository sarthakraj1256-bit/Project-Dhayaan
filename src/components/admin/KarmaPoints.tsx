import UserManagement from "./UserManagement";

const KarmaPoints = () => (
  <div className="space-y-6">
    <h2 className="text-lg font-semibold text-primary">Karma Points Overview</h2>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Total Karma Distributed", value: "2,84,500" },
        { label: "Average per User", value: "22.1" },
        { label: "Top Karma Score", value: "4,850" },
        { label: "Karma Awarded Today", value: "1,240" },
      ].map((c) => (
        <div key={c.label} className="rounded-2xl p-4 bg-card border border-border">
          <span className="text-[12px] text-muted-foreground">{c.label}</span>
          <p className="text-xl font-bold mt-1 text-foreground">{c.value}</p>
        </div>
      ))}
    </div>

    <UserManagement />
  </div>
);

export default KarmaPoints;
