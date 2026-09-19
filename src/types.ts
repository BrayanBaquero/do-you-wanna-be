export type GameStage = 
  | 'intro'
  | 'hearts'
  | 'trivia'
  | 'photos'
  | 'chest'
  | 'proposal'
  | 'success';

export interface PhotoMemory {
  id: string;
  url: string;
  title: string;
  dateOrLocation?: string;
  note: string;
  isRevealed?: boolean;
  heartsCount?: number;
}

export type ColorPalette = 'rose' | 'lavender' | 'sunset' | 'midnight' | 'mint';

export interface GameSettings {
  proposerName: string;
  partnerName: string;
  questionType: 'novia' | 'novio' | 'pareja' | 'custom';
  customQuestion: string;
  customReason: string;
  photos: PhotoMemory[];
  palette: ColorPalette;
  customAudioUrl?: string;
  customAudioName?: string;
  customAudioVolume?: number;
  backgroundMusicEnabled?: boolean;
}

export interface CaughtHeart {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

export interface TriviaQuestion {
  question: string;
  options: {
    label: string;
    reaction: string;
  }[];
}
