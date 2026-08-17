import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

import type { Character, StatKey } from '../types';
import { DEFAULT_AVATAR_URI } from '../utils/constants';
import { calculateLevel } from '../utils/xp';

const STORAGE_KEY = 'levelup.character.v1';

const DEFAULT_CHARACTER: Character = {
  name: 'Иван',
  className: 'Воин',
  xp: 0,
  avatar: DEFAULT_AVATAR_URI,
  stats: {
    strength: 10,
    intelligence: 8,
    speed: 9,
  },
  statPoints: 3,
};

type CharacterContextValue = {
  character: Character;
  updateCharacter: (patch: Partial<Pick<Character, 'name' | 'avatar'>>) => void;
  addXp: (amount: number) => void;
  spendStatPoint: (key: StatKey) => void;
  resetCharacter: () => void;
};

const CharacterContext = createContext<CharacterContextValue | null>(null);

export function CharacterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [character, setCharacter] = useState<Character>(DEFAULT_CHARACTER);
  const isLoaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<Character>;
        setCharacter({ ...DEFAULT_CHARACTER, ...parsed });
      }
      isLoaded.current = true;
    });
  }, []);

  useEffect(() => {
    if (isLoaded.current) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(character));
    }
  }, [character]);

  const updateCharacter = (
    patch: Partial<Pick<Character, 'name' | 'avatar'>>,
  ) => {
    setCharacter((previous) => ({ ...previous, ...patch }));
  };

  const addXp = (amount: number) => {
    setCharacter((previous) => {
      const oldLevel = calculateLevel(previous.xp);
      const newXp = Math.max(0, previous.xp + amount);
      const newLevel = calculateLevel(newXp);
      const earnedPoints = newLevel > oldLevel ? (newLevel - oldLevel) * 2 : 0;

      return {
        ...previous,
        xp: newXp,
        statPoints: Math.max(0, previous.statPoints + earnedPoints),
      };
    });
  };

  const spendStatPoint = (key: StatKey) => {
    setCharacter((previous) => {
      if (previous.statPoints <= 0) return previous;
      return {
        ...previous,
        statPoints: previous.statPoints - 1,
        stats: {
          ...previous.stats,
          [key]: previous.stats[key] + 1,
        },
      };
    });
  };

  const resetCharacter = () => {
    setCharacter(DEFAULT_CHARACTER);
  };

  return (
    <CharacterContext.Provider
      value={{
        character,
        updateCharacter,
        addXp,
        spendStatPoint,
        resetCharacter,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter(): CharacterContextValue {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
}
