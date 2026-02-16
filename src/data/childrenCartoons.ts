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
    youtubeVideoId: 'videoseries',
    thumbnail: 'https://img.youtube.com/vi/Jw2efcyES-E/hqdefault.jpg',
    duration: 'Playlist',
    source: 'playlist',
    playlistId: 'PLnt0tgJu1YDjBXIx_WHoBoOj0NqNOPVw5',
  },
  {
    id: 'pl-2',
    title: 'Ramayan Animated Series',
    youtubeVideoId: 'videoseries',
    thumbnail: 'https://img.youtube.com/vi/g49csu_TktQ/hqdefault.jpg',
    duration: 'Playlist',
    source: 'playlist',
    playlistId: 'PL0rMr_qVm_FLmwmWujzxAFJJp1aLO92Kh',
  },
  {
    id: 'pl-3',
    title: 'Krishna Cartoon Collection',
    youtubeVideoId: 'videoseries',
    thumbnail: 'https://img.youtube.com/vi/eoWsoQCZGdM/hqdefault.jpg',
    duration: 'Playlist',
    source: 'playlist',
    playlistId: 'PL2xd-_GzegJeoT8V4tcF5X3bg3R_20ThY',
  },
  {
    id: 'pl-4',
    title: 'Hanuman Adventures',
    youtubeVideoId: 'videoseries',
    thumbnail: 'https://img.youtube.com/vi/Jw2efcyES-E/hqdefault.jpg',
    duration: 'Playlist',
    source: 'playlist',
    playlistId: 'PLKRxH8XztcuA7oEY5ukz4b0qG2kvg74Qf',
  },
  {
    id: 'pl-5',
    title: 'Moral Stories for Kids',
    youtubeVideoId: 'videoseries',
    thumbnail: 'https://img.youtube.com/vi/g49csu_TktQ/hqdefault.jpg',
    duration: 'Playlist',
    source: 'playlist',
    playlistId: 'PLwO2Kfa63UMbo6PMVQA3wXI1uQiS0oE0X',
  },
  {
    id: 'pl-6',
    title: 'Bhagavad Gita for Children',
    youtubeVideoId: 'videoseries',
    thumbnail: 'https://img.youtube.com/vi/eoWsoQCZGdM/hqdefault.jpg',
    duration: 'Playlist',
    source: 'playlist',
    playlistId: 'PLwO2Kfa63UMa1Nipd4tmRkFGQcbq3XAa8',
  },
  {
    id: 'pl-7',
    title: 'Spiritual Tales Animated',
    youtubeVideoId: 'videoseries',
    thumbnail: 'https://img.youtube.com/vi/Jw2efcyES-E/hqdefault.jpg',
    duration: 'Playlist',
    source: 'playlist',
    playlistId: 'PL072FAABC1269965C',
  },
];

// Roll No 21 – standalone section
const rollNo21VideoIds = [
  'RaA3R_UoGtI','DW6u7rGMcZg','Hx1V2zT_b4s','mUoHWNz2JUE','gUOUFLL-l-k',
  'De8Xd5Jh4mg','Zys0_6bi_QM','XPqn24i_H74','ZfPyu4yPcqc','XteUdGK9fHs',
  '4Ey3nbUCGyE','g0zHpqGVsQA','auW9wvGUjvw','S13OtIWh1ZU','eea-7lI7oOY',
  '8ZRgzrXvMtA','v4bDeGjJV80','KUguqFk0txg','UL08Nna-NTk','UqzRlOa65Hw',
];

export const rollNo21Cartoons: CartoonVideo[] = (() => {
  const seen = new Set<string>();
  return rollNo21VideoIds
    .filter((vid) => {
      if (seen.has(vid)) return false;
      seen.add(vid);
      return true;
    })
    .map((vid) => ({
      id: `rollno21-${vid}`,
      title: `Roll No 21`,
      youtubeVideoId: vid,
      thumbnail: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
      duration: '',
      source: 'video' as const,
    }));
})();

export const allCartoons = [...standaloneCartoons, ...playlistCartoons];
