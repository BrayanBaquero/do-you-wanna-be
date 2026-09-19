import { ColorPalette } from '../types';

export interface PaletteInfo {
  id: ColorPalette;
  name: string;
  subtitle: string;
  emoji: string;
  heartSymbol: string;
  previewBg: string;
  previewBorder: string;
  previewColor: string;
  badgeText: string;
}

export const PALETTES: PaletteInfo[] = [
  {
    id: 'rose',
    name: 'Rosa Clásico Romántico',
    subtitle: 'El romance por excelencia',
    emoji: '🌹',
    heartSymbol: '❤️',
    previewBg: 'bg-rose-100',
    previewBorder: 'border-rose-400',
    previewColor: '#f43f5e',
    badgeText: 'Romance Cálido',
  },
  {
    id: 'lavender',
    name: 'Lavanda & Lila Soñador',
    subtitle: 'Mágico, poético y dulce',
    emoji: '💜',
    heartSymbol: '💜',
    previewBg: 'bg-purple-100',
    previewBorder: 'border-purple-400',
    previewColor: '#8b5cf6',
    badgeText: 'Toque Místico',
  },
  {
    id: 'sunset',
    name: 'Atardecer Cálido',
    subtitle: 'Tonos durazno, coral y ámbar',
    emoji: '🌅',
    heartSymbol: '🧡',
    previewBg: 'bg-amber-100',
    previewBorder: 'border-amber-400',
    previewColor: '#f97316',
    badgeText: 'Pasión Solar',
  },
  {
    id: 'mint',
    name: 'Esmeralda & Menta Enamorada',
    subtitle: 'Fresco, natural y sereno',
    emoji: '🌿',
    heartSymbol: '💚',
    previewBg: 'bg-emerald-100',
    previewBorder: 'border-emerald-400',
    previewColor: '#10b981',
    badgeText: 'Amor Puro',
  },
  {
    id: 'midnight',
    name: 'Noche Estrellada / Índigo',
    subtitle: 'Cielo nocturno y destellos',
    emoji: '🌌',
    heartSymbol: '💙',
    previewBg: 'bg-indigo-100',
    previewBorder: 'border-indigo-400',
    previewColor: '#6366f1',
    badgeText: 'Amor Eterno',
  },
];
