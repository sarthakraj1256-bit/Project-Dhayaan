import { Award } from "lucide-react";
import UserManagement from "./UserManagement";

// Karma Points is a view into the user management with karma focus
const KarmaPoints = () => (
  <div className="space-y-6">
    <h2 className="text-lg font-semibold" style={{ color: "#C9A84C" }}>Karma Points Overview</h2>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Total Karma Distributed", value: "2,84,500" },
        { label: "Average per User", value: "22.1" },
        { label: "Top Karma Score", value: "4,850" },
        { label: "Karma Awarded Today", value: "1,240" },
      ].map((c) => (
        <div key={c.label} className="rounded-2xl p-4" style={{ background: "#13110D", border: "1px solid rgba(201,168,76,0.2)" }}>
          <span className="text-[12px]" style={{ color: "#6B5E4E" }}>{c.label}</span>
          <p className="text-xl font-bold mt-1" style={{ color: "#F5F0E8" }}>{c.value}</p>
        </div>
      ))}
    </div>

    <UserManagement />
  </div>
);

export default KarmaPoints;
