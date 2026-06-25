"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { createFeedback } from "@/infrastructure/services/support.service";

export default function FeedbackView() {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState("5");
  const [status, setStatus] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createFeedback({
      message,
      rating: Number(rating),
      page: "dashboard-feedback",
    });
    setMessage("");
    setStatus("Feedback sent.");
  }

  return (
    <div style={{ padding: "1rem", maxWidth: "40rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Feedback</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: "0.75rem" }}
      >
        <label>
          Rating
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            style={{ display: "block", marginTop: "0.35rem" }}
          />
        </label>
        <label>
          Message
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
            rows={5}
            style={{
              display: "block",
              width: "100%",
              marginTop: "0.35rem",
              border: "1px solid #ddd",
              borderRadius: "0.5rem",
              padding: "0.75rem",
            }}
          />
        </label>
        <button
          type="submit"
          style={{
            width: "fit-content",
            padding: "0.6rem 1rem",
            borderRadius: "0.5rem",
            background: "#111",
            color: "#fff",
          }}
        >
          Send feedback
        </button>
        {status && <p>{status}</p>}
      </form>
    </div>
  );
}
