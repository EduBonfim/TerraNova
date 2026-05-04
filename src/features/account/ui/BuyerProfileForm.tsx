import { useAuth } from "@/contexts/AuthContext";
import { useAccountLogic } from "@/features/account/hooks/useAccountLogic";
import { maskEmail } from "@/services/authStore";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const genderOptions = [
  { label: "Masculino", value: "male" },
  { label: "Feminino", value: "female" },
  { label: "Outro", value: "other" },
  { label: "Preferir não informar", value: "prefer_not" },
] as const;

export function BuyerProfileForm() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  
  const {
    draftDisplayName,
    profilePhotoUri,
    draftProfileBio,
    setDraftProfileBio,
    draftPhone,
    setDraftPhone,
    draftGender,
    setDraftGender,
    onPickProfilePhoto,
    onTakeProfilePhoto,
    onSaveProfile,
  } = useAccountLogic();

  const handleSave = async () => {
    await onSaveProfile();
    await refreshUser();
    router.back();
  };

  const formatPhone = (text: string | null | undefined) => {
    if (typeof text !== "string") return "";
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)})${cleaned.slice(2)}`;
    return `(${cleaned.slice(0, 2)})${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  };

  const getGenderLabel = (value: string) => {
    return genderOptions.find((g) => g.value === value)?.label || "Selecionar";
  };

  const GenderPickerModal = () => (
    <Modal visible={showGenderPicker} transparent animationType="fade">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowGenderPicker(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Gênero</Text>
            <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
              <Ionicons name="close" size={24} color={theme.colors.gray_800} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={genderOptions}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  draftGender === item.value && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  setDraftGender(item.value);
                  setShowGenderPicker(false);
                }}
              >
                {draftGender === item.value && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={theme.colors.primary}
                    style={{ marginRight: 12 }}
                  />
                )}
                <Text
                  style={[
                    styles.modalOptionText,
                    draftGender === item.value && styles.modalOptionTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.value}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.containerScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.formContent}>
          
          {/* 1. ─── Foto de Perfil (Premium) ─── */}
          <Text style={styles.sectionTitle}>Identidade</Text>
          <View style={styles.avatarEditSection}>
            <Image
              source={
                profilePhotoUri
                  ? { uri: profilePhotoUri }
                  : require("../../../assets/perfil.png")
              }
              style={styles.largeAvatar}
            />
            <View style={styles.editAvatarButtonsRow}>
              <TouchableOpacity style={styles.editActionPrimary} onPress={onPickProfilePhoto}>
                <Ionicons name="images-outline" size={16} color={theme.colors.white} />
                <Text style={styles.editActionPrimaryText}>Galeria</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editActionSecondary} onPress={onTakeProfilePhoto}>
                <Ionicons name="camera-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.editActionSecondaryText}>Câmera</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. ─── Dados Gerais ─── */}
          <Text style={styles.sectionTitle}>Dados Gerais</Text>
          
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Nome Completo</Text>
            <TextInput
              style={[styles.input, styles.inputReadOnly]}
              value={draftDisplayName}
              editable={false}
              placeholder="Seu nome"
              placeholderTextColor={theme.colors.gray_500}
            />
            <Text style={styles.readOnlyHint}>
              🔒 O nome não pode ser editado após o cadastro.
            </Text>
          </View>

          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              style={[styles.bioInput]}
              placeholder="Defina sua bio agora"
              placeholderTextColor={theme.colors.gray_500}
              value={draftProfileBio}
              onChangeText={setDraftProfileBio}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              maxLength={160}
            />
            <Text style={styles.charCounter}>{draftProfileBio.length}/160</Text>
          </View>

          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Gênero</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowGenderPicker(true)}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  !draftGender && styles.selectButtonPlaceholder,
                ]}
              >
                {draftGender ? getGenderLabel(draftGender) : "Selecionar"}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.gray_500} />
            </TouchableOpacity>
          </View>

          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Celular</Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              placeholderTextColor={theme.colors.gray_500}
              value={draftPhone}
              onChangeText={(text) => setDraftPhone(formatPhone(text))}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputReadOnly]}
              value={maskEmail(user?.email)}
              editable={false}
            />
            <Text style={styles.readOnlyHint}>
              📧 O e-mail é usado para sua segurança e login.
            </Text>
          </View>

          {/* 3. ─── Verificação ─── */}
          <Text style={styles.sectionTitle}>Verificação</Text>
          <View style={styles.fieldSection}>
             <View style={styles.verifiedInfoRow}>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={theme.colors.primary} />
                  <Text style={styles.verifiedText}>Conta Verificada</Text>
                </View>
                <Text style={styles.readOnlyHint}>Dados verificados (CPF, Nascimento)</Text>
             </View>
          </View>

          {/* Salvar Alterações */}
          <TouchableOpacity style={styles.saveBuyerButton} onPress={handleSave}>
            <Text style={styles.saveBuyerButtonText}>Salvar alterações</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      <GenderPickerModal />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerScroll: { flex: 1, backgroundColor: theme.colors.background },
  formContent: { padding: 16 },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginTop: 20,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  avatarEditSection: {
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: theme.colors.white,
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray_100,
  },
  largeAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  editAvatarButtonsRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    width: "100%",
  },
  editActionPrimary: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  editActionPrimaryText: { color: theme.colors.white, fontWeight: "bold", fontSize: 13 },
  editActionSecondary: {
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  editActionSecondaryText: { color: theme.colors.primary, fontWeight: "bold", fontSize: 13 },

  fieldSection: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gray_600,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: theme.colors.gray_800,
    fontSize: 14,
  },
  inputReadOnly: {
    backgroundColor: theme.colors.gray_100,
    color: theme.colors.gray_500,
    borderColor: theme.colors.gray_200,
  },
  readOnlyHint: {
    fontSize: 11,
    color: theme.colors.gray_500,
    marginTop: 4,
  },
  bioInput: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: theme.colors.gray_800,
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: "top",
  },
  charCounter: {
    fontSize: 12,
    color: theme.colors.gray_500,
    textAlign: "right",
    marginTop: 4,
  },

  selectButton: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.gray_800,
  },
  selectButtonPlaceholder: {
    color: theme.colors.gray_500,
  },

  verifiedInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "rgba(107, 142, 35, 0.1)",
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.primary,
  },

  saveBuyerButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  saveBuyerButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.white,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.gray_800,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_100,
  },
  modalOptionSelected: {
    backgroundColor: "rgba(107, 142, 35, 0.05)",
  },
  modalOptionText: {
    fontSize: 14,
    color: theme.colors.gray_800,
  },
  modalOptionTextSelected: {
    fontWeight: "600",
    color: theme.colors.primary,
  },
});
