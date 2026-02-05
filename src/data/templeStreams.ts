export type TempleCategory = 'jyotirlinga' | 'shakti_peeth' | 'major' | 'international' | 'iskcon';
export type DeityType = 'shiva' | 'vishnu' | 'devi' | 'guru' | 'multi';
export type Region = 'north' | 'south' | 'east' | 'west' | 'international';

export interface AartiSchedule {
  name: string;
  time: string; // 24-hour format HH:MM
  duration: number; // in minutes
  description?: string;
}

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
  aartiSchedule?: AartiSchedule[];
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
    thumbnail: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800',
    aartiSchedule: [
      { name: 'Asa Di Var', time: '04:00', duration: 120, description: 'Morning hymns' },
      { name: 'Sukhmani Sahib', time: '08:00', duration: 90 },
      { name: 'Rehras Sahib', time: '18:30', duration: 45, description: 'Evening prayers' },
      { name: 'Kirtan Sohila', time: '21:30', duration: 30, description: 'Night prayers' }
    ]
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
    thumbnail: 'https://images.unsplash.com/photo-1621330396173-e41b1cafd17f?w=800',
    aartiSchedule: [
      { name: 'Mangla Aarti', time: '05:00', duration: 30, description: 'Morning awakening' },
      { name: 'Bhog Aarti', time: '12:00', duration: 30, description: 'Midday offering' },
      { name: 'Sandhya Aarti', time: '19:00', duration: 30, description: 'Evening ceremony' },
      { name: 'Shayan Aarti', time: '21:00', duration: 20, description: 'Night closing' }
    ]
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
    thumbnail: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800',
    aartiSchedule: [
      { name: 'Mangala Aarti', time: '03:00', duration: 45, description: 'Pre-dawn worship' },
      { name: 'Bhog Aarti', time: '11:30', duration: 30, description: 'Midday offering' },
      { name: 'Sandhya Aarti', time: '19:00', duration: 45, description: 'Evening Ganga Aarti' },
      { name: 'Shringar Aarti', time: '21:00', duration: 30, description: 'Night decoration' },
      { name: 'Shayan Aarti', time: '22:30', duration: 20 }
    ]
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
    thumbnail: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800',
    aartiSchedule: [
      { name: 'Suprabhatam', time: '03:00', duration: 60, description: 'Divine awakening' },
      { name: 'Thomala Seva', time: '08:00', duration: 45 },
      { name: 'Archana', time: '10:00', duration: 30 },
      { name: 'Sahasranamam', time: '16:00', duration: 45 },
      { name: 'Ekanta Seva', time: '22:00', duration: 30, description: 'Night closing' }
    ]
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
    thumbnail: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
    aartiSchedule: [
      { name: 'Mangala Aarti', time: '06:00', duration: 30 },
      { name: 'Madhyan Aarti', time: '12:00', duration: 20 },
      { name: 'Sandhya Aarti', time: '19:00', duration: 45, description: 'Sunset by Arabian Sea' },
      { name: 'Light & Sound Show', time: '20:00', duration: 45 }
    ]
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
    thumbnail: 'https://images.unsplash.com/photo-1590766940554-634c4a6b0fc4?w=800',
    aartiSchedule: [
      { name: 'Bhasma Aarti', time: '04:00', duration: 60, description: 'Famous ash ceremony' },
      { name: 'Madhyan Aarti', time: '10:30', duration: 30 },
      { name: 'Sandhya Aarti', time: '18:30', duration: 30 },
      { name: 'Shayan Aarti', time: '22:30', duration: 20 }
    ]
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
    thumbnail: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
    aartiSchedule: [
      { name: 'Mangala Aarti', time: '04:30', duration: 45, description: 'Himalayan dawn' },
      { name: 'Madhyan Aarti', time: '11:00', duration: 30 },
      { name: 'Sandhya Aarti', time: '18:00', duration: 30, description: 'Mountain sunset' },
      { name: 'Shayan Aarti', time: '20:30', duration: 20 }
    ]
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
    thumbnail: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
    aartiSchedule: [
      { name: 'Mangala Aarti', time: '05:00', duration: 30 },
      { name: 'Madhyan Aarti', time: '12:00', duration: 20 },
      { name: 'Sandhya Aarti', time: '19:00', duration: 30, description: 'River Narmada view' }
    ]
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
    thumbnail: 'https://images.unsplash.com/photo-1609619385076-36a873425636?w=800',
    aartiSchedule: [
      { name: 'Abhishek', time: '05:30', duration: 60, description: 'Sacred bathing ritual' },
      { name: 'Madhyan Aarti', time: '12:00', duration: 20 },
      { name: 'Sandhya Aarti', time: '19:30', duration: 30 }
    ]
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
    thumbnail: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800',
    aartiSchedule: [
      { name: 'Mangala Aarti', time: '05:30', duration: 45, description: 'Tantric worship' },
      { name: 'Bhog Aarti', time: '11:00', duration: 30 },
      { name: 'Sandhya Aarti', time: '18:00', duration: 30 }
    ]
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
    thumbnail: 'https://images.unsplash.com/photo-1605649461516-f169bd6e9f3c?w=800',
    aartiSchedule: [
      { name: 'Mangala Aarti', time: '04:00', duration: 30 },
      { name: 'Bhog Aarti', time: '12:00', duration: 30 },
      { name: 'Sandhya Aarti', time: '19:00', duration: 45, description: 'Evening Kali puja' }
    ]
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
    thumbnail: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800',
    aartiSchedule: [
      { name: 'Tiruvanandal', time: '05:00', duration: 45, description: 'Morning awakening' },
      { name: 'Kalasandhi Puja', time: '09:00', duration: 30 },
      { name: 'Uchikala Puja', time: '12:00', duration: 30 },
      { name: 'Sayarakshai', time: '18:00', duration: 30, description: 'Evening puja' },
      { name: 'Palliarai', time: '21:30', duration: 45, description: 'Night ceremony' }
    ]
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
    thumbnail: 'https://images.unsplash.com/photo-1627894006066-b36589adb945?w=800',
    aartiSchedule: [
      { name: 'Mangala Alati', time: '05:00', duration: 30, description: 'Divine awakening' },
      { name: 'Mailam', time: '06:00', duration: 45 },
      { name: 'Sakala Dhupa', time: '10:00', duration: 30 },
      { name: 'Sandhya Aarti', time: '19:00', duration: 45, description: 'Ocean sunset' },
      { name: 'Badasinghara', time: '22:00', duration: 30 }
    ]
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
    thumbnail: 'https://images.unsplash.com/photo-1609619385076-36a873425636?w=800',
    aartiSchedule: [
      { name: 'Morning Puja', time: '05:00', duration: 60 },
      { name: 'Bagmati Aarti', time: '18:00', duration: 45, description: 'River ceremony' }
    ]
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
    thumbnail: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800',
    aartiSchedule: [
      { name: 'Morning Puja', time: '06:30', duration: 30 },
      { name: 'Evening Puja', time: '18:30', duration: 30 }
    ]
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
    thumbnail: 'https://images.unsplash.com/photo-1600100830012-d0ea5d40aa89?w=800',
    aartiSchedule: [
      { name: 'Mangala Aarti', time: '04:30', duration: 30, description: 'Pre-dawn kirtan' },
      { name: 'Darshan Aarti', time: '07:15', duration: 15 },
      { name: 'Raj Bhog Aarti', time: '12:00', duration: 20 },
      { name: 'Sandhya Aarti', time: '19:00', duration: 30, description: 'Evening kirtan' },
      { name: 'Shayana Aarti', time: '20:30', duration: 15 }
    ]
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
    thumbnail: 'https://images.unsplash.com/photo-1600100830012-d0ea5d40aa89?w=800',
    aartiSchedule: [
      { name: 'Mangala Aarti', time: '04:30', duration: 45, description: 'Grand ceremony' },
      { name: 'Guru Puja', time: '07:30', duration: 30 },
      { name: 'Raj Bhog Aarti', time: '12:30', duration: 20 },
      { name: 'Sandhya Aarti', time: '18:30', duration: 45, description: 'Sunset kirtan' }
    ]
  },
  // Char Dham & Popular Temples
  {
    id: 'badrinath',
    name: 'Badrinath Temple',
    location: 'Badrinath, Uttarakhand',
    deity: 'vishnu',
    category: 'major',
    region: 'north',
    description: 'One of the Char Dham pilgrimage sites, dedicated to Lord Vishnu in Himalayan heights',
    liveFeatures: ['Morning Abhishek', 'Himalayan darshan', 'Kedarnath connection stream'],
    youtubeVideoId: 'J3_xfVlXtZo',
    isLive: true,
    isFeatured: true,
    viewerCount: 11230,
    thumbnail: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
    aartiSchedule: [
      { name: 'Maha Abhishek', time: '04:30', duration: 60, description: 'Sacred bathing' },
      { name: 'Geet Govind Path', time: '18:00', duration: 45 },
      { name: 'Aarti & Shayan', time: '21:00', duration: 30, description: 'Night closing' }
    ]
  },
  {
    id: 'dwarkadheesh',
    name: 'Dwarkadheesh Temple',
    location: 'Dwarka, Gujarat',
    deity: 'vishnu',
    category: 'major',
    region: 'west',
    description: 'Ancient temple dedicated to Lord Krishna as the King of Dwarka, part of Char Dham',
    liveFeatures: ['Daily Krishna Aarti', 'Janmashtami special', 'Gomti Ghat darshan'],
    youtubeVideoId: 'kQD_2Y4SxPs',
    isLive: true,
    isFeatured: true,
    viewerCount: 8920,
    thumbnail: 'https://images.unsplash.com/photo-1600100830012-d0ea5d40aa89?w=800',
    aartiSchedule: [
      { name: 'Mangala Aarti', time: '06:30', duration: 30 },
      { name: 'Shringar Aarti', time: '10:30', duration: 30 },
      { name: 'Raj Bhog Aarti', time: '12:30', duration: 20 },
      { name: 'Sandhya Aarti', time: '19:00', duration: 45, description: 'Sunset at Gomti' },
      { name: 'Shayan Aarti', time: '21:30', duration: 20 }
    ]
  },
  {
    id: 'siddhivinayak',
    name: 'Siddhivinayak Temple',
    location: 'Mumbai, Maharashtra',
    deity: 'multi',
    category: 'major',
    region: 'west',
    description: 'Famous Ganesh temple known for wish fulfillment, visited by millions',
    liveFeatures: ['Morning Kakad Aarti', 'Sandhya Aarti', 'Ganesh Chaturthi special'],
    youtubeVideoId: 'mf7mK1mLqEg',
    isLive: true,
    isFeatured: true,
    viewerCount: 18540,
    thumbnail: 'https://images.unsplash.com/photo-1609619385076-36a873425636?w=800',
    aartiSchedule: [
      { name: 'Kakad Aarti', time: '05:30', duration: 30, description: 'Morning awakening' },
      { name: 'Madhyan Aarti', time: '12:00', duration: 20 },
      { name: 'Sandhya Aarti', time: '19:30', duration: 45, description: 'Evening ceremony' },
      { name: 'Shej Aarti', time: '22:00', duration: 20, description: 'Night closing' }
    ]
  },
  {
    id: 'shirdi-sai',
    name: 'Shirdi Sai Baba Temple',
    location: 'Shirdi, Maharashtra',
    deity: 'guru',
    category: 'major',
    region: 'west',
    description: 'Sacred shrine of Sai Baba, one of the most visited pilgrimage sites in India',
    liveFeatures: ['Kakad Aarti', 'Dhoop Aarti', 'Shej Aarti', 'Live samadhi darshan'],
    youtubeVideoId: 'UtV3pvVmPfM',
    isLive: true,
    isFeatured: true,
    viewerCount: 22340,
    thumbnail: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
    aartiSchedule: [
      { name: 'Kakad Aarti', time: '04:30', duration: 45, description: 'Famous morning aarti' },
      { name: 'Madhyan Aarti', time: '12:00', duration: 30, description: 'Midday prayers' },
      { name: 'Dhoop Aarti', time: '18:00', duration: 30, description: 'Evening incense' },
      { name: 'Shej Aarti', time: '22:00', duration: 45, description: 'Grand night ceremony' }
    ]
  },
  {
    id: 'rameshwaram',
    name: 'Ramanathaswamy Temple',
    location: 'Rameshwaram, Tamil Nadu',
    deity: 'shiva',
    category: 'jyotirlinga',
    region: 'south',
    description: 'Southernmost Jyotirlinga with the longest temple corridor in India',
    liveFeatures: ['22 wells Abhishek', 'Morning Aarti', 'Sethu darshan'],
    youtubeVideoId: 'xd9RqLMsQ0A',
    isLive: true,
    isFeatured: false,
    viewerCount: 7650,
    thumbnail: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800',
    aartiSchedule: [
      { name: 'Palliyarai', time: '05:00', duration: 45, description: '22 wells ritual' },
      { name: 'Kalasandhi', time: '09:00', duration: 30 },
      { name: 'Uchikala', time: '12:00', duration: 30 },
      { name: 'Sayarakshai', time: '18:00', duration: 30, description: 'Ocean sunset' },
      { name: 'Ardhajama', time: '21:00', duration: 30 }
    ]
  },
  {
    id: 'akshardham-delhi',
    name: 'Akshardham Temple',
    location: 'New Delhi',
    deity: 'vishnu',
    category: 'major',
    region: 'north',
    description: 'Magnificent modern temple showcasing Indian culture and spirituality',
    liveFeatures: ['Evening light show', 'Musical fountain', 'Exhibition tours'],
    youtubeVideoId: 'h8VxvqJvL9o',
    isLive: false,
    isFeatured: false,
    viewerCount: 5430,
    thumbnail: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
    aartiSchedule: [
      { name: 'Mangala Aarti', time: '07:00', duration: 30 },
      { name: 'Light & Sound Show', time: '19:45', duration: 25, description: 'Musical fountain' }
    ]
  },
  {
    id: 'mathura-krishna',
    name: 'Krishna Janmabhoomi Temple',
    location: 'Mathura, Uttar Pradesh',
    deity: 'vishnu',
    category: 'major',
    region: 'north',
    description: 'Birthplace of Lord Krishna, one of the most sacred sites in Hinduism',
    liveFeatures: ['Janmashtami celebrations', 'Daily Krishna Aarti', 'Midnight ceremonies'],
    youtubeVideoId: 'zR4yNZ0SJYU',
    isLive: true,
    isFeatured: false,
    viewerCount: 9870,
    thumbnail: 'https://images.unsplash.com/photo-1600100830012-d0ea5d40aa89?w=800',
    aartiSchedule: [
      { name: 'Mangala Aarti', time: '05:00', duration: 30 },
      { name: 'Shringar Aarti', time: '07:30', duration: 30, description: 'Krishna decoration' },
      { name: 'Raj Bhog Aarti', time: '12:00', duration: 20 },
      { name: 'Sandhya Aarti', time: '19:00', duration: 45 },
      { name: 'Midnight Aarti', time: '00:00', duration: 60, description: 'Birth celebration' }
    ]
  },
  {
    id: 'sabarimala',
    name: 'Sabarimala Ayyappan Temple',
    location: 'Pathanamthitta, Kerala',
    deity: 'multi',
    category: 'major',
    region: 'south',
    description: 'Hilltop temple dedicated to Lord Ayyappa, famous for Makaravilakku festival',
    liveFeatures: ['Makaravilakku', 'Padi Puja', 'Festival season streams'],
    youtubeVideoId: 'K9GhMvzPjCA',
    isLive: true,
    isFeatured: false,
    viewerCount: 6780,
    thumbnail: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800',
    aartiSchedule: [
      { name: 'Usha Puja', time: '05:00', duration: 60, description: 'Dawn worship' },
      { name: 'Padi Puja', time: '10:30', duration: 45 },
      { name: 'Deeparadhana', time: '18:00', duration: 45, description: 'Lamp ceremony' }
    ]
  },
  {
    id: 'bhimashankar',
    name: 'Bhimashankar Temple',
    location: 'Pune, Maharashtra',
    deity: 'shiva',
    category: 'jyotirlinga',
    region: 'west',
    description: 'Jyotirlinga temple in the Sahyadri hills surrounded by dense forests',
    liveFeatures: ['Morning Abhishek', 'Monsoon special', 'Mahashivratri stream'],
    youtubeVideoId: 'wKL2_UUG7Ok',
    isLive: true,
    isFeatured: false,
    viewerCount: 4230,
    thumbnail: 'https://images.unsplash.com/photo-1590766940554-634c4a6b0fc4?w=800',
    aartiSchedule: [
      { name: 'Abhishek', time: '04:30', duration: 60, description: 'Forest dawn ritual' },
      { name: 'Madhyan Aarti', time: '11:00', duration: 20 },
      { name: 'Sandhya Aarti', time: '18:30', duration: 30, description: 'Sahyadri sunset' }
    ]
  },
  {
    id: 'guruvayur',
    name: 'Guruvayur Sri Krishna Temple',
    location: 'Guruvayur, Kerala',
    deity: 'vishnu',
    category: 'major',
    region: 'south',
    description: 'One of the most important Krishna temples in India, known as Dwarka of the South',
    liveFeatures: ['Nirmalya darshan', 'Elephant procession', 'Utsavam festivals'],
    youtubeVideoId: 'c-6rq8A7Nzc',
    isLive: true,
    isFeatured: false,
    viewerCount: 8340,
    thumbnail: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800',
    aartiSchedule: [
      { name: 'Nirmalya Darshan', time: '03:00', duration: 30, description: 'Sacred first darshan' },
      { name: 'Ezhunellippu', time: '06:00', duration: 45, description: 'Elephant procession' },
      { name: 'Pantheeradi Puja', time: '11:30', duration: 30 },
      { name: 'Deeparadhana', time: '18:30', duration: 45, description: 'Evening lamps' },
      { name: 'Athazha Puja', time: '21:00', duration: 30 }
    ]
  },
  {
    id: 'gangotri',
    name: 'Gangotri Temple',
    location: 'Gangotri, Uttarakhand',
    deity: 'devi',
    category: 'major',
    region: 'north',
    description: 'Source of the sacred River Ganges, part of Char Dham pilgrimage',
    liveFeatures: ['Ganga Aarti at source', 'Himalayan views', 'Pilgrimage season'],
    youtubeVideoId: 'bEVCHxMgv7E',
    isLive: false,
    isFeatured: false,
    viewerCount: 3450,
    thumbnail: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
    aartiSchedule: [
      { name: 'Mangala Aarti', time: '06:00', duration: 30, description: 'Himalayan dawn' },
      { name: 'Ganga Aarti', time: '18:30', duration: 45, description: 'Source of Ganga' }
    ]
  },
  {
    id: 'yamunotri',
    name: 'Yamunotri Temple',
    location: 'Yamunotri, Uttarakhand',
    deity: 'devi',
    category: 'major',
    region: 'north',
    description: 'Source of River Yamuna, the westernmost shrine in the Char Dham pilgrimage',
    liveFeatures: ['Hot springs darshan', 'Yamuna Aarti', 'Trek views'],
    youtubeVideoId: 'J3_xfVlXtZo',
    isLive: false,
    isFeatured: false,
    viewerCount: 2890,
    thumbnail: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
    aartiSchedule: [
      { name: 'Mangala Aarti', time: '06:30', duration: 30 },
      { name: 'Yamuna Aarti', time: '19:00', duration: 30, description: 'Source of Yamuna' }
    ]
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
