export type StatKey = 'strength' | 'intelligence' | 'speed';

export type CharacterStats = Record<StatKey, number>;

export type Character = {
  name: string;
  className: string;
  xp: number;
  avatar: string;
  stats: CharacterStats;
  statPoints: number;
};

export type Note = {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
};

export type Reminder = {
  id: string;
  label: string;
  time: string;
  done: boolean;
};
