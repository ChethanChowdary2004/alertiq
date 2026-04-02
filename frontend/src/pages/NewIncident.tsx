import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { incidentApi } from "../api/client";

export function NewIncident() {
  const [title, setTitle] = useState("");
  const [rawAlert, setRawAlert] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async () => {
    if (!title.trim() || !rawAlert.trim()) {
      setError("Both title and alert log are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const incident = await incidentApi.analyze({ title, raw_alert: rawAlert });
      navigate(`/incidents/${incident.id}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to analyze incident.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <button className="btn-ghost" onClick={() => navigate("/")}>← Back</button>
        <h1>New Incident</h1>
      </div>

      <div className="form-card">
        <div className="form-group">
          <label className="form-label">Incident Title</label>
          <input
            className="form-input"
            placeholder="e.g. API gateway 502 errors on /checkout"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Paste Alert / Error Log</label>
          <textarea
            className="form-textarea"
            rows={14}
            placeholder={`Paste your raw alert, stack trace, or log here...\n\nExample:\nERROR: Connection refused\nat ConnectionPool.connect (pool.js:142)\nat PostgreSQL.query (pg.js:89)\nCode: ECONNREFUSED 127.0.0.1:5432`}
            value={rawAlert}
            onChange={(e) => setRawAlert(e.target.value)}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          {loading ? (
            <div className="analyzing-state">
              <div className="spinner" />
              <span>AlertIQ is analyzing — checking team history and calling AI...</span>
            </div>
          ) : (
            <button className="btn-primary btn-large" onClick={submit}>
              Analyze Incident
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
