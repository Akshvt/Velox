import { useState } from "react";
import DOMPurify from "dompurify";
import { chatService, ticketService } from "../services";

/**
 * Customer-facing chat page - used when a customer opens a conversation
 * (Figma wireframe 2: conversation list + chat window).
 */
export default function ChatPage() {
  const [conversations] = useState([
    { id: 1, subject: "Billing question", lastMessage: "I was charged twice...", time: "2m ago" },
    { id: 2, subject: "Password reset", lastMessage: "I can't log in", time: "1h ago" },
    { id: 3, subject: "Feature request", lastMessage: "Can you add dark mode?", time: "3h ago" },
  ]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", body: "", name: "", email: "" });

  const handleNewTicket = async () => {
    try {
      await ticketService.create({
        subject: newTicket.subject,
        body: newTicket.body,
        customerName: newTicket.name,
        customerEmail: newTicket.email,
      });
      setNewTicketOpen(false);
      setNewTicket({ subject: "", body: "", name: "", email: "" });
    } catch (err) {
      console.error("Failed to create ticket:", err);
    }
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 56px)" }}>
      {/* Conversations sidebar */}
      <div style={{ width: 300, borderRight: "1px solid #e5e5e5", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 16, borderBottom: "1px solid #e5e5e5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Conversations</h2>
          <button className="btn btn-sm btn-primary" onClick={() => setNewTicketOpen(true)}>+ New</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedConv(c)}
              style={{
                padding: "12px 16px", borderBottom: "1px solid #f0f0f0", cursor: "pointer",
                background: selectedConv?.id === c.id ? "#f5f5f5" : "#fff",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{c.subject}</div>
              <div style={{ fontSize: 12, color: "#737373", display: "flex", justifyContent: "space-between" }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{c.lastMessage}</span>
                <span>{c.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {selectedConv ? (
          <>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e5e5", fontWeight: 600 }}>
              {selectedConv.subject}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ padding: "8px 14px", background: "#f5f5f5", borderRadius: 8, maxWidth: "75%", fontSize: 14 }}>
                {selectedConv.lastMessage}
              </div>
              {messages.map((m, i) => (
                <div key={i} style={{
                  padding: "8px 14px", borderRadius: 8, maxWidth: "75%", fontSize: 14,
                  background: m.type === "user" ? "#f5f5f5" : "#1a1a1a",
                  color: m.type === "user" ? "#1a1a1a" : "#fff",
                  alignSelf: m.type === "user" ? "flex-start" : "flex-end",
                }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(m.content) }} />
              ))}
            </div>

            <div style={{ padding: 12, borderTop: "1px solid #e5e5e5", display: "flex", gap: 8 }}>
              <input
                className="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && input.trim()) {
                    setMessages([...messages, { type: "user", content: input }]);
                    setInput("");
                  }
                }}
              />
              <button className="btn btn-primary" onClick={() => {
                if (!input.trim()) return;
                setMessages([...messages, { type: "user", content: input }]);
                setInput("");
              }}>Send</button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
            Select a conversation or start a new one
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {newTicketOpen && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 100,
        }} onClick={() => setNewTicketOpen(false)}>
          <div className="card" style={{ width: 420 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>New Conversation</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input className="input" placeholder="Your name" value={newTicket.name} onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })} />
              <input className="input" placeholder="Your email" value={newTicket.email} onChange={(e) => setNewTicket({ ...newTicket, email: e.target.value })} />
              <input className="input" placeholder="Subject" value={newTicket.subject} onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })} />
              <textarea className="input" placeholder="Describe your issue..." value={newTicket.body} onChange={(e) => setNewTicket({ ...newTicket, body: e.target.value })} rows={4} style={{ resize: "vertical" }} />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn" onClick={() => setNewTicketOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleNewTicket}>Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
