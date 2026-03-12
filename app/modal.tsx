import { useAuthContext } from "@/hooks/auth-context";
import { supabase } from "@/lib/supabase";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useHeaderHeight } from "@react-navigation/elements";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNotes } from "../context/NoteContext";

export default function CreateNoteModal() {
  const router = useRouter();
  const { addNote } = useNotes();
  const headerHeight = useHeaderHeight();
  const { session } = useAuthContext();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      const data = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      if (data) {
        setImageUri(data.uri);
        setShowCamera(false);
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert("Error: Empty fields, Title and body cannot be empty.");
      return;
    }

    setIsSaving(true);
    let uploadedImageUrl: string | null = null;

    if (imageUri) {
      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();

        const maxSize = 15 * 1024 * 1024;
        if (blob.size > maxSize) {
          Alert.alert("Error: Invalid size, Use files up to 15MB.");
          setIsSaving(false);
          return;
        }

        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];
        if (!allowedTypes.includes(blob.type)) {
          Alert.alert("Error: Invalid format, Use JPG, PNG or WebP.");
          setIsSaving(false);
          return;
        }

        const extension = imageUri.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `${Date.now()}.${extension}`;

        const formData = new FormData();
        formData.append("file", {
          uri: imageUri,
          name: fileName,
          type: `image/${extension === "jpg" ? "jpeg" : extension}`,
        } as any);

        const { data, error: uploadError } = await supabase.storage
          .from("note_images")
          .upload(fileName, formData);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("note_images").getPublicUrl(fileName);

        uploadedImageUrl = publicUrl;
      } catch (error: any) {
        Alert.alert("Upload Failed", error.message);
        setIsSaving(false);
        return;
      }
    }

    await addNote(session!.user.id, title, body, uploadedImageUrl);
    setIsSaving(false);
    router.back();
  };

  if (showCamera) {
    if (!permission?.granted) {
      return (
        <View style={styles.center}>
          <Text>Camera access is needed</Text>
          <Button title="Grant Permission" onPress={requestPermission} />
          <Button title="Cancel" onPress={() => setShowCamera(false)} />
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <CameraView style={{ flex: 1 }} ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            <TouchableOpacity style={styles.captureBtn} onPress={takePicture} />
            <TouchableOpacity onPress={() => setShowCamera(false)}>
              <Text style={{ color: "white", marginTop: 20 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
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
            multiline
            style={styles.bodyInput}
          />

          {imageUri && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <Button
                title="Remove"
                color="red"
                onPress={() => setImageUri(null)}
              />
            </View>
          )}
        </ScrollView>

        <View style={styles.toolbar}>
          <TouchableOpacity onPress={() => setShowCamera(true)}>
            <FontAwesome name="camera" size={28} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage}>
            <FontAwesome name="image" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={{ padding: 20 }}>
          {isSaving ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <Button
              title={isSaving ? "Saving..." : "Save Note"}
              onPress={handleSave}
              disabled={isSaving}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  titleInput: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  bodyInput: { fontSize: 18, minHeight: 100 },
  imagePreviewContainer: { marginTop: 20, alignItems: "center" },
  imagePreview: {
    width: "100%",
    height: 250,
    borderRadius: 8,
    resizeMode: "cover",
  },
  toolbar: {
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#ccc",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 50,
  },
  captureBtn: {
    width: 70,
    height: 70,
    backgroundColor: "white",
    borderRadius: 35,
    borderWidth: 5,
    borderColor: "#ccc",
  },
});
