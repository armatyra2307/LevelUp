import { useCharacter } from '../context/CharacterContext';
import { calculateLevel, xpCurrentToNext, xpIntoLevel } from './xp';

export function useCharacterXp() {
  const { character } = useCharacter();

  const level = calculateLevel(character.xp);
  const xpIntoLevelValue = xpIntoLevel(character.xp);
  const xpToNext = xpCurrentToNext(character.xp);
  const xpPercent = Math.round((xpIntoLevelValue / xpToNext) * 100);

  return { character, level, xpIntoLevelValue, xpToNext, xpPercent };
}
