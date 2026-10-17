"use client";

const ITEMS = [
  "FDM 3D Printing",
  "SLA Resin Printing",
  "Custom Product Design",
  "Mechanical & Robotics Parts",
  "Personalized Gifts",
  "Lamps & Lithophanes",
  "Figurines & Collectibles",
  "Functional Prototypes",
  "Pan-India Shipping",
  "International Orders",
  "Fast Turnaround",
  "WhatsApp Support",
];


const SEP = "·";

export function HomeMarquee() {
  const track = [...ITEMS, ...ITEMS];

  return (
    <div className="marquee-wrap" aria-hidden="true">
      <div className="marquee-track">
        {track.map((item, i) => (
          <span key={i} className="marquee-item">
            {item}
            <span className="marquee-sep" aria-hidden="true">{SEP}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
