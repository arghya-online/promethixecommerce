import {
  Cube,
  Gear,
  Gift,
  Lightbulb,
  Printer,
  Stack,
} from "@phosphor-icons/react";

type ChakraSide = "left" | "right";

const LEFT_TICKS = Array.from({ length: 24 }, (_, index) => index * 15);
const RIGHT_TICKS = Array.from({ length: 18 }, (_, index) => index * 20);

const CALLOUTS = {
  left: [
    { className: "hero-callout--materials", label: "Materials", value: "PLA · PETG", icon: Stack },
    { className: "hero-callout--filaments", label: "Advanced filaments", value: "PETG-CF · PLA-CF", icon: Gear },
    { className: "hero-callout--technology", label: "Print technology", value: "FDM + SLA", icon: Printer },
    { className: "hero-callout--cad", label: "Design to reality", value: "CAD → PART", icon: Cube },
    { className: "hero-callout--layer", label: "Layer by layer", value: "Additive manufacturing", icon: Stack },
  ],
  right: [
    { className: "hero-callout--collectibles", label: "Collectibles", value: "Figurines & miniatures", icon: Cube },
    { className: "hero-callout--personalized", label: "Personalized", value: "Gifts made for you", icon: Gift },
    { className: "hero-callout--lighting", label: "Creative lighting", value: "Lamps & lithophanes", icon: Lightbulb },
    { className: "hero-callout--engineering", label: "Engineering", value: "Functional components", icon: Gear },
    { className: "hero-callout--custom", label: "Custom creations", value: "Your idea, 3D printed", icon: Printer },
  ],
} as const;

function ChakraSvg({ side }: { side: ChakraSide }) {
  const ticks = side === "left" ? LEFT_TICKS : RIGHT_TICKS;
  const isLeft = side === "left";

  return (
    <svg className="hero-chakra-svg" viewBox="0 0 760 760" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id={`chakra-glow-${side}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E96B2C" stopOpacity="0.14" />
          <stop offset="68%" stopColor="#E96B2C" stopOpacity="0.035" />
          <stop offset="100%" stopColor="#E96B2C" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle className="chakra-glow" cx="380" cy="380" r="300" fill={`url(#chakra-glow-${side})`} />
      <g className="chakra-circle chakra-circle--outer">
        <circle cx="380" cy="380" r="326" strokeDasharray="116 28" />
        <path d="M380 54a326 326 0 0 1 282 163" />
      </g>
      <g className="chakra-circle chakra-circle--middle">
        <circle cx="380" cy="380" r="254" strokeDasharray="84 24" />
        <path d={isLeft ? "M194 317a192 192 0 0 1 310-93" : "M565 442a192 192 0 0 1-310 93"} />
      </g>
      <g className="chakra-circle chakra-circle--inner">
        <circle cx="380" cy="380" r="153" strokeDasharray="48 18" />
        <path d="m380 268 97 56v112l-97 56-97-56V324l97-56Z" />
      </g>
      <g className="chakra-outer-ring">
        <circle cx="380" cy="380" r="326" />
        <circle cx="380" cy="380" r="307" strokeDasharray="2 16" />
        <path d="M380 54a326 326 0 0 1 282 163" />
      </g>
      <g className="chakra-ticks">
        {ticks.map((angle) => (
          <path key={angle} d="M380 42v18" transform={`rotate(${angle} 380 380)`} />
        ))}
      </g>
      <g className="chakra-mid-ring">
        <circle cx="380" cy="380" r="254" />
        <circle cx="380" cy="380" r="232" strokeDasharray="28 18" />
        <path d={isLeft ? "M194 317a192 192 0 0 1 310-93" : "M565 442a192 192 0 0 1-310 93"} />
      </g>
      <g className="chakra-inner-ring">
        <circle cx="380" cy="380" r="153" />
        <circle cx="380" cy="380" r="112" strokeDasharray="5 13" />
        <path d="m380 268 97 56v112l-97 56-97-56V324l97-56Z" />
        <path d="m283 324 97 56 97-56M380 380v112" />
      </g>
      <g className="chakra-gear">
        <circle cx="380" cy="380" r="72" />
        {Array.from({ length: 8 }, (_, index) => (
          <path key={index} d="M380 296v19" transform={`rotate(${index * 45} 380 380)`} />
        ))}
      </g>
      <g className="chakra-orbit">
        <ellipse cx="380" cy="380" rx="284" ry="105" />
        <circle cx="96" cy="380" r="6" />
        <circle cx="664" cy="380" r="4" />
      </g>
      <g className="chakra-nodes">
        <circle cx="380" cy="127" r="5" />
        <circle cx="558" cy="225" r="4" />
        <circle cx="214" cy="537" r="4" />
        <circle cx="380" cy="380" r="7" />
      </g>
      <g className="chakra-crosshair">
        <path d="M380 88v34M380 638v34M88 380h34M638 380h34" />
        <circle cx="380" cy="380" r="12" />
      </g>
    </svg>
  );
}

function Callout({
  className,
  label,
  value,
  icon: Icon,
}: {
  className: string;
  label: string;
  value: string;
  icon: typeof Stack;
}) {
  return (
    <div className={`hero-callout ${className}`}>
      <span className="hero-callout-icon"><Icon size={13} weight="bold" /></span>
      <span>
        <strong>{label}</strong>
        <small>{value}</small>
      </span>
    </div>
  );
}

export function HeroChakra({ side }: { side: ChakraSide }) {
  return (
    <div className={`hero-chakra hero-chakra--${side}`}>
      <ChakraSvg side={side} />
      {CALLOUTS[side].map((callout) => (
        <Callout key={callout.className} {...callout} />
      ))}
      <span className="hero-annotation hero-annotation--one">
        {side === "left" ? "LAYER 042 / 186" : "DESIGNED TO BE MADE"}
      </span>
      <span className="hero-annotation hero-annotation--two">
        {side === "left" ? "LAYER HEIGHT / 0.12–0.20 MM" : "DIGITAL MODEL → PHYSICAL OBJECT"}
      </span>
      <div className="hero-chakra-text-track" aria-hidden="true">
        <div className="hero-chakra-text-scroll">
          {[...CALLOUTS[side], ...CALLOUTS[side]].map((callout, index) => (
            <span key={`${callout.className}-${index}`}>
              {callout.label} <b>·</b>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
