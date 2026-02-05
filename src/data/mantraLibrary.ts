 export interface MantraSyllable {
   text: string;
   transliteration: string;
   pronunciation: string;
 }
 
 export interface Mantra {
   id: string;
   name: string;
   sanskrit: string;
   transliteration: string;
   meaning: string;
   purpose: string;
   whenToChant: string;
   mentalFocus: string;
   syllables: MantraSyllable[];
   difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mastery';
   recommendedReps: number[];
   durationMinutes: number;
   category: string;
   audioUrl?: string;
 }
 
 export const mantras: Mantra[] = [
   {
     id: 'om',
     name: 'Om (Pranava)',
     sanskrit: 'ॐ',
     transliteration: 'Oṃ',
     meaning: 'The primordial sound of the universe, representing the essence of ultimate reality.',
     purpose: 'To align with universal consciousness and calm the mind.',
     whenToChant: 'Anytime, especially at the beginning of meditation or prayer.',
     mentalFocus: 'Feel the vibration resonating through your entire being.',
     syllables: [
       { text: 'ॐ', transliteration: 'Oṃ', pronunciation: 'AUM (A-U-M merged)' }
     ],
     difficulty: 'beginner',
     recommendedReps: [3, 11, 21, 108],
     durationMinutes: 2,
     category: 'Foundation',
   },
   {
     id: 'gayatri',
     name: 'Gayatri Mantra',
     sanskrit: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्',
     transliteration: 'Oṃ Bhūr Bhuvaḥ Svaḥ Tat Savitur Vareṇyaṃ Bhargo Devasya Dhīmahi Dhiyo Yo Naḥ Prachodayāt',
     meaning: 'We meditate on the glory of the Creator who has created the Universe, who is worthy of worship, who is the embodiment of Knowledge and Light, and who removes all sins and ignorance. May He enlighten our intellect.',
     purpose: 'To illuminate the intellect and invoke divine wisdom.',
     whenToChant: 'Dawn and dusk (Sandhya times), or during sunrise meditation.',
     mentalFocus: 'Visualize golden sunlight filling your mind with clarity.',
     syllables: [
       { text: 'ॐ', transliteration: 'Oṃ', pronunciation: 'AUM' },
       { text: 'भूर्', transliteration: 'Bhūr', pronunciation: 'BHOOR' },
       { text: 'भुवः', transliteration: 'Bhuvaḥ', pronunciation: 'BHU-vah' },
       { text: 'स्वः', transliteration: 'Svaḥ', pronunciation: 'SVAH' },
       { text: 'तत्', transliteration: 'Tat', pronunciation: 'TAT' },
       { text: 'सवितुर्', transliteration: 'Savitur', pronunciation: 'sa-vi-TUR' },
       { text: 'वरेण्यं', transliteration: 'Vareṇyaṃ', pronunciation: 'va-REN-yam' },
       { text: 'भर्गो', transliteration: 'Bhargo', pronunciation: 'BHAR-go' },
       { text: 'देवस्य', transliteration: 'Devasya', pronunciation: 'de-VAS-ya' },
       { text: 'धीमहि', transliteration: 'Dhīmahi', pronunciation: 'dhee-MA-hi' },
       { text: 'धियो', transliteration: 'Dhiyo', pronunciation: 'DHI-yo' },
       { text: 'यो', transliteration: 'Yo', pronunciation: 'YO' },
       { text: 'नः', transliteration: 'Naḥ', pronunciation: 'NAH' },
       { text: 'प्रचोदयात्', transliteration: 'Prachodayāt', pronunciation: 'pra-cho-da-YAAT' },
     ],
     difficulty: 'intermediate',
     recommendedReps: [3, 11, 27, 108],
     durationMinutes: 10,
     category: 'Vedic',
   },
   {
     id: 'maha-mrityunjaya',
     name: 'Maha Mrityunjaya Mantra',
     sanskrit: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्',
     transliteration: 'Oṃ Tryambakaṃ Yajāmahe Sugandhiṃ Puṣṭi-Vardhanam Urvārukam-iva Bandhanān Mṛtyor-Mukṣīya Māmṛtāt',
     meaning: 'We worship the three-eyed Lord Shiva who nourishes and spreads fragrance in our lives. May He free us from the bondage of death, like a ripe cucumber from its vine, and grant us immortality.',
     purpose: 'For healing, protection, and overcoming fear of death.',
     whenToChant: 'During illness, challenges, or as daily protection.',
     mentalFocus: 'Visualize a protective light surrounding you.',
     syllables: [
       { text: 'ॐ', transliteration: 'Oṃ', pronunciation: 'AUM' },
       { text: 'त्र्यम्बकं', transliteration: 'Tryambakaṃ', pronunciation: 'tri-AM-ba-kam' },
       { text: 'यजामहे', transliteration: 'Yajāmahe', pronunciation: 'ya-JAA-ma-he' },
       { text: 'सुगन्धिं', transliteration: 'Sugandhiṃ', pronunciation: 'su-gan-DHIM' },
       { text: 'पुष्टि', transliteration: 'Puṣṭi', pronunciation: 'PUSH-ti' },
       { text: 'वर्धनम्', transliteration: 'Vardhanam', pronunciation: 'var-DHA-nam' },
       { text: 'उर्वारुकम्', transliteration: 'Urvārukam', pronunciation: 'ur-VAA-ru-kam' },
       { text: 'इव', transliteration: 'Iva', pronunciation: 'I-va' },
       { text: 'बन्धनान्', transliteration: 'Bandhanān', pronunciation: 'ban-dha-NAAN' },
       { text: 'मृत्योर्', transliteration: 'Mṛtyor', pronunciation: 'mrit-YOR' },
       { text: 'मुक्षीय', transliteration: 'Mukṣīya', pronunciation: 'muk-SHEE-ya' },
       { text: 'मा', transliteration: 'Mā', pronunciation: 'MAA' },
       { text: 'अमृतात्', transliteration: 'Amṛtāt', pronunciation: 'a-mri-TAAT' },
     ],
     difficulty: 'intermediate',
     recommendedReps: [3, 11, 27, 108],
     durationMinutes: 12,
     category: 'Healing',
   },
   {
     id: 'shanti',
     name: 'Shanti Mantra',
     sanskrit: 'ॐ शान्तिः शान्तिः शान्तिः',
     transliteration: 'Oṃ Śāntiḥ Śāntiḥ Śāntiḥ',
     meaning: 'Om Peace, Peace, Peace. The three repetitions represent peace in body, mind, and spirit.',
     purpose: 'To invoke peace and conclude prayers or meditation.',
     whenToChant: 'At the end of any practice or during stressful moments.',
     mentalFocus: 'Feel waves of peace spreading from your heart.',
     syllables: [
       { text: 'ॐ', transliteration: 'Oṃ', pronunciation: 'AUM' },
       { text: 'शान्तिः', transliteration: 'Śāntiḥ', pronunciation: 'SHAAN-tih' },
       { text: 'शान्तिः', transliteration: 'Śāntiḥ', pronunciation: 'SHAAN-tih' },
       { text: 'शान्तिः', transliteration: 'Śāntiḥ', pronunciation: 'SHAAN-tih' },
     ],
     difficulty: 'beginner',
     recommendedReps: [3, 7, 21],
     durationMinutes: 3,
     category: 'Peace',
   },
   {
     id: 'om-namah-shivaya',
     name: 'Om Namah Shivaya',
     sanskrit: 'ॐ नमः शिवाय',
     transliteration: 'Oṃ Namaḥ Śivāya',
     meaning: 'I bow to Lord Shiva, the auspicious one within myself and all of existence.',
     purpose: 'For inner transformation, destroying negativity, and self-realization.',
     whenToChant: 'Anytime, especially during meditation or challenges.',
     mentalFocus: 'Surrender ego and connect with your highest self.',
     syllables: [
       { text: 'ॐ', transliteration: 'Oṃ', pronunciation: 'AUM' },
       { text: 'नमः', transliteration: 'Namaḥ', pronunciation: 'na-MAH' },
       { text: 'शिवाय', transliteration: 'Śivāya', pronunciation: 'shi-VAA-ya' },
     ],
     difficulty: 'beginner',
     recommendedReps: [11, 27, 54, 108],
     durationMinutes: 5,
     category: 'Devotional',
   },
   {
     id: 'ganesh',
     name: 'Ganesh Mantra',
     sanskrit: 'ॐ गं गणपतये नमः',
     transliteration: 'Oṃ Gaṃ Gaṇapataye Namaḥ',
     meaning: 'Salutations to Lord Ganesha, the remover of obstacles.',
     purpose: 'To remove obstacles and ensure success in new beginnings.',
     whenToChant: 'Before starting any new venture, study, or journey.',
     mentalFocus: 'Visualize obstacles dissolving and paths opening.',
     syllables: [
       { text: 'ॐ', transliteration: 'Oṃ', pronunciation: 'AUM' },
       { text: 'गं', transliteration: 'Gaṃ', pronunciation: 'GAM' },
       { text: 'गणपतये', transliteration: 'Gaṇapataye', pronunciation: 'ga-na-pa-TA-ye' },
       { text: 'नमः', transliteration: 'Namaḥ', pronunciation: 'na-MAH' },
     ],
     difficulty: 'beginner',
     recommendedReps: [3, 11, 21, 108],
     durationMinutes: 4,
     category: 'Devotional',
   },
 ];
 
 export const getMantraById = (id: string): Mantra | undefined => {
   return mantras.find(m => m.id === id);
 };
 
 export const getMantrasByDifficulty = (difficulty: Mantra['difficulty']): Mantra[] => {
   return mantras.filter(m => m.difficulty === difficulty);
 };
 
 export const getMantrasByCategory = (category: string): Mantra[] => {
   return mantras.filter(m => m.category === category);
 };
 
 export const categories = [...new Set(mantras.map(m => m.category))];