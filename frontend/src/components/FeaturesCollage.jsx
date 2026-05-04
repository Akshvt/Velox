import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MessageCircle,
  GitBranch,
  BarChart3,
  ShieldCheck,
  Sparkles,
  Zap,
  Star,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Why Velox - horizontal scattered card strip (Neo-Brutalist).
 * Cards sit in a single horizontal row with varied sizes, vertical
 * offsets, and rotations - like polaroids on a corkboard. Scrolls
 * horizontally as the user scrolls vertically (GSAP scroll-pin).
 */
export default function FeaturesCollage() {
  const root = useRef(null);
  const pinWrap = useRef(null);
  const track = useRef(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray(".collage-card");

      // Initial pop-in
      gsap.set(cards, { opacity: 0, y: 60, scale: 0.9 });
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: "back.out(1.4)",
        stagger: { each: 0.06, from: "random" },
        scrollTrigger: {
          trigger: root.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      // Horizontal scroll on vertical scroll (pin).
      // Add extra buffer so last card fully clears the viewport
      // (accounts for card rotation, shadow, and breathing space).
      const scrollAmount = () =>
        track.current.scrollWidth - window.innerWidth + 160;

      gsap.to(track.current, {
        x: () => -scrollAmount(),
        ease: "none",
        scrollTrigger: {
          trigger: pinWrap.current,
          start: "center center",
          end: () => `+=${scrollAmount()}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Subtle floating loop on every card
      cards.forEach((card, i) => {
        gsap.to(card, {
          y: `+=${8 + (i % 3) * 4}`,
          rotation: `+=${i % 2 === 0 ? 0.5 : -0.5}`,
          duration: 3 + (i % 4),
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: i * 0.12,
        });

        // 3D tilt on hover
        const onMove = (e) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left - r.width / 2) / r.width;
          const y = (e.clientY - r.top - r.height / 2) / r.height;
          gsap.to(card, {
            rotateY: x * 8,
            rotateX: -y * 8,
            transformPerspective: 800,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          });
        };
        const onLeave = () =>
          gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power2.out" });

        card.addEventListener("mousemove", onMove);
        card.addEventListener("mouseleave", onLeave);
      });

      // Pixar-style per-letter wave on the big tape - subtle, intentional.
      const jollyChars = gsap.utils.toArray(".jolly-char");
      if (jollyChars.length) {
        gsap.set(jollyChars, { transformOrigin: "50% 100%" });
        gsap.to(jollyChars, {
          y: -4,
          scale: 1.06,
          duration: 0.55,
          ease: "sine.inOut",
          stagger: { each: 0.07, repeat: -1, yoyo: true },
        });
      }

      // Single-letter wink accent (e.g. the "v" in ● live)
      const winks = gsap.utils.toArray(".jolly-wink");
      winks.forEach((el) => {
        gsap.set(el, { transformOrigin: "50% 100%" });
        gsap.timeline({ repeat: -1, repeatDelay: 1.6 })
          .to(el, { y: -8, scaleY: 1.25, duration: 0.18, ease: "power2.out" })
          .to(el, { y: 0, scaleY: 1, duration: 0.35, ease: "elastic.out(1, 0.45)" });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative mt-28 w-full overflow-hidden">
      {/* Heading */}
      <div className="mx-auto mb-14 max-w-6xl px-4 text-center">
        <span
          className="brutal-sticker mb-3 inline-block"
          style={{ background: "#FE90E8" }}
        >
          ★ Why Velox
        </span>
        <h2 className="font-display text-4xl uppercase md:text-6xl">
          Built To Resolve.
          <br />
          <span className="inline-block rounded-[12px] border-[3px] border-black bg-mustard px-3 py-1">
            Made To Wow.
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm font-medium md:text-base">
          Scroll to explore - every reason teams ship support faster with Velox.
        </p>
      </div>

      {/* Horizontal track */}
      <div ref={pinWrap} className="relative h-[760px]">
        <div
          ref={track}
          className="flex h-full items-center gap-7 px-[10vw] will-change-transform"
        >
          {/* Card 1 - large lilac */}
          <CollageCard
            tone="#D9C7FF"
            rotate="-3.5deg"
            yOffset="-40px"
            width="w-[460px]"
            height="h-[580px]"
            tag={{ text: "01 / Engine", tone: "#FFFDF5" }}
            tape={{ text: "★ trending", color: "#F7CB46", big: true }}
            ornament={
              <>
                {/* mustard lightning bolt */}
                <svg aria-hidden className="pointer-events-none absolute -right-6 top-24 z-30 h-16 w-12 rotate-[14deg] drop-shadow-[3px_3px_0_#000]" viewBox="0 0 24 32" fill="none">
                  <path d="M 14 1 L 3 18 L 11 18 L 8 31 L 21 13 L 13 13 Z" fill="#F7CB46" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
                </svg>
                {/* coral star */}
                <svg aria-hidden className="pointer-events-none absolute right-8 top-2 z-30 h-9 w-9 -rotate-[10deg]" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="#FF6B6B" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                {/* mint dot */}
                <span aria-hidden className="pointer-events-none absolute left-8 top-28 z-30 inline-block h-5 w-5 rounded-full border-[2.5px] border-black" style={{ background: "#99E885" }} />
                {/* sky triangle */}
                <svg aria-hidden className="pointer-events-none absolute left-12 bottom-12 z-30 h-7 w-7 rotate-[18deg]" viewBox="0 0 30 30" fill="none">
                  <path d="M 15 3 L 27 25 L 3 25 Z" fill="#C0F7FE" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
                </svg>
                {/* pink squiggle */}
                <svg aria-hidden className="pointer-events-none absolute -bottom-2 right-10 z-30 h-8 w-20 rotate-[-6deg]" viewBox="0 0 80 30" fill="none">
                  <path d="M 4 18 Q 14 4, 24 18 T 44 18 T 64 18 T 84 18" stroke="#FE90E8" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </>
            }
          >
            <h3 className="font-display text-[44px] uppercase leading-[0.95]">
              AI Chat <span className="text-outline">Engine</span>
            </h3>
            <p className="mt-5 text-[18px] font-medium leading-relaxed">
              Agents that understand context, tone & intent - replying with
              accuracy customers actually trust.
            </p>
            {/* Big surprised eyes - alive! */}
            <Doodle.Eyes className="mt-auto" />
          </CollageCard>

          {/* Card 2 - tall mint hero */}
          <CollageCard
            tone="#99E885"
            rotate="2.5deg"
            yOffset="30px"
            width="w-[520px]"
            height="h-[640px]"
            tape={{ text: "core", color: "#FE90E8" }}
            ornament={
              <>
                <div
                  className="pointer-events-none absolute -right-16 -top-20 z-30 h-[180px] w-[260px] rotate-[-8deg] drop-shadow-[6px_6px_0_#000]"
                  aria-hidden
                >
                  <Doodle.Globe />
                </div>
                {/* pink burst star */}
                <svg aria-hidden className="pointer-events-none absolute left-6 top-24 z-30 h-12 w-12 rotate-[12deg]" viewBox="0 0 40 40" fill="none">
                  <path d="M 20 2 L 24 16 L 38 20 L 24 24 L 20 38 L 16 24 L 2 20 L 16 16 Z" fill="#FE90E8" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
                </svg>
                {/* mustard sparkle */}
                <svg aria-hidden className="pointer-events-none absolute right-10 bottom-28 z-30 h-9 w-9 -rotate-[8deg]" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="#F7CB46" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                {/* coral dot */}
                <span aria-hidden className="pointer-events-none absolute left-10 bottom-40 z-30 inline-block h-6 w-6 rounded-full border-[3px] border-black" style={{ background: "#FF6B6B" }} />
                {/* sky scribble lines */}
                <svg aria-hidden className="pointer-events-none absolute left-1/2 -bottom-2 z-30 h-10 w-24 -translate-x-1/2 rotate-[-4deg]" viewBox="0 0 100 40" fill="none">
                  <path d="M 4 12 Q 30 0, 60 12 T 96 12 M 4 28 Q 30 18, 60 28 T 96 28" stroke="#000" strokeWidth="3" strokeLinecap="round" fill="none" />
                </svg>
              </>
            }
          >
            <div className="flex h-full flex-col items-center justify-between gap-6 text-center">
              <h3 className="font-display text-[56px] uppercase leading-[0.95]">
                Tap. Resolve.
                <br />
                Repeat.
              </h3>
              <Doodle.Tap />
              <button className="brutal-btn brutal-btn-ink text-base">
                Try it →
              </button>
            </div>
          </CollageCard>

          {/* Card 3 - sky stat */}
          <CollageCard
            tone="#C0F7FE"
            rotate="-2.5deg"
            yOffset="-60px"
            width="w-[360px]"
            height="h-[440px]"
            tag={{ text: <Star size={14} fill="#000" />, tone: "#000", color: "#fff" }}
          >
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="font-display text-[140px] leading-none">4.9</div>
              <div className="mt-3 flex gap-1.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={20} fill="#000" stroke="#000" strokeWidth={2} />
                ))}
              </div>
              <p className="mt-4 text-[15px] font-bold uppercase tracking-[0.15em]">
                Satisfied users
                <br /> worldwide
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border-[3px] border-black bg-white px-3 py-1 font-display text-[12px] uppercase shadow-[3px_3px_0_0_#000]">
                <span className="h-2 w-2 rounded-full bg-[#3FA02A]" />
                12k+ reviews
              </div>
            </div>
          </CollageCard>

          {/* Card 4 - pink routing */}
          <CollageCard
            tone="#FE90E8"
            rotate="3deg"
            yOffset="50px"
            width="w-[440px]"
            height="h-[540px]"
            ornament={
              <div
                className="pointer-events-none absolute -bottom-24 -left-20 z-30 h-[200px] w-[230px] rotate-[35deg]"
                aria-hidden
              >
                <Doodle.Arrow3D color="green" />
              </div>
            }
          >
            <Icon bg="#fff" size="lg"><GitBranch strokeWidth={2.5} /></Icon>
            <h3 className="mt-6 font-display text-[36px] uppercase leading-[0.95]">
              Smart Routing
            </h3>
            <p className="mt-4 text-[18px] font-medium leading-relaxed">
              Escalates only when it matters - to the right human, with full
              context preserved.
            </p>
            <Doodle.Routes className="mt-auto" />
          </CollageCard>

          {/* Card 5 - cream analytics with bars doodle */}
          <CollageCard
            tone="#FFDC8B"
            rotate="-2.5deg"
            yOffset="-30px"
            width="w-[480px]"
            height="h-[560px]"
            tape={{ text: "● live", color: "#99E885", big: true, side: "left", winkIndex: 2 }}
            ornament={
              <div
                className="pointer-events-none absolute -right-24 -top-16 z-30 h-[210px] w-[240px] rotate-[-25deg]"
                aria-hidden
              >
                <Doodle.Arrow3D color="coral" />
              </div>
            }
          >
            <Icon bg="#fff" size="lg"><BarChart3 strokeWidth={2.5} /></Icon>
            <h3 className="mt-6 font-display text-[36px] uppercase leading-[0.95]">
              Real-Time<br />Analytics
            </h3>
            <p className="mt-4 text-[18px] font-medium leading-relaxed">
              CSAT, deflection rate, resolution time - in dashboards your team
              actually opens.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border-[3px] border-black bg-white px-3 py-1 font-display text-[12px] uppercase tracking-wider shadow-[3px_3px_0_0_#000]"
              >
                <span className="h-2 w-2 rounded-full bg-[#3FA02A] animate-pulse" />
                this week
              </span>
              <span
                className="rounded-full border-[3px] border-black px-3 py-1 font-display text-[12px] uppercase tracking-wider shadow-[3px_3px_0_0_#000]"
                style={{ background: "#FE90E8" }}
              >
                csat 96%
              </span>
            </div>
            <Doodle.Bars className="mt-auto" />
          </CollageCard>

          {/* Card 6 - sky security */}
          <CollageCard
            tone="#C0F7FE"
            rotate="2.8deg"
            yOffset="40px"
            width="w-[420px]"
            height="h-[500px]"
            ornament={
              <div
                className="pointer-events-none absolute -right-16 -bottom-16 z-30 h-[180px] w-[180px] rotate-[-15deg]"
                aria-hidden
              >
                <Doodle.ArrowCorner />
              </div>
            }
          >
            <Icon bg="#fff" size="lg"><ShieldCheck strokeWidth={2.5} /></Icon>
            <h3 className="mt-6 font-display text-[36px] uppercase leading-[0.95]">
              Secure & Reliable
            </h3>
            <p className="mt-4 text-[18px] font-medium leading-relaxed">
              SOC 2, end-to-end encryption, self-hostable. Enterprise ready out
              of the box.
            </p>
            <Doodle.Lock className="mt-auto" />
          </CollageCard>

          {/* Card 7 - coral integrations */}
          <CollageCard
            tone="#FF6B6B"
            rotate="-3deg"
            yOffset="-50px"
            width="w-[460px]"
            height="h-[560px]"
            tape={{
              text: "★ 150+ apps",
              color: "#FFDC8B",
              big: true,
              side: "right",
              winkIndex: 0,
            }}
          >
            <Icon bg="#000" iconColor="#fff" size="lg"><Sparkles strokeWidth={2.5} /></Icon>
            <h3 className="mt-6 font-display text-[40px] uppercase leading-[0.95] text-white">
              Plug & Play
            </h3>
            <p className="mt-4 text-[18px] font-bold leading-relaxed text-white">
              Slack. Zendesk. Stripe. Shopify. Connect every tool you love in
              minutes.
            </p>
            <Doodle.Chips className="mt-auto" />
          </CollageCard>

          {/* Card 8 - black CTA, colorful confetti edition */}
          <CollageCard
            tone="#000"
            rotate="2deg"
            yOffset="30px"
            width="w-[520px]"
            height="h-[600px]"
            tag={{ text: "★", tone: "#F7CB46" }}
            tape={{
              text: "let's go!",
              color: "#FE90E8",
              big: true,
              side: "left",
              winkIndex: 4,
            }}
            ornament={
              <>
                {/* mint blob top-right */}
                <div
                  className="pointer-events-none absolute -top-6 right-10 z-20 h-10 w-10 rounded-full border-[3px] border-black shadow-[4px_4px_0_0_#000]"
                  style={{ background: "#99E885" }}
                  aria-hidden
                />
                {/* lilac square mid-right */}
                <div
                  className="pointer-events-none absolute right-6 top-1/3 z-20 h-7 w-7 rotate-[18deg] border-[3px] border-black shadow-[3px_3px_0_0_#000]"
                  style={{ background: "#D9C7FF" }}
                  aria-hidden
                />
                {/* sky triangle bottom-right */}
                <svg
                  viewBox="0 0 60 60"
                  className="pointer-events-none absolute -right-6 bottom-20 z-20 h-14 w-14 rotate-[-12deg]"
                  aria-hidden
                >
                  <path
                    d="M 30 6 L 56 52 L 4 52 Z"
                    fill="#0A0A0A"
                    transform="translate(4 4)"
                  />
                  <path
                    d="M 30 6 L 56 52 L 4 52 Z"
                    fill="#C0F7FE"
                    stroke="#000"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                </svg>
              </>
            }
          >
            <div className="flex h-full flex-col justify-between text-paper">
              <h3 className="font-display text-[56px] uppercase leading-[0.92] text-paper">
                Feel the<br />
                <span
                  className="mt-2 inline-block rounded-[12px] border-[3px] border-black px-3 py-1 text-black shadow-[6px_6px_0_0_#fff]"
                  style={{ background: "#F7CB46" }}
                >
                  speed.
                </span>
              </h3>
              <p className="text-[18px] font-medium leading-relaxed text-paper/80">
                Spin up your first AI agent in{" "}
                <span
                  className="rounded-[6px] border-[2px] border-black px-1.5 py-0.5 font-display text-black"
                  style={{ background: "#99E885" }}
                >
                  60 seconds
                </span>
                . No credit card, no friction.
              </p>
              <button className="brutal-btn brutal-btn-primary text-base">
                <Zap size={18} strokeWidth={3} /> Get Started
              </button>
            </div>
          </CollageCard>

          {/* End spacer so last card breathes */}
          <div className="shrink-0 w-[15vw]" />
        </div>
      </div>
    </section>
  );
}

/* ---------- Card primitive ---------- */

function CollageCard({
  children,
  tone = "#fff",
  rotate = "0deg",
  yOffset = "0px",
  width = "w-[280px]",
  height = "h-[320px]",
  tag,
  tape,
  ornament,
}) {
  return (
    <div
      className={`collage-card relative shrink-0 ${width} ${height} rounded-[24px] border-[3px] border-black p-10 shadow-[10px_10px_0_0_#000] will-change-transform`}
      style={{
        background: tone,
        transform: `rotate(${rotate}) translateY(${yOffset})`,
      }}
    >
      {ornament}
      {tag && (
        <span
          className="absolute -left-4 -top-4 z-10 inline-flex h-11 min-w-11 items-center justify-center rounded-full border-[3px] border-black px-3 font-display text-xs uppercase tracking-wider shadow-[3px_3px_0_0_#000]"
          style={{ background: tag.tone, color: tag.color || "#000" }}
        >
          {tag.text}
        </span>
      )}
      {tape && (
        <span
          className={
            tape.big
              ? `jolly-tape absolute z-20 inline-block ${
                  tape.side === "left"
                    ? "-left-6 -top-7 -rotate-[10deg]"
                    : "-right-6 -top-7 rotate-[10deg]"
                } rounded-[8px] border-[3px] border-black px-5 py-2 font-display text-[20px] uppercase tracking-wider shadow-[5px_5px_0_0_#000]`
              : "absolute -right-3 -top-4 z-10 rotate-[8deg] rounded-[4px] border-[2px] border-black px-3 py-1 font-display text-[11px] uppercase tracking-wider shadow-[2px_2px_0_0_#000]"
          }
          style={{ background: tape.color }}
        >
          {tape.big
            ? String(tape.text)
                .split("")
                .map((ch, i) => (
                  <span
                    key={i}
                    className={
                      tape.winkIndex === i
                        ? "jolly-wink inline-block"
                        : "jolly-char inline-block"
                    }
                    style={{ whiteSpace: "pre" }}
                  >
                    {ch}
                  </span>
                ))
            : tape.text}
        </span>
      )}
      <div className="flex h-full flex-col">{children}</div>
    </div>
  );
}

function Icon({ children, bg = "#fff", iconColor = "#000", size = "md" }) {
  const dim = size === "lg" ? "h-16 w-16" : "h-12 w-12";
  return (
    <div
      className={`flex ${dim} items-center justify-center rounded-full border-[3px] border-black shadow-[4px_4px_0_0_#000]`}
      style={{ background: bg, color: iconColor }}
    >
      {children}
    </div>
  );
}

/* ---------- Doodles ---------- */

const Doodle = {
  Brain: ({ className = "" }) => (
    <svg viewBox="0 0 200 80" className={`h-16 w-full ${className}`}>
      <g fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M40 60 C 30 50, 30 30, 50 25 C 55 10, 80 10, 85 25 C 100 20, 110 35, 100 50 C 110 60, 95 75, 80 70 C 70 80, 50 75, 40 60 Z" fill="#fff"/>
        <path d="M55 35 q 5 -5 10 0" />
        <path d="M75 35 q 5 -5 10 0" />
        <path d="M60 50 q 8 8 18 0" />
      </g>
    </svg>
  ),
  Eyes: ({ className = "" }) => (
    <svg viewBox="0 0 320 300" className={`h-48 w-full ${className}`} aria-hidden>
      {/* Eyebrows - short curved strokes above each outer eye edge */}
      <g fill="none" stroke="#000" strokeWidth="6" strokeLinecap="round">
        <path d="M 28 36 Q 70 12, 118 28" />
        <path d="M 202 28 Q 250 12, 292 36" />
      </g>

      {/* LEFT EYE */}
      <g className="eye eye-left">
        {/* eyeball - tall cream oval */}
        <ellipse
          cx="92"
          cy="170"
          rx="86"
          ry="118"
          fill="#FFFDF5"
          stroke="#000"
          strokeWidth="7"
        />
        {/* pupil - large black oval with inward (right-side) triangular notch */}
        <path
          d="M 92 80
             C 50 80, 32 118, 32 170
             C 32 222, 50 260, 92 260
             C 122 260, 140 244, 148 220
             L 120 170
             L 148 120
             C 140 96, 122 80, 92 80 Z"
          fill="#000"
        />
      </g>

      {/* RIGHT EYE */}
      <g className="eye eye-right">
        {/* eyeball */}
        <ellipse
          cx="228"
          cy="170"
          rx="86"
          ry="118"
          fill="#FFFDF5"
          stroke="#000"
          strokeWidth="7"
        />
        {/* pupil - mirror notch on left side */}
        <path
          d="M 228 80
             C 270 80, 288 118, 288 170
             C 288 222, 270 260, 228 260
             C 198 260, 180 244, 172 220
             L 200 170
             L 172 120
             C 180 96, 198 80, 228 80 Z"
          fill="#000"
        />
      </g>
    </svg>
  ),
  Tap: ({ className = "" }) => (
    <svg viewBox="0 0 220 140" className={`h-32 w-full ${className}`}>
      <g fill="none" stroke="#000" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        <rect x="60" y="40" width="100" height="80" rx="14" fill="#F7CB46" />
        <circle cx="110" cy="80" r="14" fill="#000" />
        <path d="M110 30 v 18" />
        <path d="M90 35 l 8 10" />
        <path d="M130 35 l -8 10" />
        <path d="M150 130 q 30 -10 40 -40" />
      </g>
    </svg>
  ),
  Bars: ({ className = "" }) => (
    // Big, poppy analytics chart: chunky bars w/ offset shadows, value
    // pills on top, dotted baseline, trend line + arrow, and a sparkle.
    <svg viewBox="0 0 320 170" className={`h-40 w-full ${className}`}>
      {/* dotted baseline grid */}
      <g stroke="#000" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" opacity="0.55">
        <line x1="10" y1="40"  x2="310" y2="40"  />
        <line x1="10" y1="80"  x2="310" y2="80"  />
        <line x1="10" y1="120" x2="310" y2="120" />
      </g>
      {/* solid baseline */}
      <line x1="10" y1="148" x2="310" y2="148" stroke="#000" strokeWidth="3" strokeLinecap="round" />

      {/* shadow layer */}
      <g fill="#0A0A0A">
        <rect x="26"  y="92"  width="38" height="60"  rx="4" />
        <rect x="80"  y="62"  width="38" height="90"  rx="4" />
        <rect x="134" y="106" width="38" height="46"  rx="4" />
        <rect x="188" y="38"  width="38" height="114" rx="4" />
        <rect x="242" y="78"  width="38" height="74"  rx="4" />
      </g>
      {/* bars */}
      <g stroke="#000" strokeWidth="3.5" strokeLinejoin="round">
        <rect x="22"  y="88"  width="38" height="60"  rx="4" fill="#fff" />
        <rect x="76"  y="58"  width="38" height="90"  rx="4" fill="#FE90E8" />
        <rect x="130" y="102" width="38" height="46"  rx="4" fill="#fff" />
        <rect x="184" y="34"  width="38" height="114" rx="4" fill="#99E885" />
        <rect x="238" y="74"  width="38" height="74"  rx="4" fill="#C0F7FE" />
      </g>

      {/* trend line connecting tops */}
      <polyline
        points="41,88 95,58 149,102 203,34 257,74"
        fill="none"
        stroke="#000"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0"
      />
      {/* trend dots */}
      <g fill="#000">
        <circle cx="41"  cy="88"  r="4" />
        <circle cx="95"  cy="58"  r="4" />
        <circle cx="149" cy="102" r="4" />
        <circle cx="203" cy="34"  r="4" />
        <circle cx="257" cy="74"  r="4" />
      </g>

      {/* trend up arrow off the peak */}
      <g stroke="#000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M 270 60 L 300 28" />
        <path d="M 300 28 L 290 28 M 300 28 L 300 38" />
      </g>

      {/* peak value pill */}
      <g>
        <rect x="178" y="6" width="56" height="22" rx="11" fill="#0A0A0A" transform="translate(3 3)" />
        <rect x="178" y="6" width="56" height="22" rx="11" fill="#000" stroke="#000" strokeWidth="2" />
        <text x="206" y="22" fontFamily="'Archivo Black', sans-serif" fontSize="13" fill="#fff" textAnchor="middle">
          +28%
        </text>
      </g>

      {/* sparkle */}
      <g stroke="#000" strokeWidth="3" strokeLinecap="round">
        <path d="M 24 18 l 0 14 M 17 25 l 14 0" />
      </g>
    </svg>
  ),
  Routes: ({ className = "" }) => (
    <svg viewBox="0 0 220 90" className={`h-20 w-full ${className}`}>
      <g fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        {/* trunk */}
        <path d="M 20 45 L 80 45" />
        {/* split up & down */}
        <path d="M 80 45 C 100 45, 100 18, 130 18" />
        <path d="M 80 45 C 100 45, 100 72, 130 72" />
        <path d="M 80 45 L 130 45" />
        {/* nodes */}
        <circle cx="20" cy="45" r="9" fill="#FE90E8" />
        <circle cx="80" cy="45" r="9" fill="#000" />
        <circle cx="135" cy="18" r="11" fill="#99E885" />
        <circle cx="135" cy="45" r="11" fill="#FFDC8B" />
        <circle cx="135" cy="72" r="11" fill="#C0F7FE" />
        {/* tiny chevrons inside top/bottom nodes */}
        <path d="M 131 18 l 4 -4 l 4 4" stroke="#000" strokeWidth="2.5" />
        <path d="M 131 72 l 4 4 l 4 -4" stroke="#000" strokeWidth="2.5" />
      </g>
    </svg>
  ),
  Lock: ({ className = "" }) => (
    <svg viewBox="0 0 200 90" className={`h-20 w-full ${className}`}>
      <g stroke="#000" strokeWidth="3.5" strokeLinejoin="round">
        {/* shadow */}
        <rect x="46" y="40" width="68" height="50" rx="8" fill="#0A0A0A" />
        {/* shackle */}
        <path d="M 60 38 V 28 a 20 20 0 0 1 40 0 V 38" fill="none" />
        {/* body */}
        <rect x="42" y="36" width="68" height="50" rx="8" fill="#FFDC8B" />
        {/* keyhole */}
        <circle cx="76" cy="58" r="6" fill="#000" />
        <rect x="73" y="58" width="6" height="14" fill="#000" />
        {/* sparkles */}
        <g stroke="#000" strokeWidth="3" strokeLinecap="round">
          <path d="M 130 20 l 6 6 M 136 20 l -6 6" />
          <path d="M 160 50 l 6 6 M 166 50 l -6 6" />
          <path d="M 145 75 l 6 6 M 151 75 l -6 6" />
        </g>
        {/* check badge */}
        <circle cx="155" cy="32" r="14" fill="#99E885" />
        <path d="M 148 32 l 5 5 l 9 -10" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  ),
  Chips: ({ className = "" }) => (
    <svg viewBox="0 0 240 70" className={`h-16 w-full ${className}`}>
      <g stroke="#000" strokeWidth="3" strokeLinejoin="round">
        {/* shadows */}
        <g fill="#0A0A0A" stroke="none">
          <rect x="10"  y="18" width="46" height="46" rx="10" />
          <rect x="68"  y="18" width="46" height="46" rx="10" />
          <rect x="126" y="18" width="46" height="46" rx="10" />
          <rect x="184" y="18" width="46" height="46" rx="10" />
        </g>
        {/* chips */}
        <rect x="6"   y="14" width="46" height="46" rx="10" fill="#99E885" />
        <rect x="64"  y="14" width="46" height="46" rx="10" fill="#FFDC8B" />
        <rect x="122" y="14" width="46" height="46" rx="10" fill="#C0F7FE" />
        <rect x="180" y="14" width="46" height="46" rx="10" fill="#FE90E8" />
      </g>
      {/* glyphs */}
      <g fontFamily="'Archivo Black', sans-serif" fontSize="22" textAnchor="middle" fill="#000">
        <text x="29"  y="46">S</text>
        <text x="87"  y="46">Z</text>
        <text x="145" y="46">$</text>
        <text x="203" y="46">★</text>
      </g>
    </svg>
  ),
  Globe: ({ className = "" }) => (
    <svg viewBox="0 0 220 130" className={`h-full w-full ${className}`}>
      {/* drop shadow */}
      <ellipse cx="118" cy="95" rx="92" ry="22" fill="#0A0A0A" />
      {/* squashed sphere body */}
      <ellipse cx="110" cy="70" rx="95" ry="45" fill="#5BB8C9" stroke="#000" strokeWidth="3.5" />
      {/* longitude lines */}
      <g fill="none" stroke="#000" strokeWidth="2.2">
        <ellipse cx="110" cy="70" rx="95" ry="10" />
        <ellipse cx="110" cy="70" rx="95" ry="22" />
        <ellipse cx="110" cy="70" rx="95" ry="34" />
        <ellipse cx="110" cy="70" rx="75" ry="45" />
        <ellipse cx="110" cy="70" rx="50" ry="45" />
        <ellipse cx="110" cy="70" rx="22" ry="45" />
        <line x1="110" y1="25" x2="110" y2="115" />
        <line x1="15" y1="70" x2="205" y2="70" />
      </g>
    </svg>
  ),
  Arrow3D: ({ className = "", color = "coral" }) => {
    const palette =
      color === "green"
        ? { top: "#B5E36A", front: "#7AB833" }
        : { top: "#FFB8B8", front: "#FF7A7A" };
    // Clean isometric arrow pointing down-left.
    const d =
      "M 215 30 L 235 50 L 140 145 L 155 160 L 40 200 L 80 75 L 95 100 Z";
    return (
      <svg viewBox="0 0 240 220" className={`h-full w-full ${className}`}>
        {/* black shadow side (offset down-right) */}
        <path d={d} fill="#0A0A0A" transform="translate(10 10)" />
        {/* top highlight ridge peeks on the upper-left edges */}
        <path
          d={d}
          fill={palette.top}
          stroke="#000"
          strokeWidth="3.5"
          strokeLinejoin="round"
          transform="translate(-5 -5)"
        />
        {/* front face */}
        <path
          d={d}
          fill={palette.front}
          stroke="#000"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  },
  // Chunky L-shaped corner arrow (matches reference image): a bold L
  // sitting in bottom-left + a separate diagonal parallelogram shaft
  // floating in the top-right, both with offset black shadow layers.
  ArrowCorner: ({ className = "" }) => {
    // The L is the arrowhead (down-left). The diagonal parallelogram is
    // the arrow's tail; its bottom-left tip lands exactly on the L's
    // inner corner (100,140) and its bottom edge sits flush with the
    // top of the L's horizontal wing.
    const lPath =
      "M 40 40 L 100 40 L 100 140 L 200 140 L 200 200 L 40 200 Z";
    const shaftPath =
      "M 170 40 L 225 40 L 155 140 L 100 140 Z";
    return (
      <svg viewBox="0 0 240 240" className={`h-full w-full ${className}`}>
        {/* shadow layers (offset down-right) */}
        <g transform="translate(12 12)">
          <path d={lPath} fill="#0A0A0A" />
          <path d={shaftPath} fill="#0A0A0A" />
        </g>
        {/* L (arrowhead) */}
        <path
          d={lPath}
          fill="#3FA02A"
          stroke="#000"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* diagonal shaft (rendered on top so it overlaps the L vertical wing) */}
        <path
          d={shaftPath}
          fill="#3FA02A"
          stroke="#000"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  },
};
