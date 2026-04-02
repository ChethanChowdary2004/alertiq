import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8000" });

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ff4d4f",
  high: "#fa8c16",
  medium: "#fadb14",
  low: "#52c41a",
};

interface Summary {
  total_incidents: number;
  resolved: number;
  open: number;
  investigating: number;
  repeat_rate: number;
  avg_resolution_hours: number | null;
}

export function Analytics() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [severity, setSeverity] = useState<{ severity: string; count: number }[]>([]);
  const [overTime, setOverTime] = useState<{ date: string; count: number }[]>([]);
  const [keywords, setKeywords] = useState<{ keyword: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/analytics/summary"),
      api.get("/analytics/severity-breakdown"),
      api.get("/analytics/incidents-over-time"),
      api.get("/analytics/top-keywords"),
    ]).then(([s, sv, ot, kw]) => {
      setSummary(s.data);
      setSeverity(sv.data);
      setOverTime(ot.data);
      setKeywords(kw.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="page"><p className="loading-text">Loading analytics...</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p className="page-subtitle">Team incident intelligence overview</p>
        </div>
        <button className="btn-ghost" onClick={() => navigate("/")}>← Dashboard</button>
      </div>

      {/* Summary cards */}
      <div className="stats-row" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
        <div className="stat-card">
          <span className="stat-num">{summary?.total_incidents}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card stat-warn">
          <span className="stat-num">{summary?.open}</span>
          <span className="stat-label">Open</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{summary?.investigating}</span>
          <span className="stat-label">Investigating</span>
        </div>
        <div className="stat-card stat-success">
          <span className="stat-num">{summary?.resolved}</span>
          <span className="stat-label">Resolved</span>
        </div>
        <div className="stat-card stat-danger">
          <span className="stat-num">{summary?.repeat_rate}%</span>
          <span className="stat-label">Repeat Rate</span>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Incidents over time */}
        <div className="analytics-card">
          <h2>Incidents over time</h2>
          {overTime.length === 0 ? (
            <p className="chart-empty">Not enough data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={overTime}>
                <XAxis dataKey="date" tick={{ fill: "#9da3b4", fontSize: 11 }} />
                <YAxis tick={{ fill: "#9da3b4", fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#1a1d27", border: "1px solid #2e3347", borderRadius: 8 }}
                  labelStyle={{ color: "#e8eaf0" }}
                  itemStyle={{ color: "#6c63ff" }}
                />
                <Bar dataKey="count" fill="#6c63ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Severity breakdown */}
        <div className="analytics-card">
          <h2>Severity breakdown</h2>
          {severity.length === 0 ? (
            <p className="chart-empty">Not enough data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={severity}
                  dataKey="count"
                  nameKey="severity"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent}) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={{ stroke: "#9da3b4" }}
                >
                  {severity.map((entry) => (
                    <Cell
                      key={entry.severity}
                      fill={SEVERITY_COLORS[entry.severity] ?? "#6c63ff"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1a1d27", border: "1px solid #2e3347", borderRadius: 8 }}
                  itemStyle={{ color: "#e8eaf0" }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "#9da3b4", fontSize: 13 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top root cause keywords */}
        <div className="analytics-card">
          <h2>Top root cause keywords</h2>
          {keywords.length === 0 ? (
            <p className="chart-empty">Not enough data yet</p>
          ) : (
            <div className="keyword-list">
              {keywords.map((kw, i) => (
                <div key={kw.keyword} className="keyword-row">
                  <span className="keyword-rank">#{i + 1}</span>
                  <span className="keyword-text">{kw.keyword}</span>
                  <div className="keyword-bar-wrap">
                    <div
                      className="keyword-bar"
                      style={{
                        width: `${(kw.count / keywords[0].count) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="keyword-count">{kw.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Avg resolution time */}
        <div className="analytics-card analytics-card-center">
          <h2>Avg resolution time</h2>
          <div className="big-metric">
            {summary?.avg_resolution_hours !== null
              ? <><span className="big-num">{summary?.avg_resolution_hours}</span><span className="big-unit">hrs</span></>
              : <span className="big-num">—</span>
            }
          </div>
          <p className="metric-note">Across all resolved incidents</p>
        </div>
      </div>
    </div>
  );
}