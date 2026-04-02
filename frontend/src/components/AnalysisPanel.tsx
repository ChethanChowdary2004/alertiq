import type { Incident } from "../types";
import { SeverityBadge } from "./SeverityBadge";

export function AnalysisPanel({ incident }: { incident: Incident }) {
  return (
    <div className="analysis-panel">
      <div className="analysis-header">
        <h2>AI Analysis</h2>
        <SeverityBadge severity={incident.severity} />
      </div>
      <div className="analysis-block">
        <span className="analysis-label">Summary</span>
        <p>{incident.ai_summary ?? "—"}</p>
      </div>
      <div className="analysis-block">
        <span className="analysis-label">Root Cause</span>
        <p>{incident.root_cause ?? "—"}</p>
      </div>
      <div className="analysis-block">
        <span className="analysis-label">Suggested Fix</span>
        <pre className="fix-block">{incident.suggested_fix ?? "—"}</pre>
      </div>
      <div className="analysis-block">
        <span className="analysis-label">Raw Alert</span>
        <pre className="raw-alert">{incident.raw_alert}</pre>
      </div>
    </div>
  );
}
