import type { Severity } from "../types";

const colors: Record<Severity, string> = {
  critical: "badge badge-critical",
  high: "badge badge-high",
  medium: "badge badge-medium",
  low: "badge badge-low",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <span className={colors[severity]}>{severity.toUpperCase()}</span>;
}
