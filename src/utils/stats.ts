import type { StatKey } from '../types';

import Ionicons from '@expo/vector-icons/Ionicons';

export const STAT_LABELS: Record<StatKey, string> = {
  strength: 'Сила',
  intelligence: 'Интеллект',
  speed: 'Скорость',
};

export const STAT_ICONS: Record<StatKey, keyof typeof Ionicons.glyphMap> = {
  strength: 'fitness',
  intelligence: 'bulb',
  speed: 'speedometer',
};

export type Stat = {
  key: StatKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export const STATS: Stat[] = (Object.keys(STAT_LABELS) as StatKey[]).map(
  (key) => ({ key, label: STAT_LABELS[key], icon: STAT_ICONS[key] }),
);
