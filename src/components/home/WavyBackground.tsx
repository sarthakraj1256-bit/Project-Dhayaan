import { motion, useScroll, useTransform } from 'framer-motion';

export default function WavyBackground() {
  const { scrollY } = useScroll();
  const topY = useTransform(scrollY, [0, 600], [0, -80]);
  const bottomY = useTransform(scrollY, [0, 600], [0, 80]);

  return (
    <>
      {/* Top Green/Cyan Wave */}
      <motion.div
        initial={{ y: '-100%' }}
        animate={{ y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        style={{ height: '35vh', y: topY }}
        className="fixed top-0 left-0 right-0 z-0 pointer-events-none"
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #0D9488 0%, #06B6D4 40%, #22D3EE 70%, #67E8F9 100%)',
            opacity: 0.75,
          }}
        />
        {/* Wavy bottom edge */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          style={{ height: '80px', transform: 'translateY(1px)', opacity: 0.75 }}
        >
          <path
            d="M0,40 C180,100 360,0 540,50 C720,100 900,10 1080,60 C1200,90 1320,30 1440,50 L1440,0 L0,0 Z"
            fill="url(#topGradient)"
          />
          <defs>
            <linearGradient id="topGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0D9488" />
              <stop offset="40%" stopColor="#06B6D4" />
              <stop offset="70%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#67E8F9" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Bottom Orange/Pink Wave */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        style={{ height: '30vh', y: bottomY }}
        className="fixed bottom-0 left-0 right-0 z-0 pointer-events-none"
      >
        {/* Wavy top edge */}
        <svg
          className="absolute top-0 left-0 w-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          style={{ height: '80px', transform: 'translateY(-1px)', opacity: 0.75 }}
        >
          <path
            d="M0,80 C180,20 360,110 540,60 C720,10 900,100 1080,50 C1200,20 1320,80 1440,60 L1440,120 L0,120 Z"
            fill="url(#bottomGradient)"
          />
          <defs>
            <linearGradient id="bottomGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="40%" stopColor="#FB923C" />
              <stop offset="70%" stopColor="#F472B6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        </svg>
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #FB923C 40%, #F472B6 70%, #EC4899 100%)',
            top: '79px',
            opacity: 0.75,
          }}
        />
      </motion.div>
    </>
  );
}
