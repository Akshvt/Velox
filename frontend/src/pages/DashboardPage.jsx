import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DOMPurify from "dompurify";
import { fetchTickets, selectTicket, setFilters } from "../store/ticketSlice";
import { fetchMessages } from "../store/chatSlice";
import { chatService, aiService, ticketService } from "../services";
import { STATUS_LABELS } from "../utils/constants";
import Sidebar from "../components/Sidebar";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { tickets, selectedTicket, filters, pagination } = useSelector((s) => s.tickets);
  const { messages, activeTicketId } = useSelector((s) => s.chat);
  const [msgInput, setMsgInput] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");

  useEffect(() => { dispatch(fetchTickets(filters)); }, [dispatch, filters]);

  const handleSelectTicket = (ticket) => {
    dispatch(selectTicket(ticket));
    dispatch(fetchMessages(ticket._id));
  };

  const handleSend = async () => {
    if (!msgInput.trim() || !selectedTicket) return;
    await chatService.sendMessage(selectedTicket._id, { content: msgInput, senderType: "agent" });
    setMsgInput("");
    dispatch(fetchMessages(selectedTicket._id));
  };

  const handleAiSuggest = async () => {
    if (!selectedTicket) return;
    try {
      const { data } = await aiService.suggestReply(selectedTicket._id);
      setAiSuggestion(data.suggestion);
    } catch { setAiSuggestion("AI service unavailable"); }
  };

  const handleStatusChange = async (status) => {
    if (!selectedTicket) return;
    await ticketService.update(selectedTicket._id, { status });
    dispatch(fetchTickets(filters));
  };

  const ticketMessages = selectedTicket ? (messages[selectedTicket._id] || []) : [];

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main" style={{ display: "flex", flexDirection: "row", overflow: "hidden" }}>
        {/* Panel 1: Ticket List */}
        <div style={{ width: 320, borderRight: "1px solid #e5e5e5", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "16px", borderBottom: "1px solid #e5e5e5" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Tickets</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <select className="input" style={{ flex: 1 }} value={filters.status} onChange={(e) => dispatch(setFilters({ status: e.target.value }))}>
                <option value="">All Status</option>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {tickets.map((t) => (
              <div
                key={t._id}
                onClick={() => handleSelectTicket(t)}
                style={{
                  padding: "12px 16px", borderBottom: "1px solid #f0f0f0", cursor: "pointer",
                  background: selectedTicket?._id === t._id ? "#f5f5f5" : "#fff",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{t.subject}</div>
                <div style={{ fontSize: 12, color: "#737373", display: "flex", justifyContent: "space-between" }}>
                  <span>{t.customer?.name}</span>
                  <span className={`badge badge-${t.status}`}>{STATUS_LABELS[t.status]}</span>
                </div>
              </div>
            ))}
            {tickets.length === 0 && <div style={{ padding: 24, textAlign: "center", color: "#999", fontSize: 13 }}>No tickets found</div>}
          </div>

          <div style={{ padding: 8, borderTop: "1px solid #e5e5e5", fontSize: 12, color: "#999", textAlign: "center" }}>
            {pagination.total} tickets · Page {pagination.page}
          </div>
        </div>

        {/* Panel 2: Chat / Conversation */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {selectedTicket ? (
            <>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e5e5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{selectedTicket.subject}</div>
                  <div style={{ fontSize: 12, color: "#737373" }}>{selectedTicket.customer?.name} · {selectedTicket.customer?.email}</div>
                </div>
                <button className="btn btn-sm" onClick={handleAiSuggest}>✨ AI Suggest</button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {ticketMessages.map((m, i) => (
                  <div key={i} style={{
                    padding: "8px 14px", borderRadius: 8, maxWidth: "75%", fontSize: 14,
                    background: m.senderType === "agent" ? "#1a1a1a" : "#f5f5f5",
                    color: m.senderType === "agent" ? "#fff" : "#1a1a1a",
                    alignSelf: m.senderType === "agent" ? "flex-end" : "flex-start",
                  }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(m.content) }} />
                ))}
              </div>

              {aiSuggestion && (
                <div style={{ padding: "8px 16px", background: "#fffde7", borderTop: "1px solid #e5e5e5", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>✨ {aiSuggestion}</span>
                  <button className="btn btn-sm" onClick={() => { setMsgInput(aiSuggestion); setAiSuggestion(""); }}>Use</button>
                </div>
              )}

              <div style={{ padding: 12, borderTop: "1px solid #e5e5e5", display: "flex", gap: 8 }}>
                <input className="input" value={msgInput} onChange={(e) => setMsgInput(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => e.key === "Enter" && handleSend()} />
                <button className="btn btn-primary" onClick={handleSend}>Send</button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
              Select a ticket to view conversation
            </div>
          )}
        </div>

        {/* Panel 3: Ticket Detail */}
        {selectedTicket && (
          <div style={{ width: 280, borderLeft: "1px solid #e5e5e5", padding: 16, overflowY: "auto", flexShrink: 0 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Ticket Details</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
              <div>
                <div style={{ color: "#737373", marginBottom: 2 }}>Status</div>
                <select className="input" value={selectedTicket.status} onChange={(e) => handleStatusChange(e.target.value)}>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <div style={{ color: "#737373", marginBottom: 2 }}>Priority</div>
                <div className={`badge`}>{selectedTicket.priority}</div>
              </div>
              <div>
                <div style={{ color: "#737373", marginBottom: 2 }}>Category</div>
                <div>{selectedTicket.category || "Uncategorized"}</div>
              </div>
              <div>
                <div style={{ color: "#737373", marginBottom: 2 }}>Assigned To</div>
                <div>{selectedTicket.assignedTo?.name || "Unassigned"}</div>
              </div>
              <div>
                <div style={{ color: "#737373", marginBottom: 2 }}>Created</div>
                <div>{new Date(selectedTicket.createdAt).toLocaleDateString()}</div>
              </div>
              {selectedTicket.aiConfidence && (
                <div>
                  <div style={{ color: "#737373", marginBottom: 2 }}>AI Confidence</div>
                  <div>{(selectedTicket.aiConfidence * 100).toFixed(0)}%</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
