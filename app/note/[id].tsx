import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    Image,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import { useNotes } from "../../context/NoteContext";

export default function NoteContentsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { editNote, getNote, removeNote } = useNotes();
  const note = getNote(id as string);

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setText(note.text);
    }
  }, [note]);

  if (!note) return <ActivityIndicator style={{ marginTop: 50 }} />;

  const handleUpdate = async () => {
    if (!title.trim() || !text.trim()) {
      Alert.alert("Missing Info", "Title and text cannot be empty.");
      return;
    }

    setIsSaving(true);

    const { error } = await editNote(id as string, title, text);

    setIsSaving(false);

    if (error) {
      Alert.alert("Failed to update note.");
      return;
    }

    Alert.alert("Success, Note updated!");
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsSaving(true);

            const { error } = await removeNote(id as string);

            setIsSaving(false);

            if (error) {
              Alert.alert("Failed to delete note.");
            } else {
              Alert.alert("Note successfully deleted.");
              router.back();
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Edit Note" }} />

      {note.picture_url && (
        <Image source={{ uri: note.picture_url }} style={styles.noteImage} />
      )}

      <TextInput
        style={styles.title}
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        editable={!isSaving}
      />
      <TextInput
        style={styles.body}
        value={text}
        onChangeText={setText}
        multiline={true}
        editable={!isSaving}
        placeholder="Note body"
        textAlignVertical="top"
      />

      <Button
        title={isSaving ? "Saving..." : "Update Note"}
        onPress={handleUpdate}
        disabled={isSaving}
      />

      <View style={{ height: 10 }} />

      <Button
        title="Delete Note"
        onPress={handleDelete}
        color="red"
        disabled={isSaving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  noteImage: {
    width: "100%",
    height: 250,
    marginBottom: 20,
    resizeMode: "cover",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  body: {
    fontSize: 18,
  },
});
