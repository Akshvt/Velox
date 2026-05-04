import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Holds tickets escalated from the customer Chat -> Agent dashboard.
 * Persisted so a fresh agent login still sees pending escalations.
 */
export const useEscalationStore = create(
  persist(
    (set) => ({
      escalations: [], // { id, name, subject, preview, channel, priority, status, createdAt }
      addEscalation: (ticket) =>
        set((s) => ({
          escalations: [
            {
              id: `ESC-${Date.now().toString(36).toUpperCase()}`,
              status: "Open",
              priority: "High",
              channel: "Chat",
              createdAt: Date.now(),
              ...ticket,
            },
            ...s.escalations,
          ],
        })),
      clearEscalations: () => set({ escalations: [] }),
    }),
    { name: "velox.escalations" },
  ),
);
