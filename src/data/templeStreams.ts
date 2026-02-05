export type TempleCategory = 'jyotirlinga' | 'shakti_peeth' | 'major' | 'international' | 'iskcon';
export type DeityType = 'shiva' | 'vishnu' | 'devi' | 'guru' | 'multi';
export type Region = 'north' | 'south' | 'east' | 'west' | 'international';

export interface Temple {
  id: string;
  name: string;
  location: string;
  deity: DeityType;
  category: TempleCategory;
  region: Region;
  description: string;
  liveFeatures: string[];
  youtubeChannelId?: string;
  youtubeVideoId?: string;
  isLive: boolean;
  isFeatured: boolean;
  viewerCount?: number;
  thumbnail: string;
}

export interface SpiritualContent {
  id: string;
  title: string;
  type: 'bhajan' | 'discourse' | 'aarti' | 'meditation' | 'short';
  youtubeVideoId: string;
  duration: string;
  speaker?: string;
  thumbnail: string;
}

export const temples: Temple[] = [
  // Major Temples
  {
    id: 'golden-temple',
    name: 'Golden Temple',
    location: 'Amritsar, Punjab',
    deity: 'guru',
    category: 'major',
    region: 'north',
    description: 'Harmandir Sahib - The holiest Gurdwara and spiritual center of Sikhism',
    liveFeatures: ['Continuous Kirtan broadcast', '24/7 Darshan stream', 'Special festival coverage'],
    youtubeVideoId: 'LBaF7ypRVXM',
    isLive: true,
    isFeatured: true,
    viewerCount: 15420,
    thumbnail: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800'
  },
  {
    id: 'vaishno-devi',
    name: 'Vaishno Devi Temple',
    location: 'Katra, Jammu & Kashmir',
    deity: 'devi',
    category: 'shakti_peeth',
    region: 'north',
    description: 'One of the holiest Hindu temples dedicated to Goddess Vaishno Devi',
    liveFeatures: ['Daily Aarti streaming', 'Pilgrim darshan camera', 'Festival ritual broadcasts'],
    youtubeVideoId: 'zGDzdps75ns',
    isLive: true,
    isFeatured: true,
    viewerCount: 8932,
    thumbnail: 'https://images.unsplash.com/photo-1621330396173-e41b1cafd17f?w=800'
  },
  {
    id: 'kashi-vishwanath',
    name: 'Kashi Vishwanath Temple',
    location: 'Varanasi, Uttar Pradesh',
    deity: 'shiva',
    category: 'jyotirlinga',
    region: 'north',
    description: 'One of the most famous Hindu temples dedicated to Lord Shiva',
    liveFeatures: ['Mangala Aarti livestream', 'Ganga Aarti connection', 'Shiv Abhishek coverage'],
    youtubeVideoId: '6FMPGsGEs7c',
    isLive: true,
    isFeatured: true,
    viewerCount: 12450,
    thumbnail: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800'
  },
  {
    id: 'tirupati-balaji',
    name: 'Tirupati Balaji Temple',
    location: 'Tirumala, Andhra Pradesh',
    deity: 'vishnu',
    category: 'major',
    region: 'south',
    description: 'Tirumala Venkateswara Temple - Most visited religious place in the world',
    liveFeatures: ['Daily Suprabhatam', 'Live Darshan stream', 'Special seva coverage'],
    youtubeVideoId: 'pK8fg9WuZxg',
    isLive: true,
    isFeatured: true,
    viewerCount: 25680,
    thumbnail: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'
  },
  {
    id: 'somnath',
    name: 'Somnath Temple',
    location: 'Prabhas Patan, Gujarat',
    deity: 'shiva',
    category: 'jyotirlinga',
    region: 'west',
    description: 'First among the twelve Jyotirlinga shrines of Lord Shiva',
    liveFeatures: ['Shiv Aarti livestream', 'Ocean temple ambience', 'Mahashivratri special'],
    youtubeVideoId: 'yfSLuEj99aE',
    isLive: true,
    isFeatured: false,
    viewerCount: 6780,
    thumbnail: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800'
  },
  {
    id: 'mahakaleshwar',
    name: 'Mahakaleshwar Temple',
    location: 'Ujjain, Madhya Pradesh',
    deity: 'shiva',
    category: 'jyotirlinga',
    region: 'west',
    description: 'Famous for the Bhasma Aarti performed with sacred ash',
    liveFeatures: ['Famous Bhasma Aarti', 'Daily Shiv worship', 'Festival streams'],
    youtubeVideoId: 'n3k-D6GdXRc',
    isLive: true,
    isFeatured: true,
    viewerCount: 9340,
    thumbnail: 'https://images.unsplash.com/photo-1590766940554-634c4a6b0fc4?w=800'
  },
  // Jyotirlinga Network
  {
    id: 'kedarnath',
    name: 'Kedarnath Temple',
    location: 'Kedarnath, Uttarakhand',
    deity: 'shiva',
    category: 'jyotirlinga',
    region: 'north',
    description: 'Himalayan Jyotirlinga temple at 3,583 meters altitude',
    liveFeatures: ['Morning Himalayan Aarti', 'Snow-season ambience', 'Pilgrimage coverage'],
    youtubeVideoId: 'bEVCHxMgv7E',
    isLive: true,
    isFeatured: false,
    viewerCount: 7820,
    thumbnail: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800'
  },
  {
    id: 'omkareshwar',
    name: 'Omkareshwar Temple',
    location: 'Omkareshwar, Madhya Pradesh',
    deity: 'shiva',
    category: 'jyotirlinga',
    region: 'west',
    description: 'Island temple shaped like the Om symbol',
    liveFeatures: ['Daily Aarti stream', 'River view darshan', 'Festival celebrations'],
    youtubeVideoId: 'RZ1JbWJVhlU',
    isLive: false,
    isFeatured: false,
    viewerCount: 3450,
    thumbnail: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'
  },
  {
    id: 'trimbakeshwar',
    name: 'Trimbakeshwar Temple',
    location: 'Nashik, Maharashtra',
    deity: 'shiva',
    category: 'jyotirlinga',
    region: 'west',
    description: 'Origin of River Godavari with unique three-faced Shivalinga',
    liveFeatures: ['Morning Abhishek', 'Kumbh Mela coverage', 'Daily darshan'],
    youtubeVideoId: 'wKL2_UUG7Ok',
    isLive: false,
    isFeatured: false,
    viewerCount: 2890,
    thumbnail: 'https://images.unsplash.com/photo-1609619385076-36a873425636?w=800'
  },
  // Shakti Peeth Network
  {
    id: 'kamakhya',
    name: 'Kamakhya Temple',
    location: 'Guwahati, Assam',
    deity: 'devi',
    category: 'shakti_peeth',
    region: 'east',
    description: 'Powerful Shakti Peeth dedicated to Goddess Kamakhya',
    liveFeatures: ['Daily Shakti worship', 'Ambubachi Mela coverage', 'Tantric rituals'],
    youtubeVideoId: 'QZT4tQxXN-8',
    isLive: true,
    isFeatured: false,
    viewerCount: 4560,
    thumbnail: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800'
  },
  {
    id: 'kalighat',
    name: 'Kalighat Temple',
    location: 'Kolkata, West Bengal',
    deity: 'devi',
    category: 'shakti_peeth',
    region: 'east',
    description: 'One of the 51 Shakti Peethas dedicated to Goddess Kali',
    liveFeatures: ['Morning Aarti', 'Festival pujas', 'Durga Puja special'],
    youtubeVideoId: 'mKh5s_2hC8s',
    isLive: false,
    isFeatured: false,
    viewerCount: 2340,
    thumbnail: 'https://images.unsplash.com/photo-1605649461516-f169bd6e9f3c?w=800'
  },
  // South Indian Temples
  {
    id: 'meenakshi-amman',
    name: 'Meenakshi Amman Temple',
    location: 'Madurai, Tamil Nadu',
    deity: 'devi',
    category: 'major',
    region: 'south',
    description: 'Historic Hindu temple with stunning Dravidian architecture',
    liveFeatures: ['Classical rituals', 'Devotional music', 'Night ceremony'],
    youtubeVideoId: 'sWqE-mXiHLI',
    isLive: true,
    isFeatured: false,
    viewerCount: 5670,
    thumbnail: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'
  },
  {
    id: 'jagannath',
    name: 'Jagannath Temple',
    location: 'Puri, Odisha',
    deity: 'vishnu',
    category: 'major',
    region: 'east',
    description: 'Famous for the annual Rath Yatra festival',
    liveFeatures: ['Rath Yatra festival', 'Daily Aarti', 'Coastal ambience'],
    youtubeVideoId: 'c-6rq8A7Nzc',
    isLive: true,
    isFeatured: false,
    viewerCount: 4890,
    thumbnail: 'https://images.unsplash.com/photo-1627894006066-b36589adb945?w=800'
  },
  // International Temples
  {
    id: 'pashupatinath',
    name: 'Pashupatinath Temple',
    location: 'Kathmandu, Nepal',
    deity: 'shiva',
    category: 'international',
    region: 'international',
    description: 'UNESCO World Heritage Site - Sacred temple on Bagmati River',
    liveFeatures: ['Bagmati River Aarti', 'Maha Shivaratri coverage', 'Daily worship'],
    youtubeVideoId: 'xTBVl3TQS8o',
    isLive: true,
    isFeatured: false,
    viewerCount: 3210,
    thumbnail: 'https://images.unsplash.com/photo-1609619385076-36a873425636?w=800'
  },
  {
    id: 'batu-caves',
    name: 'Batu Caves Temple',
    location: 'Kuala Lumpur, Malaysia',
    deity: 'multi',
    category: 'international',
    region: 'international',
    description: 'Limestone hill with cave temples dedicated to Lord Murugan',
    liveFeatures: ['Thaipusam festival', 'Tamil devotional events', 'Cave darshan'],
    youtubeVideoId: 'fHE2KqQRSu0',
    isLive: false,
    isFeatured: false,
    viewerCount: 1890,
    thumbnail: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800'
  },
  // ISKCON Temples
  {
    id: 'iskcon-vrindavan',
    name: 'ISKCON Vrindavan',
    location: 'Vrindavan, Uttar Pradesh',
    deity: 'vishnu',
    category: 'iskcon',
    region: 'north',
    description: 'Krishna-Balaram Mandir - Center of Krishna consciousness',
    liveFeatures: ['Mangala Aarti', 'Hare Krishna kirtan', 'Festival celebrations'],
    youtubeVideoId: 'pzgkpSZ4yYc',
    isLive: true,
    isFeatured: true,
    viewerCount: 8760,
    thumbnail: 'https://images.unsplash.com/photo-1600100830012-d0ea5d40aa89?w=800'
  },
  {
    id: 'iskcon-mayapur',
    name: 'ISKCON Mayapur',
    location: 'Mayapur, West Bengal',
    deity: 'vishnu',
    category: 'iskcon',
    region: 'east',
    description: 'World headquarters of ISKCON with Temple of the Vedic Planetarium',
    liveFeatures: ['Grand Aarti', 'Kirtan mela', 'TOVP darshan'],
    youtubeVideoId: '0s8XG7cBu-I',
    isLive: true,
    isFeatured: false,
    viewerCount: 6540,
    thumbnail: 'https://images.unsplash.com/photo-1600100830012-d0ea5d40aa89?w=800'
  }
];

export const spiritualContent: SpiritualContent[] = [
  // Bhajans
  {
    id: 'hanuman-chalisa',
    title: 'Hanuman Chalisa - Complete',
    type: 'bhajan',
    youtubeVideoId: 'AETFvQonfV8',
    duration: '10:45',
    thumbnail: 'https://images.unsplash.com/photo-1609619385076-36a873425636?w=400'
  },
  {
    id: 'shiv-tandav',
    title: 'Shiv Tandav Stotram',
    type: 'bhajan',
    youtubeVideoId: 'Rk_Z1kLJvnc',
    duration: '8:32',
    thumbnail: 'https://images.unsplash.com/photo-1590766940554-634c4a6b0fc4?w=400'
  },
  {
    id: 'vishnu-sahasranamam',
    title: 'Vishnu Sahasranamam',
    type: 'bhajan',
    youtubeVideoId: 'T_9FVrw-Omg',
    duration: '28:15',
    thumbnail: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400'
  },
  // Aarti
  {
    id: 'om-jai-jagdish',
    title: 'Om Jai Jagdish Hare Aarti',
    type: 'aarti',
    youtubeVideoId: 'q8mWMlQBdFE',
    duration: '7:20',
    thumbnail: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400'
  },
  {
    id: 'ganga-aarti',
    title: 'Ganga Aarti - Varanasi',
    type: 'aarti',
    youtubeVideoId: 'W2YsBMdJEKM',
    duration: '12:45',
    thumbnail: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400'
  },
  // Discourses
  {
    id: 'premanand-wisdom-1',
    title: 'Life Wisdom - Premanand Maharaj',
    type: 'discourse',
    youtubeVideoId: 'RfV6dPqbKZQ',
    duration: '15:30',
    speaker: 'Premanand Maharaj',
    thumbnail: 'https://images.unsplash.com/photo-1609619385076-36a873425636?w=400'
  },
  {
    id: 'bhakti-guidance',
    title: 'Path of Bhakti - Spiritual Guidance',
    type: 'discourse',
    youtubeVideoId: 'Rk_Z1kLJvnc',
    duration: '22:10',
    speaker: 'Spiritual Master',
    thumbnail: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=400'
  },
  // Meditation
  {
    id: 'chakra-meditation',
    title: 'Chakra Healing Meditation',
    type: 'meditation',
    youtubeVideoId: 'W2YsBMdJEKM',
    duration: '30:00',
    thumbnail: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400'
  },
  // Shorts
  {
    id: 'morning-mantra',
    title: 'Morning Mantra - 1 Minute Peace',
    type: 'short',
    youtubeVideoId: 'AETFvQonfV8',
    duration: '0:60',
    thumbnail: 'https://images.unsplash.com/photo-1600100830012-d0ea5d40aa89?w=400'
  },
  {
    id: 'quick-darshan',
    title: 'Quick Temple Darshan',
    type: 'short',
    youtubeVideoId: 'LBaF7ypRVXM',
    duration: '0:45',
    thumbnail: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=400'
  }
];

export const categoryLabels: Record<TempleCategory, string> = {
  jyotirlinga: '🕉️ Jyotirlinga',
  shakti_peeth: '🔱 Shakti Peeth',
  major: '🛕 Major Temples',
  international: '🌍 International',
  iskcon: '🙏 ISKCON'
};

export const deityLabels: Record<DeityType, string> = {
  shiva: '🔱 Shiva',
  vishnu: '🙏 Vishnu',
  devi: '🌸 Devi',
  guru: '📿 Guru',
  multi: '✨ Multi-Deity'
};

export const regionLabels: Record<Region, string> = {
  north: 'North India',
  south: 'South India',
  east: 'East India',
  west: 'West India',
  international: 'International'
};
