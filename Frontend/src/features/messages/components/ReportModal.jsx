/**
 * Report Modal Component
 * Modal para denunciar um usuário
 */

import { useAuth } from "@/contexts/AuthContext";
import { addReport } from "@/services/reportsStore";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = [
  {
    value: "comportamento",
    label: "Comportamento",
    icon: "alert-circle-outline",
  },
  { value: "fraude", label: "Fraude", icon: "warning-outline" },
  {
    value: "conteudo_inapropriado",
    label: "Conteúdo Inapropriado",
    icon: "ban-outline",
  },
  { value: "outro", label: "Outro", icon: "help-circle-outline" },
];

export function ReportModal({ visible, onClose, reportedUserName }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("comportamento");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceImage, setEvidenceImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permissão necessária",
          "Ative a permissão da galeria para selecionar fotos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setEvidenceImage(result.assets[0].uri);
      }
    } catch (_error) {
      Alert.alert("Erro", "Não foi possível selecionar a imagem");
    }
  };

  const handleRemoveImage = () => {
    setEvidenceImage(null);
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert("Atenção", "Por favor, descreva o motivo da denúncia");
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        "Atenção",
        "Por favor, descreva o que aconteceu com mais detalhes"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await addReport({
        reporter: user?.username || "Anônimo",
        reportedUser: reportedUserName,
        category: selectedCategory,
        reason: reason.trim(),
        description: description.trim(),
        evidenceImageUri: evidenceImage || undefined,
      });

      Alert.alert(
        "Denúncia Enviada",
        "Obrigado por ajudar a manter nossa comunidade segura. Nossa equipe analisará sua denúncia em breve.",
        [
          {
            text: "OK",
            onPress: () => {
              resetForm();
              onClose();
            },
          },
        ]
      );
    } catch (_error) {
      Alert.alert(
        "Erro",
        "Não foi possível enviar a denúncia. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCategory("comportamento");
    setReason("");
    setDescription("");
    setEvidenceImage(null);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.container, { marginTop: Math.max(insets.top, 20) }]}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Ionicons name="close" size={24} color={theme.colors.gray_900} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Denunciar Usuário</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.reportedBar}>
            <Ionicons
              name="person-circle-outline"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.reportedText}>
              Denunciando:{" "}
              <Text style={styles.reportedName}>{reportedUserName}</Text>
            </Text>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Categoria */}
            <View style={styles.section}>
              <Text style={styles.label}>Categoria da Denúncia</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryButton,
                      selectedCategory === cat.value &&
                        styles.categoryButtonSelected,
                    ]}
                    onPress={() => setSelectedCategory(cat.value)}
                    disabled={isSubmitting}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={20}
                      color={
                        selectedCategory === cat.value
                          ? theme.colors.primary
                          : theme.colors.gray_600
                      }
                    />
                    <Text
                      style={[
                        styles.categoryLabel,
                        selectedCategory === cat.value &&
                          styles.categoryLabelSelected,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Motivo */}
            <View style={styles.section}>
              <Text style={styles.label}>Motivo Principal</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Comportamento agressivo, Fraude, etc."
                placeholderTextColor={theme.colors.placeholder}
                value={reason}
                onChangeText={setReason}
                maxLength={50}
                editable={!isSubmitting}
              />
              <Text style={styles.counter}>{reason.length}/50</Text>
            </View>

            {/* Descrição Detalhada */}
            <View style={styles.section}>
              <Text style={styles.label}>Descreva o que aconteceu</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Forneça detalhes sobre o incidente..."
                placeholderTextColor={theme.colors.placeholder}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
                maxLength={500}
                textAlignVertical="top"
                editable={!isSubmitting}
              />
              <Text style={styles.counter}>{description.length}/500</Text>
            </View>

            {/* Imagem de Evidência */}
            <View style={styles.section}>
              <View style={styles.labelWithOptional}>
                <Text style={styles.label}>Evidência (Imagem)</Text>
                <Text style={styles.optional}>Opcional</Text>
              </View>

              {evidenceImage ? (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: evidenceImage }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={handleRemoveImage}
                    disabled={isSubmitting}
                  >
                    <Ionicons
                      name="close-circle"
                      size={28}
                      color={theme.colors.red_500}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handlePickImage}
                  disabled={isSubmitting}
                >
                  <Ionicons
                    name="cloud-upload-outline"
                    size={32}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.uploadText}>
                    Toque para adicionar uma imagem
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Info */}
            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle"
                size={18}
                color={theme.colors.primary}
              />
              <Text style={styles.infoText}>
                Sua denúncia será analisada por nossa equipe de moderação.
                Denúncias falsas podem resultar em ações contra sua conta.
              </Text>
            </View>
          </ScrollView>

          {/* Botões */}
          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={theme.colors.white} size="small" />
              ) : (
                <>
                  <Ionicons name="flag" size={18} color={theme.colors.white} />
                  <Text style={styles.submitButtonText}>Enviar Denúncia</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_100,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray_100,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.gray_900,
  },
  reportedBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${theme.colors.primary}10`,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  reportedText: {
    fontSize: 14,
    color: theme.colors.gray_700,
  },
  reportedName: {
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.gray_900,
    marginBottom: 10,
  },
  labelWithOptional: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  optional: {
    fontSize: 13,
    color: theme.colors.gray_500,
    fontStyle: "italic",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.gray_200,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: theme.colors.white,
  },
  categoryButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}08`,
  },
  categoryLabel: {
    fontSize: 13,
    color: theme.colors.gray_600,
    marginTop: 8,
    textAlign: "center",
    fontWeight: "500",
  },
  categoryLabelSelected: {
    color: theme.colors.primary,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1.5,
    borderColor: theme.colors.gray_200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.gray_900,
    backgroundColor: theme.colors.white,
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  counter: {
    fontSize: 12,
    color: theme.colors.gray_500,
    marginTop: 6,
    textAlign: "right",
    fontWeight: "500",
  },
  imagePreview: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: theme.colors.gray_100,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
  },
  image: {
    width: "100%",
    height: 200,
  },
  removeImageButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: "dashed",
    borderRadius: 16,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${theme.colors.primary}05`,
  },
  uploadText: {
    fontSize: 14,
    color: theme.colors.gray_600,
    marginTop: 10,
    fontWeight: "500",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "#FFE082",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#795548",
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray_100,
    backgroundColor: theme.colors.white,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    borderWidth: 1.5,
    borderColor: theme.colors.gray_300,
    backgroundColor: theme.colors.white,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.gray_700,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.white,
  },
});
