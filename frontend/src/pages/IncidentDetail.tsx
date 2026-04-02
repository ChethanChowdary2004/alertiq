import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { incidentApi } from "../api/client";
import { AnalysisPanel } from "../components/AnalysisPanel";
import { ChatWindow } from "../components/ChatWindow";
import type { Incident, Status } from "../types";

const STATUS_OPTIONS: Status[] = ["open", "investigating", "resolved"];

export function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    incidentApi.get(id).then((data) => {
      setIncident(data);
      setLoading(false);
    });
  }, [id]);

  const handleStatusChange = async (status: Status) => {
    if (!id || !incident) return;
    const updated = await incidentApi.updateStatus(id, status);
    setIncident(updated);
  };

  const handleDelete = async () => {
    if (!id || !confirm("Delete this incident?")) return;
    await incidentApi.delete(id);
    navigate("/");
  };

  if (loading) return <div className="page"><p className="loading-text">Loading...</p></div>;
  if (!incident) return <div className="page"><p>Incident not found.</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn-ghost" onClick={() => navigate("/")}>← Dashboard</button>
        <div className="detail-actions">
          <select
            className="status-select"
            value={incident.status}
            onChange={(e) => handleStatusChange(e.target.value as Status)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button className="btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      <h1 className="detail-title">{incident.title}</h1>
      <p className="detail-meta">
        Created {new Date(incident.created_at).toLocaleString("en-IN")}
      </p>

      <div className="detail-grid">
        <AnalysisPanel incident={incident} />
        <ChatWindow incidentId={incident.id} />
      </div>
    </div>
  );
}
