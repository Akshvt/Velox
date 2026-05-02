import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ExternalLink,
  HelpCircle,
  Keyboard,
  LifeBuoy,
  MessageSquare,
  Sparkles,
  X,
} from "lucide-react";

/**
 * HelpMenu - help/support dropdown.
 *
 * Backend-ready:
 *  - Replace the static `LINKS` array with a fetched help-center index if needed.
 *  - "Contact support" can be wired to a real /api/support/contact endpoint
 *    (e.g. open Intercom / Zendesk widget).
 *  - "Keyboard shortcuts" opens a local modal - no backend.
 */

const LINKS = [
  { key: "docs",      label: "Documentation",     desc: "Guides, API, integrations",          Icon: BookOpen,      href: "https://velox.example.com/docs",   external: true,  bg: "#F1ECFF", color: "#7C5CFF" },
  { key: "shortcuts", label: "Keyboard shortcuts", desc: "Move faster across the app",        Icon: Keyboard,      action: "shortcuts",                      external: false, bg: "#FFF5DC", color: "#C28A00" },
  { key: "contact",   label: "Contact support",   desc: "We usually reply within an hour",    Icon: LifeBuoy,      to: "/chat",                              external: false, bg: "#E9F5E0", color: "#3FA02A" },
  { key: "feedback",  label: "Send feedback",     desc: "Tell us what to build next",         Icon: MessageSquare, href: "mailto:feedback@velox.example.com",external: true,  bg: "#FCE7F3", color: "#D63384" },
  { key: "whats",     label: "What's new",        desc: "Latest releases & improvements",     Icon: Sparkles,      href: "https://velox.example.com/changelog", external: true, bg: "#E6F4FF", color: "#1F7AE0" },
];

const SHORTCUTS = [
  { keys: ["⌘", "K"],     label: "Open quick search" },
  { keys: ["G", "D"],     label: "Go to Dashboard" },
  { keys: ["G", "T"],     label: "Go to Tickets" },
  { keys: ["G", "A"],     label: "Go to Analytics" },
  { keys: ["N"],          label: "New ticket / message" },
  { keys: ["R"],          label: "Reply to current ticket" },
  { keys: ["E"],          label: "Mark resolved" },
  { keys: ["?"],          label: "Show this help" },
  { keys: ["Esc"],        label: "Close panel / dialog" },
];

export default function HelpMenu() {
  const [open, setOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // ?-key opens the menu
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target?.isContentEditable) return;
      if (e.key === "?" && !shortcutsOpen) {
        e.preventDefault();
        setShortcutsOpen(true);
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcutsOpen]);

  // ESC closes the shortcuts modal
  useEffect(() => {
    if (!shortcutsOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setShortcutsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcutsOpen]);

  return (
    <>
      <div ref={wrapRef} className="relative hidden sm:block">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Help"
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-black/15 transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
        >
          <HelpCircle size={16} strokeWidth={2.5} />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-12 z-50 w-[320px] overflow-hidden rounded-[20px] bg-white shadow-[0_18px_44px_-12px_rgba(28,28,40,0.22)] ring-1 ring-black/10"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
              <span className="font-display text-[14px] uppercase tracking-wide">Help & Support</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded-full text-black/55 hover:bg-[#FAFAF6]"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>

            {/* links */}
            <ul className="max-h-[60vh] divide-y divide-black/5 overflow-y-auto">
              {LINKS.map((l) => {
                const Icon = l.Icon;
                const inner = (
                  <div className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[#FAFAF6]">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                      style={{ background: l.bg, color: l.color }}
                    >
                      <Icon size={15} strokeWidth={2.5} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-bold">{l.label}</span>
                        {l.external && <ExternalLink size={11} strokeWidth={2.5} className="text-black/40" />}
                      </div>
                      <p className="mt-0.5 text-[11.5px] font-medium leading-snug text-black/55">{l.desc}</p>
                    </div>
                  </div>
                );

                if (l.action === "shortcuts") {
                  return (
                    <li key={l.key}>
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          setShortcutsOpen(true);
                        }}
                        className="block w-full text-left"
                      >
                        {inner}
                      </button>
                    </li>
                  );
                }
                if (l.to) {
                  return (
                    <li key={l.key}>
                      <Link to={l.to} onClick={() => setOpen(false)} className="block">
                        {inner}
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={l.key}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setOpen(false)}
                      className="block"
                    >
                      {inner}
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* footer */}
            <div className="border-t border-black/5 px-4 py-2.5 text-center text-[11px] font-medium text-black/45">
              Velox v2.6 ·{" "}
              <a
                href="https://velox.example.com/status"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#3FA02A] hover:underline"
              >
                All systems operational
              </a>
            </div>
          </div>
        )}
      </div>

      {/* keyboard shortcuts modal */}
      {shortcutsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setShortcutsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[480px] overflow-hidden rounded-[24px] bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.4)] ring-1 ring-black/10"
          >
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "#FFF5DC", color: "#C28A00" }}>
                  <Keyboard size={15} strokeWidth={2.5} />
                </span>
                <span className="font-display text-[16px] uppercase tracking-wide">Keyboard shortcuts</span>
              </div>
              <button
                type="button"
                onClick={() => setShortcutsOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-black/55 hover:bg-[#FAFAF6]"
              >
                <X size={15} strokeWidth={2.5} />
              </button>
            </div>
            <ul className="max-h-[60vh] divide-y divide-black/5 overflow-y-auto">
              {SHORTCUTS.map((s) => (
                <li key={s.label} className="flex items-center justify-between gap-4 px-5 py-3">
                  <span className="text-[13px] font-medium text-black/75">{s.label}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    {s.keys.map((k, i) => (
                      <kbd
                        key={i}
                        className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-md border border-black/15 bg-[#FAFAF6] px-1.5 font-mono text-[11px] font-bold text-black/70"
                      >
                        {k}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-black/5 px-5 py-3 text-center text-[11px] font-medium text-black/45">
              Press <kbd className="mx-1 inline-flex h-5 items-center rounded border border-black/15 bg-[#FAFAF6] px-1.5 font-mono text-[10px] font-bold">Esc</kbd> to close
            </div>
          </div>
        </div>
      )}
    </>
  );
}
