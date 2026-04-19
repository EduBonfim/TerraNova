import React from "react";
import { View, Modal, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { profileStyles as styles } from "../styles/user-profile.styles";

interface ImagePreviewModalProps {
  previewPhoto: string | null;
  onClose: () => void;
}

export function ImagePreviewModal({ previewPhoto, onClose }: ImagePreviewModalProps) {
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
