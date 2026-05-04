import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { appTheme as theme } from "@/theme/appTheme";
import { registerStyles as styles } from "@/features/register/styles/register.styles";

interface AvatarImagePickerProps {
  avatarUri: string | null;
  setAvatarUri: (uri: string | null) => void;
}

export function AvatarImagePicker({ avatarUri, setAvatarUri }: AvatarImagePickerProps) {
  const onPickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission", "Enable gallery access to pick a photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setAvatarUri(result.assets[0].uri);
  };

  const onTakeAvatar = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission", "Enable camera access to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setAvatarUri(result.assets[0].uri);
  };

  const showAvatarOptions = () => {
    Alert.alert("Foto de Perfil", "Escolha uma opçao", [
      { text: "Galeria", onPress: onPickAvatar },
      { text: "Camera", onPress: onTakeAvatar },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  return (
    <View style={styles.avatarPickerSection}>
      <TouchableOpacity style={styles.avatarCircle} onPress={showAvatarOptions}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : (
          <Ionicons name="camera" size={32} color={theme.colors.primary} />
        )}
        <View style={styles.avatarAddBadge}>
          <Ionicons name="add" size={16} color={theme.colors.white} />
        </View>
      </TouchableOpacity>
      <Text style={styles.avatarLabel}>Toque para adicionar sua foto de perfil pessoal</Text>
    </View>
  );
}
