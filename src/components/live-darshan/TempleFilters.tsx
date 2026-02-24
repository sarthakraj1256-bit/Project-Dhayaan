import { motion } from 'framer-motion';
import { Filter, Radio, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  TempleCategory, 
  DeityType, 
  Region,
} from '@/data/templeStreams';
import type { TranslationKey } from '@/i18n/translations';

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

const categoryKeyMap: Record<TempleCategory, TranslationKey> = {
  jyotirlinga: 'temple.cat.jyotirlinga',
  shakti_peeth: 'temple.cat.shaktiPeeth',
  major: 'temple.cat.major',
  international: 'temple.cat.international',
  iskcon: 'temple.cat.iskcon',
};

const deityKeyMap: Record<DeityType, TranslationKey> = {
  shiva: 'temple.deity.shiva',
  vishnu: 'temple.deity.vishnu',
  devi: 'temple.deity.devi',
  guru: 'temple.deity.guru',
  multi: 'temple.deity.multi',
};

const regionKeyMap: Record<Region, TranslationKey> = {
  north: 'temple.region.north',
  south: 'temple.region.south',
  east: 'temple.region.east',
  west: 'temple.region.west',
  international: 'temple.region.international',
};

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
  const { t } = useLanguage();
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
          {t('temple.liveOnly')}
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
          {t('temple.clearFilters')}
        </Button>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          {t('temple.category')}
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
                {category === 'all' ? t('temple.allTemples') : t(categoryKeyMap[category])}
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Deity Filter */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">{t('temple.byDeity')}</h4>
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
                {deity === 'all' ? t('temple.allDeities') : t(deityKeyMap[deity])}
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Region Filter */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">{t('temple.byRegion')}</h4>
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
                {region === 'all' ? t('temple.allRegions') : t(regionKeyMap[region])}
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TempleFilters;
