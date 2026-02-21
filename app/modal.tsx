import { useAuthContext } from "@/hooks/auth-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNotes } from "../context/NoteContext";

export default function CreateNoteModal() {
  const router = useRouter();
  const { addNote } = useNotes();
  const headerHeight = useHeaderHeight();
  const { session } = useAuthContext();
  const scrollViewRef = useRef<ScrollView>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert("Error, title and text fields cannot be empty.");
      return;
    }

    if (!session?.user?.id) {
      Alert.alert("Error", "You must be logged in to save a note.");
      return;
    }

    setIsSaving(true);

    const { error } = await addNote(session.user.id, title, body);

    setIsSaving(false);

    if (error) {
      Alert.alert("Failed to save note");
      return;
    }

    Alert.alert("Note successfully created!");
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20 }}
          keyboardDismissMode="on-drag"
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          <TextInput
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            style={styles.titleInput}
          />
          <TextInput
            placeholder="Start typing..."
            value={body}
            onChangeText={setBody}
            multiline={true}
            textAlignVertical="top"
            style={styles.bodyInput}
            scrollEnabled={false}
          />
        </ScrollView>

        <View style={{ padding: 10, borderTopWidth: 1, borderColor: "#ccc" }}>
          <Button title="Save Note" onPress={handleSave} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleInput: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  bodyInput: {
    fontSize: 18,
    marginBottom: 20,
    minHeight: 100,
  },
});
