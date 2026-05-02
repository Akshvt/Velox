import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Zap,
  Star,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@store/authStore";
import { auth as authService } from "@api/services/auth.service";

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const parallaxRef = useParallax();

  const [businessName, setBusinessName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const initialsFor = (n) =>
    n.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!businessName.trim() || !name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in every field.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    authService
      .register({
        businessName: businessName.trim(),
        name: name.trim(),
        email: email.trim(),
        password,
      })
      .then((data) => {
        const apiUser = data?.user ?? {};
        const user = {
          email: apiUser.email || email.trim(),
          role: apiUser.role || "admin",
          name: apiUser.name || name.trim(),
          initials: initialsFor(apiUser.name || name.trim()),
          roleLabel: apiUser.role === "admin" ? "Super Admin" : "Support Agent",
          tenantId: apiUser.tenantId,
        };
        setAuth({ user, accessToken: data?.accessToken || null });
        navigate("/admin", { replace: true });
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message ||
            "Could not create your workspace. Try a different email.",
        );
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <div
      ref={parallaxRef}
      className="relative min-h-screen w-full overflow-hidden"
      style={{ background: "#FAF6E9" }}
    >
      <RegisterMotionStyles />
      <DoodleBackground />

      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
        {/* ===== LEFT - agency hero ===== */}
        <section
          className="relative hidden flex-col justify-between overflow-hidden px-10 pb-10 pt-12 lg:flex xl:px-14"
          style={{ background: "#FAF6E9" }}
        >
          {/* big watermark numeral */}
          <span
            aria-hidden
            className="pointer-events-none absolute right-2 top-2 select-none font-display leading-none tracking-tighter text-black/[0.06] sm:-right-6 sm:top-2"
            style={{ fontSize: "clamp(120px, 18vw, 260px)" }}
          >
            01
          </span>

          {/* top row - index + tag */}
          <div className="relative z-10 flex items-center justify-between">
            <span data-parallax="10" className="inline-flex items-center gap-2.5 rounded-full border-[3px] border-black bg-white px-4 py-2 font-mono text-[13px] uppercase tracking-[0.2em] shadow-[5px_5px_0_0_#000]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#99E885]" />
              Index · 01 / Register
            </span>
            <span
              data-parallax="-14"
              className="inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-white px-4 py-2 font-mono text-[13px] uppercase tracking-[0.18em] shadow-[5px_5px_0_0_#000]"
              style={{ transform: "rotate(2deg)" }}
            >
              <Sparkles size={14} strokeWidth={3} /> v 2.6
            </span>
          </div>

          {/* hero block */}
          <div className="relative z-10">
            <span
              data-parallax="18"
              className="brutal-sticker inline-block"
              style={{ background: "#F7CB46", fontSize: "1rem", padding: "0.6rem 1.15rem", boxShadow: "6px 6px 0 0 #000", transform: "rotate(-2deg)" }}
            >
              ⚡ Get Started - Free Forever
            </span>

            <h1
              className="mt-5 font-display uppercase leading-[0.95] tracking-tight"
              style={{ fontSize: "clamp(48px, 6vw, 84px)" }}
            >
              Join the
              <br />
              <span className="mt-2 inline-block rounded-[14px] border-[3px] border-black bg-mustard px-4 py-1 shadow-[6px_6px_0_0_#000]">
                Velox
              </span>{" "}
              Squad
            </h1>

            <p
              className="mt-6 max-w-[480px] text-[16px] font-semibold leading-snug text-black/70"
            >
              One workspace, every role. Spin up your support team, knowledge base
              and AI agents in under a minute. <span className="bg-mustard px-1">No credit card.</span>
            </p>

            {/* role chips row */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              {[
                { label: "Admin", color: "#F7CB46", r: "-3deg", depth: 22 },
                { label: "Agent", color: "#99E885", r: "2deg", depth: -18 },
                { label: "Designer", color: "#FFC9E0", r: "-2deg", depth: 14 },
                { label: "Developer", color: "#A0D8FF", r: "3deg", depth: -24 },
              ].map((c) => (
                <span
                  key={c.label}
                  data-parallax={c.depth}
                  className="inline-flex items-center gap-2.5 rounded-full border-[3px] border-black px-5 py-2.5 font-display text-[16px] uppercase tracking-wide shadow-[6px_6px_0_0_#000]"
                  style={{ background: c.color, transform: `rotate(${c.r})` }}
                >
                  <span className="h-2 w-2 rounded-full bg-black" />
                  {c.label}
                </span>
              ))}
            </div>
          </div>

          {/* bottom row - stats + spinning star */}
          <div className="relative z-10 mt-10 flex items-end justify-between gap-6">
            <div className="grid grid-cols-3 gap-4 text-left">
              <Stat n="12k+" label="Teams onboarded" bg="#FFE9A8" />
              <Stat n="60s" label="Avg. setup" bg="#D9C7FF" />
              <Stat n="4.9★" label="Rated by ops" bg="#A0D8FF" />
            </div>

            <div className="relative shrink-0" data-parallax="-30">
              <div
                className="flex h-[140px] w-[140px] items-center justify-center rounded-full border-[3px] border-black shadow-[8px_8px_0_0_#000]"
                style={{ background: "#F7CB46" }}
              >
                <svg viewBox="0 0 200 200" className="absolute inset-0">
                  <defs>
                    <path
                      id="reg-circle"
                      d="M 100,100 m -76,0 a 76,76 0 1,1 152,0 a 76,76 0 1,1 -152,0"
                    />
                  </defs>
                  <text className="font-display uppercase" fontSize="20" fontWeight="800" letterSpacing="4">
                    <textPath href="#reg-circle">
                      ★ Sign Up · Sign Up · Sign Up · Sign Up ·
                    </textPath>
                  </text>
                </svg>
              </div>
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-black bg-black p-2 text-mustard shadow-[3px_3px_0_0_#000]"
              >
                <Star size={20} strokeWidth={3} className="fill-mustard text-mustard" />
              </div>
            </div>
          </div>
        </section>

        {/* ===== RIGHT - form ===== */}
        <section className="relative flex items-center justify-center px-5 py-10 sm:px-8" style={{ background: "#FAF6E9" }}>
          {/* logo top-right of right pane */}
          <Link
            to="/"
            className="absolute right-5 top-5 inline-flex w-fit items-center gap-2 rounded-full border-[3px] border-black bg-white px-4 py-2 shadow-[4px_4px_0_0_#000] transition-transform hover:-translate-y-0.5 sm:right-8 sm:top-8"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-[10px] border-[3px] border-black bg-mustard">
              <Zap size={12} strokeWidth={3} />
            </span>
            <span className="font-display text-base tracking-tight">Velox</span>
          </Link>

          {/* floating decorative shapes around card */}
          <span
            aria-hidden
            data-parallax="30"
            className="pointer-events-none absolute left-6 top-24 hidden h-14 w-14 rounded-[14px] border-[3px] border-black shadow-[5px_5px_0_0_#000] sm:block"
            style={{ background: "#99E885", transform: "rotate(14deg)" }}
          />
          <span
            aria-hidden
            data-parallax="-22"
            className="pointer-events-none absolute bottom-20 left-10 hidden h-10 w-10 rounded-full border-[3px] border-black shadow-[4px_4px_0_0_#000] sm:block"
            style={{ background: "#FFC9E0", transform: "rotate(-12deg)" }}
          />

          <div className="relative w-full max-w-[520px]">
            <span
              data-parallax="20"
              className="brutal-sticker absolute -left-4 -top-7 z-10"
              style={{ background: "#99E885", fontSize: "1.05rem", padding: "0.6rem 1.15rem", boxShadow: "6px 6px 0 0 #000", transform: "rotate(-6deg)" }}
            >
              ✨ Try It Free
            </span>
            <span
              data-parallax="-16"
              className="absolute -right-3 -top-5 z-10 inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-white px-3.5 py-1.5 font-mono text-[13px] uppercase tracking-[0.18em] shadow-[5px_5px_0_0_#000]"
              style={{ transform: "rotate(5deg)" }}
            >
              <span className="h-2 w-2 rounded-full bg-[#99E885]" /> Live
            </span>

            <div className="rounded-[28px] border-[3px] border-black bg-white p-7 shadow-[10px_10px_0_0_#000] sm:p-9">
              <h2 className="font-display uppercase leading-[0.92] tracking-tight" style={{ fontSize: "clamp(34px, 4.2vw, 46px)" }}>
                Create your
                <br />
                <span className="mt-2 inline-block rounded-[16px] border-[3px] border-black bg-mustard px-3 py-1 shadow-[5px_5px_0_0_#000]">
                  Account
                </span>
              </h2>
              <p className="mt-3 text-[13.5px] font-semibold text-black/65">
                Sign up free - no credit card needed.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <BrutalField
                  label="Business name"
                  icon={Building2}
                  type="text"
                  placeholder="Acme Inc."
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />

                <BrutalField
                  label="Your name"
                  icon={User}
                  type="text"
                  autoComplete="name"
                  placeholder="Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <BrutalField
                  label="Work email"
                  icon={Mail}
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <BrutalField
                  label="Password"
                  icon={Lock}
                  type={showPwd ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="rounded-full p-1 text-black/55 hover:text-black"
                      aria-label={showPwd ? "Hide password" : "Show password"}
                    >
                      {showPwd ? (
                        <EyeOff size={15} strokeWidth={2.5} />
                      ) : (
                        <Eye size={15} strokeWidth={2.5} />
                      )}
                    </button>
                  }
                />

                {error && (
                  <p className="rounded-[12px] border-[3px] border-black bg-[#FFC9E0] px-3 py-2 text-[12.5px] font-semibold shadow-[3px_3px_0_0_#000]">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border-[3px] border-black bg-mustard px-6 py-4 text-[16px] font-bold uppercase tracking-wider shadow-[6px_6px_0_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0_0_#000] disabled:opacity-60"
                >
                  {submitting ? "Creating workspace…" : "Try It Free"}
                  <ArrowRight
                    size={18}
                    strokeWidth={3}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>

                <p className="pt-2 text-center text-[12.5px] font-semibold text-black/65">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-black underline decoration-[3px] underline-offset-4 hover:bg-mustard"
                  >
                    Log in
                  </Link>
                </p>
              </form>
            </div>

            <span
              aria-hidden
              data-parallax="-26"
              className="absolute -bottom-5 -right-3 hidden h-12 w-12 rounded-[10px] border-[3px] border-black shadow-[4px_4px_0_0_#000] sm:block"
              style={{ background: "#A0D8FF", transform: "rotate(18deg)" }}
            />
            <span
              aria-hidden
              data-parallax="20"
              className="absolute -bottom-7 right-12 hidden h-7 w-16 rounded-full border-[3px] border-black sm:block"
              style={{ background: "#D9C7FF", transform: "rotate(-12deg)" }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------------- subcomponents ---------------- */

function Stat({ n, label, bg }) {
  return (
    <div
      className="rounded-[16px] border-[3px] border-black px-4 py-3 shadow-[6px_6px_0_0_#000]"
      style={{ background: bg }}
    >
      <div className="font-display text-[30px] leading-none">{n}</div>
      <div className="mt-1.5 text-[12px] font-bold uppercase tracking-wider text-black/70">
        {label}
      </div>
    </div>
  );
}

function RegisterMotionStyles() {
  return (
    <style>{`
      [data-parallax] {
        will-change: transform;
      }
      .reg-stroke {
        -webkit-text-stroke: 2px #000;
        color: transparent;
      }
      @media (prefers-reduced-motion: reduce) {
        [data-parallax] { transform: none !important; }
      }
    `}</style>
  );
}

function useParallax() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const nodes = Array.from(root.querySelectorAll("[data-parallax]"));
    const baseTransforms = new WeakMap();
    const state = new WeakMap(); // current x,y per node
    nodes.forEach((n) => {
      baseTransforms.set(n, n.style.transform || "");
      state.set(n, { cx: 0, cy: 0, tx: 0, ty: 0 });
    });

    let mouseX = -9999;
    let mouseY = -9999;
    let rafId = 0;
    let running = false;

    // tuning
    const RADIUS = 160;       // px - how close before it starts pushing
    const MAX_PUSH = 60;      // px - strongest displacement
    const EASE = 0.18;        // 0..1 - higher = snappier follow

    function onMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!running) {
        running = true;
        rafId = requestAnimationFrame(tick);
      }
    }
    function onLeave() {
      mouseX = -9999;
      mouseY = -9999;
      if (!running) {
        running = true;
        rafId = requestAnimationFrame(tick);
      }
    }

    function tick() {
      let stillMoving = false;
      nodes.forEach((n) => {
        const rect = n.getBoundingClientRect();
        const ncx = rect.left + rect.width / 2;
        const ncy = rect.top + rect.height / 2;
        const dx = ncx - mouseX;
        const dy = ncy - mouseY;
        const dist = Math.hypot(dx, dy);

        const strength = parseFloat(n.dataset.parallax) || 1; // per-node multiplier
        const factor = strength < 0 ? -1 : 1;
        const mag = Math.min(Math.abs(strength) / 25, 1.5); // depth scaling

        let tx = 0;
        let ty = 0;
        if (dist < RADIUS && dist > 0.001) {
          const force = (1 - dist / RADIUS) * MAX_PUSH * mag * factor;
          tx = (dx / dist) * force;
          ty = (dy / dist) * force;
        }

        const s = state.get(n);
        s.tx = tx;
        s.ty = ty;
        s.cx += (s.tx - s.cx) * EASE;
        s.cy += (s.ty - s.cy) * EASE;

        if (Math.abs(s.cx - s.tx) > 0.05 || Math.abs(s.cy - s.tx) > 0.05) {
          stillMoving = true;
        }

        const base = baseTransforms.get(n) || "";
        n.style.transform = `translate3d(${s.cx.toFixed(2)}px, ${s.cy.toFixed(2)}px, 0) ${base}`.trim();
      });

      if (stillMoving || mouseX > -9000) {
        rafId = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      if (rafId) cancelAnimationFrame(rafId);
      nodes.forEach((n) => {
        n.style.transform = baseTransforms.get(n) || "";
      });
    };
  }, []);
  return ref;
}

function BrutalField({ label, icon: Icon, trailing, ...rest }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-black/65">
        {label}
      </span>
      <span className="flex items-center gap-2 rounded-full border-[3px] border-black bg-white px-3.5 py-3 shadow-[3px_3px_0_0_#000] transition-all focus-within:-translate-y-0.5 focus-within:shadow-[5px_5px_0_0_#000]">
        <Icon size={15} strokeWidth={2.5} className="text-black/55" />
        <input
          {...rest}
          className="w-full bg-transparent text-[14px] font-semibold placeholder:font-medium placeholder:text-black/35 focus:outline-none"
        />
        {trailing}
      </span>
    </label>
  );
}

function DoodleBackground() {
  return (
    <>
      <Star className="pointer-events-none absolute left-6 top-24 h-6 w-6 -rotate-12 fill-mustard" strokeWidth={3} />
      <Star className="pointer-events-none absolute right-10 top-10 h-7 w-7 rotate-12 fill-[#FFC9E0]" strokeWidth={3} />
      <Star className="pointer-events-none absolute bottom-12 left-12 h-5 w-5 fill-[#A0D8FF]" strokeWidth={3} />

      <svg
        className="pointer-events-none absolute right-[18%] top-[14%] h-8 w-8 rotate-[18deg]"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          d="M14 2 L22 10 L17 11 L13 19 L11 17 L4 20 L7 13 L5 11 L13 7 Z"
          fill="#F7CB46"
          stroke="#000"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>

      <svg
        className="pointer-events-none absolute bottom-[18%] right-[22%] h-16 w-16 opacity-70"
        viewBox="0 0 64 64"
        aria-hidden
      >
        <path
          d="M8 32 C 8 16, 28 8, 40 18 C 50 26, 38 38, 28 36 C 20 34, 22 26, 30 26"
          fill="none"
          stroke="#000"
          strokeWidth="2.5"
          strokeDasharray="3 5"
          strokeLinecap="round"
        />
      </svg>
    </>
  );
}
