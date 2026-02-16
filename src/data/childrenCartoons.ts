export interface CartoonVideo {
  id: string;
  title: string;
  youtubeVideoId: string;
  thumbnail: string;
  duration: string;
  source: 'video' | 'playlist';
  playlistId?: string;
}

// Standalone videos — shown first
export const standaloneCartoons: CartoonVideo[] = [
  {
    id: 'cartoon-1',
    title: 'Hanuman Chalisa for Kids',
    youtubeVideoId: 'Jw2efcyES-E',
    thumbnail: 'https://img.youtube.com/vi/Jw2efcyES-E/hqdefault.jpg',
    duration: '5:00',
    source: 'video',
  },
  {
    id: 'cartoon-2',
    title: 'Lord Ganesha Stories for Children',
    youtubeVideoId: 'g49csu_TktQ',
    thumbnail: 'https://img.youtube.com/vi/g49csu_TktQ/hqdefault.jpg',
    duration: '12:30',
    source: 'video',
  },
  {
    id: 'cartoon-3',
    title: 'Krishna Janmashtami Special',
    youtubeVideoId: 'eoWsoQCZGdM',
    thumbnail: 'https://img.youtube.com/vi/eoWsoQCZGdM/hqdefault.jpg',
    duration: '10:15',
    source: 'video',
  },
];

// Representative videos from each playlist
export const playlistCartoons: CartoonVideo[] = [
  {
    id: 'pl-1',
    title: 'Mahabharat for Kids',
    youtubeVideoId: 'PLnt0tgJu1YDjBXIx_WHoBoOj0NqNOPVw5',
    thumbnail: 'https://img.youtube.com/vi/Jw2efcyES-E/hqdefault.jpg',
    duration: 'Playlist',
    source: 'playlist',
    playlistId: 'PLnt0tgJu1YDjBXIx_WHoBoOj0NqNOPVw5',
  },
  {
    id: 'pl-2',
    title: 'Ramayan Animated Series',
    youtubeVideoId: 'PL0rMr_qVm_FLmwmWujzxAFJJp1aLO92Kh',
    thumbnail: 'https://img.youtube.com/vi/g49csu_TktQ/hqdefault.jpg',
    duration: 'Playlist',
    source: 'playlist',
    playlistId: 'PL0rMr_qVm_FLmwmWujzxAFJJp1aLO92Kh',
  },
  {
    id: 'pl-3',
    title: 'Krishna Cartoon Collection',
    youtubeVideoId: 'PL2xd-_GzegJeoT8V4tcF5X3bg3R_20ThY',
    thumbnail: 'https://img.youtube.com/vi/eoWsoQCZGdM/hqdefault.jpg',
    duration: 'Playlist',
    source: 'playlist',
    playlistId: 'PL2xd-_GzegJeoT8V4tcF5X3bg3R_20ThY',
  },
  {
    id: 'pl-4',
    title: 'Hanuman Adventures',
    youtubeVideoId: 'PLKRxH8XztcuA7oEY5ukz4b0qG2kvg74Qf',
    thumbnail: 'https://img.youtube.com/vi/Jw2efcyES-E/hqdefault.jpg',
    duration: 'Playlist',
    source: 'playlist',
    playlistId: 'PLKRxH8XztcuA7oEY5ukz4b0qG2kvg74Qf',
  },
  {
    id: 'pl-5',
    title: 'Moral Stories for Kids',
    youtubeVideoId: 'PLwO2Kfa63UMbo6PMVQA3wXI1uQiS0oE0X',
    thumbnail: 'https://img.youtube.com/vi/g49csu_TktQ/hqdefault.jpg',
    duration: 'Playlist',
    source: 'playlist',
    playlistId: 'PLwO2Kfa63UMbo6PMVQA3wXI1uQiS0oE0X',
  },
  {
    id: 'pl-6',
    title: 'Bhagavad Gita for Children',
    youtubeVideoId: 'PLwO2Kfa63UMa1Nipd4tmRkFGQcbq3XAa8',
    thumbnail: 'https://img.youtube.com/vi/eoWsoQCZGdM/hqdefault.jpg',
    duration: 'Playlist',
    source: 'playlist',
    playlistId: 'PLwO2Kfa63UMa1Nipd4tmRkFGQcbq3XAa8',
  },
  {
    id: 'pl-7',
    title: 'Spiritual Tales Animated',
    youtubeVideoId: 'PL072FAABC1269965C',
    thumbnail: 'https://img.youtube.com/vi/Jw2efcyES-E/hqdefault.jpg',
    duration: 'Playlist',
    source: 'playlist',
    playlistId: 'PL072FAABC1269965C',
  },
];

export const allCartoons = [...standaloneCartoons, ...playlistCartoons];
