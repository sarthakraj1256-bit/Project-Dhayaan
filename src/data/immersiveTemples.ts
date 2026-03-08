// Immersive 360° Temple Data Structure

export type TempleCategory = 
  | 'iskcon' 
  | 'jyotirlinga' 
  | 'shakti_peeth' 
  | 'vishnu' 
  | 'sikh' 
  | 'international'
  | 'heritage';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TempleZone {
  id: string;
  name: string;
  nameHindi?: string;
  description: string;
  // Placeholder panorama - will be replaced with real 360° images
  panoramaUrl: string;
  // Hotspots for navigation to other zones
  hotspots: {
    id: string;
    targetZoneId: string;
    position: { x: number; y: number; z: number };
    label: string;
  }[];
  // Interactive ritual points
  ritualPoints: {
    id: string;
    type: 'diya' | 'bell' | 'flower' | 'prasad' | 'meditation';
    position: { x: number; y: number; z: number };
    label: string;
  }[];
  // Meditation spots
  meditationSpots: {
    id: string;
    position: { x: number; y: number; z: number };
    name: string;
    recommended: boolean;
  }[];
  // Audio ambience specific to this zone
  ambienceType: 'main_hall' | 'sanctum' | 'corridor' | 'courtyard' | 'entrance';
}

export interface ImmersiveTemple {
  id: string;
  name: string;
  nameHindi: string;
  location: string;
  category: TempleCategory;
  deity: string;
  description: string;
  thumbnail: string;
  zones: TempleZone[];
  defaultZoneId: string;
  audio: {
    aartiTrack: string;
    kirtanTrack: string;
    bellSound: string;
    ambienceTrack: string;
    chantingTrack: string;
  };
  themes: {
    morning: { lightColor: string; intensity: number };
    afternoon: { lightColor: string; intensity: number };
    evening: { lightColor: string; intensity: number };
    night: { lightColor: string; intensity: number };
  };
  features: {
    hasLiveStream: boolean;
    hasMeditation: boolean;
    hasRituals: boolean;
    hasGuidedTour: boolean;
  };
  festivals?: {
    name: string;
    startDate: string;
    endDate: string;
    specialDecoration: boolean;
  }[];
  /** If set, clicking opens this external virtual tour URL instead of the internal 360° viewer */
  virtualTourUrl?: string;
}

// Temple-specific panorama image mappings for variety
const templePanoramaImages: Record<string, { entrance: string; corridor: string; sanctum: string }> = {
  // ISKCON temples - Krishna themed
  iskcon_vrindavan: {
    entrance: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=2048&q=80',
    corridor: 'https://images.unsplash.com/photo-1609619385002-f40f1df9b7eb?w=2048&q=80',
    sanctum: 'https://images.unsplash.com/photo-1545126178-862cdb469409?w=2048&q=80'
  },
  iskcon_mayapur: {
    entrance: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=2048&q=80',
    corridor: 'https://images.unsplash.com/photo-1609619385002-f40f1df9b7eb?w=2048&q=80',
    sanctum: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=2048&q=80'
  },
  iskcon_bangalore: {
    entrance: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=2048&q=80',
    corridor: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2048&q=80',
    sanctum: 'https://images.unsplash.com/photo-1609619385002-f40f1df9b7eb?w=2048&q=80'
  },
  // Jyotirlinga temples - Shiva themed
  kedarnath: {
    entrance: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=2048&q=80',
    corridor: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=2048&q=80',
    sanctum: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2048&q=80'
  },
  kashi_vishwanath: {
    entrance: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=2048&q=80',
    corridor: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=2048&q=80',
    sanctum: 'https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=2048&q=80'
  },
  somnath: {
    entrance: 'https://images.unsplash.com/photo-1590766940554-634f6c5d9a70?w=2048&q=80',
    corridor: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=2048&q=80',
    sanctum: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=2048&q=80'
  },
  mahakaleshwar: {
    entrance: 'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=2048&q=80',
    corridor: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=2048&q=80',
    sanctum: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=2048&q=80'
  },
  // Shakti Peeth temples - Goddess themed
  vaishno_devi: {
    entrance: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=2048&q=80',
    corridor: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2048&q=80',
    sanctum: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=2048&q=80'
  },
  kamakhya: {
    entrance: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2048&q=80',
    corridor: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=2048&q=80',
    sanctum: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=2048&q=80'
  },
  meenakshi_amman: {
    entrance: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=2048&q=80',
    corridor: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=2048&q=80',
    sanctum: 'https://images.unsplash.com/photo-1609619385002-f40f1df9b7eb?w=2048&q=80'
  },
  // Vishnu temples
  tirupati: {
    entrance: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=2048&q=80',
    corridor: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=2048&q=80',
    sanctum: 'https://images.unsplash.com/photo-1545126178-862cdb469409?w=2048&q=80'
  },
  jagannath_puri: {
    entrance: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=2048&q=80',
    corridor: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=2048&q=80',
    sanctum: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=2048&q=80'
  },
  badrinath: {
    entrance: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=2048&q=80',
    corridor: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2048&q=80',
    sanctum: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2048&q=80'
  },
  // Sikh temples
  golden_temple: {
    entrance: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=2048&q=80',
    corridor: 'https://images.unsplash.com/photo-1609619385002-f40f1df9b7eb?w=2048&q=80',
    sanctum: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=2048&q=80'
  },
  // International temples
  pashupatinath: {
    entrance: 'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=2048&q=80',
    corridor: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=2048&q=80',
    sanctum: 'https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=2048&q=80'
  },
  batu_caves: {
    entrance: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=2048&q=80',
    corridor: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2048&q=80',
    sanctum: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=2048&q=80'
  }
};

// Fallback images for temples not in the mapping
const defaultImages = {
  entrance: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=2048&q=80',
  corridor: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=2048&q=80',
  sanctum: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=2048&q=80'
};

// Default zone template for temples with unique images per temple
const createDefaultZones = (templeId: string): TempleZone[] => {
  const images = templePanoramaImages[templeId] || defaultImages;
  
  return [
    {
      id: `${templeId}_entrance`,
      name: 'Temple Entrance',
      nameHindi: 'मंदिर प्रवेश द्वार',
      description: 'The grand entrance to the sacred temple',
      panoramaUrl: images.entrance,
      hotspots: [
        { id: 'h1', targetZoneId: `${templeId}_corridor`, position: { x: 0, y: 0, z: -10 }, label: 'Enter Temple' }
      ],
      ritualPoints: [
        { id: 'r1', type: 'bell', position: { x: 3, y: 2, z: -5 }, label: 'Ring Temple Bell' }
      ],
      meditationSpots: [],
      ambienceType: 'entrance'
    },
    {
      id: `${templeId}_corridor`,
      name: 'Temple Corridor',
      nameHindi: 'मंदिर गलियारा',
      description: 'The sacred passage leading to the main sanctum',
      panoramaUrl: images.corridor,
      hotspots: [
        { id: 'h1', targetZoneId: `${templeId}_entrance`, position: { x: 0, y: 0, z: 10 }, label: 'Back to Entrance' },
        { id: 'h2', targetZoneId: `${templeId}_sanctum`, position: { x: 0, y: 0, z: -10 }, label: 'Enter Sanctum' }
      ],
      ritualPoints: [
        { id: 'r1', type: 'diya', position: { x: -3, y: 1, z: -3 }, label: 'Light Diya' },
        { id: 'r2', type: 'flower', position: { x: 3, y: 1, z: -3 }, label: 'Offer Flowers' }
      ],
      meditationSpots: [
        { id: 'm1', position: { x: -5, y: 0, z: 0 }, name: 'Quiet Corner', recommended: false }
      ],
      ambienceType: 'corridor'
    },
    {
      id: `${templeId}_sanctum`,
      name: 'Main Sanctum (Garbhagriha)',
      nameHindi: 'गर्भगृह',
      description: 'The innermost sanctum where the deity resides',
      panoramaUrl: images.sanctum,
      hotspots: [
        { id: 'h1', targetZoneId: `${templeId}_corridor`, position: { x: 0, y: 0, z: 10 }, label: 'Back to Corridor' }
      ],
      ritualPoints: [
        { id: 'r1', type: 'prasad', position: { x: 0, y: 1, z: -8 }, label: 'Offer Prasad' },
        { id: 'r2', type: 'diya', position: { x: -2, y: 1, z: -6 }, label: 'Light Aarati Diya' },
        { id: 'r3', type: 'flower', position: { x: 2, y: 1, z: -6 }, label: 'Offer Garland' }
      ],
      meditationSpots: [
        { id: 'm1', position: { x: 0, y: 0, z: 5 }, name: 'Before the Deity', recommended: true }
      ],
      ambienceType: 'sanctum'
    }
  ];
};

// ISKCON Temples
export const iskconTemples: ImmersiveTemple[] = [
  {
    id: 'iskcon_vrindavan',
    name: 'ISKCON Vrindavan',
    nameHindi: 'इस्कॉन वृंदावन',
    location: 'Vrindavan, Uttar Pradesh',
    category: 'iskcon',
    deity: 'Krishna-Balaram',
    description: 'The spiritual headquarters of ISKCON in the holy land of Vrindavan, where Lord Krishna performed His divine pastimes.',
    thumbnail: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=400',
    zones: createDefaultZones('iskcon_vrindavan'),
    defaultZoneId: 'iskcon_vrindavan_entrance',
    audio: {
      aartiTrack: 'Traditional ISKCON Mangala Aarati with kartals and mridanga',
      kirtanTrack: 'Hare Krishna Mahamantra kirtan with devotees chanting',
      bellSound: 'Large brass temple bell resonating',
      ambienceTrack: 'Temple morning ambience with birds and distant chanting',
      chantingTrack: 'Hare Krishna Hare Krishna Krishna Krishna Hare Hare, Hare Rama Hare Rama Rama Rama Hare Hare'
    },
    themes: {
      morning: { lightColor: '#FFE4B5', intensity: 0.8 },
      afternoon: { lightColor: '#FFF8DC', intensity: 1.0 },
      evening: { lightColor: '#FFD700', intensity: 0.7 },
      night: { lightColor: '#4A4A6A', intensity: 0.3 }
    },
    features: {
      hasLiveStream: true,
      hasMeditation: true,
      hasRituals: true,
      hasGuidedTour: true
    },
    festivals: [
      { name: 'Janmashtami', startDate: '2026-08-25', endDate: '2026-08-26', specialDecoration: true }
    ]
  },
  {
    id: 'iskcon_mayapur',
    name: 'ISKCON Mayapur',
    nameHindi: 'इस्कॉन मायापुर',
    location: 'Mayapur, West Bengal',
    category: 'iskcon',
    deity: 'Radha-Madhava',
    description: 'The world headquarters of ISKCON and birthplace of Lord Chaitanya Mahaprabhu.',
    thumbnail: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400',
    zones: createDefaultZones('iskcon_mayapur'),
    defaultZoneId: 'iskcon_mayapur_entrance',
    audio: {
      aartiTrack: 'Grand Mayapur Aarati with hundreds of devotees',
      kirtanTrack: 'Bengali style kirtan with harmonium and mridanga',
      bellSound: 'Multiple brass bells ringing in harmony',
      ambienceTrack: 'Mayapur morning sounds with Ganges river',
      chantingTrack: 'Sri Krishna Chaitanya Prabhu Nityananda Sri Advaita Gadadhara Srivasa Adi Gaura Bhakta Vrinda'
    },
    themes: {
      morning: { lightColor: '#FFE4B5', intensity: 0.9 },
      afternoon: { lightColor: '#FFFACD', intensity: 1.0 },
      evening: { lightColor: '#FFA500', intensity: 0.8 },
      night: { lightColor: '#2F2F4F', intensity: 0.25 }
    },
    features: {
      hasLiveStream: true,
      hasMeditation: true,
      hasRituals: true,
      hasGuidedTour: true
    }
  },
  {
    id: 'iskcon_bangalore',
    name: 'ISKCON Bangalore',
    nameHindi: 'इस्कॉन बैंगलोर',
    location: 'Bangalore, Karnataka',
    category: 'iskcon',
    deity: 'Radha-Krishna',
    description: 'One of the largest ISKCON temples in the world with stunning architecture.',
    thumbnail: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400',
    zones: createDefaultZones('iskcon_bangalore'),
    defaultZoneId: 'iskcon_bangalore_entrance',
    audio: {
      aartiTrack: 'South Indian style ISKCON Aarati',
      kirtanTrack: 'Melodious kirtan with veena accompaniment',
      bellSound: 'Deep resonating temple bell',
      ambienceTrack: 'Peaceful temple garden ambience',
      chantingTrack: 'Hare Krishna Mahamantra in melodious tune'
    },
    themes: {
      morning: { lightColor: '#FFEFD5', intensity: 0.85 },
      afternoon: { lightColor: '#FFFAF0', intensity: 1.0 },
      evening: { lightColor: '#FFD700', intensity: 0.75 },
      night: { lightColor: '#3D3D5C', intensity: 0.3 }
    },
    features: {
      hasLiveStream: true,
      hasMeditation: true,
      hasRituals: true,
      hasGuidedTour: false
    }
  }
];

// Jyotirlinga Temples
export const jyotirlingaTemples: ImmersiveTemple[] = [
  {
    id: 'kedarnath',
    name: 'Kedarnath Temple',
    nameHindi: 'केदारनाथ मंदिर',
    location: 'Kedarnath, Uttarakhand',
    category: 'jyotirlinga',
    deity: 'Lord Shiva',
    description: 'One of the holiest Jyotirlingas situated in the majestic Himalayas at 3,583 meters.',
    thumbnail: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400',
    zones: createDefaultZones('kedarnath'),
    defaultZoneId: 'kedarnath_entrance',
    audio: {
      aartiTrack: 'Himalayan Shiva Aarati with damaru and bells',
      kirtanTrack: 'Om Namah Shivaya chanting in mountain echo',
      bellSound: 'Ancient brass bell with Himalayan wind',
      ambienceTrack: 'Mountain wind and distant temple bells',
      chantingTrack: 'Om Namah Shivaya'
    },
    themes: {
      morning: { lightColor: '#E6E6FA', intensity: 0.7 },
      afternoon: { lightColor: '#F0FFFF', intensity: 0.9 },
      evening: { lightColor: '#DDA0DD', intensity: 0.6 },
      night: { lightColor: '#191970', intensity: 0.2 }
    },
    features: {
      hasLiveStream: true,
      hasMeditation: true,
      hasRituals: true,
      hasGuidedTour: true
    }
  },
  {
    id: 'kashi_vishwanath',
    name: 'Kashi Vishwanath Temple',
    nameHindi: 'काशी विश्वनाथ मंदिर',
    location: 'Varanasi, Uttar Pradesh',
    category: 'jyotirlinga',
    deity: 'Lord Shiva',
    description: 'The most sacred Shiva temple on the banks of the holy Ganges in the ancient city of Varanasi.',
    thumbnail: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400',
    zones: createDefaultZones('kashi_vishwanath'),
    defaultZoneId: 'kashi_vishwanath_entrance',
    audio: {
      aartiTrack: 'Ganga Aarati style Shiva worship with conch shells',
      kirtanTrack: 'Banaras style bhajan with tabla and harmonium',
      bellSound: 'Multiple temple bells creating sacred resonance',
      ambienceTrack: 'Ganga ghat ambience with distant prayers',
      chantingTrack: 'Har Har Mahadev, Om Namah Shivaya'
    },
    themes: {
      morning: { lightColor: '#FFDAB9', intensity: 0.8 },
      afternoon: { lightColor: '#FFE4C4', intensity: 1.0 },
      evening: { lightColor: '#FF8C00', intensity: 0.9 },
      night: { lightColor: '#2F4F4F', intensity: 0.35 }
    },
    features: {
      hasLiveStream: true,
      hasMeditation: true,
      hasRituals: true,
      hasGuidedTour: true
    }
  },
  {
    id: 'somnath',
    name: 'Somnath Temple',
    nameHindi: 'सोमनाथ मंदिर',
    location: 'Prabhas Patan, Gujarat',
    category: 'jyotirlinga',
    deity: 'Lord Shiva',
    description: 'The first among the twelve Jyotirlingas, rebuilt multiple times through history.',
    thumbnail: 'https://images.unsplash.com/photo-1590766940554-634f6c5d9a70?w=400',
    zones: createDefaultZones('somnath'),
    defaultZoneId: 'somnath_entrance',
    audio: {
      aartiTrack: 'Somnath evening Aarati with ocean waves',
      kirtanTrack: 'Gujarati Shiv bhajan with dhol',
      bellSound: 'Seaside temple bell with ocean breeze',
      ambienceTrack: 'Arabian Sea waves and temple ambience',
      chantingTrack: 'Jai Somnath, Om Namah Shivaya'
    },
    themes: {
      morning: { lightColor: '#ADD8E6', intensity: 0.75 },
      afternoon: { lightColor: '#87CEEB', intensity: 1.0 },
      evening: { lightColor: '#FF6347', intensity: 0.8 },
      night: { lightColor: '#000080', intensity: 0.3 }
    },
    features: {
      hasLiveStream: true,
      hasMeditation: true,
      hasRituals: true,
      hasGuidedTour: true
    }
  },
  {
    id: 'mahakaleshwar',
    name: 'Mahakaleshwar Temple',
    nameHindi: 'महाकालेश्वर मंदिर',
    location: 'Ujjain, Madhya Pradesh',
    category: 'jyotirlinga',
    deity: 'Lord Shiva (Mahakal)',
    description: 'The only south-facing Jyotirlinga, famous for the Bhasma Aarati ritual.',
    thumbnail: 'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=400',
    zones: createDefaultZones('mahakaleshwar'),
    defaultZoneId: 'mahakaleshwar_entrance',
    audio: {
      aartiTrack: 'Bhasma Aarati with sacred ash ritual sounds',
      kirtanTrack: 'Mahakal bhajan with Malwa folk style',
      bellSound: 'Deep underground temple bell',
      ambienceTrack: 'Ancient temple corridor echoes',
      chantingTrack: 'Jai Mahakal, Om Namah Shivaya'
    },
    themes: {
      morning: { lightColor: '#D3D3D3', intensity: 0.6 },
      afternoon: { lightColor: '#C0C0C0', intensity: 0.8 },
      evening: { lightColor: '#B8860B', intensity: 0.7 },
      night: { lightColor: '#1C1C1C', intensity: 0.25 }
    },
    features: {
      hasLiveStream: true,
      hasMeditation: true,
      hasRituals: true,
      hasGuidedTour: true
    }
  }
];

// Shakti Peeth Temples
export const shaktiPeethTemples: ImmersiveTemple[] = [
  {
    id: 'vaishno_devi',
    name: 'Vaishno Devi Temple',
    nameHindi: 'वैष्णो देवी मंदिर',
    location: 'Katra, Jammu & Kashmir',
    category: 'shakti_peeth',
    deity: 'Goddess Vaishno Devi',
    description: 'One of the most visited shrines in India, located in the Trikuta Mountains.',
    thumbnail: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=400',
    zones: createDefaultZones('vaishno_devi'),
    defaultZoneId: 'vaishno_devi_entrance',
    audio: {
      aartiTrack: 'Maa Vaishno Devi Aarati with Pahadi dhol',
      kirtanTrack: 'Jai Mata Di bhajan with mountain echoes',
      bellSound: 'Cave temple bell resonance',
      ambienceTrack: 'Mountain cave ambience with pilgrims',
      chantingTrack: 'Jai Mata Di, Maa Sherawali'
    },
    themes: {
      morning: { lightColor: '#FFB6C1', intensity: 0.7 },
      afternoon: { lightColor: '#FFC0CB', intensity: 0.85 },
      evening: { lightColor: '#FF69B4', intensity: 0.75 },
      night: { lightColor: '#4B0082', intensity: 0.3 }
    },
    features: {
      hasLiveStream: true,
      hasMeditation: true,
      hasRituals: true,
      hasGuidedTour: true
    }
  },
  {
    id: 'kamakhya',
    name: 'Kamakhya Temple',
    nameHindi: 'कामाख्या मंदिर',
    location: 'Guwahati, Assam',
    category: 'shakti_peeth',
    deity: 'Goddess Kamakhya',
    description: 'The most powerful Shakti Peeth, famous for the Ambubachi Mela.',
    thumbnail: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400',
    zones: createDefaultZones('kamakhya'),
    defaultZoneId: 'kamakhya_entrance',
    audio: {
      aartiTrack: 'Kamakhya Devi Aarati with Assamese drums',
      kirtanTrack: 'Tantric chanting with bells and cymbals',
      bellSound: 'Ancient bronze bell',
      ambienceTrack: 'Nilachal hill ambience with forest sounds',
      chantingTrack: 'Jai Maa Kamakhya, Om Aim Hreem Kleem'
    },
    themes: {
      morning: { lightColor: '#DC143C', intensity: 0.6 },
      afternoon: { lightColor: '#B22222', intensity: 0.8 },
      evening: { lightColor: '#8B0000', intensity: 0.7 },
      night: { lightColor: '#2F0000', intensity: 0.3 }
    },
    features: {
      hasLiveStream: false,
      hasMeditation: true,
      hasRituals: true,
      hasGuidedTour: false
    }
  },
  {
    id: 'meenakshi_amman',
    name: 'Meenakshi Amman Temple',
    nameHindi: 'मीनाक्षी अम्मन मंदिर',
    location: 'Madurai, Tamil Nadu',
    category: 'shakti_peeth',
    deity: 'Goddess Meenakshi',
    description: 'A historic temple known for its stunning Dravidian architecture and 14 gopurams.',
    thumbnail: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400',
    zones: createDefaultZones('meenakshi_amman'),
    defaultZoneId: 'meenakshi_amman_entrance',
    audio: {
      aartiTrack: 'Carnatic style temple Aarati with nadaswaram',
      kirtanTrack: 'Tamil devotional songs with mridangam',
      bellSound: 'Temple bell with South Indian temple ambience',
      ambienceTrack: 'Grand temple corridor with pilgrims',
      chantingTrack: 'Om Meenakshi, Angayarkanni'
    },
    themes: {
      morning: { lightColor: '#98FB98', intensity: 0.75 },
      afternoon: { lightColor: '#90EE90', intensity: 0.9 },
      evening: { lightColor: '#32CD32', intensity: 0.7 },
      night: { lightColor: '#006400', intensity: 0.35 }
    },
    features: {
      hasLiveStream: true,
      hasMeditation: true,
      hasRituals: true,
      hasGuidedTour: true
    }
  }
];

// Vishnu Temples
export const vishnuTemples: ImmersiveTemple[] = [
  {
    id: 'tirupati',
    name: 'Tirumala Tirupati',
    nameHindi: 'तिरुमला तिरुपति',
    location: 'Tirupati, Andhra Pradesh',
    category: 'vishnu',
    deity: 'Lord Venkateswara',
    description: 'The richest and most visited temple in the world, dedicated to Lord Vishnu.',
    thumbnail: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400',
    zones: createDefaultZones('tirupati'),
    defaultZoneId: 'tirupati_entrance',
    audio: {
      aartiTrack: 'Suprabhatam with traditional Telugu hymns',
      kirtanTrack: 'Govinda Govinda chanting with devotees',
      bellSound: 'Massive temple bell',
      ambienceTrack: 'Seven hills ambience with temple sounds',
      chantingTrack: 'Govinda Govinda, Om Namo Venkatesaya'
    },
    themes: {
      morning: { lightColor: '#FFD700', intensity: 0.9 },
      afternoon: { lightColor: '#FFA500', intensity: 1.0 },
      evening: { lightColor: '#FF8C00', intensity: 0.85 },
      night: { lightColor: '#8B4513', intensity: 0.4 }
    },
    features: {
      hasLiveStream: true,
      hasMeditation: true,
      hasRituals: true,
      hasGuidedTour: true
    }
  },
  {
    id: 'jagannath_puri',
    name: 'Jagannath Temple',
    nameHindi: 'जगन्नाथ मंदिर',
    location: 'Puri, Odisha',
    category: 'vishnu',
    deity: 'Lord Jagannath',
    description: 'One of the Char Dham pilgrimage sites, famous for the annual Rath Yatra.',
    thumbnail: 'https://images.unsplash.com/photo-1590766940554-634f6c5d9a70?w=400',
    zones: createDefaultZones('jagannath_puri'),
    defaultZoneId: 'jagannath_puri_entrance',
    audio: {
      aartiTrack: 'Jagannath Aarati with Odia temple instruments',
      kirtanTrack: 'Jai Jagannath bhajan with mardala',
      bellSound: 'Ancient Puri temple bell',
      ambienceTrack: 'Bay of Bengal breeze with temple sounds',
      chantingTrack: 'Jai Jagannath, Hare Krishna'
    },
    themes: {
      morning: { lightColor: '#FFE4B5', intensity: 0.85 },
      afternoon: { lightColor: '#FFDAB9', intensity: 1.0 },
      evening: { lightColor: '#FF7F50', intensity: 0.8 },
      night: { lightColor: '#2F4F4F', intensity: 0.35 }
    },
    features: {
      hasLiveStream: true,
      hasMeditation: true,
      hasRituals: true,
      hasGuidedTour: true
    },
    festivals: [
      { name: 'Rath Yatra', startDate: '2026-07-06', endDate: '2026-07-15', specialDecoration: true }
    ]
  },
  {
    id: 'badrinath',
    name: 'Badrinath Temple',
    nameHindi: 'बद्रीनाथ मंदिर',
    location: 'Badrinath, Uttarakhand',
    category: 'vishnu',
    deity: 'Lord Vishnu (Badrinarayan)',
    description: 'One of the Char Dham, situated in the Himalayas along the Alaknanda River.',
    thumbnail: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400',
    zones: createDefaultZones('badrinath'),
    defaultZoneId: 'badrinath_entrance',
    audio: {
      aartiTrack: 'Badrinath Aarati with Himalayan temple bells',
      kirtanTrack: 'Jai Badri Vishal bhajan',
      bellSound: 'High altitude temple bell',
      ambienceTrack: 'Alaknanda river and mountain winds',
      chantingTrack: 'Jai Badri Vishal, Om Namo Narayanaya'
    },
    themes: {
      morning: { lightColor: '#E0FFFF', intensity: 0.7 },
      afternoon: { lightColor: '#AFEEEE', intensity: 0.85 },
      evening: { lightColor: '#DDA0DD', intensity: 0.65 },
      night: { lightColor: '#000033', intensity: 0.2 }
    },
    features: {
      hasLiveStream: true,
      hasMeditation: true,
      hasRituals: true,
      hasGuidedTour: true
    }
  }
];

// Sikh Temples
export const sikhTemples: ImmersiveTemple[] = [
  {
    id: 'golden_temple',
    name: 'Golden Temple (Harmandir Sahib)',
    nameHindi: 'स्वर्ण मंदिर',
    location: 'Amritsar, Punjab',
    category: 'sikh',
    deity: 'Guru Granth Sahib',
    description: 'The holiest Gurdwara and spiritual center of Sikhism, featuring the sacred Sarovar.',
    thumbnail: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=400',
    zones: createDefaultZones('golden_temple'),
    defaultZoneId: 'golden_temple_entrance',
    audio: {
      aartiTrack: 'Gurbani Kirtan with harmonium and tabla',
      kirtanTrack: 'Continuous Shabad Kirtan',
      bellSound: 'Gurudwara bell',
      ambienceTrack: 'Sarovar water sounds with Gurbani',
      chantingTrack: 'Waheguru, Sat Sri Akal'
    },
    themes: {
      morning: { lightColor: '#FFD700', intensity: 0.95 },
      afternoon: { lightColor: '#DAA520', intensity: 1.0 },
      evening: { lightColor: '#B8860B', intensity: 0.9 },
      night: { lightColor: '#8B7500', intensity: 0.5 }
    },
    features: {
      hasLiveStream: true,
      hasMeditation: true,
      hasRituals: true,
      hasGuidedTour: true
    }
  }
];

// International Temples
export const internationalTemples: ImmersiveTemple[] = [
  {
    id: 'pashupatinath',
    name: 'Pashupatinath Temple',
    nameHindi: 'पशुपतिनाथ मंदिर',
    location: 'Kathmandu, Nepal',
    category: 'international',
    deity: 'Lord Shiva',
    description: 'One of the most sacred Shiva temples in the world, a UNESCO World Heritage Site.',
    thumbnail: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400',
    zones: createDefaultZones('pashupatinath'),
    defaultZoneId: 'pashupatinath_entrance',
    audio: {
      aartiTrack: 'Nepali Shiva Aarati with traditional instruments',
      kirtanTrack: 'Om Namah Shivaya in Nepali style',
      bellSound: 'Ancient Nepali temple bell',
      ambienceTrack: 'Bagmati river and cremation ghat sounds',
      chantingTrack: 'Om Pashupati, Om Namah Shivaya'
    },
    themes: {
      morning: { lightColor: '#DEB887', intensity: 0.75 },
      afternoon: { lightColor: '#D2B48C', intensity: 0.9 },
      evening: { lightColor: '#CD853F', intensity: 0.7 },
      night: { lightColor: '#3D2914', intensity: 0.3 }
    },
    features: {
      hasLiveStream: false,
      hasMeditation: true,
      hasRituals: true,
      hasGuidedTour: true
    }
  },
  {
    id: 'batu_caves',
    name: 'Batu Caves Temple',
    nameHindi: 'बातू गुफाएं',
    location: 'Selangor, Malaysia',
    category: 'international',
    deity: 'Lord Murugan',
    description: 'A limestone hill with cave temples, featuring a 42.7m tall statue of Lord Murugan.',
    thumbnail: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400',
    zones: createDefaultZones('batu_caves'),
    defaultZoneId: 'batu_caves_entrance',
    audio: {
      aartiTrack: 'Tamil style temple Aarati',
      kirtanTrack: 'Murugan bhajan with urumi melam',
      bellSound: 'Cave temple bell echo',
      ambienceTrack: 'Cave ambience with bats and echoes',
      chantingTrack: 'Vel Vel, Muruga'
    },
    themes: {
      morning: { lightColor: '#F0E68C', intensity: 0.7 },
      afternoon: { lightColor: '#FAFAD2', intensity: 0.85 },
      evening: { lightColor: '#EEE8AA', intensity: 0.65 },
      night: { lightColor: '#2F2F2F', intensity: 0.25 }
    },
    features: {
      hasLiveStream: false,
      hasMeditation: true,
      hasRituals: true,
      hasGuidedTour: true
    }
  }
];

// Combined export
export const allImmersiveTemples: ImmersiveTemple[] = [
  ...iskconTemples,
  ...jyotirlingaTemples,
  ...shaktiPeethTemples,
  ...vishnuTemples,
  ...sikhTemples,
  ...internationalTemples
];

// Get temple by ID
export const getTempleById = (id: string): ImmersiveTemple | undefined => {
  return allImmersiveTemples.find(t => t.id === id);
};

// Get temples by category
export const getTemplesByCategory = (category: TempleCategory): ImmersiveTemple[] => {
  return allImmersiveTemples.filter(t => t.category === category);
};

// Category labels
export const categoryLabels: Record<TempleCategory, string> = {
  iskcon: '🙏 ISKCON & Krishna',
  jyotirlinga: '🔱 Jyotirlinga',
  shakti_peeth: '🌺 Shakti Peeth',
  vishnu: '🙏 Vishnu Pilgrimage',
  sikh: '☬ Sikh Gurudwara',
  international: '🌍 International'
};
