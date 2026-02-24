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
  youtubeVideoId?: string; // Primary live stream video ID
  recordedVideoId?: string; // Recorded aarti/darshan fallback video ID
  backupAmbienceId?: string; // Optional backup ambience/bhajan video ID
  isLive: boolean;
  isFeatured: boolean;
  viewerCount?: number;
  thumbnail: string;
  aartiSchedule?: AartiSchedule[];
}

export interface SpiritualContent {
  id: string;
  title: string;
  type: 'bhajan' | 'discourse' | 'aarti' | 'meditation' | 'short' | 'mantra' | 'pravachan';
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
    youtubeVideoId: 'LBaF7ypRVXM', // Live Kirtan
    recordedVideoId: 'vb0eMzMmOP0', // Golden Temple Shabad Kirtan Playlist
    backupAmbienceId: 'LBaF7ypRVXM',
    isLive: true,
    isFeatured: true,
    viewerCount: 15420,
    thumbnail: '/temples/golden-temple.jpg',
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
    liveFeatures: ['Daily Aarati streaming', 'Pilgrim darshan camera', 'Festival ritual broadcasts'],
    youtubeVideoId: 'zGDzdps75ns', // Live Darshan
    recordedVideoId: '_WxL5l0vnEA', // Vaishno Devi Bhajan & Aarati Videos
    backupAmbienceId: 'HaGHAyS6xJc',
    isLive: true,
    isFeatured: true,
    viewerCount: 8932,
    thumbnail: '/temples/vaishno-devi.jpg',
    aartiSchedule: [
      { name: 'Mangla Aarati', time: '05:00', duration: 30, description: 'Morning awakening' },
      { name: 'Bhog Aarati', time: '12:00', duration: 30, description: 'Midday offering' },
      { name: 'Sandhya Aarati', time: '19:00', duration: 30, description: 'Evening ceremony' },
      { name: 'Shayan Aarati', time: '21:00', duration: 20, description: 'Night closing' }
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
    liveFeatures: ['Mangala Aarati livestream', 'Ganga Aarati connection', 'Shiv Abhishek coverage'],
    youtubeVideoId: '6FMPGsGEs7c', // Live Ganga & Mangala Aarati
    recordedVideoId: 'W2YsBMdJEKM', // Kashi Vishwanath Aarati Playlist
    backupAmbienceId: 'q8mWMlQBdFE',
    isLive: true,
    isFeatured: true,
    viewerCount: 12450,
    thumbnail: '/temples/kashi-vishwanath.jpg',
    aartiSchedule: [
      { name: 'Mangala Aarati', time: '03:00', duration: 45, description: 'Pre-dawn worship' },
      { name: 'Bhog Aarati', time: '11:30', duration: 30, description: 'Midday offering' },
      { name: 'Sandhya Aarati', time: '19:00', duration: 45, description: 'Evening Ganga Aarati' },
      { name: 'Shringar Aarati', time: '21:00', duration: 30, description: 'Night decoration' },
      { name: 'Shayan Aarati', time: '22:30', duration: 20 }
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
    youtubeVideoId: 'pK8fg9WuZxg', // Tirumala Live Darshan
    recordedVideoId: 'T_9FVrw-Omg', // Suprabhatam & Daily Seva Playlist
    backupAmbienceId: 'AETFvQonfV8',
    isLive: true,
    isFeatured: true,
    viewerCount: 25680,
    thumbnail: '/temples/tirupati-balaji.jpg',
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
    liveFeatures: ['Shiv Aarati livestream', 'Ocean temple ambience', 'Mahashivratri special'],
    youtubeVideoId: 'yfSLuEj99aE', // Somnath Live Aarati
    recordedVideoId: 'Rk_Z1kLJvnc', // Somnath Evening Aarati Videos
    backupAmbienceId: 'q8mWMlQBdFE',
    isLive: true,
    isFeatured: false,
    viewerCount: 6780,
    thumbnail: '/temples/somnath.jpg',
    aartiSchedule: [
      { name: 'Mangala Aarati', time: '06:00', duration: 30 },
      { name: 'Madhyan Aarati', time: '12:00', duration: 20 },
      { name: 'Sandhya Aarati', time: '19:00', duration: 45, description: 'Sunset by Arabian Sea' },
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
    description: 'Famous for the Bhasma Aarati performed with sacred ash',
    liveFeatures: ['Famous Bhasma Aarati', 'Daily Shiv worship', 'Festival streams'],
    youtubeVideoId: 'n3k-D6GdXRc', // Mahakaleshwar Bhasma Aarati Live
    recordedVideoId: 'Rk_Z1kLJvnc', // Bhasma Aarati Recorded Playlist
    backupAmbienceId: 'q8mWMlQBdFE',
    isLive: true,
    isFeatured: true,
    viewerCount: 9340,
    thumbnail: '/temples/mahakaleshwar.jpg',
    aartiSchedule: [
      { name: 'Bhasma Aarati', time: '04:00', duration: 60, description: 'Famous ash ceremony' },
      { name: 'Madhyan Aarati', time: '10:30', duration: 30 },
      { name: 'Sandhya Aarati', time: '18:30', duration: 30 },
      { name: 'Shayan Aarati', time: '22:30', duration: 20 }
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
    liveFeatures: ['Morning Himalayan Aarati', 'Snow-season ambience', 'Pilgrimage coverage'],
    youtubeVideoId: 'bEVCHxMgv7E', // Kedarnath Live Aarati Stream
    recordedVideoId: 'Rk_Z1kLJvnc', // Kedarnath Morning & Evening Aarati Playlist
    backupAmbienceId: 'q8mWMlQBdFE',
    isLive: true,
    isFeatured: false,
    viewerCount: 7820,
    thumbnail: '/temples/kedarnath.jpg',
    aartiSchedule: [
      { name: 'Mangala Aarati', time: '04:30', duration: 45, description: 'Himalayan dawn' },
      { name: 'Madhyan Aarati', time: '11:00', duration: 30 },
      { name: 'Sandhya Aarati', time: '18:00', duration: 30, description: 'Mountain sunset' },
      { name: 'Shayan Aarati', time: '20:30', duration: 20 }
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
    liveFeatures: ['Daily Aarati stream', 'River view darshan', 'Festival celebrations'],
    youtubeVideoId: 'RZ1JbWJVhlU', // Omkareshwar Jyotirlinga Live Darshan
    recordedVideoId: 'Rk_Z1kLJvnc', // Omkareshwar Recorded Aarati Videos
    backupAmbienceId: 'q8mWMlQBdFE',
    isLive: false,
    isFeatured: false,
    viewerCount: 3450,
    thumbnail: '/temples/omkareshwar.jpg',
    aartiSchedule: [
      { name: 'Mangala Aarati', time: '05:00', duration: 30 },
      { name: 'Madhyan Aarati', time: '12:00', duration: 20 },
      { name: 'Sandhya Aarati', time: '19:00', duration: 30, description: 'River Narmada view' }
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
    youtubeVideoId: 'wKL2_UUG7Ok', // Trimbakeshwar Live Abhishek
    recordedVideoId: 'Rk_Z1kLJvnc', // Trimbakeshwar Shiva Aarati Playlist
    backupAmbienceId: 'q8mWMlQBdFE',
    isLive: false,
    isFeatured: false,
    viewerCount: 2890,
    thumbnail: '/temples/trimbakeshwar.jpg',
    aartiSchedule: [
      { name: 'Abhishek', time: '05:30', duration: 60, description: 'Sacred bathing ritual' },
      { name: 'Madhyan Aarati', time: '12:00', duration: 20 },
      { name: 'Sandhya Aarati', time: '19:30', duration: 30 }
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
    youtubeVideoId: 'QZT4tQxXN-8', // Kamakhya Temple Live Darshan
    recordedVideoId: 'AETFvQonfV8', // Kamakhya Devi Recorded Aarati
    backupAmbienceId: 'HaGHAyS6xJc',
    isLive: true,
    isFeatured: false,
    viewerCount: 4560,
    thumbnail: '/temples/kamakhya.jpg',
    aartiSchedule: [
      { name: 'Mangala Aarati', time: '05:30', duration: 45, description: 'Tantric worship' },
      { name: 'Bhog Aarati', time: '11:00', duration: 30 },
      { name: 'Sandhya Aarati', time: '18:00', duration: 30 }
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
    liveFeatures: ['Morning Aarati', 'Festival pujas', 'Durga Puja special'],
    youtubeVideoId: 'mKh5s_2hC8s', // Kalighat Kali Temple Live
    recordedVideoId: 'AETFvQonfV8', // Kalighat Evening Aarati Videos
    backupAmbienceId: 'HaGHAyS6xJc',
    isLive: false,
    isFeatured: false,
    viewerCount: 2340,
    thumbnail: '/temples/kalighat.jpg',
    aartiSchedule: [
      { name: 'Mangala Aarati', time: '04:00', duration: 30 },
      { name: 'Bhog Aarati', time: '12:00', duration: 30 },
      { name: 'Sandhya Aarati', time: '19:00', duration: 45, description: 'Evening Kali puja' }
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
    youtubeVideoId: 'sWqE-mXiHLI', // Meenakshi Temple Live Darshan
    recordedVideoId: 'T_9FVrw-Omg', // Meenakshi Amman Aarati Playlist
    backupAmbienceId: 'AETFvQonfV8',
    isLive: true,
    isFeatured: false,
    viewerCount: 5670,
    thumbnail: '/temples/meenakshi-amman.jpg',
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
    liveFeatures: ['Rath Yatra festival', 'Daily Aarati', 'Coastal ambience'],
    youtubeVideoId: 'c-6rq8A7Nzc', // Jagannath Puri Live Darshan
    recordedVideoId: 'T_9FVrw-Omg', // Jagannath Aarati & Rath Yatra Videos
    backupAmbienceId: 'AETFvQonfV8',
    isLive: true,
    isFeatured: false,
    viewerCount: 4890,
    thumbnail: '/temples/jagannath.jpg',
    aartiSchedule: [
      { name: 'Mangala Alati', time: '05:00', duration: 30, description: 'Divine awakening' },
      { name: 'Mailam', time: '06:00', duration: 45 },
      { name: 'Sakala Dhupa', time: '10:00', duration: 30 },
      { name: 'Sandhya Aarati', time: '19:00', duration: 45, description: 'Ocean sunset' },
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
    liveFeatures: ['Bagmati River Aarati', 'Maha Shivaratri coverage', 'Daily worship'],
    youtubeVideoId: 'xTBVl3TQS8o', // Pashupatinath Live Aarati
    recordedVideoId: 'W2YsBMdJEKM', // Bagmati Aarati Recorded Videos
    backupAmbienceId: 'q8mWMlQBdFE',
    isLive: true,
    isFeatured: false,
    viewerCount: 3210,
    thumbnail: '/temples/pashupatinath.jpg',
    aartiSchedule: [
      { name: 'Morning Puja', time: '05:00', duration: 60 },
      { name: 'Bagmati Aarati', time: '18:00', duration: 45, description: 'River ceremony' }
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
    recordedVideoId: 'T_9FVrw-Omg', // Cave temple Aarati recordings
    backupAmbienceId: 'AETFvQonfV8',
    isLive: false,
    isFeatured: false,
    viewerCount: 1890,
    thumbnail: '/temples/batu-caves.jpg',
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
    liveFeatures: ['Mangala Aarati', 'Hare Krishna kirtan', 'Festival celebrations'],
    youtubeVideoId: 'pzgkpSZ4yYc', // ISKCON Vrindavan Live Mangala Aarati
    recordedVideoId: 'T_9FVrw-Omg', // ISKCON Kirtan & Aarati Playlist
    backupAmbienceId: 'AETFvQonfV8',
    isLive: true,
    isFeatured: true,
    viewerCount: 8760,
    thumbnail: '/temples/iskcon-vrindavan.jpg',
    aartiSchedule: [
      { name: 'Mangala Aarati', time: '04:30', duration: 30, description: 'Pre-dawn kirtan' },
      { name: 'Darshan Aarati', time: '07:15', duration: 15 },
      { name: 'Raj Bhog Aarati', time: '12:00', duration: 20 },
      { name: 'Sandhya Aarati', time: '19:00', duration: 30, description: 'Evening kirtan' },
      { name: 'Shayana Aarati', time: '20:30', duration: 15 }
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
    liveFeatures: ['Grand Aarati', 'Kirtan mela', 'TOVP darshan'],
    youtubeVideoId: '0s8XG7cBu-I', // ISKCON Mayapur Live Darshan
    recordedVideoId: 'T_9FVrw-Omg', // Mayapur Aarati & Kirtan Playlist
    backupAmbienceId: 'AETFvQonfV8',
    isLive: true,
    isFeatured: false,
    viewerCount: 6540,
    thumbnail: '/temples/iskcon-mayapur.jpg',
    aartiSchedule: [
      { name: 'Mangala Aarati', time: '04:30', duration: 45, description: 'Grand ceremony' },
      { name: 'Guru Puja', time: '07:30', duration: 30 },
      { name: 'Raj Bhog Aarati', time: '12:30', duration: 20 },
      { name: 'Sandhya Aarati', time: '18:30', duration: 45, description: 'Sunset kirtan' }
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
    youtubeVideoId: 'J3_xfVlXtZo', // Badrinath Live Darshan (seasonal)
    recordedVideoId: 'T_9FVrw-Omg', // Badrinath Morning & Evening Aarati
    backupAmbienceId: 'AETFvQonfV8',
    isLive: true,
    isFeatured: true,
    viewerCount: 11230,
    thumbnail: '/temples/badrinath.jpg',
    aartiSchedule: [
      { name: 'Maha Abhishek', time: '04:30', duration: 60, description: 'Sacred bathing' },
      { name: 'Geet Govind Path', time: '18:00', duration: 45 },
      { name: 'Aarati & Shayan', time: '21:00', duration: 30, description: 'Night closing' }
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
    liveFeatures: ['Daily Krishna Aarati', 'Janmashtami special', 'Gomti Ghat darshan'],
    youtubeVideoId: 'kQD_2Y4SxPs', // Dwarka Live Darshan
    recordedVideoId: 'T_9FVrw-Omg', // Dwarkadhish Aarati Playlist
    backupAmbienceId: 'AETFvQonfV8',
    isLive: true,
    isFeatured: true,
    viewerCount: 8920,
    thumbnail: '/temples/dwarkadheesh.jpg',
    aartiSchedule: [
      { name: 'Mangala Aarati', time: '06:30', duration: 30 },
      { name: 'Shringar Aarati', time: '10:30', duration: 30 },
      { name: 'Raj Bhog Aarati', time: '12:30', duration: 20 },
      { name: 'Sandhya Aarati', time: '19:00', duration: 45, description: 'Sunset at Gomti' },
      { name: 'Shayan Aarati', time: '21:30', duration: 20 }
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
    liveFeatures: ['Morning Kakad Aarati', 'Sandhya Aarati', 'Ganesh Chaturthi special'],
    youtubeVideoId: 'mf7mK1mLqEg',
    recordedVideoId: 'AETFvQonfV8', // Siddhivinayak Aarati Playlist
    backupAmbienceId: 'q8mWMlQBdFE',
    isLive: true,
    isFeatured: true,
    viewerCount: 18540,
    thumbnail: '/temples/siddhivinayak.jpg',
    aartiSchedule: [
      { name: 'Kakad Aarati', time: '05:30', duration: 30, description: 'Morning awakening' },
      { name: 'Madhyan Aarati', time: '12:00', duration: 20 },
      { name: 'Sandhya Aarati', time: '19:30', duration: 45, description: 'Evening ceremony' },
      { name: 'Shej Aarati', time: '22:00', duration: 20, description: 'Night closing' }
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
    liveFeatures: ['Kakad Aarati', 'Dhoop Aarati', 'Shej Aarati', 'Live samadhi darshan'],
    youtubeVideoId: 'UtV3pvVmPfM', // Shirdi Live Kakad & Shej Aarati
    recordedVideoId: 'AETFvQonfV8', // Shirdi Daily Aarati Playlist
    backupAmbienceId: 'q8mWMlQBdFE',
    isLive: true,
    isFeatured: true,
    viewerCount: 22340,
    thumbnail: '/temples/shirdi-sai.jpg',
    aartiSchedule: [
      { name: 'Kakad Aarati', time: '04:30', duration: 45, description: 'Famous morning aarati' },
      { name: 'Madhyan Aarati', time: '12:00', duration: 30, description: 'Midday prayers' },
      { name: 'Dhoop Aarati', time: '18:00', duration: 30, description: 'Evening incense' },
      { name: 'Shej Aarati', time: '22:00', duration: 45, description: 'Grand night ceremony' }
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
    liveFeatures: ['22 wells Abhishek', 'Morning Aarati', 'Sethu darshan'],
    youtubeVideoId: 'xd9RqLMsQ0A', // Rameswaram Live Abhishekam
    recordedVideoId: 'Rk_Z1kLJvnc', // Ramanathaswamy Aarati Videos
    backupAmbienceId: 'q8mWMlQBdFE',
    isLive: true,
    isFeatured: false,
    viewerCount: 7650,
    thumbnail: '/temples/rameshwaram.jpg',
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
    youtubeVideoId: 'h8VxvqJvL9o', // Akshardham Live Events (limited)
    recordedVideoId: 'T_9FVrw-Omg', // Akshardham Bhajan & Aarati Videos
    backupAmbienceId: 'AETFvQonfV8',
    isLive: false,
    isFeatured: false,
    viewerCount: 5430,
    thumbnail: '/temples/akshardham.jpg',
    aartiSchedule: [
      { name: 'Mangala Aarati', time: '07:00', duration: 30 },
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
    liveFeatures: ['Janmashtami celebrations', 'Daily Krishna Aarati', 'Midnight ceremonies'],
    youtubeVideoId: 'zR4yNZ0SJYU', // Janmabhoomi Live Darshan
    recordedVideoId: 'T_9FVrw-Omg', // Krishna Janmashtami & Daily Aarati
    backupAmbienceId: 'AETFvQonfV8',
    isLive: true,
    isFeatured: false,
    viewerCount: 9870,
    thumbnail: '/temples/mathura-krishna.jpg',
    aartiSchedule: [
      { name: 'Mangala Aarati', time: '05:00', duration: 30 },
      { name: 'Shringar Aarati', time: '07:30', duration: 30, description: 'Krishna decoration' },
      { name: 'Raj Bhog Aarati', time: '12:00', duration: 20 },
      { name: 'Sandhya Aarati', time: '19:00', duration: 45 },
      { name: 'Midnight Aarati', time: '00:00', duration: 60, description: 'Birth celebration' }
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
    youtubeVideoId: 'K9GhMvzPjCA', // Sabarimala Live (seasonal)
    recordedVideoId: 'AETFvQonfV8', // Harivarasanam & Aarati Playlist
    backupAmbienceId: 'q8mWMlQBdFE',
    isLive: true,
    isFeatured: false,
    viewerCount: 6780,
    thumbnail: '/temples/sabarimala.jpg',
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
    youtubeVideoId: 'wKL2_UUG7Ok', // Bhimashankar Live Abhishek
    recordedVideoId: 'Rk_Z1kLJvnc', // Bhimashankar Aarati Videos
    backupAmbienceId: 'q8mWMlQBdFE',
    isLive: true,
    isFeatured: false,
    viewerCount: 4230,
    thumbnail: '/temples/bhimashankar.jpg',
    aartiSchedule: [
      { name: 'Abhishek', time: '04:30', duration: 60, description: 'Forest dawn ritual' },
      { name: 'Madhyan Aarati', time: '11:00', duration: 20 },
      { name: 'Sandhya Aarati', time: '18:30', duration: 30, description: 'Sahyadri sunset' }
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
    youtubeVideoId: 'c-6rq8A7Nzc', // Guruvayur Live Darshan
    recordedVideoId: 'T_9FVrw-Omg', // Guruvayur Krishna Aarati Playlist
    backupAmbienceId: 'AETFvQonfV8',
    isLive: true,
    isFeatured: false,
    viewerCount: 8340,
    thumbnail: '/temples/guruvayur.jpg',
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
    liveFeatures: ['Ganga Aarati at source', 'Himalayan views', 'Pilgrimage season'],
    youtubeVideoId: 'bEVCHxMgv7E', // Gangotri Live (seasonal)
    recordedVideoId: 'W2YsBMdJEKM', // Ganga Aarati & Himalayan Darshan
    backupAmbienceId: 'q8mWMlQBdFE',
    isLive: false,
    isFeatured: false,
    viewerCount: 3450,
    thumbnail: '/temples/gangotri.jpg',
    aartiSchedule: [
      { name: 'Mangala Aarati', time: '06:00', duration: 30, description: 'Himalayan dawn' },
      { name: 'Ganga Aarati', time: '18:30', duration: 45, description: 'Source of Ganga' }
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
    liveFeatures: ['Hot springs darshan', 'Yamuna Aarati', 'Trek views'],
    youtubeVideoId: 'J3_xfVlXtZo', // Yamunotri Live (seasonal)
    recordedVideoId: 'W2YsBMdJEKM', // Yamunotri Aarati Videos
    backupAmbienceId: 'q8mWMlQBdFE',
    isLive: false,
    isFeatured: false,
    viewerCount: 2890,
    thumbnail: '/temples/yamunotri.jpg',
    aartiSchedule: [
      { name: 'Mangala Aarati', time: '06:30', duration: 30 },
      { name: 'Yamuna Aarati', time: '19:00', duration: 30, description: 'Source of Yamuna' }
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
    thumbnail: 'https://img.youtube.com/vi/AETFvQonfV8/hqdefault.jpg'
  },
  {
    id: 'shiv-tandav',
    title: 'Shiv Tandav Stotram',
    type: 'bhajan',
    youtubeVideoId: 'hMBKmQEPNzI',
    duration: '8:32',
    thumbnail: 'https://img.youtube.com/vi/hMBKmQEPNzI/hqdefault.jpg'
  },
  {
    id: 'vishnu-sahasranamam',
    title: 'Vishnu Sahasranamam',
    type: 'bhajan',
    youtubeVideoId: 'zKC17254flc',
    duration: '28:15',
    thumbnail: 'https://img.youtube.com/vi/zKC17254flc/hqdefault.jpg'
  },
  // Aarati
  {
    id: 'om-jai-jagdish',
    title: 'Om Jai Jagdish Hare Aarati',
    type: 'aarti',
    youtubeVideoId: 'NE3SWh9_vR4',
    duration: '7:20',
    thumbnail: 'https://img.youtube.com/vi/NE3SWh9_vR4/hqdefault.jpg'
  },
  {
    id: 'ganga-aarti',
    title: 'Ganga Aarati - Varanasi',
    type: 'aarti',
    youtubeVideoId: 'I8HNi91OKcs',
    duration: 'Live',
    thumbnail: 'https://img.youtube.com/vi/I8HNi91OKcs/hqdefault.jpg'
  },
  // Discourses
  {
    id: 'premanand-wisdom-1',
    title: 'Premanand Ji Maharaj',
    type: 'pravachan',
    youtubeVideoId: 'Uv9hn_9yEpg',
    duration: '15:30',
    speaker: 'Premanand Ji Maharaj',
    thumbnail: 'https://img.youtube.com/vi/Uv9hn_9yEpg/hqdefault.jpg'
  },
  // Shorts
  {
    id: 'morning-mantra',
    title: 'Morning Mantra - 1 Minute Peace',
    type: 'short',
    youtubeVideoId: 'AETFvQonfV8',
    duration: '0:60',
    thumbnail: 'https://img.youtube.com/vi/AETFvQonfV8/hqdefault.jpg'
  },
  // New additions
  {
    id: 'manglacharan-nirankari',
    title: 'Manglacharan Nirankari Mission',
    type: 'bhajan',
    youtubeVideoId: 'fNWJV8bERZc',
    duration: '12:00',
    thumbnail: 'https://img.youtube.com/vi/fNWJV8bERZc/hqdefault.jpg'
  },
  {
    id: 'dhuni-nirankari',
    title: 'Dhuni Nirankari Mission',
    type: 'bhajan',
    youtubeVideoId: 'Bc0ZPaZ5OFE',
    duration: '10:00',
    thumbnail: 'https://img.youtube.com/vi/Bc0ZPaZ5OFE/hqdefault.jpg'
  },
  {
    id: 'all-aarti-morning',
    title: 'All Aarati (Morning)',
    type: 'aarti',
    youtubeVideoId: 'q8lcgclUVSQ',
    duration: '45:00',
    thumbnail: 'https://img.youtube.com/vi/q8lcgclUVSQ/hqdefault.jpg'
  },
  {
    id: 'panchdev-aarti',
    title: 'Panchdev Aarati',
    type: 'aarti',
    youtubeVideoId: 'zysW2tnJy30',
    duration: '15:00',
    thumbnail: 'https://img.youtube.com/vi/zysW2tnJy30/hqdefault.jpg'
  },
  {
    id: 'bajrang-baan',
    title: 'Bajrang Baan',
    type: 'bhajan',
    youtubeVideoId: 'dXl2NdlmeIE',
    duration: '12:30',
    thumbnail: 'https://img.youtube.com/vi/dXl2NdlmeIE/hqdefault.jpg'
  },
  {
    id: 'iskcon-morning-aarti',
    title: 'ISKCON Morning Aarati',
    type: 'aarti',
    youtubeVideoId: 'W9D2mJaEI2Y',
    duration: '20:00',
    thumbnail: 'https://img.youtube.com/vi/W9D2mJaEI2Y/hqdefault.jpg'
  },
  {
    id: 'shiv-amritwani',
    title: 'Shiv Amritwani',
    type: 'bhajan',
    youtubeVideoId: 'kYFriF5zHMM',
    duration: '35:00',
    thumbnail: 'https://img.youtube.com/vi/kYFriF5zHMM/hqdefault.jpg'
  },
  {
    id: 'hanuman-amritwani',
    title: 'Shri Hanuman Amritwani',
    type: 'bhajan',
    youtubeVideoId: 'ksPEwPcFGbU',
    duration: '40:00',
    thumbnail: 'https://img.youtube.com/vi/ksPEwPcFGbU/hqdefault.jpg'
  },
  {
    id: 'mahamrityunjay-mantra',
    title: 'Mahamrityunjay Mantra',
    type: 'mantra',
    youtubeVideoId: 'adyjwFgXRNY',
    duration: '30:00',
    thumbnail: 'https://img.youtube.com/vi/adyjwFgXRNY/hqdefault.jpg'
  }
];

export const getCategoryLabels = (t: (key: string) => string): Record<TempleCategory, string> => ({
  jyotirlinga: t('temple.cat.jyotirlinga'),
  shakti_peeth: t('temple.cat.shaktiPeeth'),
  major: t('temple.cat.major'),
  international: t('temple.cat.international'),
  iskcon: t('temple.cat.iskcon'),
});

export const getDeityLabels = (t: (key: string) => string): Record<DeityType, string> => ({
  shiva: t('temple.deity.shiva'),
  vishnu: t('temple.deity.vishnu'),
  devi: t('temple.deity.devi'),
  guru: t('temple.deity.guru'),
  multi: t('temple.deity.multi'),
});

export const getRegionLabels = (t: (key: string) => string): Record<Region, string> => ({
  north: t('temple.region.north'),
  south: t('temple.region.south'),
  east: t('temple.region.east'),
  west: t('temple.region.west'),
  international: t('temple.region.international'),
});

// Keep backward-compatible exports
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
