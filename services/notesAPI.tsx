import { Alert } from "react-native";
import { supabase } from "../lib/supabase";

export async function apiCreateNote(
  userId: string,
  title: string,
  text: string,
  imageUrl: string | null = null,
) {
  if (!title.trim() || !text.trim()) {
    Alert.alert("Enter both title and text.");
    return { data: null, error: new Error("Empty title or text") };
  }

  try {
    const { data, error } = await supabase
      .from("Note")
      .insert({
        userid: userId,
        title: title,
        text: text,
        picture_url: imageUrl,
      })
      .select()
      .single();
    return { data, error };
  } catch (error) {
    console.error("Error creating note:", error);
    return { data: null, error };
  }
}

export async function apiGetAllNotes() {
  try {
    const { data, error } = await supabase
      .from("Note")
      .select("*")
      .order("created_at", { ascending: false });
    return { data, error };
  } catch (error) {
    console.error("Error fetching notes:", error);
    return { data: null, error };
  }
}

export async function apiGetNoteById(id: string) {
  try {
    const { data, error } = await supabase
      .from("Note")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  } catch (error) {
    console.error("Error fetching note by ID:", error);
    return { data: null, error };
  }
}

export async function apiUpdateNote(id: string, title: string, text: string) {
  if (!title.trim() || !text.trim()) {
    Alert.alert("Enter both title and text.");
    return { data: null, error: new Error("Empty title or text") };
  }

  try {
    const { data, error } = await supabase
      .from("Note")
      .update({ title: title, text: text })
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    console.error("Error updating note:", error);
    return { data: null, error };
  }
}

export async function apiDeleteNote(id: string) {
  try {
    const { data, error } = await supabase.from("Note").delete().eq("id", id);
    return { data, error };
  } catch (error) {
    console.error("Error deleting note:", error);
    return { error };
  }
}
