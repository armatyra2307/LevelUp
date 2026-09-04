import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

import type { Note } from '../types';
import { createId } from '../utils/helpers';

const STORAGE_KEY = 'levelup.notes.v1';

const DEFAULT_NOTES: Note[] = [
  {
    id: createId(),
    title: 'Цели на неделю',
    body: 'Пробежка, чтение 20 стр, медитация...',
    updatedAt: new Date().toISOString(),
  },
  {
    id: createId(),
    title: 'Идеи для проекта',
    body: 'Добавить систему достижений и магазин...',
    updatedAt: new Date().toISOString(),
  },
];

type NotesContextValue = {
  notes: Note[];
  addNote: (title: string, body: string) => void;
  updateNote: (id: string, title: string, body: string) => void;
  deleteNote: (id: string) => void;
};

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>(DEFAULT_NOTES);
  const isLoaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setNotes(JSON.parse(stored));
        } catch {
          console.warn('Corrupted notes data in AsyncStorage, using defaults');
        }
      }
      isLoaded.current = true;
    });
  }, []);

  useEffect(() => {
    if (isLoaded.current) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes]);

  const addNote = (title: string, body: string) => {
    setNotes((previous) => [
      {
        id: createId(),
        title,
        body,
        updatedAt: new Date().toISOString(),
      },
      ...previous,
    ]);
  };

  const updateNote = (id: string, title: string, body: string) => {
    setNotes((previous) =>
      previous.map((note) =>
        note.id === id
          ? { ...note, title, body, updatedAt: new Date().toISOString() }
          : note,
      ),
    );
  };

  const deleteNote = (id: string) => {
    setNotes((previous) => previous.filter((note) => note.id !== id));
  };

  return (
    <NotesContext.Provider value={{ notes, addNote, updateNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes(): NotesContextValue {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
