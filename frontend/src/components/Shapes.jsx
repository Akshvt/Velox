/* Decorative SVG shapes for Neo-Brutalist accents. */

export function Star4({ className, fill = "#000" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M50 0 L58 42 L100 50 L58 58 L50 100 L42 58 L0 50 L42 42 Z"
        fill={fill}
        stroke="#000"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Flower({ className, fill = "#99E885" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g fill={fill} stroke="#000" strokeWidth="3" strokeLinejoin="round">
        <circle cx="50" cy="20" r="14" />
        <circle cx="80" cy="50" r="14" />
        <circle cx="50" cy="80" r="14" />
        <circle cx="20" cy="50" r="14" />
        <circle cx="50" cy="50" r="16" fill="#000" />
      </g>
    </svg>
  );
}

export function Sparkle({ className, fill = "#FE90E8" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M50 5 C55 40 60 45 95 50 C60 55 55 60 50 95 C45 60 40 55 5 50 C40 45 45 40 50 5 Z"
        fill={fill}
        stroke="#000"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Squiggle({ className, stroke = "#000" }) {
  return (
    <svg viewBox="0 0 120 30" className={className} aria-hidden="true">
      <path
        d="M2 15 Q 17 0 32 15 T 62 15 T 92 15 T 118 15"
        fill="none"
        stroke={stroke}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Burst({ className, fill = "#F7CB46" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M50 2 L57 18 L74 10 L72 28 L92 28 L80 42 L98 50 L80 58 L92 72 L74 72 L74 90 L57 82 L50 98 L43 82 L26 90 L26 72 L8 72 L20 58 L2 50 L20 42 L8 28 L26 28 L26 10 L43 18 Z"
        fill={fill}
        stroke="#000"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
