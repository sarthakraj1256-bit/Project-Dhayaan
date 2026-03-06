export interface LiveTemple {
  id: number;
  name: string;
  subtitle: string;
  liveUrl: string;
  embedChannel: string;
  location: string;
  deity: string;
  image: string;
  color: string;
  gradient: string;
}

export const LIVE_TEMPLES: LiveTemple[] = [
  {
    id: 1,
    name: "Golden Temple",
    subtitle: "Sri Harmandir Sahib, Amritsar",
    liveUrl: "https://www.youtube.com/@sgpcsriamritsar/live",
    embedChannel: "sgpcsriamritsar",
    location: "Amritsar, Punjab",
    deity: "Waheguru",
    image: "/temples/golden-temple.jpg",
    color: "#D4A017",
    gradient: "from-amber-700 to-yellow-500",
  },
  {
    id: 2,
    name: "Vaishno Devi Temple",
    subtitle: "Mata Vaishno Devi, Katra",
    liveUrl: "https://www.youtube.com/@mhoneshraddha/live",
    embedChannel: "mhoneshraddha",
    location: "Katra, Jammu & Kashmir",
    deity: "Mata Vaishno Devi",
    image: "/temples/vaishno-devi.jpg",
    color: "#C2185B",
    gradient: "from-pink-800 to-red-500",
  },
  {
    id: 3,
    name: "Kashi Vishwanath Temple",
    subtitle: "Baba Vishwanath, Varanasi",
    liveUrl: "https://www.youtube.com/@ddastro/live",
    embedChannel: "ddastro",
    location: "Varanasi, Uttar Pradesh",
    deity: "Lord Shiva",
    image: "/temples/kashi-vishwanath.jpg",
    color: "#FF6F00",
    gradient: "from-orange-800 to-amber-500",
  },
  {
    id: 4,
    name: "Tirupati Balaji Temple",
    subtitle: "Sri Venkateswara, Tirupati",
    liveUrl: "https://www.youtube.com/@svbcbroadcast/live",
    embedChannel: "svbcbroadcast",
    location: "Tirupati, Andhra Pradesh",
    deity: "Lord Venkateswara",
    image: "/temples/tirupati-balaji.jpg",
    color: "#1565C0",
    gradient: "from-blue-900 to-blue-600",
  },
];
