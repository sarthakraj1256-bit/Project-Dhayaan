export interface LiveTemple {
  id: number;
  name: string;
  location: string;
  deity: string;
  color: string;
  imageUrl: string;
  liveUrl: string | null;
  hasLive: boolean;
  region: string;
}

const ALL_TEMPLES: LiveTemple[] = [
  { id: 1, name: "Siddhivinayak Temple", location: "Mumbai, Maharashtra", deity: "Lord Ganesha", color: "#E65100", imageUrl: "/temples/siddhivinayak.jpg", liveUrl: "https://www.youtube.com/@mayurbhakti/live", hasLive: true, region: "west" },
  { id: 2, name: "Somnath Temple", location: "Saurashtra, Gujarat", deity: "Lord Shiva", color: "#6A1B9A", imageUrl: "/temples/somnath.jpg", liveUrl: "https://www.youtube.com/@bhaktilive1/live", hasLive: true, region: "west" },
  { id: 3, name: "Mahakaleshwar Temple", location: "Ujjain, Madhya Pradesh", deity: "Lord Shiva", color: "#1A237E", imageUrl: "/temples/mahakaleshwar.jpg", liveUrl: "https://www.youtube.com/@mahakallivedarshanofficial/live", hasLive: true, region: "north" },
  { id: 4, name: "Kedarnath Temple", location: "Uttarakhand, Himalayas", deity: "Lord Shiva", color: "#37474F", imageUrl: "/temples/kedarnath.jpg", liveUrl: "https://www.youtube.com/@swargmarg/live", hasLive: true, region: "north" },
  { id: 5, name: "Omkareshwar Temple", location: "Khandwa, Madhya Pradesh", deity: "Lord Shiva", color: "#BF360C", imageUrl: "/temples/omkareshwar.jpg", liveUrl: "https://www.youtube.com/@shriomkarofficial/live", hasLive: true, region: "north" },
  { id: 6, name: "Trimbakeshwar Temple", location: "Nashik, Maharashtra", deity: "Lord Shiva", color: "#4E342E", imageUrl: "/temples/trimbakeshwar.jpg", liveUrl: null, hasLive: false, region: "west" },
  { id: 7, name: "Kamakhya Temple", location: "Guwahati, Assam", deity: "Goddess Kamakhya", color: "#880E4F", imageUrl: "/temples/kamakhya.jpg", liveUrl: null, hasLive: false, region: "east" },
  { id: 8, name: "Kalighat Temple", location: "Kolkata, West Bengal", deity: "Goddess Kali", color: "#212121", imageUrl: "/temples/kalighat.jpg", liveUrl: "https://www.youtube.com/@live_tv_darshann/live", hasLive: true, region: "east" },
  { id: 9, name: "Meenakshi Amman Temple", location: "Madurai, Tamil Nadu", deity: "Goddess Meenakshi", color: "#1B5E20", imageUrl: "/temples/meenakshi-amman.jpg", liveUrl: "https://www.youtube.com/@maduraimeenakshi1481/live", hasLive: true, region: "south" },
  { id: 10, name: "Jagannath Temple", location: "Puri, Odisha", deity: "Lord Jagannath", color: "#E65100", imageUrl: "/temples/jagannath.jpg", liveUrl: "https://www.youtube.com/@jayjagannathtvhindi/live", hasLive: true, region: "east" },
  { id: 11, name: "Pashupatinath Temple", location: "Kathmandu, Nepal", deity: "Lord Shiva", color: "#5D4037", imageUrl: "/temples/pashupatinath.jpg", liveUrl: "https://www.youtube.com/@krishnagyansagar/live", hasLive: true, region: "east" },
  { id: 12, name: "Batu Caves Temple", location: "Kuala Lumpur, Malaysia", deity: "Lord Murugan", color: "#F57F17", imageUrl: "/temples/batu-caves.jpg", liveUrl: null, hasLive: false, region: "international" },
  { id: 13, name: "ISKCON Vrindavan", location: "Vrindavan, Uttar Pradesh", deity: "Radha Krishna", color: "#F9A825", imageUrl: "/temples/iskcon-vrindavan.jpg", liveUrl: "https://www.youtube.com/@bhaktilive1/live", hasLive: true, region: "pilgrimages" },
  { id: 14, name: "ISKCON Mayapur", location: "Mayapur, West Bengal", deity: "Radha Madhava", color: "#0277BD", imageUrl: "/temples/iskcon-mayapur.jpg", liveUrl: "https://www.youtube.com/@mayapurtvofficial/live", hasLive: true, region: "east" },
  { id: 15, name: "Badrinath Temple", location: "Chamoli, Uttarakhand", deity: "Lord Vishnu", color: "#1565C0", imageUrl: "/temples/badrinath.jpg", liveUrl: null, hasLive: false, region: "north" },
  { id: 16, name: "Dwarkadheesh Temple", location: "Dwarka, Gujarat", deity: "Lord Krishna", color: "#1A237E", imageUrl: "/temples/dwarkadheesh.jpg", liveUrl: "https://www.youtube.com/@shridwarkadhishmandirofficial/live", hasLive: true, region: "west" },
  { id: 17, name: "Ramanathaswamy Temple", location: "Rameswaram, Tamil Nadu", deity: "Lord Shiva", color: "#4A148C", imageUrl: "/temples/rameshwaram.jpg", liveUrl: null, hasLive: false, region: "south" },
  { id: 18, name: "Akshardham Temple", location: "New Delhi", deity: "Swaminarayan", color: "#E65100", imageUrl: "/temples/akshardham.jpg", liveUrl: null, hasLive: false, region: "pilgrimages" },
  { id: 19, name: "Krishna Janmabhoomi", location: "Mathura, Uttar Pradesh", deity: "Lord Krishna", color: "#F57F17", imageUrl: "/temples/mathura-krishna.jpg", liveUrl: "https://www.youtube.com/@solotunebhaktidhara/live", hasLive: true, region: "pilgrimages" },
  { id: 20, name: "Sabarimala Temple", location: "Pathanamthitta, Kerala", deity: "Lord Ayyappa", color: "#1B5E20", imageUrl: "/temples/sabarimala.jpg", liveUrl: null, hasLive: false, region: "south" },
  { id: 21, name: "Bhimashankar Temple", location: "Pune, Maharashtra", deity: "Lord Shiva", color: "#4E342E", imageUrl: "/temples/bhimashankar.jpg", liveUrl: null, hasLive: false, region: "west" },
  { id: 22, name: "Guruvayur Temple", location: "Guruvayur, Kerala", deity: "Lord Krishna", color: "#F9A825", imageUrl: "/temples/guruvayur.jpg", liveUrl: "https://www.youtube.com/@guruvayurdevaswomofficial/live", hasLive: true, region: "south" },
  { id: 23, name: "Gangotri Temple", location: "Uttarkashi, Uttarakhand", deity: "Goddess Ganga", color: "#0277BD", imageUrl: "/temples/gangotri.jpg", liveUrl: null, hasLive: false, region: "north" },
  { id: 24, name: "Yamunotri Temple", location: "Uttarkashi, Uttarakhand", deity: "Goddess Yamuna", color: "#00838F", imageUrl: "/temples/yamunotri.jpg", liveUrl: null, hasLive: false, region: "north" },
  { id: 25, name: "Kashi Vishwanath Dham", location: "Varanasi, Uttar Pradesh", deity: "Lord Shiva", color: "#D4A017", imageUrl: "/temples/kashi-vishwanath.jpg", liveUrl: "https://youtube.com/@ddastro/live", hasLive: true, region: "north" },
  { id: 26, name: "Tirupati Balaji", location: "Tirumala, Andhra Pradesh", deity: "Lord Venkateswara", color: "#8B0000", imageUrl: "/temples/tirupati-balaji.jpg", liveUrl: "https://youtube.com/@svbcbroadcast/live", hasLive: true, region: "south" },
];

export const LIVE_TEMPLES = ALL_TEMPLES;

export const REGION_ORDER = [
  { key: 'north', labelKey: 'darshan.regionNorth' as const },
  { key: 'west', labelKey: 'darshan.regionWest' as const },
  { key: 'south', labelKey: 'darshan.regionSouth' as const },
  { key: 'east', labelKey: 'darshan.regionEast' as const },
  { key: 'pilgrimages', labelKey: 'darshan.regionPilgrimages' as const },
  { key: 'international', labelKey: 'darshan.regionInternational' as const },
] as const;

export function getTemplesByRegion(temples: LiveTemple[]) {
  return REGION_ORDER.map(r => ({
    ...r,
    temples: temples.filter(t => t.region === r.key),
  })).filter(r => r.temples.length > 0);
}
