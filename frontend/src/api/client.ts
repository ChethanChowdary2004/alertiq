import axios from "axios";
import type { Incident, ChatMessage, AnalyzeRequest } from "../types";

const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

export const incidentApi = {
  list: (): Promise<Incident[]> =>
    api.get("/incidents/").then((r) => r.data),
  get: (id: string): Promise<Incident> =>
    api.get(`/incidents/${id}`).then((r) => r.data),
  analyze: (body: AnalyzeRequest): Promise<Incident> =>
    api.post("/incidents/analyze", body).then((r) => r.data),
  updateStatus: (id: string, status: string): Promise<Incident> =>
    api.patch(`/incidents/${id}`, { status }).then((r) => r.data),
  delete: (id: string): Promise<void> =>
    api.delete(`/incidents/${id}`).then((r) => r.data),
};

export const chatApi = {
  getHistory: (incidentId: string): Promise<ChatMessage[]> =>
    api.get(`/incidents/${incidentId}/chat/`).then((r) => r.data),
  send: (incidentId: string, content: string): Promise<ChatMessage> =>
    api.post(`/incidents/${incidentId}/chat/`, { content }).then((r) => r.data),
};
