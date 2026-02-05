 // Sound Library - Admin-friendly array of frequency objects
 // Simply add new entries to expand the library
 
 export interface FrequencyItem {
   freq: string;
   value: number; // Hz value for audio synthesis
   name: string;
   purpose: string;
   category: FrequencyCategory;
 }
 
 export type FrequencyCategory =
   | 'refresh'
   | 'healing'
   | 'focus'
   | 'stress'
   | 'meditation'
   | 'sleep';
 
 export interface CategoryInfo {
   id: FrequencyCategory;
   name: string;
   description: string;
   icon: string;
   color: string; // Neon color for the category
 }
 
 export const categories: CategoryInfo[] = [
   {
     id: 'refresh',
     name: 'Refresh & Energy',
     description: 'Feel fresh, alert, and mentally clear',
     icon: '⚡',
     color: 'cyan',
   },
   {
     id: 'healing',
     name: 'Healing & Recovery',
     description: 'Emotional, mental, and energetic healing',
     icon: '💫',
     color: 'emerald',
   },
   {
     id: 'focus',
     name: 'Focus & Productivity',
     description: 'Concentration, learning, and mental sharpness',
     icon: '🎯',
     color: 'amber',
   },
   {
     id: 'stress',
     name: 'Stress Relief',
     description: 'Calm the nervous system and reduce anxiety',
     icon: '🌊',
     color: 'blue',
   },
   {
     id: 'meditation',
     name: 'Deep Meditation',
     description: 'Advanced meditation and spiritual growth',
     icon: '🕉️',
     color: 'violet',
   },
   {
     id: 'sleep',
     name: 'Sleep & Recovery',
     description: 'Better rest and physical recovery',
     icon: '🌙',
     color: 'indigo',
   },
 ];
 
 export const soundLibrary: FrequencyItem[] = [
   // Refresh & Energy Boost
   { freq: '174Hz', value: 174, name: 'Foundation', purpose: 'Mental refresh, grounding', category: 'refresh' },
   { freq: '285Hz', value: 285, name: 'Rejuvenation', purpose: 'Cellular rejuvenation', category: 'refresh' },
   { freq: '396Hz', value: 396, name: 'Liberation', purpose: 'Release fear and mental fatigue', category: 'refresh' },
   { freq: '417Hz', value: 417, name: 'Reset', purpose: 'Reset mind, remove negative patterns', category: 'refresh' },
   { freq: '432Hz', value: 432, name: 'Natural Balance', purpose: 'Calm clarity, natural balance', category: 'refresh' },
   { freq: '500Hz', value: 500, name: 'Uplift', purpose: 'Mood uplift and freshness', category: 'refresh' },
   { freq: '528Hz', value: 528, name: 'Positive Energy', purpose: 'Positive energy, inner balance', category: 'refresh' },
 
   // Healing & Recovery
   { freq: '174Hz', value: 174, name: 'Comfort', purpose: 'Physical comfort and grounding', category: 'healing' },
   { freq: '285Hz', value: 285, name: 'Regeneration', purpose: 'Tissue and energy regeneration', category: 'healing' },
   { freq: '396Hz', value: 396, name: 'Emotional Release', purpose: 'Emotional release', category: 'healing' },
   { freq: '417Hz', value: 417, name: 'Trauma Healing', purpose: 'Healing from past trauma', category: 'healing' },
   { freq: '528Hz', value: 528, name: 'Deep Healing', purpose: 'Deep healing and restoration', category: 'healing' },
   { freq: '639Hz', value: 639, name: 'Harmony', purpose: 'Emotional harmony', category: 'healing' },
   { freq: '741Hz', value: 741, name: 'Detox', purpose: 'Detox, clarity, inner cleansing', category: 'healing' },
 
   // Focus & Productivity
   { freq: '136.1Hz', value: 136.1, name: 'Earth OM', purpose: 'Grounded focus (Earth frequency)', category: 'focus' },
   { freq: '210Hz', value: 210, name: 'Alertness', purpose: 'Mental alertness', category: 'focus' },
   { freq: '432Hz', value: 432, name: 'Balanced Focus', purpose: 'Balanced focus without stress', category: 'focus' },
   { freq: '528Hz', value: 528, name: 'Clear Thinking', purpose: 'Clear thinking', category: 'focus' },
   { freq: '852Hz', value: 852, name: 'Awareness', purpose: 'Awareness and mental alignment', category: 'focus' },
 
   // Stress Relief
   { freq: '174Hz', value: 174, name: 'Safe Ground', purpose: 'Safe, grounding energy', category: 'stress' },
   { freq: '396Hz', value: 396, name: 'Release', purpose: 'Release stress and fear', category: 'stress' },
   { freq: '432Hz', value: 432, name: 'Deep Calm', purpose: 'Deep calm', category: 'stress' },
   { freq: '444Hz', value: 444, name: 'Stability', purpose: 'Emotional stability', category: 'stress' },
   { freq: '528Hz', value: 528, name: 'Peace', purpose: 'Peaceful balance', category: 'stress' },
   { freq: '639Hz', value: 639, name: 'Comfort', purpose: 'Emotional comfort', category: 'stress' },
 
   // Deep Meditation
   { freq: '108Hz', value: 108, name: 'Sacred', purpose: 'Traditional meditation tone', category: 'meditation' },
   { freq: '136.1Hz', value: 136.1, name: 'OM', purpose: 'OM / Earth frequency', category: 'meditation' },
   { freq: '432Hz', value: 432, name: 'Conscious', purpose: 'Conscious awareness', category: 'meditation' },
   { freq: '528Hz', value: 528, name: 'Heart Center', purpose: 'Heart-centered meditation', category: 'meditation' },
   { freq: '639Hz', value: 639, name: 'Connection', purpose: 'Connection and compassion', category: 'meditation' },
   { freq: '741Hz', value: 741, name: 'Purification', purpose: 'Inner purification', category: 'meditation' },
   { freq: '852Hz', value: 852, name: 'Awakening', purpose: 'Spiritual awakening', category: 'meditation' },
   { freq: '963Hz', value: 963, name: 'Higher Self', purpose: 'Higher consciousness', category: 'meditation' },
 
   // Sleep & Recovery
   { freq: '174Hz', value: 174, name: 'Body Relax', purpose: 'Body relaxation', category: 'sleep' },
   { freq: '285Hz', value: 285, name: 'Recovery', purpose: 'Physical recovery', category: 'sleep' },
   { freq: '396Hz', value: 396, name: 'Calm State', purpose: 'Calm emotional state', category: 'sleep' },
   { freq: '432Hz', value: 432, name: 'Slow Mind', purpose: 'Slow brain activity', category: 'sleep' },
   { freq: '528Hz', value: 528, name: 'Inner Peace', purpose: 'Gentle inner peace', category: 'sleep' },
   { freq: '639Hz', value: 639, name: 'Ease', purpose: 'Emotional ease', category: 'sleep' },
   { freq: '741Hz', value: 741, name: 'Quietness', purpose: 'Mental quietness', category: 'sleep' },
 ];
 
 export interface AtmosphereItem {
   id: string;
   name: string;
   icon: string;
 }
 
 export const atmospheres: AtmosphereItem[] = [
   { id: 'none', name: 'No Atmosphere', icon: '🔇' },
   { id: 'rain', name: 'Gentle Rain', icon: '🌧️' },
   { id: 'river', name: 'River Flow', icon: '🏞️' },
   { id: 'bells', name: 'Temple Bells', icon: '🔔' },
   { id: 'forest', name: 'Forest Ambience', icon: '🌲' },
   { id: 'chimes', name: 'Wind Chimes', icon: '🎐' },
 ];
 
 export const getFrequenciesByCategory = (category: FrequencyCategory): FrequencyItem[] => {
   return soundLibrary.filter((item) => item.category === category);
 };