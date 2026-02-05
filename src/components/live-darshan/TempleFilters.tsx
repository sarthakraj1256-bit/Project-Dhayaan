import { motion } from 'framer-motion';
import { Filter, Radio, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TempleCategory, 
  DeityType, 
  Region,
  categoryLabels,
  deityLabels,
  regionLabels 
} from '@/data/templeStreams';

interface TempleFiltersProps {
  selectedCategory: TempleCategory | 'all';
  selectedDeity: DeityType | 'all';
  selectedRegion: Region | 'all';
  showLiveOnly: boolean;
  onCategoryChange: (category: TempleCategory | 'all') => void;
  onDeityChange: (deity: DeityType | 'all') => void;
  onRegionChange: (region: Region | 'all') => void;
  onLiveOnlyChange: (liveOnly: boolean) => void;
}

const TempleFilters = ({
  selectedCategory,
  selectedDeity,
  selectedRegion,
  showLiveOnly,
  onCategoryChange,
  onDeityChange,
  onRegionChange,
  onLiveOnlyChange
}: TempleFiltersProps) => {
  const categories: (TempleCategory | 'all')[] = ['all', 'jyotirlinga', 'shakti_peeth', 'major', 'international', 'iskcon'];
  const deities: (DeityType | 'all')[] = ['all', 'shiva', 'vishnu', 'devi', 'guru'];
  const regions: (Region | 'all')[] = ['all', 'north', 'south', 'east', 'west', 'international'];

  return (
    <div className="space-y-6">
      {/* Live Only Toggle */}
      <div className="flex items-center gap-3">
        <Button
          variant={showLiveOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => onLiveOnlyChange(!showLiveOnly)}
          className="gap-2"
        >
          <Radio className={`w-4 h-4 ${showLiveOnly ? 'animate-pulse' : ''}`} />
          Live Only
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onCategoryChange('all');
            onDeityChange('all');
            onRegionChange('all');
            onLiveOnlyChange(false);
          }}
          className="gap-2 text-muted-foreground"
        >
          <Filter className="w-4 h-4" />
          Clear Filters
        </Button>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Temple Category
        </h4>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <motion.div
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge
                variant={selectedCategory === category ? 'default' : 'outline'}
                className={`cursor-pointer transition-all ${
                  selectedCategory === category 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => onCategoryChange(category)}
              >
                {category === 'all' ? '🏛️ All Temples' : categoryLabels[category]}
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Deity Filter */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">By Deity</h4>
        <div className="flex flex-wrap gap-2">
          {deities.map((deity) => (
            <motion.div
              key={deity}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge
                variant={selectedDeity === deity ? 'default' : 'outline'}
                className={`cursor-pointer transition-all ${
                  selectedDeity === deity 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => onDeityChange(deity)}
              >
                {deity === 'all' ? '✨ All Deities' : deityLabels[deity]}
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Region Filter */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">By Region</h4>
        <div className="flex flex-wrap gap-2">
          {regions.map((region) => (
            <motion.div
              key={region}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge
                variant={selectedRegion === region ? 'default' : 'outline'}
                className={`cursor-pointer transition-all ${
                  selectedRegion === region 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => onRegionChange(region)}
              >
                {region === 'all' ? '🌏 All Regions' : regionLabels[region]}
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TempleFilters;
