import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { PinModal } from "@/features/account/components/modals/PinModal";
import { useAccountLogic } from "@/features/account/hooks/useAccountLogic";
import { useAuth } from "@/contexts/AuthContext";
import { appTheme as theme } from "@/theme/appTheme";
import { PROFILE_BIO_MAX } from "@/features/account/utils/accountUtils";

export function ProducerProfileForm() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const {
    draftDisplayName,
    draftFarmName,
    setDraftFarmName,
    draftProducerRole,
    setDraftProducerRole,
    draftFarmAddress,
    setDraftFarmAddress,
    draftFarmAddressNumber,
    setDraftFarmAddressNumber,
    draftFarmAddressReference,
    setDraftFarmAddressReference,
    draftFarmCep,
    onDraftCepChange,
    draftProfileBio,
    setDraftProfileBio,
    isCepResolving,
    resolveCepAndOpenPin,
    profilePhotoUri,
    onPickProfilePhoto,
    onTakeProfilePhoto,
    farmPhotos,
    onPickFarmPhoto,
    onTakeFarmPhoto,
    setPreviewPhoto,
    onRemovePhoto,
    onSaveProfile,
    isPinModalOpen,
    onClosePinModal,
    draftGateCoords,
    onMapPressSetGate,
    onConfirmPin,
    previewPhoto,
  } = useAccountLogic();

  const handleSave = async () => {
    await onSaveProfile();
    await refreshUser();
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.containerScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.formContent}>
          {/* ─── Meu Nome ─── */}
          <Text style={styles.editLabel}>Nome Completo</Text>
          <TextInput
            style={[styles.photoInput, styles.inputReadOnly]}
            placeholder="Seu nome"
            placeholderTextColor={theme.colors.gray_500}
            value={draftDisplayName}
            editable={false}
          />
          <Text style={styles.readOnlyHint}>
            🔒 O nome não pode ser editado após o cadastro.
          </Text>

          {/* ─── Nome da fazenda ─── */}
          <Text style={styles.editLabel}>Nome da fazenda</Text>
          <TextInput
            style={styles.photoInput}
            placeholder="Nome da fazenda"
            placeholderTextColor={theme.colors.gray_500}
            value={draftFarmName}
            onChangeText={setDraftFarmName}
          />

          {/* ─── Função ─── */}
          <Text style={styles.editLabel}>Função</Text>
          <TextInput
            style={styles.photoInput}
            placeholder="Ex: Agricultor Familiar"
            placeholderTextColor={theme.colors.gray_500}
            value={draftProducerRole}
            onChangeText={setDraftProducerRole}
          />

          {/* ─── Endereço da fazenda ─── */}
          <Text style={styles.editLabel}>Endereço da fazenda</Text>
          <TextInput
            style={styles.photoInput}
            placeholder="Ex: Rio Verde, GO - Bairro/Comunidade"
            placeholderTextColor={theme.colors.gray_500}
            value={draftFarmAddress}
            onChangeText={setDraftFarmAddress}
          />

          {/* ─── Número ─── */}
          <Text style={styles.editLabel}>Número</Text>
          <TextInput
            style={styles.photoInput}
            placeholder="Ex: 123 ou Lote 5"
            placeholderTextColor={theme.colors.gray_500}
            value={draftFarmAddressNumber}
            onChangeText={setDraftFarmAddressNumber}
            keyboardType="default"
          />

          {/* ─── Referência/Complemento ─── */}
          <Text style={styles.editLabel}>Referência/Complemento (opcional)</Text>
          <TextInput
            style={styles.photoInput}
            placeholder="Ex: Próximo ao rio, após o portão"
            placeholderTextColor={theme.colors.gray_500}
            value={draftFarmAddressReference}
            onChangeText={setDraftFarmAddressReference}
          />

          {/* ─── CEP da fazenda ─── */}
          <Text style={styles.editLabel}>CEP da fazenda</Text>
          <TextInput
            style={styles.photoInput}
            placeholder="00000-000"
            placeholderTextColor={theme.colors.gray_500}
            value={draftFarmCep}
            onChangeText={onDraftCepChange}
            keyboardType="number-pad"
            maxLength={9}
          />

          {/* ─── Botão de validação do CEP / pin ─── */}
          <TouchableOpacity
            style={styles.validateCepButton}
            onPress={() => resolveCepAndOpenPin(draftFarmCep)}
            disabled={isCepResolving}
          >
            {isCepResolving ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <>
                <Ionicons name="pin-outline" size={16} color={theme.colors.white} />
                <Text style={styles.validateCepButtonText}>
                  Validar CEP e marcar porteira
                </Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.cepHelperText}>
            Ao validar o CEP, um mapa abre para você posicionar o pin exatamente na porteira.
          </Text>

          {/* ─── Descrição do perfil ─── */}
          <Text style={styles.editLabel}>Descrição do perfil</Text>
          <TextInput
            style={[styles.photoInput, styles.profileBioInput]}
            placeholder="Conte um pouco sobre o seu trabalho"
            placeholderTextColor={theme.colors.gray_500}
            value={draftProfileBio}
            onChangeText={setDraftProfileBio}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={PROFILE_BIO_MAX}
          />
          <Text style={styles.profileBioCounter}>
            {draftProfileBio.length}/{PROFILE_BIO_MAX}
          </Text>

          {/* ─── Foto de perfil ─── */}
          <Text style={styles.editLabel}>Foto de perfil</Text>
          <View style={styles.editAvatarRow}>
            <Image
              source={
                profilePhotoUri
                  ? { uri: profilePhotoUri }
                  : require("../../../assets/perfil.png")
              }
              style={styles.editAvatar}
            />
            <View style={styles.editAvatarActionsCol}>
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

          {/* ─── Fotos da fazenda ─── */}
          <Text style={styles.editLabel}>Fotos da fazenda ({farmPhotos.length}/5)</Text>
          <TouchableOpacity style={styles.addPhotoGalleryButton} onPress={onPickFarmPhoto}>
            <Ionicons name="images-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.addPhotoGalleryButtonText}>Adicionar da galeria</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.addPhotoCameraButton} onPress={onTakeFarmPhoto}>
            <Ionicons name="camera-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.addPhotoCameraButtonText}>Adicionar da câmera</Text>
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryRow}
          >
            {farmPhotos.map((uri) => (
              <View key={uri} style={styles.photoBox}>
                <TouchableOpacity onPress={() => setPreviewPhoto(uri)}>
                  <Image source={{ uri }} style={styles.farmPhoto} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.removePhotoButton} onPress={() => onRemovePhoto(uri)}>
                  <Ionicons name="close" size={12} color={theme.colors.white} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.editDoneButton} onPress={handleSave}>
            <Text style={styles.editDoneButtonText}>Concluir edição</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* Modal Reintroduzido para preview da foto em tela cheia */}
      <Modal visible={!!previewPhoto} transparent={true} animationType="fade">
        <View style={styles.previewModalContainer}>
          <TouchableOpacity 
            style={styles.closePreviewButton}
            onPress={() => setPreviewPhoto(null)}
          >
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

      <PinModal
        visible={isPinModalOpen}
        onClose={onClosePinModal}
        draftGateCoords={draftGateCoords}
        onMapPressSetGate={onMapPressSetGate}
        onConfirmPin={onConfirmPin}
        isBuyer={false}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerScroll: { flex: 1, backgroundColor: theme.colors.background },
  formContent: { padding: 16 },

  editLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 8,
    marginTop: 12,
  },
  photoInput: {
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.gray_800,
    marginBottom: 10,
  },
  inputReadOnly: {
    backgroundColor: theme.colors.gray_200,
    color: theme.colors.gray_500,
  },
  readOnlyHint: {
    fontSize: 11,
    color: theme.colors.gray_500,
    marginTop: -6,
    marginBottom: 10,
  },
  profileBioInput: { minHeight: 86 },
  profileBioCounter: {
    textAlign: "right",
    color: theme.colors.gray_500,
    fontSize: 12,
    marginTop: -4,
    marginBottom: 8,
  },
  validateCepButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  validateCepButtonText: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: 13,
  },
  cepHelperText: {
    color: theme.colors.gray_500,
    fontSize: 12,
    marginBottom: 10,
  },
  editAvatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  editAvatar: { width: 72, height: 72, borderRadius: 36 },
  editAvatarActionsCol: { flex: 1, gap: 8 },
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
  addPhotoGalleryButton: {
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  addPhotoGalleryButtonText: { color: theme.colors.primary, fontWeight: "bold", fontSize: 13 },
  addPhotoCameraButton: {
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  addPhotoCameraButtonText: { color: theme.colors.primary, fontWeight: "bold", fontSize: 13 },
  galleryRow: { flexDirection: "row", gap: 12, paddingVertical: 6 },
  photoBox: { position: "relative" },
  farmPhoto: { width: 100, height: 100, borderRadius: 8 },
  removePhotoButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    padding: 4,
  },
  editDoneButton: {
    marginTop: 20,
    backgroundColor: theme.colors.gray_800,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  editDoneButtonText: { color: theme.colors.white, fontWeight: "bold", fontSize: 14 },

  previewModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closePreviewButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
});
