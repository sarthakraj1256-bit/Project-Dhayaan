export default function WavyBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Base — soft mint */}
      <div className="absolute inset-0" style={{ background: '#F0FDF9' }} />

      {/* Layer 1 — Deep dark-blue band (top-left sweep) */}
      <svg
        className="absolute top-0 left-0 w-full"
        viewBox="0 0 1440 700"
        preserveAspectRatio="none"
        style={{ height: '65vh' }}
      >
        <path
          d="M0,0 L1440,0 L1440,180 C1200,320 900,380 600,300 C300,220 120,350 0,280 Z"
          fill="#1E3A5F"
        />
      </svg>

      {/* Layer 2 — Teal ribbon over blue */}
      <svg
        className="absolute top-0 left-0 w-full"
        viewBox="0 0 1440 700"
        preserveAspectRatio="none"
        style={{ height: '60vh' }}
      >
        <path
          d="M0,0 L1440,0 L1440,120 C1100,260 800,200 500,260 C200,320 60,200 0,240 Z"
          fill="#2DD4BF"
        />
      </svg>

      {/* Layer 3 — Mint panel sliding from top */}
      <svg
        className="absolute top-0 left-0 w-full"
        viewBox="0 0 1440 600"
        preserveAspectRatio="none"
        style={{ height: '42vh' }}
      >
        <path
          d="M0,0 L1440,0 L1440,80 C1200,180 960,140 720,180 C480,220 240,140 0,190 Z"
          fill="#99F6E4"
        />
      </svg>

      {/* Layer 3.5 — Dark blue mid-section fill */}
      <div
        className="absolute left-0 w-full"
        style={{
          top: '30vh',
          height: '40vh',
          background: '#1E3A5F',
        }}
      />

      {/* Layer 4 — Coral / peach band (bottom sweep) */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 600"
        preserveAspectRatio="none"
        style={{ height: '50vh' }}
      >
        <path
          d="M0,600 L1440,600 L1440,360 C1200,260 960,340 720,280 C480,220 240,310 0,260 Z"
          fill="#F87171"
          opacity="0.55"
        />
      </svg>

      {/* Layer 5 — Peach ribbon above coral */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 500"
        preserveAspectRatio="none"
        style={{ height: '40vh' }}
      >
        <path
          d="M0,500 L1440,500 L1440,340 C1100,250 800,320 500,280 C200,240 80,310 0,300 Z"
          fill="#FBBF24"
          opacity="0.3"
        />
      </svg>

      {/* Layer 6 — Soft coral/peach bottom edge */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        style={{ height: '32vh' }}
      >
        <path
          d="M0,400 L1440,400 L1440,280 C1200,200 900,300 600,240 C300,180 100,260 0,220 Z"
          fill="#FB923C"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
