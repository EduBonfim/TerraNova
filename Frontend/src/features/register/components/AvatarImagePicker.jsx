import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { appTheme as theme } from "@/theme/appTheme";
import { registerStyles as styles } from "@/features/register/styles/register.styles";

export function AvatarImagePicker({ avatarUri, setAvatarUri }) {
  const onPickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissão necessária",
        "Habilite o acesso à galeria para escolher uma foto."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const onTakeAvatar = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissão necessária",
        "Habilite o acesso à câmera para tirar uma foto."
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const showAvatarOptions = () => {
    Alert.alert("Foto de Perfil", "Escolha uma opção", [
      { text: "Galeria", onPress: onPickAvatar },
      { text: "Câmera", onPress: onTakeAvatar },
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
      <Text style={styles.avatarLabel}>
        Toque para adicionar sua foto de perfil pessoal
      </Text>
    </View>
  );
}
