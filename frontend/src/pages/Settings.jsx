import { useEffect, useState } from "react";
import {
  Palette,
  Moon,
  Sun,
  Sparkles,
  Rocket,
  Check,
  Monitor,
  Workflow,
  ChevronRight,
  Lightbulb,
  Stars,
  Flame,
  LineChart,
  Compass,
} from "lucide-react";
import AppShell from "@layouts/AppShell.jsx";

/* ────────────────────────────────────────────────────────────────────── */
/* Theme hook                                                             */
/* ────────────────────────────────────────────────────────────────────── */

const THEME_KEY = "velox.theme";

function applyTheme(mode) {
  const root = document.documentElement;
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = mode === "dark" || (mode === "system" && prefersDark);
  root.classList.toggle("dark", isDark);
  root.dataset.theme = mode;
  root.style.colorScheme = isDark ? "dark" : "light";
}

function useTheme() {
  const [mode, setMode] = useState(() => {
    if (typeof window === "undefined") return "light";
    return window.localStorage.getItem(THEME_KEY) || "system";
  });

  useEffect(() => {
    applyTheme(mode);
    window.localStorage.setItem(THEME_KEY, mode);
  }, [mode]);

  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [mode]);

  return [mode, setMode];
}

/* ────────────────────────────────────────────────────────────────────── */
/* Page                                                                   */
/* ────────────────────────────────────────────────────────────────────── */

export default function Settings() {
  const [tab, setTab] = useState("theme");

  return (
    <AppShell
      variant="scroll"
      active="settings"
      title="Settings"
      subtitle="Pick your theme · and see what we'll work on in the future"
      actions={
        <button
          onClick={() => setTab("future")}
          className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" /> Future scope
        </button>
      }
    >
      {/* Top tabs */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {[
          { k: "theme", label: "Theme", icon: Palette },
          { k: "future", label: "Future Scope", icon: Rocket },
        ].map((t) => {
          const Icon = t.icon;
          const active = tab === t.k;
          return (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ring-1 transition ${
                active
                  ? "bg-black text-white ring-black"
                  : "bg-white text-neutral-700 ring-black/15 hover:bg-neutral-50"
              }`}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "theme" ? <ThemePane /> : <FutureScope />}

      {/* Footer workflow strip */}
      <div className="mt-6">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            <h3 className="font-display text-sm uppercase tracking-wider text-neutral-700">
              Roadmap Workflow
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { icon: Lightbulb, label: "Ideate", tone: "bg-[#FFF5DC] text-[#5a3f00]" },
              { icon: Stars, label: "Vote", tone: "bg-[#F1ECFF] text-[#3a2a8a]" },
              { icon: Rocket, label: "Build", tone: "bg-[#E9F5E0] text-[#1d4d10]" },
              { icon: Flame, label: "Ship", tone: "bg-[#FCE7F3] text-[#7a1750]" },
              { icon: LineChart, label: "Measure", tone: "bg-[#EDEDEA] text-[#2b2b29]" },
              { icon: Compass, label: "Iterate", tone: "bg-[#FFF5DC] text-[#5a3f00]" },
            ].map((s, i, arr) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-2">
                  <div
                    className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold ring-1 ring-black/10 ${s.tone}`}
                  >
                    <Icon className="h-3.5 w-3.5" /> {s.label}
                  </div>
                  {i < arr.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Theme pane - clean grid + accent picker                                */
/* ────────────────────────────────────────────────────────────────────── */

function ThemePane() {
  const [mode, setMode] = useTheme();
  const [accent, setAccent] = useState("#7C5CFF");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <SectionTitle icon={Palette} title="Theme" />
        <div className="grid grid-cols-3 gap-3">
          {[
            { k: "light", label: "Light", icon: Sun },
            { k: "dark", label: "Dark", icon: Moon },
            { k: "system", label: "System", icon: Monitor },
          ].map((t) => {
            const Icon = t.icon;
            const active = mode === t.k;
            return (
              <button
                key={t.k}
                onClick={() => setMode(t.k)}
                className={`relative flex flex-col items-center gap-2 rounded-2xl p-4 ring-1 transition ${
                  active
                    ? "bg-black text-white ring-black"
                    : "bg-white text-neutral-700 ring-black/15 hover:bg-neutral-50"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-semibold">{t.label}</span>
                {active && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-neutral-500">
          Saved to this browser. System follows your OS automatically.
        </p>
      </Card>

      <Card>
        <SectionTitle icon={Sparkles} title="Accent colour" />
        <div className="flex flex-wrap gap-3">
          {[
            { c: "#7C5CFF", n: "Lilac" },
            { c: "#3FA02A", n: "Mint" },
            { c: "#C28A00", n: "Mustard" },
            { c: "#D63384", n: "Pink" },
            { c: "#111111", n: "Ink" },
          ].map((s) => {
            const active = accent === s.c;
            return (
              <button
                key={s.n}
                onClick={() => setAccent(s.c)}
                className={`flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold ring-1 ring-black/10 ${
                  active
                    ? "outline outline-2 outline-offset-2 outline-black"
                    : ""
                }`}
              >
                <span
                  className="h-4 w-4 rounded-full ring-1 ring-black/10"
                  style={{ background: s.c }}
                />
                {s.n}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-neutral-500">
          A taste of personality across pills, charts and highlights.
        </p>
      </Card>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Future Scope - just the text                                           */
/* ────────────────────────────────────────────────────────────────────── */

function FutureScope() {
  return (
    <div className="relative overflow-hidden rounded-[28px] ring-1 ring-black/15">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F1ECFF] via-[#E9F5E0] to-[#FFF5DC]" />
      <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#7C5CFF]/20 blur-3xl" />
      <div className="absolute -bottom-12 -left-8 h-56 w-56 rounded-full bg-[#3FA02A]/20 blur-3xl" />
      <div className="relative flex flex-col items-center justify-center px-6 py-20 text-center md:py-28">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-700 ring-1 ring-black/10 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" /> Future Scope
        </div>
        <h2 className="font-display mt-4 text-3xl uppercase tracking-tight text-neutral-900 md:text-5xl">
          We'll work on these in the <span className="text-[#7C5CFF]">future</span>.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-700 md:text-base">
          This is future scope only.
        </p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Tiny shared bits                                                       */
/* ────────────────────────────────────────────────────────────────────── */

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-[20px] bg-white p-5 ring-1 ring-black/10 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Icon className="h-4 w-4" />
      <h3 className="font-display text-sm uppercase tracking-wider text-neutral-700">
        {title}
      </h3>
    </div>
  );
}
