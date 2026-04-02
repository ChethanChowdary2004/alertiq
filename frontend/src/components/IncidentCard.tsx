import { useNavigate } from "react-router-dom";
import type { Incident } from "../types";
import { SeverityBadge } from "./SeverityBadge";

export function IncidentCard({ incident }: { incident: Incident }) {
  const navigate = useNavigate();
  const date = new Date(incident.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="card" onClick={() => navigate(`/incidents/${incident.id}`)}>
      <div className="card-top">
        <SeverityBadge severity={incident.severity} />
        <span className={`status-pill status-${incident.status}`}>{incident.status}</span>
      </div>
      <h3 className="card-title">{incident.title}</h3>
      <p className="card-summary">{incident.ai_summary ?? "Analyzing..."}</p>
      <span className="card-date">{date}</span>
    </div>
  );
}
