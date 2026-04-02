import { useState, useEffect, useRef } from "react";
import { chatApi } from "../api/client";
import type { ChatMessage } from "../types";

export function ChatWindow({ incidentId }: { incidentId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatApi.getHistory(incidentId).then(setMessages);
  }, [incidentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setLoading(true);

    const optimistic: ChatMessage = {
      id: crypto.randomUUID(),
      incident_id: incidentId,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const reply = await chatApi.send(incidentId, text);
      setMessages((prev) => [...prev, reply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          incident_id: incidentId,
          role: "assistant",
          content: "Something went wrong. Please try again.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>Ask AI about this incident</h2>
        <span className="chat-hint">This AI knows this incident's full context</span>
      </div>
      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="chat-empty">
            No messages yet. Ask something like "What caused this?" or "Has this happened before?"
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-msg chat-msg-${msg.role}`}>
            <span className="chat-role">{msg.role === "user" ? "You" : "AlertIQ"}</span>
            <p>{msg.content}</p>
          </div>
        ))}
        {loading && (
          <div className="chat-msg chat-msg-assistant">
            <span className="chat-role">AlertIQ</span>
            <p className="chat-typing">Thinking...</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-row">
        <textarea
          className="chat-input"
          rows={2}
          placeholder="Ask a follow-up question... (Enter to send)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
        />
        <button className="chat-send-btn" onClick={send} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
