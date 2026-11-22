import React from "react";
import { Image, Modal, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { profileStyles as styles } from "@/features/user-profile/styles/user-profile.styles";

export function ImagePreviewModal({ previewPhoto, onClose }) {
  return (
    <Modal visible={!!previewPhoto} transparent={true} animationType="fade">
      <View style={styles.previewModalContainer}>
        <TouchableOpacity style={styles.closePreviewButton} onPress={onClose}>
          <Ionicons name="close" size={32} color="#FFFFFF" />
        </TouchableOpacity>
        {previewPhoto ? (
          <Image
            source={{ uri: previewPhoto }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        ) : null}
      </View>
    </Modal>
  );
}
