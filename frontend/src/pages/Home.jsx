import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import {
  ArrowRight,
  Check,
  MessageCircle,
  Play,
  Bot,
  User,
  Send,
  GitBranch,
  BarChart3,
  ShieldCheck,
  Headphones,
  Zap,
  Star,
  Quote,
  Plus,
  Minus,
  Slack,
  Github,
  Mail,
  Globe,
  Webhook,
  Database,
  Sparkles,
  Phone,
  Twitter,
  Linkedin,
  Instagram,
  ArrowUpRight,
  MapPin,
  X,
} from "lucide-react";
import FeaturesCollage from "@components/FeaturesCollage";
import TeamSection from "@components/TeamSection";

export default function Home() {
  const heroStage = useRef(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray(".hero-pop");
      if (!cards.length) return;

      // Initial reveal - staggered drop with elastic settle
      gsap.from(cards, {
        y: 80,
        opacity: 0,
        scale: 0.85,
        duration: 1.1,
        ease: "elastic.out(1, 0.55)",
        stagger: 0.12,
        clearProps: "opacity",
      });

      cards.forEach((card, i) => {
        const baseRotate = parseFloat(card.dataset.rotate || "0");
        const inner = card.querySelector(".hero-pop-inner") || card;
        const shine = card.querySelector(".pop-shine");

        // Lock the rotation onto the card so GSAP composes correctly
        gsap.set(card, { rotation: baseRotate, transformOrigin: "50% 50%" });
        gsap.set(inner, { transformPerspective: 1100, transformStyle: "preserve-3d" });

        // Idle float - staggered per card, paused on hover
        const float = gsap.to(card, {
          y: -8,
          duration: 2.2 + i * 0.15,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: i * 0.35,
        });

        const qy = gsap.quickTo(inner, "rotationY", { duration: 0.55, ease: "power3.out" });
        const qx = gsap.quickTo(inner, "rotationX", { duration: 0.55, ease: "power3.out" });
        const qz = gsap.quickTo(card, "rotation", { duration: 0.55, ease: "power3.out" });
        const qmx = gsap.quickTo(card, "x", { duration: 0.45, ease: "power3.out" });
        const qmy = gsap.quickTo(card, "y", { duration: 0.45, ease: "power3.out" });
        const qs = gsap.quickTo(card, "scale", { duration: 0.45, ease: "power3.out" });

        const onEnter = () => {
          float.pause();
          qs(1.04);
          gsap.to(card, { boxShadow: "18px 18px 0 0 #000", duration: 0.35, ease: "power2.out" });
          if (shine) {
            gsap.fromTo(
              shine,
              { xPercent: -120, opacity: 0.0 },
              { xPercent: 220, opacity: 1, duration: 0.9, ease: "power2.out" },
            );
          }
        };
        const onMove = (e) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left - r.width / 2) / r.width;
          const y = (e.clientY - r.top - r.height / 2) / r.height;
          qy(x * 16);
          qx(-y * 16);
          qz(baseRotate + x * 4);
          qmx(x * 10);
          qmy(y * 10 - 8);
        };
        const onLeave = () => {
          qy(0);
          qx(0);
          qz(baseRotate);
          qmx(0);
          qs(1);
          gsap.to(card, { boxShadow: "", duration: 0.35, ease: "power2.out", clearProps: "boxShadow" });
          float.resume();
        };

        card.addEventListener("mouseenter", onEnter);
        card.addEventListener("mousemove", onMove);
        card.addEventListener("mouseleave", onLeave);
      });
    },
    { scope: heroStage },
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* ============ NAVBAR ============ */}
      <header className="relative mx-auto mt-4 flex max-w-6xl items-center justify-between gap-3 px-3 sm:mt-6 sm:gap-4 sm:px-4">
        {/* white pill bar holding logo + links */}
        <div className="flex flex-1 items-center justify-between rounded-full border-[3px] border-black bg-white px-4 py-2 shadow-[4px_4px_0_0_#000] sm:px-6 sm:py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border-[3px] border-black bg-mustard">
              <Zap size={18} strokeWidth={3} />
            </div>
            <span className="font-display text-2xl tracking-tight">Velox</span>
          </div>

          <nav className="hidden items-center gap-8 text-[13px] font-bold uppercase tracking-wider md:flex">
            <a href="#" className="hover:underline underline-offset-4 decoration-[3px]">Features</a>
            <a href="#" className="hover:underline underline-offset-4 decoration-[3px]">Pricing</a>
            <a href="#" className="hover:underline underline-offset-4 decoration-[3px]">About</a>
            <a href="#" className="hover:underline underline-offset-4 decoration-[3px]">How It Works?</a>
          </nav>

          <Link
            to="/login"
            className="hidden text-[13px] font-bold uppercase tracking-wider hover:underline underline-offset-4 decoration-[3px] md:inline"
          >
            Log in
          </Link>
        </div>

        {/* fluffy cloud Sign Up button */}
        <Link
          to="/register"
          aria-label="Sign Up"
          className="group relative inline-flex h-[52px] w-[130px] shrink-0 items-center justify-center transition-transform hover:-translate-y-0.5 sm:h-[64px] sm:w-[170px]"
        >
          <svg
            viewBox="0 0 200 90"
            className="absolute inset-0 h-full w-full drop-shadow-[4px_4px_0_#000]"
            aria-hidden
          >
            {/* cloud shape: a few overlapping bumps with a single black outline */}
            <path
              d="
                M 30 60
                C 10 60, 10 32, 32 30
                C 30 12, 60 8, 70 24
                C 80 6, 118 8, 122 28
                C 138 14, 172 22, 170 44
                C 192 44, 196 72, 174 76
                C 172 90, 138 92, 130 78
                C 118 92, 84 90, 78 76
                C 60 90, 32 84, 30 60
                Z
              "
              fill="#D9C7FF"
              stroke="#000"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
          </svg>
          <span className="relative z-10 font-display text-[13px] uppercase tracking-wider sm:text-[15px]">
            Sign Up
          </span>
          {/* tiny cursor pointer like the reference */}
          <svg
            viewBox="0 0 24 24"
            className="absolute -bottom-1 -right-1 z-10 h-5 w-5"
            aria-hidden
          >
            <path
              d="M 4 3 L 4 19 L 9 14 L 12 21 L 15 20 L 12 13 L 19 13 Z"
              fill="#fff"
              stroke="#000"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </header>

      {/* ============ HERO (Claud-style doodle composition) ============ */}
      <section className="relative mx-auto mt-12 max-w-6xl px-4 sm:mt-16">
        {/* Headline */}
        <div className="mx-auto max-w-4xl text-center">
          <span
            className="brutal-sticker rot-2 mb-5 inline-block"
            style={{ background: "#99E885" }}
          >
            ⚡ AI Customer Support
          </span>
          <h1 className="font-display text-3xl uppercase leading-[0.95] sm:text-4xl md:text-6xl">
            Fast Replies, Big Wins:
            <br />
            <span className="mt-2 inline-block rounded-[14px] border-[3px] border-black bg-mustard px-3 py-1 sm:px-4">
              Velox Challenge
            </span>
          </h1>
        </div>

        {/* Doodle stage - flex row, wraps on mobile */}
        <div
          ref={heroStage}
          className="relative mt-10 flex flex-wrap items-center justify-center gap-8 sm:mt-14 lg:flex-nowrap [perspective:1200px]"
        >
          {/* ------ Floating doodle pops around the stage ------ */}
          {/* squiggle, top-left */}
          <svg aria-hidden className="pointer-events-none absolute -top-6 left-0 h-10 w-20 -rotate-[8deg]" viewBox="0 0 80 30" fill="none">
            <path d="M 4 18 Q 14 4, 24 18 T 44 18 T 64 18 T 84 18" stroke="#FE90E8" strokeWidth="4" strokeLinecap="round" />
          </svg>
          {/* lightning bolt, top-right */}
          <svg aria-hidden className="pointer-events-none absolute -top-4 right-2 h-12 w-10 rotate-[14deg]" viewBox="0 0 24 32" fill="none">
            <path d="M 14 1 L 3 18 L 11 18 L 8 31 L 21 13 L 13 13 Z" fill="#F7CB46" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
          {/* mint dot cluster, mid-left */}
          <svg aria-hidden className="pointer-events-none absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2" viewBox="0 0 32 32" fill="none">
            <circle cx="8"  cy="8"  r="4" fill="#99E885" stroke="#000" strokeWidth="2" />
            <circle cx="22" cy="14" r="3" fill="#C0F7FE" stroke="#000" strokeWidth="2" />
            <circle cx="12" cy="24" r="3" fill="#FE90E8" stroke="#000" strokeWidth="2" />
          </svg>
          {/* coral burst, bottom-left */}
          <svg aria-hidden className="pointer-events-none absolute -bottom-6 left-12 h-10 w-10 -rotate-[12deg]" viewBox="0 0 40 40" fill="none">
            <path d="M 20 2 L 24 16 L 38 20 L 24 24 L 20 38 L 16 24 L 2 20 L 16 16 Z" fill="#FF6B6B" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
          {/* arc dashes, bottom-right */}
          <svg aria-hidden className="pointer-events-none absolute -bottom-4 right-8 h-12 w-24" viewBox="0 0 100 40" fill="none">
            <path d="M 4 32 Q 50 -10, 96 32" stroke="#000" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" fill="none" />
          </svg>
          {/* sky triangle, top-mid */}
          <svg aria-hidden className="pointer-events-none absolute -top-2 left-1/2 h-7 w-7 -translate-x-1/2 rotate-[18deg]" viewBox="0 0 30 30" fill="none">
            <path d="M 15 3 L 27 25 L 3 25 Z" fill="#C0F7FE" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
          {/* mustard scribble, mid-right */}
          <svg aria-hidden className="pointer-events-none absolute right-0 top-1/3 h-12 w-14 rotate-[-10deg]" viewBox="0 0 60 50" fill="none">
            <path d="M 6 10 Q 18 0, 30 12 T 54 14 M 8 28 Q 24 22, 40 32 M 10 44 L 50 38" stroke="#F7CB46" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </svg>
          {/* LEFT - #1 ticket card */}
          <div
            data-rotate="-4"
            className="hero-pop group relative w-[320px] shrink-0 rounded-[20px] border-[4px] border-black p-6 shadow-[10px_10px_0_0_#000]"
            style={{ background: "#D9C7FF" }}
          >
            {/* shimmer sweep */}
            <span aria-hidden className="pop-shine pointer-events-none" />
            <div className="hero-pop-inner relative">
            <span className="absolute -left-4 -top-4 inline-flex h-11 min-w-11 items-center justify-center rounded-full border-[3px] border-black bg-white px-3 font-display text-sm uppercase shadow-[3px_3px_0_0_#000]">
              #1
            </span>
            {/* mini coral star, corner pop */}
            <svg aria-hidden className="pointer-events-none absolute -right-3 top-2 h-7 w-7 rotate-[12deg]" viewBox="0 0 24 24" fill="none">
              <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="#FF6B6B" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            <p className="text-center text-base font-bold leading-snug">
              Velox Resolves Tickets:
              <br />
              <span className="font-display text-lg uppercase">Tap. Reply. Done.</span>
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <svg viewBox="0 0 80 60" className="h-16 w-20" aria-hidden>
                <g fill="#fff" stroke="#000" strokeWidth="3" strokeLinejoin="round">
                  <path d="M16 42 C 8 36, 8 18, 22 16 C 24 6, 46 6, 50 18 C 64 14, 72 30, 64 40 C 70 50, 56 58, 46 52 C 38 60, 22 56, 16 42 Z" />
                </g>
                <g fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M28 24 q 4 -4 8 0" />
                  <path d="M44 24 q 4 -4 8 0" />
                  <path d="M30 36 q 7 6 14 0" />
                </g>
              </svg>
              <div className="flex flex-col">
                <span className="font-display text-3xl uppercase leading-none">Tap</span>
                <span className="font-display text-3xl uppercase leading-none text-black/30">Tap</span>
              </div>
            </div>
            </div>
          </div>

          {/* CENTER - Chat Preview window */}
          <div
            data-rotate="0"
            className="hero-pop group relative w-full max-w-[540px] shrink-0 overflow-hidden rounded-[24px] border-[4px] border-black bg-white shadow-[14px_14px_0_0_#000]"
          >
            <span aria-hidden className="pop-shine pointer-events-none" />
            <div className="hero-pop-inner">
            {/* title bar */}
            <div className="flex items-center gap-2 border-b-[3px] border-black bg-paper px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full border-[2px] border-black bg-coral" />
              <span className="h-2.5 w-2.5 rounded-full border-[2px] border-black bg-mustard" />
              <span className="ml-2 font-display text-[13px] uppercase tracking-wider">
                Chat Preview
              </span>
            </div>

            {/* messages */}
            <div className="flex flex-col gap-4 p-5">
              {/* bot */}
              <div className="flex items-start gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] border-black bg-sky shadow-[2px_2px_0_0_#000]">
                  <Bot size={16} strokeWidth={3} />
                </span>
                <div className="max-w-[78%] rounded-[14px] border-[3px] border-black bg-white px-3.5 py-2 text-sm font-medium shadow-[2px_2px_0_0_#000]">
                  Hello! How can I help you today?
                </div>
              </div>

              {/* user */}
              <div className="flex items-start justify-end gap-2">
                <div className="max-w-[78%] rounded-[14px] border-[3px] border-black bg-mustard px-3.5 py-2 text-sm font-medium shadow-[2px_2px_0_0_#000]">
                  I need help with my order.
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] border-black bg-pink shadow-[2px_2px_0_0_#000]">
                  <User size={16} strokeWidth={3} />
                </span>
              </div>

              {/* bot */}
              <div className="flex items-start gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] border-black bg-sky shadow-[2px_2px_0_0_#000]">
                  <Bot size={16} strokeWidth={3} />
                </span>
                <div className="max-w-[78%] rounded-[14px] border-[3px] border-black bg-white px-3.5 py-2 text-sm font-medium shadow-[2px_2px_0_0_#000]">
                  Sure! I can help with that.
                  <br />
                  Can you please share your order ID?
                </div>
              </div>
            </div>

            {/* input bar */}
            <div className="flex items-center gap-2 border-t-[3px] border-black bg-paper p-3">
              <div className="flex flex-1 items-center rounded-full border-[3px] border-black bg-white px-4 py-2 text-sm font-medium text-black/50 shadow-[2px_2px_0_0_#000]">
                Type your message...
              </div>
              <button
                aria-label="Send"
                className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-black bg-mustard shadow-[3px_3px_0_0_#000] transition-transform hover:-translate-y-0.5"
              >
                <Send size={16} strokeWidth={3} />
              </button>
            </div>
            </div>
          </div>

          {/* RIGHT - 4.9 review card */}
          <div
            data-rotate="4"
            className="hero-pop group relative w-[320px] shrink-0 rounded-[20px] border-[4px] border-black p-6 shadow-[10px_10px_0_0_#000]"
            style={{ background: "#C0F7FE" }}
          >
            <span aria-hidden className="pop-shine pointer-events-none" />
            <div className="hero-pop-inner relative">
            <span
              className="absolute -right-4 -top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-black font-display text-lg shadow-[3px_3px_0_0_#000]"
              style={{ background: "#F7CB46" }}
            >
              ★
            </span>
            {/* mint sparkle, corner pop */}
            <svg aria-hidden className="pointer-events-none absolute -left-3 top-3 h-7 w-7 -rotate-[14deg]" viewBox="0 0 24 24" fill="none">
              <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="#99E885" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            <div className="text-center">
              <div className="font-display text-7xl leading-none">4.9</div>
              <p className="mt-3 text-sm font-bold uppercase tracking-wide">
                <span className="text-black/60">#satisfied</span>{" "}
                <span className="rounded-[6px] border-[2px] border-black bg-mustard px-1.5 py-0.5">users</span>
                <br />
                worldwide
              </p>
              <svg viewBox="0 0 160 60" className="mx-auto mt-4 h-16 w-full" aria-hidden>
                <g fill="#fff" stroke="#000" strokeWidth="3" strokeLinejoin="round">
                  <path d="M 18 40 C 8 30, 14 14, 30 14 C 36 4, 60 6, 62 22 C 76 22, 80 38, 70 46 C 74 56, 56 60, 48 54 C 38 60, 22 54, 18 40 Z" />
                  <path d="M 90 40 C 80 30, 86 14, 102 14 C 108 4, 132 6, 134 22 C 148 22, 152 38, 142 46 C 146 56, 128 60, 120 54 C 110 60, 94 54, 90 40 Z" />
                </g>
                <g fill="#000">
                  <rect x="22" y="26" width="14" height="8" rx="2" />
                  <rect x="40" y="26" width="14" height="8" rx="2" />
                </g>
                <g fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M 102 28 q 4 -4 8 0" />
                  <path d="M 120 28 l 8 0" />
                  <path d="M 108 40 q 6 5 12 0" />
                </g>
              </svg>
            </div>
            </div>
          </div>
        </div>

        {/* CTA - clear hierarchy: dominant primary, lightweight secondary, micro trust */}
        <div className="relative mt-12 flex flex-col items-center">
          {/* sparkle accents (kept tight around the action zone) */}
          <span aria-hidden className="cta-spark pointer-events-none absolute -top-5 left-1/2 hidden -translate-x-[180px] sm:inline-block">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="#F7CB46" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </span>
          <span aria-hidden className="cta-spark cta-spark-2 pointer-events-none absolute top-1 left-1/2 hidden translate-x-[140px] sm:inline-block">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="#FE90E8" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </span>
          <span aria-hidden className="cta-spark cta-spark-3 pointer-events-none absolute -top-2 left-1/2 hidden -translate-x-[250px] sm:inline-block">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="#99E885" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </span>

          {/* Action row - primary anchors, secondary recedes */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-4">
            {/* PRIMARY */}
            <Link to="/chat" className="cta-btn cta-btn-primary group">
              <MessageCircle size={20} strokeWidth={3.5} />
              <span>Start Free Chat</span>
              <ArrowRight className="cta-arrow" size={20} strokeWidth={3.5} />
              {/* "FREE" tape sticker */}
              <span
                className="absolute -left-4 -top-4 -rotate-[14deg] rounded-[8px] border-[3px] border-black px-2.5 py-1 font-display text-xs uppercase shadow-[3px_3px_0_0_#000]"
                style={{ background: "#FE90E8" }}
              >
                100% Free
              </span>
            </Link>

            {/* SECONDARY - white outlined pill */}
            <button 
              className="cta-btn cta-btn-ghost group"
              onClick={() => setIsVideoModalOpen(true)}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-black bg-mint shadow-[2px_2px_0_0_#000]">
                <Play size={11} strokeWidth={4} fill="currentColor" />
              </span>
              <span>Watch 60s Demo</span>
            </button>
          </div>

          {/* Micro trust line - supportive, not competing */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[13px] font-bold text-black/70">
            <span className="inline-flex items-center gap-1.5">
              <Check size={14} strokeWidth={4} className="text-black" /> No credit card
            </span>
            <span className="text-black/30">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={14} strokeWidth={4} className="text-black" /> 60-second setup
            </span>
            <span className="text-black/30">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={14} strokeWidth={4} className="text-black" /> Cancel anytime
            </span>
          </div>
        </div>

        {/* Bottom strip - Claud-style: 3 columns, lilac, mascot in middle */}
        <div
          className="mx-auto mt-14 grid max-w-6xl grid-cols-1 items-center gap-6 rounded-[22px] border-[3px] border-black p-6 shadow-[8px_8px_0_0_#000] md:grid-cols-3 md:p-8"
          style={{ background: "#D9C7FF" }}
        >
          {/* LEFT - headline */}
          <h3 className="font-display text-3xl uppercase leading-[0.95] md:text-4xl">
            Reply Faster.
            <br />
            Resolve More
            <br />
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-[10px] border-[3px] border-black bg-white px-2.5 py-0.5 align-middle">
              <span className="flex h-6 w-6 items-center justify-center rounded-[6px] border-[2px] border-black bg-mustard">
                <Zap size={14} strokeWidth={3} />
              </span>
              <span className="font-display">Velox</span>
            </span>
          </h3>

          {/* CENTER - mascot doodle (chilling blob with phone) */}
          <div className="flex items-center justify-center">
            <svg
              viewBox="0 0 280 140"
              className="h-32 w-full max-w-[320px]"
              aria-hidden
            >
              <g
                fill="#fff"
                stroke="#000"
                strokeWidth="3.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              >
                {/* tail / antenna swoosh */}
                <path d="M 60 92 C 30 80, 30 30, 70 30 C 70 50, 90 60, 110 70" fill="none" />
                <circle cx="58" cy="22" r="6" fill="#000" />

                {/* blob body (cloud-ish) */}
                <path d="M 110 100 C 90 100, 80 80, 92 70 C 90 52, 116 44, 124 56 C 138 40, 168 44, 172 64 C 192 60, 208 84, 196 100 C 210 110, 198 130, 178 126 L 118 126 C 102 126, 96 116, 110 100 Z" />

                {/* face - big smile + closed eye */}
                <path d="M 138 80 q 5 -5 10 0" fill="none" />
                <path d="M 154 80 q 5 -5 10 0" fill="none" />
                <path d="M 144 96 q 10 10 22 -2" fill="none" />

                {/* arm holding phone */}
                <path d="M 196 110 C 214 110, 222 100, 230 96" fill="none" />
                <rect
                  x="220"
                  y="86"
                  width="32"
                  height="48"
                  rx="6"
                  fill="#000"
                  stroke="#000"
                />
                <rect x="225" y="92" width="22" height="34" rx="3" fill="#444" stroke="none" />
              </g>
            </svg>
          </div>

          {/* RIGHT - real-photo avatar stack + caption below */}
          <div className="flex flex-col items-center gap-3 md:items-end">
            <div className="flex -space-x-4">
              {[
                "https://i.pravatar.cc/120?img=14",
                "https://i.pravatar.cc/120?img=33",
                "https://i.pravatar.cc/120?img=47",
              ].map((src, i) => (
                <span
                  key={i}
                  className="inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-[22px] border-[3px] border-black bg-white shadow-[4px_4px_0_0_#000]"
                >
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </span>
              ))}
              <span
                className="inline-flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-black font-display text-2xl shadow-[4px_4px_0_0_#000]"
                style={{ background: "#F7CB46" }}
              >
                +
              </span>
            </div>
            <p className="font-display text-[18px] uppercase leading-[1.1] tracking-wide md:text-right">
              Tap And Play With
              <br />
              Your Friends
            </p>
          </div>
        </div>
      </section>

      {/* ============ WHY CHOOSE (collage with GSAP motion) ============ */}
      <FeaturesCollage />

      {/* ============ TESTIMONIALS ============ */}
      <Testimonials />

      {/* ============ TEAM (flip-on-scroll music cards) ============ */}
      <TeamSection />

      {/* ============ PRICING ============ */}
      <Pricing />

      {/* ============ INTEGRATIONS ============ */}
      <Integrations />

      {/* ============ FAQ ============ */}
      <FAQ />

      {/* ============ CTA BANNER ============ */}
      <section className="mx-auto mt-20 max-w-6xl px-4">
        <div className="flex flex-col items-center justify-between gap-6 rounded-[20px] border-[3px] border-black bg-cream p-8 shadow-[8px_8px_0_0_#000] md:flex-row md:p-10">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-[3px] border-black bg-white shadow-[4px_4px_0_0_#000]">
              <Headphones size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-display text-2xl uppercase md:text-3xl">
                Ready to transform your support?
              </h3>
              <p className="mt-1 text-sm font-medium md:text-base">
                Start a conversation with our AI now and experience the future of support.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <Link to="/chat" className="brutal-btn brutal-btn-ink">
              <MessageCircle size={18} strokeWidth={3} /> Start Chat Now
            </Link>
            <span className="flex items-center gap-2 text-xs font-bold">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border-[2px] border-black bg-mint">
                <Check size={10} strokeWidth={4} />
              </span>
              No signup required
            </span>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <SiteFooter />

      {/* ============ VIDEO MODAL ============ */}
      {isVideoModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-4xl overflow-hidden rounded-[20px] border-[4px] border-black bg-paper shadow-[12px_12px_0_0_#000]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-[4px] border-black bg-mustard px-4 py-3">
              <h3 className="font-display text-lg uppercase tracking-wider">Velox Demo</h3>
              <button 
                onClick={() => setIsVideoModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border-[2px] border-black bg-white transition-transform hover:scale-110"
              >
                <X size={16} strokeWidth={3} />
              </button>
            </div>
            
            {/* Video Container (16:9 Aspect Ratio) */}
            <div className="relative w-full pb-[56.25%]">
              <iframe 
                src="https://player.vimeo.com/video/76979871?autoplay=1&title=0&byline=0&portrait=0" 
                title="Velox Demo Video" 
                allow="autoplay; fullscreen; picture-in-picture" 
                allowFullScreen
                className="absolute left-0 top-0 h-full w-full bg-black object-cover"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =============================================================
   FOOTER \u2014 agency-style neo-brutalist footer.
   Layers: orange grid roof \u2192 cream wave divider \u2192 huge wordmark
   row + socials \u2192 link columns + newsletter \u2192 fine-print bar.
   ============================================================= */
function SiteFooter() {
  const wordRef = useRef(null);
  const linkRefs = useRef([]);
  linkRefs.current = [];
  const addLinkRef = (el) => {
    if (el && !linkRefs.current.includes(el)) linkRefs.current.push(el);
  };

  // Magnetic repel on the social pills + arrow chips
  const magnetRef = useRef(null);
  useGSAP(
    () => {
      const root = magnetRef.current;
      if (!root) return;
      const dots = Array.from(root.querySelectorAll("[data-foot-magnet]"));
      if (!dots.length) return;
      const movers = dots.map((el) => ({
        el,
        qx: gsap.quickTo(el, "x", { duration: 0.7, ease: "power3.out" }),
        qy: gsap.quickTo(el, "y", { duration: 0.7, ease: "power3.out" }),
      }));
      const RADIUS = 160;
      const STRENGTH = 24;
      const onMove = (e) => {
        movers.forEach(({ el, qx, qy }) => {
          const r = el.getBoundingClientRect();
          const dx = r.left + r.width / 2 - e.clientX;
          const dy = r.top + r.height / 2 - e.clientY;
          const dist = Math.hypot(dx, dy);
          if (dist < RADIUS && dist > 0.001) {
            const f = (1 - dist / RADIUS) * STRENGTH;
            const a = Math.atan2(dy, dx);
            qx(Math.cos(a) * f);
            qy(Math.sin(a) * f);
          } else {
            qx(0);
            qy(0);
          }
        });
      };
      const onLeave = () => movers.forEach(({ qx, qy }) => (qx(0), qy(0)));
      root.addEventListener("mousemove", onMove);
      root.addEventListener("mouseleave", onLeave);
      return () => {
        root.removeEventListener("mousemove", onMove);
        root.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope: magnetRef },
  );

  const cols = [
    {
      title: "Product",
      links: ["Features", "Pricing", "Integrations", "Changelog", "Roadmap"],
    },
    {
      title: "Company",
      links: ["About", "Team", "Careers", "Press", "Contact"],
    },
    {
      title: "Resources",
      links: ["Docs", "API", "Status", "Security", "Blog"],
    },
  ];

  return (
    <footer className="relative mt-24" ref={magnetRef}>
      {/* Inline keyframes - kept here so they always ship with the
         footer regardless of Tailwind cache state. */}
      <style>{`@keyframes velox-wave-flow{from{transform:translate3d(-50%,0,0)}to{transform:translate3d(0,0,0)}}@keyframes velox-marquee-scroll{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}@keyframes velox-stamp-wobble{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(-2deg) scale(1.04)}}`}</style>

      {/* Orange roof with grid + sticker */}
      <div
        className="relative h-28 border-t-[3px] border-black sm:h-36"
        style={{
          background: "#FF6A2A",
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.18) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      >
        {/* Yellow burst hanging off the top */}
        <div
          aria-hidden
          className="absolute right-[8%] top-[-44px] h-28 w-28 rotate-[14deg] sm:h-32 sm:w-32"
        >
          <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[5px_5px_0_rgba(0,0,0,0.85)]">
            <polygon
              points="50,2 60,28 88,18 74,44 98,52 72,62 86,88 58,76 50,98 42,76 14,88 28,62 2,52 26,44 12,18 40,28"
              fill="#F7CB46"
              stroke="#000"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Floating "let's ship" stamp - BIG poppy */}
        <div
          className="absolute left-[6%] top-[-26px] rounded-xl border-[4px] border-black bg-black px-5 py-2 text-cream shadow-[6px_6px_0_0_#FFC9E0] sm:px-6 sm:py-3"
          style={{ animation: "velox-stamp-wobble 3.6s ease-in-out infinite" }}
        >
          <span className="font-display text-lg uppercase tracking-widest sm:text-2xl">
            let&apos;s ship →
          </span>
        </div>
      </div>

      {/* Cream wave divider - animated */}
      <AnimatedWave />

      {/* Main footer body */}
      <div className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 pt-10 sm:pt-14">
          {/* Top row: tagline + socials */}
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl">
              <span className="inline-flex -rotate-[2deg] items-center gap-2 rounded-full border-[4px] border-black bg-mustard px-4 py-2 text-sm font-black uppercase tracking-wider shadow-[5px_5px_0_0_#000] sm:text-base">
                <Sparkles size={16} strokeWidth={3.5} /> velox · support, but make it fast
              </span>
              <p className="mt-4 font-display text-xl uppercase leading-[1.05] sm:text-2xl">
                From inbox chaos to first-reply zen - the AI helpdesk your
                team will actually want to log into.
              </p>
            </div>

            {/* Social pills */}
            <div className="flex items-center gap-3">
              {[
                { Icon: Twitter, href: "#", bg: "#D9C7FF" },
                { Icon: Instagram, href: "#", bg: "#FFC9E0" },
                { Icon: Linkedin, href: "#", bg: "#99E885" },
                { Icon: Github, href: "#", bg: "#FFE9A8" },
              ].map(({ Icon, href, bg }, i) => (
                <a
                  key={i}
                  href={href}
                  data-foot-magnet
                  className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-black shadow-[4px_4px_0_0_#000] transition-shadow hover:shadow-[6px_6px_0_0_#000]"
                  style={{ background: bg }}
                  aria-label="social"
                >
                  <Icon size={18} strokeWidth={2.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Massive wordmark */}
          <div
            ref={wordRef}
            className="relative mt-10 select-none border-y-[3px] border-black py-2"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(0,0,0,0.06) 0 8px, transparent 8px 16px)",
              }}
            />
            <div className="relative flex items-baseline gap-4 overflow-hidden whitespace-nowrap">
              <span
                className="font-display uppercase leading-[0.85] tracking-tighter"
                style={{
                  fontSize: "clamp(72px, 18vw, 240px)",
                  WebkitTextStroke: "0px transparent",
                }}
              >
                velox
              </span>
              <span className="hidden text-[11px] font-bold uppercase tracking-[0.3em] text-black/60 md:inline">
                /vəˈlɒks/ - rapid, swift
              </span>
              <span
                aria-hidden
                className="ml-auto hidden h-10 w-10 shrink-0 self-center rounded-full border-[3px] border-black md:block"
                style={{ background: "#7C5CFF" }}
              />
            </div>
          </div>

          {/* Link columns + newsletter + CTA strip removed per request */}

          {/* Fine-print bar */}
          <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t-[3px] border-black py-5 text-[12px] font-bold uppercase tracking-wide md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-black bg-white px-2.5 py-0.5 text-[10px]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                All systems normal
              </span>
              <span className="hidden items-center gap-1 text-black/60 sm:inline-flex">
                <MapPin size={11} strokeWidth={3} /> Made in BLR · SF · the cloud
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="text-black/60">© 2026 Velox Labs</span>
              <a href="#" className="hover:underline">Privacy</a>
              <a href="#" className="hover:underline">Terms</a>
              <a href="#" className="hover:underline">Cookies</a>
              <a href="#" className="hover:underline">DPA</a>
            </div>
          </div>
        </div>

        {/* Marquee bottom band - BIG JOLLY scroller */}
        <div
          className="relative overflow-hidden border-y-[3px] border-black py-4 sm:py-6"
          style={{ background: "#7C5CFF" }}
        >
          {/* Subtle dotted texture */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.7) 1.5px, transparent 1.5px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div
            className="relative flex w-max gap-6 whitespace-nowrap font-display uppercase leading-none tracking-tight text-cream sm:gap-12"
            style={{
              fontSize: "clamp(36px, 8vw, 96px)",
              animation: "velox-marquee-scroll 28s linear infinite",
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="inline-flex shrink-0 items-center gap-4 sm:gap-8">
                <span
                  style={{
                    WebkitTextStroke: i % 2 === 0 ? "0" : "2px #FFDC8B",
                    color: i % 2 === 0 ? "#FFDC8B" : "transparent",
                  }}
                >
                  velox
                </span>
                <svg viewBox="0 0 100 100" className="h-9 w-9 shrink-0 animate-spin-slow sm:h-16 sm:w-16" aria-hidden>
                  <polygon
                    points="50,2 60,28 88,18 74,44 98,52 72,62 86,88 58,76 50,98 42,76 14,88 28,62 2,52 26,44 12,18 40,28"
                    fill="#F7CB46"
                    stroke="#000"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />
                </svg>
                <span style={{ color: "#FFC9E0" }}>support</span>
                <span aria-hidden className="text-mustard">✦</span>
                <span style={{ color: "#99E885" }}>fast</span>
                <span aria-hidden className="text-mustard">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* Animated cream wave divider - the wave flows from left to
   right. We render TWO identical wave SVGs side-by-side and
   shift the parent by -50% so the second copy seamlessly takes
   over when the first scrolls off. */
function AnimatedWave() {
  const segments = Array.from({ length: 6 });
  // Build one wave path that fits a 1440×60 viewBox.
  const wavePath = `M0,60 L0,30 ${segments
    .map(
      (_, i) =>
        `Q${i * 240 + 60},0 ${i * 240 + 120},30 T${i * 240 + 240},30`,
    )
    .join(" ")} L1440,60 Z`;

  const Wave = () => (
    <svg
      viewBox="0 0 1440 60"
      preserveAspectRatio="none"
      className="block h-full w-1/2 shrink-0"
      aria-hidden
    >
      <path d={wavePath} fill="#FAF6E9" stroke="#000" strokeWidth="3" />
    </svg>
  );

  return (
    <div
      aria-hidden
      className="relative block h-10 w-full overflow-hidden sm:h-12"
      style={{ background: "#FF6A2A" }}
    >
      <div
        className="flex h-full w-[200%]"
        style={{
          animation: "velox-wave-flow 5s linear infinite",
          willChange: "transform",
        }}
      >
        <Wave />
        <Wave />
      </div>
    </div>
  );
}

function ChatBubble({ from, children }) {
  const isBot = from === "bot";
  return (
    <div className={`flex items-end gap-2 ${isBot ? "" : "flex-row-reverse"}`}>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] border-black ${isBot ? "bg-sky" : "bg-pink"}`}>
        {isBot ? <Bot size={16} strokeWidth={3} /> : <User size={16} strokeWidth={3} />}
      </div>
      <div className={`max-w-[78%] rounded-[12px] border-[3px] border-black px-4 py-2 text-sm font-medium shadow-[2px_2px_0_0_#000] ${isBot ? "bg-white" : "bg-mustard"}`}>
        {children}
      </div>
    </div>
  );
}

/* =============================================================
   TESTIMONIALS
   ============================================================= */
function Testimonials() {
  const items = [
    {
      quote:
        "Velox cut our first-response time from 4 hours to 38 seconds. Our CSAT jumped 22 points in the first month.",
      name: "Priya Shah",
      role: "Head of Support, Lumen Labs",
      avatar: "https://i.pravatar.cc/120?img=47",
      bg: "#FFE9A8",
    },
    {
      quote:
        "The AI suggestions are genuinely useful - not noise. My team accepts about 70% of them with zero edits.",
      name: "Marcus Lee",
      role: "Support Lead, Northwind",
      avatar: "https://i.pravatar.cc/120?img=14",
      bg: "#D9C7FF",
    },
    {
      quote:
        "Setup took 12 minutes. Twelve. We replaced two legacy tools the same week and never looked back.",
      name: "Aisha Okafor",
      role: "COO, Trailfound",
      avatar: "https://i.pravatar.cc/120?img=33",
      bg: "#99E885",
    },
  ];
  return (
    <section className="mx-auto mt-20 max-w-6xl px-4">
      <div className="mb-8 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border-[3px] border-black bg-mustard px-3 py-1 text-[12px] font-bold uppercase shadow-[3px_3px_0_0_#000]">
            <Star size={12} strokeWidth={3.5} /> Loved by support teams
          </span>
          <h2 className="mt-3 font-display text-3xl uppercase leading-[0.95] sm:text-4xl md:text-5xl">
            Real teams.
            <br />
            Real numbers.
          </h2>
        </div>
        <p className="max-w-md text-sm font-medium text-black/70 md:text-right">
          Three sentences from people who replaced their old helpdesk with Velox.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {items.map((t, i) => (
          <article
            key={i}
            className="relative flex flex-col gap-4 rounded-[18px] border-[3px] border-black p-5 shadow-[6px_6px_0_0_#000] transition-transform hover:-translate-y-1 hover:translate-x-[-2px] hover:shadow-[10px_10px_0_0_#000]"
            style={{ background: t.bg }}
          >
            <Quote size={28} strokeWidth={3} className="opacity-80" />
            <p className="text-[15px] font-medium leading-snug">“{t.quote}”</p>
            <div className="mt-auto flex items-center gap-3 border-t-[2px] border-black/30 pt-3">
              <span className="inline-flex h-11 w-11 overflow-hidden rounded-full border-[3px] border-black bg-white">
                <img src={t.avatar} alt="" className="h-full w-full object-cover" loading="lazy" />
              </span>
              <div className="min-w-0">
                <div className="truncate font-display text-sm uppercase">{t.name}</div>
                <div className="truncate text-[12px] font-bold text-black/70">{t.role}</div>
              </div>
              <div className="ml-auto flex gap-0.5">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star key={s} size={12} strokeWidth={2.5} fill="#000" />
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* =============================================================
   PRICING
   ============================================================= */
function Pricing() {
  const tiers = [
    {
      name: "Starter",
      price: "$0",
      period: "/forever",
      tagline: "For solo founders shipping their first support inbox.",
      features: ["1 agent seat", "100 AI replies / mo", "Email + web chat", "Community support"],
      cta: "Start free",
      to: "/register",
      bg: "#FFFFFF",
      featured: false,
    },
    {
      name: "Team",
      price: "$29",
      period: "/agent / mo",
      tagline: "For growing teams that live in their inbox.",
      features: [
        "Unlimited AI replies",
        "Multi-channel routing",
        "Knowledge base + FAQ",
        "Realtime analytics",
        "Priority support",
      ],
      cta: "Start 14-day trial",
      to: "/register",
      bg: "#F7CB46",
      featured: true,
    },
    {
      name: "Scale",
      price: "Custom",
      period: "",
      tagline: "SSO, SLAs, dedicated infra, and a human you can call.",
      features: [
        "SSO + SCIM",
        "Custom data residency",
        "99.99% uptime SLA",
        "Dedicated CSM",
        "Audit logs + SOC 2",
      ],
      cta: "Contact sales",
      to: "/chat",
      bg: "#D9C7FF",
      featured: false,
    },
  ];
  return (
    <section className="mx-auto mt-20 max-w-6xl px-4">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border-[3px] border-black bg-white px-3 py-1 text-[12px] font-bold uppercase shadow-[3px_3px_0_0_#000]">
          <Sparkles size={12} strokeWidth={3.5} /> Simple pricing
        </span>
        <h2 className="mt-3 font-display text-3xl uppercase leading-[0.95] sm:text-4xl md:text-5xl">
          Pay for seats.
          <br />
          Not for chats.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm font-medium text-black/70">
          No per-message fees, no surprise overages. Cancel any time.
        </p>
      </div>

      <div className="grid items-stretch gap-5 md:grid-cols-3">
        {tiers.map((t) => (
          <article
            key={t.name}
            className={`relative flex flex-col gap-4 rounded-[20px] border-[3px] border-black p-6 shadow-[6px_6px_0_0_#000] ${t.featured ? "md:-translate-y-2 md:shadow-[10px_10px_0_0_#000]" : ""}`}
            style={{ background: t.bg }}
          >
            {t.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border-[3px] border-black bg-black px-3 py-0.5 font-display text-[11px] uppercase tracking-wide text-white">
                Most popular
              </span>
            )}
            <header>
              <div className="font-display text-xl uppercase">{t.name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-4xl">{t.price}</span>
                <span className="text-sm font-bold text-black/70">{t.period}</span>
              </div>
              <p className="mt-2 text-[13px] font-medium text-black/80">{t.tagline}</p>
            </header>

            <ul className="flex flex-col gap-2 border-t-[2px] border-black/30 pt-4 text-sm font-medium">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[2px] border-black bg-white">
                    <Check size={11} strokeWidth={4} />
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              to={t.to}
              className={`brutal-btn mt-auto justify-center ${t.featured ? "brutal-btn-ink" : ""}`}
            >
              {t.cta} <ArrowRight size={16} strokeWidth={3} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

/* =============================================================
   INTEGRATIONS
   ============================================================= */
function Integrations() {
  const items = [
    { name: "Slack", Icon: Slack, bg: "#FFE9A8" },
    { name: "GitHub", Icon: Github, bg: "#D9C7FF" },
    { name: "Email", Icon: Mail, bg: "#FFC9E0" },
    { name: "Webhooks", Icon: Webhook, bg: "#99E885" },
    { name: "Phone / SMS", Icon: Phone, bg: "#FFE9A8" },
    { name: "Web SDK", Icon: Globe, bg: "#D9C7FF" },
    { name: "Postgres", Icon: Database, bg: "#FFC9E0" },
    { name: "Zapier", Icon: Zap, bg: "#99E885" },
  ];

  // Magnetic repel - tiles drift away from the cursor like a soft air-blow,
  // then ease back to their resting spot.
  const gridRef = useRef(null);
  useGSAP(
    () => {
      const grid = gridRef.current;
      if (!grid) return;
      const tiles = Array.from(grid.querySelectorAll("[data-tile]"));
      if (!tiles.length) return;

      const movers = tiles.map((el) => ({
        el,
        qx: gsap.quickTo(el, "x", { duration: 0.8, ease: "power3.out" }),
        qy: gsap.quickTo(el, "y", { duration: 0.8, ease: "power3.out" }),
      }));

      const RADIUS = 200;
      const STRENGTH = 38;

      const onMove = (e) => {
        const cx = e.clientX;
        const cy = e.clientY;
        movers.forEach(({ el, qx, qy }) => {
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
        movers.forEach(({ qx, qy }) => {
          qx(0);
          qy(0);
        });
      };

      grid.addEventListener("mousemove", onMove);
      grid.addEventListener("mouseleave", onLeave);
      return () => {
        grid.removeEventListener("mousemove", onMove);
        grid.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope: gridRef },
  );

  return (
    <section className="mx-auto mt-20 max-w-6xl px-4">
      <div className="mb-8 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border-[3px] border-black bg-pink px-3 py-1 text-[12px] font-bold uppercase shadow-[3px_3px_0_0_#000]">
            <GitBranch size={12} strokeWidth={3.5} /> Integrations
          </span>
          <h2 className="mt-3 font-display text-3xl uppercase leading-[0.95] sm:text-4xl md:text-5xl">
            Plug into the
            <br />
            stack you already use.
          </h2>
        </div>
        <p className="max-w-md text-sm font-medium text-black/70 md:text-right">
          Native connectors for the channels and tools your team lives in. REST + webhooks for everything else.
        </p>
      </div>

      <div ref={gridRef} className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {items.map(({ name, Icon, bg }) => (
          <div
            key={name}
            data-tile
            className="group flex items-center gap-3 rounded-[16px] border-[3px] border-black bg-white p-4 shadow-[5px_5px_0_0_#000] will-change-transform"
          >
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] border-[3px] border-black"
              style={{ background: bg }}
            >
              <Icon size={20} strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
              <div className="truncate font-display text-sm uppercase">{name}</div>
              <div className="text-[11px] font-bold text-black/60">Connected</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =============================================================
   FAQ
   ============================================================= */
function FAQ() {
  const qs = [
    {
      q: "Do I need a credit card to start?",
      a: "No. The Starter plan is free forever for one seat and 100 AI replies a month. Add a card only when you want to scale.",
    },
    {
      q: "How does the AI actually help my agents?",
      a: "Velox drafts replies using your knowledge base and past resolved tickets. Agents accept, edit, or reject - you stay in control while the AI handles the boring 80%.",
    },
    {
      q: "Can I bring my own data and docs?",
      a: "Yes. Import a knowledge base via Markdown, URL crawl, or API. The AI is grounded on your content, not the open internet.",
    },
    {
      q: "Where is my data stored?",
      a: "By default, in the region you choose at signup (US, EU, or APAC). Scale customers can pin to a specific data residency.",
    },
    {
      q: "Is there an SLA?",
      a: "Team plans get 99.9% uptime. Scale plans get 99.99% with a written SLA and support credits if we miss it.",
    },
    {
      q: "Can I migrate from Zendesk / Intercom / Freshdesk?",
      a: "Yes - we ship a one-click importer for tickets, contacts, and macros. Most teams are fully moved over in under a day.",
    },
  ];
  const [open, setOpen] = useState(0);
  const [hover, setHover] = useState(-1);

  // Magnetic repel - the plus/x circles drift away from the cursor
  // smoothly, then ease back to their resting spot.
  const listRef = useRef(null);
  useGSAP(
    () => {
      const list = listRef.current;
      if (!list) return;
      const dots = Array.from(list.querySelectorAll("[data-faq-dot]"));
      if (!dots.length) return;

      const movers = dots.map((el) => ({
        el,
        qx: gsap.quickTo(el, "x", { duration: 0.7, ease: "power3.out" }),
        qy: gsap.quickTo(el, "y", { duration: 0.7, ease: "power3.out" }),
      }));

      const RADIUS = 160;
      const STRENGTH = 26;

      const onMove = (e) => {
        const cx = e.clientX;
        const cy = e.clientY;
        movers.forEach(({ el, qx, qy }) => {
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
        movers.forEach(({ qx, qy }) => {
          qx(0);
          qy(0);
        });
      };

      list.addEventListener("mousemove", onMove);
      list.addEventListener("mouseleave", onLeave);
      return () => {
        list.removeEventListener("mousemove", onMove);
        list.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope: listRef },
  );

  return (
    <section className="mx-auto mt-20 max-w-4xl px-4">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border-[3px] border-black bg-mint px-3 py-1 text-[12px] font-bold uppercase shadow-[3px_3px_0_0_#000]">
          <MessageCircle size={12} strokeWidth={3.5} /> FAQ
        </span>
        <h2 className="mt-3 font-display text-3xl uppercase leading-[0.95] sm:text-4xl md:text-5xl">
          Questions, answered.
        </h2>
      </div>

      <ul ref={listRef} className="flex flex-col gap-3">
        {qs.map((item, i) => (
          <FAQItem
            key={item.q}
            index={i}
            total={qs.length}
            item={item}
            isOpen={open === i}
            isHover={hover === i}
            onToggle={() => setOpen(open === i ? -1 : i)}
            onHover={() => setHover(i)}
            onLeave={() => setHover((h) => (h === i ? -1 : h))}
          />
        ))}
      </ul>
    </section>
  );
}

/* Single accordion item with awwwards-style micro-interactions:
   - Animated open/close (GSAP height + opacity + word stagger)
   - Plus icon rotates to X, bg swaps color
   - Question letters individually wrap so we can lift on hover
   - Number prefix slides in on hover
   - Left accent bar grows from top on hover/open                 */
function FAQItem({ index, item, isOpen, isHover, onToggle, onHover, onLeave, total }) {
  const panelRef = useRef(null);
  const innerRef = useRef(null);
  const iconRef = useRef(null);
  const barRef = useRef(null);
  const numRef = useRef(null);
  const lettersRef = useRef(null);

  // Open / close animation - height, opacity, and word-by-word answer stagger
  useGSAP(
    () => {
      if (!panelRef.current || !innerRef.current) return;
      if (isOpen) {
        gsap.set(panelRef.current, { height: "auto" });
        const h = panelRef.current.offsetHeight;
        gsap.fromTo(
          panelRef.current,
          { height: 0, opacity: 0 },
          { height: h, opacity: 1, duration: 0.55, ease: "power3.out" },
        );
        const words = innerRef.current.querySelectorAll(".faq-word");
        gsap.fromTo(
          words,
          { y: 14, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power3.out",
            stagger: 0.018,
            delay: 0.12,
          },
        );
      } else {
        gsap.to(panelRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: "power3.inOut",
        });
      }
    },
    { dependencies: [isOpen], scope: panelRef },
  );

  // Plus → X rotation + color swap
  useGSAP(
    () => {
      if (!iconRef.current) return;
      gsap.to(iconRef.current, {
        rotation: isOpen ? 135 : 0,
        backgroundColor: isOpen ? "#FFC9E0" : isHover ? "#99E885" : "#F7CB46",
        duration: 0.45,
        ease: "back.out(2)",
      });
    },
    { dependencies: [isOpen, isHover] },
  );

  // Left accent bar grows on hover/open
  useGSAP(
    () => {
      if (!barRef.current) return;
      gsap.to(barRef.current, {
        scaleY: isOpen || isHover ? 1 : 0,
        duration: 0.5,
        ease: "power3.out",
      });
    },
    { dependencies: [isOpen, isHover] },
  );

  // Number prefix slides in on hover/open
  useGSAP(
    () => {
      if (!numRef.current) return;
      gsap.to(numRef.current, {
        x: isOpen || isHover ? 0 : -16,
        opacity: isOpen || isHover ? 1 : 0,
        duration: 0.45,
        ease: "power3.out",
      });
    },
    { dependencies: [isOpen, isHover] },
  );

  // Letter lift on hover
  useGSAP(
    () => {
      if (!lettersRef.current) return;
      const letters = lettersRef.current.querySelectorAll(".faq-letter");
      gsap.to(letters, {
        y: isHover ? -2 : 0,
        duration: 0.4,
        ease: "power3.out",
        stagger: { each: 0.012, from: "start" },
      });
    },
    { dependencies: [isHover] },
  );

  const num = String(index + 1).padStart(2, "0");
  const totalStr = String(total).padStart(2, "0");

  return (
    <li
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="relative overflow-hidden rounded-[16px] border-[3px] border-black bg-white shadow-[5px_5px_0_0_#000]"
    >
      {/* Left accent bar - grows from top on hover/open */}
      <div
        ref={barRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-full w-[6px] origin-top scale-y-0"
        style={{ background: isOpen ? "#FFC9E0" : "#F7CB46" }}
      />

      <button
        type="button"
        onClick={onToggle}
        className="relative flex w-full items-center gap-3 px-4 py-4 text-left sm:px-5"
        aria-expanded={isOpen}
      >
        {/* Number prefix - slides in on hover */}
        <span
          ref={numRef}
          className="hidden font-display text-[11px] uppercase tracking-[0.2em] text-black/50 opacity-0 sm:inline-block"
        >
          {num}/{totalStr}
        </span>

        {/* Question with per-letter lift */}
        <span
          ref={lettersRef}
          className="flex-1 font-display text-[15px] uppercase leading-tight sm:text-base"
        >
          {item.q.split("").map((ch, k) => (
            <span
              key={k}
              className="faq-letter inline-block"
              style={{ whiteSpace: ch === " " ? "pre" : "normal" }}
            >
              {ch}
            </span>
          ))}
        </span>

        {/* Plus / X icon */}
        <span
          ref={iconRef}
          data-faq-dot
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[3px] border-black"
          style={{ background: "#F7CB46" }}
        >
          <Plus size={14} strokeWidth={3.5} />
        </span>
      </button>

      {/* Animated answer panel */}
      <div
        ref={panelRef}
        className="overflow-hidden"
        style={{ height: 0, opacity: 0 }}
      >
        <div
          ref={innerRef}
          className="border-t-[2px] border-black/20 px-4 py-4 text-[14px] font-medium leading-relaxed text-black/80 sm:px-5"
        >
          {item.a.split(" ").map((w, k) => (
            <span key={k} className="faq-word inline-block whitespace-pre">
              {w}{" "}
            </span>
          ))}
        </div>
      </div>
    </li>
  );
}
