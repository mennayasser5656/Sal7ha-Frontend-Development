"use client";

import { useEffect, useState } from "react";
import {
  listInboxMessages,
  markInboxMessageRead,
  type InboxMessage,
} from "@/infrastructure/services/inbox.service";

export default function InboxView() {
  const [messages, setMessages] = useState<InboxMessage[]>([]);

  useEffect(() => {
    async function loadMessages() {
      const response = await listInboxMessages({ page: 1, limit: 50 });
      setMessages(response.data);
    }

    void loadMessages();
  }, []);

  async function handleMarkRead(id: string) {
    const updated = await markInboxMessageRead(id);
    setMessages((current) =>
      current.map((message) => (message.id === id ? updated : message)),
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Inbox</h1>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {messages.map((message) => (
          <button
            key={message.id}
            type="button"
            onClick={() => handleMarkRead(message.id)}
            style={{
              textAlign: "left",
              border: "1px solid #e5e5e5",
              borderRadius: "0.5rem",
              padding: "1rem",
              background: message.status === "read" ? "#fff" : "#fff8df",
            }}
          >
            <strong>{message.title}</strong>
            <p style={{ margin: "0.5rem 0", color: "#555" }}>{message.body}</p>
            <small>{new Date(message.createdAt).toLocaleString()}</small>
          </button>
        ))}
        {messages.length === 0 && <p>No inbox messages.</p>}
      </div>
    </div>
  );
}
