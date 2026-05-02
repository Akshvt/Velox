import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Sparkles,
  Code2,
  HelpCircle,
  Server,
  Layout,
  Cloud,
} from "lucide-react";

// Team headshots — bg-removed PNGs so hair/silhouette overflow the card frame.
import mayankPhoto from "@/assets/team/Mayank Roy Background Removed.png";
import arvPhoto from "@/assets/team/arv3 Background Removed.png";
import lucyPhoto from "@/assets/team/lucy Background Removed.png";
// Decor stickers — neo-pop overlays
import fistPencil from "@/assets/decor/WhatsApp Image 2026-05-02 at 1.52.29 PM Background Removed.png";
import handDecor from "@/assets/decor/hand.png";
import lucyDecor from "@/assets/decor/lucy.png";
import firstCardDecor from "@/assets/decor/first-card.png";

gsap.registerPlugin(ScrollTrigger);

/* =============================================================
   TEAM SECTION
   3 music-player style intro cards. Cards start flipped (back
   side, "?") and flip to reveal the engineer one-by-one as the
   user scrolls through the section.
   Replace `members[].photo` URLs with the real headshots.
   ============================================================= */

const members = [
  {
    name: "Mayank Roy",
    handle: "@mayankroy",
    role: "Full-Stack Software Engineer",
    tagline: "backend whisperer fr — talks to APIs in his sleep, ships the UI between sips.",
    specialty: "Backend lead",
    icon: Server,
    chips: ["Backend", "APIs", "Full-stack"],
    cardBg: "#99E885", // mint green
    photo: mayankPhoto,
    accent: "#000",
    sticker: fistPencil, // neo-pop overlay (top-right)
    extras: [
      {
        src: firstCardDecor,
        className:
          "-left-12 -top-10 h-28 w-28 -rotate-[14deg] sm:h-32 sm:w-32",
      },
    ],
  },
  {
    name: "Atharv",
    handle: "@atharv",
    role: "Full-Stack Software Engineer",
    tagline: "system design lead — diagrams the whole vibe, then makes the UI actually slap.",
    specialty: "System design + UI",
    icon: Layout,
    chips: ["System Design", "Frontend", "Full-stack"],
    cardBg: "#7C5CFF", // purple/blue
    photo: arvPhoto,
    accent: "#fff",
    photoScale: 168,
    photoOffset: 4,
    decor: "arv",
    extras: [
      {
        src: handDecor,
        className:
          "-right-14 top-4 h-32 w-32 rotate-[18deg] sm:h-36 sm:w-36",
      },
    ],
  },
  {
    name: "Akshat",
    handle: "@akshat",
    role: "Full-Stack Software Engineer",
    tagline: "deploys at 3am, no cap — keeps the cluster breathing while the rest of us sleep.",
    specialty: "Backend + Deploy",
    icon: Cloud,
    chips: ["Backend", "Deploy", "Full-stack"],
    cardBg: "#FFC9E0", // pink
    photo: lucyPhoto,
    accent: "#000",
    sticker: lucyDecor,
  },
];

export default function TeamSection() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray(".team-card");
      if (!cards.length) return;

      // Use gsap.matchMedia so each breakpoint owns its own
      // animation tree — when the viewport crosses 768px the
      // matching block reverts and the other one runs. This
      // prevents a stale ScrollTrigger pin from trapping the
      // user on the first card after a resize.
      const mm = gsap.matchMedia();

      // -------- MOBILE / TABLET (< 768px) --------
      // No pin. Cards render face-up and stack normally so the
      // user can scroll past all three.
      mm.add("(max-width: 767px)", () => {
        cards.forEach((card) => {
          const inner = card.querySelector(".team-card-inner");
          gsap.set(inner, {
            rotationY: 0,
            transformPerspective: 1200,
            transformStyle: "preserve-3d",
            clearProps: "transform",
          });
          gsap.set(inner, { rotationY: 0 });
          gsap.set(card, { clearProps: "transform" });
        });
        cards.forEach((card, i) => {
          gsap.to(card, {
            y: -6,
            duration: 2.4 + i * 0.2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: i * 0.4,
          });
        });
      });

      // -------- DESKTOP (>= 768px) --------
      mm.add("(min-width: 768px)", () => {
        cards.forEach((card) => {
          const inner = card.querySelector(".team-card-inner");
          gsap.set(inner, {
            rotationY: 180,
            transformPerspective: 1200,
            transformStyle: "preserve-3d",
          });
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top+=40",
            end: "+=2600",
            scrub: 1.6,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            pinType: "transform",
            invalidateOnRefresh: true,
          },
        });

        cards.forEach((card, i) => {
          const inner = card.querySelector(".team-card-inner");
          tl.to(
            inner,
            {
              rotationY: 0,
              duration: 1,
              ease: "power3.inOut",
            },
            0.4 + i * 1.6,
          );
        });

        cards.forEach((card, i) => {
          gsap.to(card, {
            y: -6,
            duration: 2.4 + i * 0.2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: i * 0.4,
          });
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative mx-auto mt-20 w-full max-w-7xl px-4 py-10 sm:mt-24 md:flex md:h-screen md:flex-col md:justify-center md:gap-6 md:py-6"
      aria-label="The team behind Velox"
    >
      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border-[3px] border-black bg-mint px-3 py-1 text-[12px] font-bold uppercase shadow-[3px_3px_0_0_#000]">
          <Code2 size={12} strokeWidth={3.5} /> Built by 3 engineers
        </span>
        <h2 className="mt-3 font-display text-3xl uppercase leading-[0.9] sm:text-4xl md:text-5xl">
          Meet the
          <br className="sm:hidden" />{" "}
          software engineers.
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-[13px] font-medium text-black/70">
          Three full-stack engineers shipping every line of Velox.
        </p>
      </div>

      {/* Cards grid — stacks on mobile, 3-up on md+ */}
      <div className="mt-10 flex flex-col items-center gap-12 sm:gap-10 md:mt-0 md:min-h-0 md:flex-1 md:grid md:grid-cols-3 md:items-center md:gap-6 md:pt-16">
        {members.map((m) => (
          <TeamCard key={m.handle} member={m} />
        ))}
      </div>

      {/* Hint — desktop only (mobile users just scroll) */}
      <p className="mt-8 hidden items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wide text-black/50 md:flex">
        <Sparkles size={11} strokeWidth={3} /> scroll slowly — cards reveal one-by-one
      </p>
    </section>
  );
}

/* ============================================================= */
function TeamCard({ member }) {
  const cardRef = useRef(null);

  // Magnetic repel — decorative elements push away from the cursor
  // smoothly while preserving each element's static rotation.
  useGSAP(
    () => {
      const card = cardRef.current;
      if (!card) return;
      const nodes = card.querySelectorAll("[data-magnet]");
      if (!nodes.length) return;

      const items = Array.from(nodes).map((el) => {
        // Parse the existing tailwind rotate (e.g. -rotate-[18deg] / rotate-[10deg])
        // Use getAttribute because SVG.className is an SVGAnimatedString, not a string.
        const cls = el.getAttribute("class") || "";
        const m = cls.match(/(-)?rotate-\[(-?\d+(?:\.\d+)?)deg\]/);
        let rotation = 0;
        if (m) {
          rotation = parseFloat(m[2]);
          if (m[1] === "-") rotation = -rotation;
        }
        gsap.set(el, { rotation, x: 0, y: 0, force3D: true });
        return {
          el,
          qx: gsap.quickTo(el, "x", { duration: 0.7, ease: "power3.out" }),
          qy: gsap.quickTo(el, "y", { duration: 0.7, ease: "power3.out" }),
        };
      });

      const RADIUS = 180;
      const STRENGTH = 32;

      const onMove = (e) => {
        const cx = e.clientX;
        const cy = e.clientY;
        items.forEach(({ el, qx, qy }) => {
          const r = el.getBoundingClientRect();
          const ex = r.left + r.width / 2;
          const ey = r.top + r.height / 2;
          const dx = ex - cx;
          const dy = ey - cy;
          const dist = Math.hypot(dx, dy);
          if (dist < RADIUS && dist > 0.001) {
            const force = (1 - dist / RADIUS) * STRENGTH;
            const ang = Math.atan2(dy, dx);
            qx(Math.cos(ang) * force);
            qy(Math.sin(ang) * force);
          } else {
            qx(0);
            qy(0);
          }
        });
      };
      const onLeave = () => {
        items.forEach(({ qx, qy }) => {
          qx(0);
          qy(0);
        });
      };

      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
      return () => {
        card.removeEventListener("mousemove", onMove);
        card.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope: cardRef },
  );

  return (
    <div
      ref={cardRef}
      className="team-card relative mx-auto h-full w-full max-w-[330px] [perspective:1400px]"
    >
      {/* Flip container */}
      <div
        className="team-card-inner relative mx-auto w-full [transform-style:preserve-3d]"
        style={{ aspectRatio: "4 / 5", maxHeight: "min(72vh, 580px)" }}
      >
        {/* Neo-pop sticker overlay (e.g. fist+pencil on first card) — front only */}
        {member.sticker && (
          <img
            src={member.sticker}
            alt=""
            aria-hidden
            data-magnet
            className="pointer-events-none absolute -right-16 -top-20 z-30 h-32 w-32 -rotate-[18deg] select-none drop-shadow-[4px_4px_0_rgba(0,0,0,0.85)] [backface-visibility:hidden] sm:h-40 sm:w-40"
          />
        )}

        {/* Decorative shape stickers (per-card) — placed ON the photo, front only */}
        {member.decor === "arv" && (
          <BurstSticker
            data-magnet
            className="pointer-events-none absolute left-6 top-16 z-30 h-24 w-24 -rotate-[10deg] drop-shadow-[4px_4px_0_rgba(0,0,0,0.85)] [backface-visibility:hidden]"
          />
        )}

        {/* Extra image stickers (per-card) — front only */}
        {member.extras?.map((s, i) => (
          <img
            key={i}
            src={s.src}
            alt=""
            aria-hidden
            data-magnet
            className={`pointer-events-none absolute z-30 select-none drop-shadow-[4px_4px_0_rgba(0,0,0,0.85)] [backface-visibility:hidden] ${s.className}`}
          />
        ))}
        {/* FRONT */}
        <div
          className="absolute inset-0 flex flex-col rounded-[28px] border-[3px] border-black p-3 shadow-[8px_8px_0_0_#000] [backface-visibility:hidden]"
          style={{ background: member.cardBg }}
        >
          {/* Photo well — transparent PNG silhouette overflows the top */}
          <div
            className="relative w-full shrink-0"
            style={{
              aspectRatio: "4 / 2.6",
              clipPath: "inset(-200px 0 0 0 round 22px)",
              WebkitClipPath: "inset(-200px 0 0 0 round 22px)",
            }}
          >
            {/* Sunburst rays behind the head */}
            <Sunburst
              color={hexA(member.cardBg === "#7C5CFF" ? "#fff" : "#000", 0.18)}
            />
            {/* Soft color halo behind the head */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-[-10%] h-[90%] w-[85%] -translate-x-1/2 rounded-full blur-2xl"
              style={{ background: hexA(member.cardBg, 0.7) }}
            />
            {/* Cut-out photo */}
            <img
              src={member.photo}
              alt={member.name}
              loading="lazy"
              className="absolute inset-x-0 bottom-0 mx-auto w-auto max-w-none object-contain"
              style={{
                objectPosition: "center bottom",
                height: `${member.photoScale ?? 150}%`,
                bottom: `${member.photoOffset ?? 0}%`,
              }}
            />
          </div>

          {/* Intro panel */}
          <div
            className="mt-2 flex min-h-0 flex-1 flex-col justify-between gap-2 overflow-hidden"
            style={{ color: member.accent }}
          >
            <div className="min-h-0">
              <div className="text-[10px] font-medium uppercase tracking-wide opacity-80">
                say hi to
              </div>
              <div className="font-display text-xl uppercase leading-[0.95]">
                {member.name}
              </div>
              <div className="text-[11px] font-bold opacity-90">{member.handle}</div>
              <div className="mt-1 line-clamp-2 text-[11px] font-medium leading-snug opacity-90">
                {member.tagline}
              </div>
            </div>

            <div>
              {/* Stack chips */}
              <div className="flex flex-wrap gap-1">
                {member.chips.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center rounded-full border-[2px] border-black px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                    style={{
                      background: hexA(member.accent, 0.12),
                      color: member.accent,
                      borderColor: member.accent,
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>

              {/* Specialty footer */}
              <div
                className="mt-2 flex items-center justify-between rounded-xl border-[2px] px-2 py-1"
                style={{
                  borderColor: member.accent,
                  background: hexA(member.accent, 0.08),
                }}
              >
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide">
                  <member.icon size={11} strokeWidth={3} /> {member.specialty}
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase opacity-80">
                  <Sparkles size={9} strokeWidth={3} /> full-stack
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BACK — neo-pop mystery card */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[28px] border-[3px] border-black bg-cream shadow-[8px_8px_0_0_#000] [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          {/* Dotted grid background */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(rgba(0,0,0,0.18) 1.5px, transparent 1.5px)",
              backgroundSize: "14px 14px",
            }}
          />

          {/* Diagonal stripe band across the middle */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-[-10%] right-[-10%] top-[42%] h-16 -rotate-[8deg] border-y-[3px] border-black"
            style={{
              background: member.cardBg,
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(0,0,0,0.18) 0 6px, transparent 6px 14px)",
            }}
          />

          {/* Yellow burst — top-left corner */}
          <BurstSticker
            data-magnet
            className="absolute -left-6 -top-6 h-24 w-24 -rotate-[12deg] drop-shadow-[3px_3px_0_rgba(0,0,0,0.85)]"
          />

          {/* Pink dot — bottom-left */}
          <div
            aria-hidden
            data-magnet
            className="absolute bottom-6 left-5 h-10 w-10 rounded-full border-[3px] border-black shadow-[3px_3px_0_0_#000]"
            style={{ background: "#FFC9E0" }}
          />

          {/* Mint square — bottom-right, rotated */}
          <div
            aria-hidden
            data-magnet
            className="absolute bottom-8 right-6 h-9 w-9 rotate-[18deg] border-[3px] border-black shadow-[3px_3px_0_0_#000]"
            style={{ background: "#99E885" }}
          />

          {/* Center stack */}
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center">
            {/* Massive ? in offset stack */}
            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-0 translate-x-[5px] translate-y-[5px] font-display text-[120px] leading-none text-black/20"
              >
                ?
              </div>
              <div
                className="relative font-display text-[120px] leading-none"
                style={{ color: member.cardBg }}
              >
                <span
                  style={{
                    WebkitTextStroke: "3px #000",
                    textShadow: "4px 4px 0 #000",
                  }}
                >
                  ?
                </span>
              </div>
            </div>

            {/* Stamp-style label */}
            <div
              data-magnet
              className="mt-3 -rotate-[3deg] rounded-md border-[3px] border-black bg-white px-3 py-1 shadow-[3px_3px_0_0_#000]"
            >
              <span className="font-display text-base uppercase tracking-wide">
                Who&apos;s this?
              </span>
            </div>

            {/* Footer pill */}
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border-[3px] border-black bg-mustard px-3 py-1 text-[11px] font-bold uppercase tracking-wide shadow-[3px_3px_0_0_#000]">
              <Code2 size={11} strokeWidth={3} /> Full-stack engineer
            </div>
          </div>

          {/* Top-right corner tag */}
          <div
            data-magnet
            className="absolute right-3 top-3 rotate-[6deg] rounded-md border-[3px] border-black bg-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-cream shadow-[2px_2px_0_0_#FFC9E0]"
          >
            mystery · 03
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================= */
/* Yellow spiky burst sticker (matches the reference image) */
function BurstSticker({ className = "", ...rest }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden {...rest}>
      <polygon
        points="50,2 60,28 88,18 74,44 98,52 72,62 86,88 58,76 50,98 42,76 14,88 28,62 2,52 26,44 12,18 40,28"
        fill="#F7CB46"
        stroke="#000"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* "chill guy" / "be nice" orange pill sticker. Pass `text` to customize. */
function BeNicePill({ className = "", text = "Be nice." }) {
  return (
    <svg viewBox="0 0 220 70" className={className} aria-hidden>
      {/* outer black halo so the pill stands out on any photo */}
      <rect
        x="3"
        y="5"
        width="214"
        height="60"
        rx="30"
        fill="#FF6A2A"
        stroke="#000"
        strokeWidth="4"
      />
      {/* inner gloss highlight */}
      <rect
        x="14"
        y="12"
        width="192"
        height="14"
        rx="7"
        fill="#FF8A55"
        opacity="0.55"
      />
      {/* yellow side dots */}
      <circle cx="30" cy="35" r="8" fill="#FFE45C" stroke="#000" strokeWidth="2.5" />
      <circle cx="33" cy="33" r="2.5" fill="#FFB800" />
      <circle cx="190" cy="35" r="8" fill="#FFE45C" stroke="#000" strokeWidth="2.5" />
      <circle cx="193" cy="33" r="2.5" fill="#FFB800" />
      {/* italic white label */}
      <text
        x="110"
        y="45"
        textAnchor="middle"
        fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
        fontSize="24"
        fontWeight="900"
        fill="#fff"
        stroke="#000"
        strokeWidth="1.2"
        fontStyle="italic"
      >
        {text}
      </text>
    </svg>
  );
}

function Sparkle({ small = false }) {
  const s = small ? 18 : 22;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2 L13.5 9.5 L21 12 L13.5 14.5 L12 22 L10.5 14.5 L3 12 L10.5 9.5 Z"
        fill="#fff"
        stroke="#000"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Sunburst rays behind the head — desi poster vibe. */
function Sunburst({ color = "rgba(0,0,0,0.18)" }) {
  const rays = 18;
  return (
    <svg
      aria-hidden
      viewBox="-50 -50 100 100"
      className="pointer-events-none absolute left-1/2 top-[20%] h-[160%] w-[160%] -translate-x-1/2"
    >
      {Array.from({ length: rays }).map((_, i) => {
        const angle = (i / rays) * Math.PI * 2;
        const x1 = Math.cos(angle) * 18;
        const y1 = Math.sin(angle) * 18;
        const x2 = Math.cos(angle) * 60;
        const y2 = Math.sin(angle) * 60;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

/* Tiny helper: turn a hex (#000 / #ffffff) into rgba(...) with alpha. */
function hexA(hex, alpha) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
