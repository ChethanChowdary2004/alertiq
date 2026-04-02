import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { incidentApi } from "../api/client";
import { IncidentCard } from "../components/IncidentCard";
import type { Incident } from "../types";

export function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    incidentApi.list().then((data) => {
      setIncidents(data);
      setLoading(false);
    });
  }, []);

  const counts = {
    open: incidents.filter((i) => i.status === "open").length,
    investigating: incidents.filter((i) => i.status === "investigating").length,
    resolved: incidents.filter((i) => i.status === "resolved").length,
    critical: incidents.filter((i) => i.severity === "critical").length,
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>AlertIQ</h1>
          <p className="page-subtitle">Incident Intelligence Platform</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/new")}>
          + New Incident
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-num">{incidents.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card stat-danger">
          <span className="stat-num">{counts.critical}</span>
          <span className="stat-label">Critical</span>
        </div>
        <div className="stat-card stat-warn">
          <span className="stat-num">{counts.open}</span>
          <span className="stat-label">Open</span>
        </div>
        <div className="stat-card stat-success">
          <span className="stat-num">{counts.resolved}</span>
          <span className="stat-label">Resolved</span>
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Loading incidents...</p>
      ) : incidents.length === 0 ? (
        <div className="empty-state">
          <p>No incidents yet.</p>
          <button className="btn-primary" onClick={() => navigate("/new")}>
            Submit your first incident
          </button>
        </div>
      ) : (
        <div className="card-grid">
          {incidents.map((inc) => (
            <IncidentCard key={inc.id} incident={inc} />
          ))}
        </div>
      )}
    </div>
  );
}
