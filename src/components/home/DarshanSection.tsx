import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { temples } from '@/data/templeStreams';

export default function DarshanSection() {
  const previewTemples = temples.slice(0, 4);

  return (
    <section className="px-6 py-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Temple Darshan
        </h2>
        <Link to="/live-darshan" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {previewTemples.map((temple, index) => (
          <motion.div
            key={temple.id}
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.04 }}
            className="shrink-0 w-[156px]"
          >
            <Link
              to="/live-darshan"
              className="block rounded-xl overflow-hidden bg-card hover:brightness-110 transition-all duration-200 active:scale-[0.98]"
            >
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                <img
                  src={`https://img.youtube.com/vi/${temple.youtubeVideoId}/mqdefault.jpg`}
                  alt={temple.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-card/80 backdrop-blur-sm text-[10px] font-medium text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                    Live
                  </span>
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-xs font-medium text-foreground truncate">
                  {temple.name}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {temple.location}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
