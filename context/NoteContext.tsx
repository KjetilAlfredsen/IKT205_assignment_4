import {
  apiCreateNote,
  apiDeleteNote,
  apiGetAllNotes,
  apiUpdateNote,
} from "@/services/notesAPI";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Note {
  id: number;
  title: string;
  text: string;
  userid?: string;
  created_at?: string;
  picture_url?: string | null;
}

interface NotesContextInterface {
  notes: Note[];
  addNote: (
    userId: string,
    title: string,
    text: string,
    imageUrl: string | null,
  ) => Promise<{ error: any }>;
  getNote: (id: string) => Note | undefined;
  editNote: (
    id: string,
    title: string,
    text: string,
  ) => Promise<{ error: any }>;
  removeNote: (id: string) => Promise<{ error: any }>;
}

const NoteContext = createContext<NotesContextInterface | undefined>(undefined);

export function NoteProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);

  const refreshNotes = async () => {
    const { data, error } = await apiGetAllNotes();
    if (data) {
      setNotes(data);
    }
  };

  useEffect(() => {
    refreshNotes();
  }, []);

  const addNote = async (
    userId: string,
    title: string,
    text: string,
    imageUrl: string | null = null,
  ) => {
    const { error } = await apiCreateNote(userId, title, text, imageUrl);
    if (!error) {
      await refreshNotes();
    }
    return { error };
  };

  const editNote = async (id: string, title: string, text: string) => {
    const { error } = await apiUpdateNote(id, title, text);
    if (!error) {
      await refreshNotes();
    }
    return { error };
  };

  const removeNote = async (id: string) => {
    const { error } = await apiDeleteNote(id);
    if (!error) {
      await refreshNotes();
    }
    return { error };
  };

  const getNote = (id: string) => {
    return notes.find((note) => String(note.id) === String(id));
  };

  return (
    <NoteContext.Provider
      value={{ notes, addNote, getNote, editNote, removeNote }}
    >
      {children}
    </NoteContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error("Note not found");
  }
  return context;
}
