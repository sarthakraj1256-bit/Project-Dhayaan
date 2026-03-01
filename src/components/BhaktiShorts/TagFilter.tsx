import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

const TAGS = [
  { key: null, label: "All" },
  { key: "bhajan", label: "Bhajan" },
  { key: "aarti", label: "Aarti" },
  { key: "meditation", label: "Meditation" },
  { key: "satsang", label: "Satsang" },
  { key: "mantra", label: "Mantra" },
  { key: "story", label: "Story" },
  { key: "festival", label: "Festival" },
] as const;

interface TagFilterProps {
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
}

const TagFilter = ({ activeTag, onTagChange }: TagFilterProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll active tag into view
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeTag]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-x-auto scrollbar-hide flex gap-2 py-1"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {TAGS.map((tag) => {
        const isActive = activeTag === tag.key;
        return (
          <button
            key={tag.key ?? "all"}
            ref={isActive ? activeRef : undefined}
            onClick={() => onTagChange(tag.key)}
            className="relative flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-colors touch-target"
            style={
              isActive
                ? {
                    background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
                    color: "#0A0604",
                  }
                : {
                    background: "rgba(15,10,5,0.5)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(201,168,76,0.2)",
                    color: "rgba(232,201,122,0.8)",
                  }
            }
            aria-label={`Filter by ${tag.label}`}
            aria-pressed={isActive}
          >
            {tag.label}
          </button>
        );
      })}
    </div>
  );
};

export default TagFilter;
