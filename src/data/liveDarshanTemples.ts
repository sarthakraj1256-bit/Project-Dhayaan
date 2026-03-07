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
  { id: 1, name: "Siddhivinayak Temple", location: "Mumbai, Maharashtra", deity: "Lord Ganesha", color: "#E65100", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Siddhivinayak_Temple%2C_Mumbai_1.jpg/640px-Siddhivinayak_Temple%2C_Mumbai_1.jpg", liveUrl: "https://www.youtube.com/@mayurbhakti/live", hasLive: true, region: "west" },
  { id: 2, name: "Somnath Temple", location: "Saurashtra, Gujarat", deity: "Lord Shiva", color: "#6A1B9A", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Somnath_Temple_Gujrat_india.jpg/640px-Somnath_Temple_Gujrat_india.jpg", liveUrl: "https://www.youtube.com/@bhaktilive1/live", hasLive: true, region: "west" },
  { id: 3, name: "Mahakaleshwar Temple", location: "Ujjain, Madhya Pradesh", deity: "Lord Shiva", color: "#1A237E", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Mahakal_Temple_Ujjain.jpg/640px-Mahakal_Temple_Ujjain.jpg", liveUrl: "https://www.youtube.com/@mahakallivedarshanofficial/live", hasLive: true, region: "north" },
  { id: 4, name: "Kedarnath Temple", location: "Uttarakhand, Himalayas", deity: "Lord Shiva", color: "#37474F", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Kedarnath_Temple.jpg/640px-Kedarnath_Temple.jpg", liveUrl: "https://www.youtube.com/@swargmarg/live", hasLive: true, region: "north" },
  { id: 5, name: "Omkareshwar Temple", location: "Khandwa, Madhya Pradesh", deity: "Lord Shiva", color: "#BF360C", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Omkareshwar_temple.jpg/640px-Omkareshwar_temple.jpg", liveUrl: "https://www.youtube.com/@shriomkarofficial/live", hasLive: true, region: "north" },
  { id: 6, name: "Trimbakeshwar Temple", location: "Nashik, Maharashtra", deity: "Lord Shiva", color: "#4E342E", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Trimbakeshwar_Shiva_Temple.jpg/640px-Trimbakeshwar_Shiva_Temple.jpg", liveUrl: null, hasLive: false, region: "west" },
  { id: 7, name: "Kamakhya Temple", location: "Guwahati, Assam", deity: "Goddess Kamakhya", color: "#880E4F", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Kamakhya_Temple.jpg/640px-Kamakhya_Temple.jpg", liveUrl: null, hasLive: false, region: "east" },
  { id: 8, name: "Kalighat Temple", location: "Kolkata, West Bengal", deity: "Goddess Kali", color: "#212121", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Kalighat_Kali_Temple.jpg/640px-Kalighat_Kali_Temple.jpg", liveUrl: "https://www.youtube.com/@live_tv_darshann/live", hasLive: true, region: "east" },
  { id: 9, name: "Meenakshi Amman Temple", location: "Madurai, Tamil Nadu", deity: "Goddess Meenakshi", color: "#1B5E20", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Meenakshi_Amman_Temple_Madurai.jpg/640px-Meenakshi_Amman_Temple_Madurai.jpg", liveUrl: "https://www.youtube.com/@maduraimeenakshi1481/live", hasLive: true, region: "south" },
  { id: 10, name: "Jagannath Temple", location: "Puri, Odisha", deity: "Lord Jagannath", color: "#E65100", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Jagannath_temple_Puri.jpg/640px-Jagannath_temple_Puri.jpg", liveUrl: "https://www.youtube.com/@jayjagannathtvhindi/live", hasLive: true, region: "east" },
  { id: 11, name: "Pashupatinath Temple", location: "Kathmandu, Nepal", deity: "Lord Shiva", color: "#5D4037", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Pashupatinath_Temple.jpg/640px-Pashupatinath_Temple.jpg", liveUrl: "https://www.youtube.com/@krishnagyansagar/live", hasLive: true, region: "east" },
  { id: 12, name: "Batu Caves Temple", location: "Kuala Lumpur, Malaysia", deity: "Lord Murugan", color: "#F57F17", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Batu_Caves_Temple_Malaysia.jpg/640px-Batu_Caves_Temple_Malaysia.jpg", liveUrl: null, hasLive: false, region: "international" },
  { id: 13, name: "ISKCON Vrindavan", location: "Vrindavan, Uttar Pradesh", deity: "Radha Krishna", color: "#F9A825", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/ISKCON_Vrindavan.jpg/640px-ISKCON_Vrindavan.jpg", liveUrl: "https://www.youtube.com/@bhaktilive1/live", hasLive: true, region: "pilgrimages" },
  { id: 14, name: "ISKCON Mayapur", location: "Mayapur, West Bengal", deity: "Radha Madhava", color: "#0277BD", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/TOVP_Mayapur.jpg/640px-TOVP_Mayapur.jpg", liveUrl: "https://www.youtube.com/@mayapurtvofficial/live", hasLive: true, region: "east" },
  { id: 15, name: "Badrinath Temple", location: "Chamoli, Uttarakhand", deity: "Lord Vishnu", color: "#1565C0", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Badrinath_Temple_Uttarakhand.jpg/640px-Badrinath_Temple_Uttarakhand.jpg", liveUrl: null, hasLive: false, region: "north" },
  { id: 16, name: "Dwarkadheesh Temple", location: "Dwarka, Gujarat", deity: "Lord Krishna", color: "#1A237E", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Dwarkadhish_temple.jpg/640px-Dwarkadhish_temple.jpg", liveUrl: "https://www.youtube.com/@shridwarkadhishmandirofficial/live", hasLive: true, region: "west" },
  { id: 17, name: "Ramanathaswamy Temple", location: "Rameswaram, Tamil Nadu", deity: "Lord Shiva", color: "#4A148C", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Ramanathaswamy_Temple_Rameshwaram.jpg/640px-Ramanathaswamy_Temple_Rameshwaram.jpg", liveUrl: null, hasLive: false, region: "south" },
  { id: 18, name: "Akshardham Temple", location: "New Delhi", deity: "Swaminarayan", color: "#E65100", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Akshardham_Temple_Delhi.jpg/640px-Akshardham_Temple_Delhi.jpg", liveUrl: null, hasLive: false, region: "pilgrimages" },
  { id: 19, name: "Krishna Janmabhoomi", location: "Mathura, Uttar Pradesh", deity: "Lord Krishna", color: "#F57F17", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Krishna_Janmabhoomi_Mathura.jpg/640px-Krishna_Janmabhoomi_Mathura.jpg", liveUrl: "https://www.youtube.com/@solotunebhaktidhara/live", hasLive: true, region: "pilgrimages" },
  { id: 20, name: "Sabarimala Temple", location: "Pathanamthitta, Kerala", deity: "Lord Ayyappa", color: "#1B5E20", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Sabarimala_Temple_Kerala.jpg/640px-Sabarimala_Temple_Kerala.jpg", liveUrl: null, hasLive: false, region: "south" },
  { id: 21, name: "Bhimashankar Temple", location: "Pune, Maharashtra", deity: "Lord Shiva", color: "#4E342E", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Bhimashankar_Temple.jpg/640px-Bhimashankar_Temple.jpg", liveUrl: null, hasLive: false, region: "west" },
  { id: 22, name: "Guruvayur Temple", location: "Guruvayur, Kerala", deity: "Lord Krishna", color: "#F9A825", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Guruvayur_Temple.jpg/640px-Guruvayur_Temple.jpg", liveUrl: "https://www.youtube.com/@guruvayurdevaswomofficial/live", hasLive: true, region: "south" },
  { id: 23, name: "Gangotri Temple", location: "Uttarkashi, Uttarakhand", deity: "Goddess Ganga", color: "#0277BD", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Gangotri_Temple_Uttarakhand.jpg/640px-Gangotri_Temple_Uttarakhand.jpg", liveUrl: null, hasLive: false, region: "north" },
  { id: 24, name: "Yamunotri Temple", location: "Uttarkashi, Uttarakhand", deity: "Goddess Yamuna", color: "#00838F", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Yamunotri_Temple.jpg/640px-Yamunotri_Temple.jpg", liveUrl: null, hasLive: false, region: "north" },
];

export const LIVE_TEMPLES = ALL_TEMPLES;

export const REGION_ORDER = [
  { key: 'north', label: '📍 North India & Himalayas' },
  { key: 'west', label: '📍 West India' },
  { key: 'south', label: '📍 South India' },
  { key: 'east', label: '📍 East India & Nepal' },
  { key: 'pilgrimages', label: '📍 North India Pilgrimages' },
  { key: 'international', label: '📍 International' },
] as const;

export function getTemplesByRegion(temples: LiveTemple[]) {
  return REGION_ORDER.map(r => ({
    ...r,
    temples: temples.filter(t => t.region === r.key),
  })).filter(r => r.temples.length > 0);
}
