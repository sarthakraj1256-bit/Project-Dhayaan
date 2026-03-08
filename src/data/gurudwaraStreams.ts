export interface Gurudwara {
  id: number;
  name: string;
  location: string;
  imageUrl: string;
  liveUrl: string;
}

export const GURUDWARAS: Gurudwara[] = [
  {
    id: 1,
    name: 'Golden Temple (Sri Harmandir Sahib)',
    location: 'Amritsar, Punjab',
    imageUrl: '/gurudwaras/golden-temple.jpg',
    liveUrl: 'https://youtube.com/@sgpcsriamritsar',
  },
  {
    id: 2,
    name: 'Gurdwara Dukh Niwaran Sahib',
    location: 'Ludhiana, Punjab',
    imageUrl: '/gurudwaras/dukh-niwaran-sahib.jpg',
    liveUrl: 'https://youtube.com/@akalmultimedia',
  },
  {
    id: 3,
    name: 'Gurbani Katha Kirtan',
    location: 'Sikh Kirtan Channel',
    imageUrl: '/gurudwaras/gurbani-kirtan.jpg',
    liveUrl: 'https://youtube.com/@chardiklagurbaanitv',
  },
  {
    id: 4,
    name: 'Amritvela Trust',
    location: 'Amritsar',
    imageUrl: '/gurudwaras/amritvela-trust.jpg',
    liveUrl: 'https://youtube.com/@amritvelatrustlive',
  },
  {
    id: 5,
    name: 'Gurdwara Sis Ganj Sahib',
    location: 'Chandni Chowk, Delhi',
    imageUrl: '/gurudwaras/sis-ganj-sahib.jpg',
    liveUrl: 'https://youtube.com/@gurdwarasisganjsahib8055',
  },
  {
    id: 6,
    name: 'Gurudwara Shaheed Ganj Baba Deep Singh Ji',
    location: 'Amritsar',
    imageUrl: '/gurudwaras/shaheed-ganj-baba-deep-singh.jpg',
    liveUrl: 'https://youtube.com/@shaheedganjbabadeepsinghji',
  },
  {
    id: 7,
    name: 'Guru Khalsa GTV',
    location: 'Sikh Religious Channel',
    imageUrl: '/gurudwaras/guru-khalsa-gtv.jpg',
    liveUrl: 'https://youtube.com/@gurukhalsagtv',
  },
];
