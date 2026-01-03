// 1. Define the specific Moods allowed in the app
// This matches the 'MOODS' array in your KidsCorner component
export type Mood = 'happy' | 'calm' | 'sad' | 'angry' | 'silly' | 'worried';

// 2. Define the Main Data Structure for the Child
export interface KidsData {
  // Array of collected stickers (e.g., ['🎈', '⭐'])
  stickers: string[];
  
  // Current streak count
  streak: number;
  
  // Array of worry strings locked away in the box
  worries: string[];
  
  // The last mood selected (Optional, as it might be undefined on first load)
  lastMood?: Mood;
}