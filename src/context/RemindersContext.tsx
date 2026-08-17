import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

import type { Reminder } from '../types';
import { createId } from '../utils/helpers';
import { XP_PER_REMINDER } from '../utils/xp';
import { useCharacter } from './CharacterContext';

const STORAGE_KEY = 'levelup.reminders.v1';

const DEFAULT_REMINDERS: Reminder[] = [
  { id: createId(), label: 'Тренировка', time: '08:00', done: false },
  { id: createId(), label: 'Выпить воду', time: '12:00', done: false },
  {
    id: createId(),
    label: 'Вечерняя медитация',
    time: '21:30',
    done: false,
  },
];

type RemindersContextValue = {
  reminders: Reminder[];
  toggleReminder: (id: string) => void;
  addReminder: (label: string, time: string) => void;
  deleteReminder: (id: string) => void;
};

const RemindersContext = createContext<RemindersContextValue | null>(null);

export function RemindersProvider({ children }: { children: React.ReactNode }) {
  const { addXp } = useCharacter();
  const [reminders, setReminders] = useState<Reminder[]>(DEFAULT_REMINDERS);
  const isLoaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        setReminders(JSON.parse(stored));
      }
      isLoaded.current = true;
    });
  }, []);

  useEffect(() => {
    if (isLoaded.current) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    }
  }, [reminders]);

  const toggleReminder = (id: string) => {
    setReminders((previous) => {
      const reminder = previous.find((item) => item.id === id);
      if (!reminder) return previous;

      const nextDone = !reminder.done;
      addXp(nextDone ? XP_PER_REMINDER : -XP_PER_REMINDER);

      return previous.map((item) =>
        item.id === id ? { ...item, done: nextDone } : item,
      );
    });
  };

  const addReminder = (label: string, time: string) => {
    setReminders((previous) => [
      { id: createId(), label, time, done: false },
      ...previous,
    ]);
  };

  const deleteReminder = (id: string) => {
    setReminders((previous) => previous.filter((item) => item.id !== id));
  };

  return (
    <RemindersContext.Provider
      value={{ reminders, toggleReminder, addReminder, deleteReminder }}
    >
      {children}
    </RemindersContext.Provider>
  );
}

export function useReminders(): RemindersContextValue {
  const context = useContext(RemindersContext);
  if (!context) {
    throw new Error('useReminders must be used within a RemindersProvider');
  }
  return context;
}
