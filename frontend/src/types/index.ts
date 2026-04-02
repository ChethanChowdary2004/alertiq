export type Severity = "critical" | "high" | "medium" | "low";
export type Status = "open" | "investigating" | "resolved";

export interface Incident {
  id: string;
  title: string;
  raw_alert: string;
  ai_summary: string | null;
  root_cause: string | null;
  suggested_fix: string | null;
  severity: Severity;
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  incident_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface AnalyzeRequest {
  title: string;
  raw_alert: string;
}
