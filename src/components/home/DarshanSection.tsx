import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { temples } from '@/data/templeStreams';

export default function DarshanSection() {
  const [activeTab, setActiveTab] = useState('live');

  // Show first 6 temples for preview
  const previewTemples = temples.slice(0, 6);

  return (
    <section className="px-6 py-16 md:py-24">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-3 block">
            Divine Connection
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            Temple Darshan
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
            Experience the divine from temples across India, 24/7
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full max-w-xs mx-auto mb-8 bg-void-light/60 border border-border">
              <TabsTrigger
                value="live"
                className="flex-1 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Live Now
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="recorded"
                className="flex-1 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Recorded
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="live" className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previewTemples.map((temple, index) => (
                  <TempleCard
                    key={temple.id}
                    temple={temple}
                    isLive={true}
                    index={index}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recorded" className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previewTemples.map((temple, index) => (
                  <TempleCard
                    key={temple.id}
                    temple={temple}
                    isLive={false}
                    index={index}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-10"
        >
          <Link
            to="/live-darshan"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/30 text-primary font-display text-sm tracking-wider hover:bg-primary/20 hover:border-primary/50 transition-all duration-300"
          >
            View All Temples
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

interface TempleCardProps {
  temple: typeof temples[0];
  isLive: boolean;
  index: number;
}

function TempleCard({ temple, isLive, index }: TempleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to="/live-darshan"
        className="group block rounded-xl overflow-hidden bg-void-light/40 border border-border hover:border-primary/30 transition-all duration-300"
      >
        {/* Thumbnail */}
        <div className="aspect-video bg-void relative overflow-hidden">
          <img
            src={`https://img.youtube.com/vi/${temple.youtubeVideoId}/mqdefault.jpg`}
            alt={temple.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* Badge */}
          <div className="absolute top-2 left-2">
            {isLive ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/90 text-white text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-black text-xs font-medium">
                Recorded
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-display text-sm md:text-base text-foreground truncate group-hover:text-primary transition-colors">
            {temple.name}
          </h3>
          <p className="text-muted-foreground text-xs md:text-sm font-body truncate">
            {temple.location}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
