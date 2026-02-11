export default function WavyBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Base soft gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #F0FDF9 0%, #FFF5F0 40%, #FDF2F8 70%, #F0FDFA 100%)',
        }}
      />

      {/* Wave layer 1 — top mint */}
      <svg
        className="absolute top-0 left-0 w-full"
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        style={{ height: '45vh' }}
      >
        <defs>
          <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#99F6E4" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#A7F3D0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          d="M0,0 L0,200 C120,280 240,160 480,220 C720,280 840,140 1080,200 C1200,230 1320,180 1440,200 L1440,0 Z"
          fill="url(#wave1)"
        />
      </svg>

      {/* Wave layer 2 — mid teal */}
      <svg
        className="absolute top-0 left-0 w-full"
        viewBox="0 0 1440 350"
        preserveAspectRatio="none"
        style={{ height: '38vh' }}
      >
        <defs>
          <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5EEAD4" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#2DD4BF" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#99F6E4" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          d="M0,0 L0,160 C200,240 400,100 600,180 C800,260 1000,120 1200,180 C1320,210 1380,170 1440,180 L1440,0 Z"
          fill="url(#wave2)"
        />
      </svg>

      {/* Wave layer 3 — bottom coral/peach */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        style={{ height: '40vh' }}
      >
        <defs>
          <linearGradient id="wave3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FECDD3" stopOpacity="0.4" />
            <stop offset="40%" stopColor="#FED7AA" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#FBCFE8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <path
          d="M0,400 L0,220 C180,140 360,280 540,200 C720,120 900,260 1080,180 C1200,140 1320,220 1440,180 L1440,400 Z"
          fill="url(#wave3)"
        />
      </svg>

      {/* Wave layer 4 — subtle peach overlay */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 300"
        preserveAspectRatio="none"
        style={{ height: '30vh' }}
      >
        <defs>
          <linearGradient id="wave4" x1="0%" y1="100%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDA4AF" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#FDBA74" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FCA5A5" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path
          d="M0,300 L0,180 C240,100 480,240 720,160 C960,80 1200,200 1440,140 L1440,300 Z"
          fill="url(#wave4)"
        />
      </svg>

      {/* Soft radial glow center */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(167,243,208,0.15) 0%, transparent 60%)',
        }}
      />
    </div>
  );
}
