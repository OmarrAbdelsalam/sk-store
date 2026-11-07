/**
 * SK BAGS wordmark — drawn as SVG in a geometric monoline style (thin even
 * strokes, letters built from straight lines and circle arcs, wide spacing),
 * in the spirit of the Parfois logotype. Uses `currentColor`, so it follows
 * the header's text colour (white over the hero, ink elsewhere).
 * Size it by height: <Wordmark className="h-[22px] w-auto" />.
 */
export default function Wordmark({ className = "", title = "SK Bags" }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 216 30"
      role="img"
      aria-label={title}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="butt"
      strokeLinejoin="miter"
    >
      <title>{title}</title>
      {/* S */}
      <path d="M22 3 H9 A6 6 0 0 0 9 15 H15 A6 6 0 0 1 15 27 H2" />
      {/* K */}
      <g transform="translate(34 0)">
        <path d="M2 3 V27 M20 3 L2.8 16 M8.5 11.5 L20.5 27" />
      </g>
      {/* B */}
      <g transform="translate(88 0)">
        {/* one continuous stroke so the corners join cleanly */}
        <path d="M2 15 H13 A6 6 0 0 1 13 27 H2 V3 H12 A6 6 0 0 1 12 15 H2" />
      </g>
      {/* A */}
      <g transform="translate(120 0)">
        <path d="M2 27 V13 A10 10 0 0 1 22 13 V27 M2 19 H22" />
      </g>
      {/* G */}
      <g transform="translate(154 0)">
        <path d="M21.19 7.29 A12 12 0 1 0 24 15 H14" />
      </g>
      {/* S */}
      <g transform="translate(190 0)">
        <path d="M22 3 H9 A6 6 0 0 0 9 15 H15 A6 6 0 0 1 15 27 H2" />
      </g>
    </svg>
  );
}
