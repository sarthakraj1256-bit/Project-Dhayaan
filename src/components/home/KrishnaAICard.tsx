import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function KrishnaAICard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className="px-5 py-2"
    >
      <Link
        to="/my-krishna"
        className="block rounded-2xl p-5 transition-all duration-200 active:scale-[0.98] hover:-translate-y-0.5"
        style={{
          background: 'linear-gradient(135deg, #0D1B3E 0%, #1A3A6B 60%, #2E5FA3 100%)',
          border: '1px solid rgba(245,200,66,0.25)',
          boxShadow: '0 4px 24px rgba(13,27,62,0.5), 0 0 40px rgba(245,200,66,0.04)',
        }}
      >
        <div className="flex items-start gap-3.5">
          <span className="text-[28px] mt-0.5">🪷</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold" style={{ color: '#F5C842' }}>
              My Krishna AI
            </h3>
            <p className="text-[12px] mt-1 leading-relaxed" style={{ color: '#93B4E8' }}>
              Seek wisdom from the Bhagavad Gita
            </p>
            <p className="text-[11px] mt-2 flex items-center gap-1" style={{ color: '#D4B483' }}>
              Ask your question to Krishna
              <ArrowRight className="w-3 h-3" />
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
