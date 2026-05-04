import { useAuth } from "@/contexts/AuthContext";
import { PinModal } from "@/features/account/components/modals/PinModal";
import { useAccountLogic } from "@/features/account/hooks/useAccountLogic";
import { PROFILE_BIO_MAX } from "@/features/account/utils/accountUtils";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ActivityIndicator,
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
    draftPhone,
    setDraftPhone,
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

  const formatPhone = (text: string | null | undefined) => {
    if (typeof text !== "string") return "";
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)})${cleaned.slice(2)}`;
    return `(${cleaned.slice(0, 2)})${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.containerScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.formContent}>
          
          {/* 1. ─── Foto de Perfil (Igual ao Consumidor) ─── */}
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

          {/* 2. ─── Fotos da Fazenda (Novo Padrão) ─── */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Galeria da Fazenda ({farmPhotos.length}/5)</Text>
            <View style={styles.galleryActionsRow}>
              <TouchableOpacity style={styles.galleryMiniButton} onPress={onPickFarmPhoto}>
                <Ionicons name="images-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.galleryMiniButtonText}>Galeria</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.galleryMiniButton} onPress={onTakeFarmPhoto}>
                <Ionicons name="camera-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.galleryMiniButtonText}>Câmera</Text>
              </TouchableOpacity>
            </View>

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
              {farmPhotos.length === 0 && (
                <View style={styles.emptyGalleryBox}>
                  <Text style={styles.emptyGalleryText}>Nenhuma foto adicionada</Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* 3. ─── Nome Completo (ReadOnly) ─── */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Nome Completo</Text>
            <TextInput
              style={[styles.input, styles.inputReadOnly]}
              value={draftDisplayName}
              editable={false}
            />
            <Text style={styles.readOnlyHint}>
              🔒 O nome não pode ser editado após o cadastro.
            </Text>
          </View>

          {/* 4. ─── Dados do Produtor ─── */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Nome da fazenda</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome da fazenda"
              placeholderTextColor={theme.colors.gray_500}
              value={draftFarmName}
              onChangeText={setDraftFarmName}
            />
          </View>

          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Função</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Agricultor Familiar"
              placeholderTextColor={theme.colors.gray_500}
              value={draftProducerRole}
              onChangeText={setDraftProducerRole}
            />
          </View>

          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Telefone de Contato</Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              placeholderTextColor={theme.colors.gray_500}
              value={draftPhone}
              onChangeText={(text) => setDraftPhone(formatPhone(text))}
              keyboardType="phone-pad"
            />
          </View>

          {/* 5. ─── Localização Rural ─── */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>CEP Rural</Text>
            <TextInput
              style={styles.input}
              placeholder="00000-000"
              placeholderTextColor={theme.colors.gray_500}
              value={draftFarmCep}
              onChangeText={onDraftCepChange}
              keyboardType="number-pad"
              maxLength={9}
            />
          </View>

          <TouchableOpacity
            style={styles.validateCepButton}
            onPress={() => resolveCepAndOpenPin(draftFarmCep)}
            disabled={isCepResolving}
          >
            {isCepResolving ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <>
                <Ionicons name="pin-outline" size={18} color={theme.colors.white} />
                <Text style={styles.validateCepButtonText}>Definir localização no mapa</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Endereço da Fazenda</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Estrada Municipal, km 10"
              placeholderTextColor={theme.colors.gray_500}
              value={draftFarmAddress}
              onChangeText={setDraftFarmAddress}
            />
          </View>

          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Número / Lote / Referência</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Lote 5, Porteira azul"
              placeholderTextColor={theme.colors.gray_500}
              value={`${draftFarmAddressNumber}${draftFarmAddressReference ? ' - ' + draftFarmAddressReference : ''}`}
              onChangeText={(text) => {
                const parts = text.split(' - ');
                setDraftFarmAddressNumber(parts[0] || "");
                if (parts[1]) setDraftFarmAddressReference(parts[1]);
              }}
            />
          </View>

          {/* 6. ─── Bio ─── */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              style={styles.bioInput}
              placeholder="Conte sua história e o que você produz..."
              placeholderTextColor={theme.colors.gray_500}
              value={draftProfileBio}
              onChangeText={setDraftProfileBio}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={PROFILE_BIO_MAX}
            />
            <Text style={styles.charCounter}>{draftProfileBio.length}/{PROFILE_BIO_MAX}</Text>
          </View>

          {/* 7. ─── Botão de Endereço de Entrega (NOVO) ─── */}
          <TouchableOpacity 
            style={styles.deliveryAddressButton}
            onPress={() => router.push("/edit-address")}
          >
            <View style={styles.deliveryAddressIcon}>
              <Ionicons name="home-outline" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.deliveryAddressContent}>
              <Text style={styles.deliveryAddressTitle}>Endereço de entrega</Text>
              <Text style={styles.deliveryAddressSubtitle}>Gerenciar local para suas compras</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.gray_400} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveProducerButton} onPress={handleSave}>
            <Text style={styles.saveProducerButtonText}>Salvar alterações</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* Modals */}
      <Modal visible={!!previewPhoto} transparent={true} animationType="fade">
        <View style={styles.previewModalContainer}>
          <TouchableOpacity style={styles.closePreviewButton} onPress={() => setPreviewPhoto(null)}>
            <Ionicons name="close" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          {previewPhoto ? <Image source={{ uri: previewPhoto }} style={styles.fullScreenImage} resizeMode="contain" /> : null}
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

  /* Estilos herdados do Consumidor */
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
    borderWidth: 2,
    borderColor: theme.colors.white,
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
    minHeight: 80,
    textAlignVertical: "top",
  },
  charCounter: {
    fontSize: 12,
    color: theme.colors.gray_500,
    textAlign: "right",
    marginTop: 4,
  },

  /* Galeria (Estilo Consistente) */
  galleryActionsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  galleryMiniButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    paddingVertical: 10,
    gap: 8,
  },
  galleryMiniButtonText: { fontSize: 13, fontWeight: "600", color: theme.colors.gray_700 },
  galleryRow: { flexDirection: "row", gap: 12, paddingBottom: 10 },
  photoBox: { position: "relative" },
  farmPhoto: { width: 100, height: 100, borderRadius: 10 },
  emptyGalleryBox: { 
    width: "100%", 
    height: 100, 
    borderRadius: 10, 
    backgroundColor: theme.colors.gray_100, 
    justifyContent: "center", 
    alignItems: "center", 
    borderStyle: "dashed", 
    borderWidth: 1, 
    borderColor: theme.colors.gray_300 
  },
  emptyGalleryText: { fontSize: 12, color: theme.colors.gray_500 },
  removePhotoButton: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: theme.colors.red_500,
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },

  /* Localização */
  validateCepButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  validateCepButtonText: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: 14,
  },

  /* Delivery Address Button */
  deliveryAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
  },
  deliveryAddressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(107, 142, 35, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  deliveryAddressContent: { flex: 1 },
  deliveryAddressTitle: { fontSize: 14, fontWeight: "bold", color: theme.colors.gray_800 },
  deliveryAddressSubtitle: { fontSize: 12, color: theme.colors.gray_500, marginTop: 2 },

  /* Footer */
  saveProducerButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveProducerButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.white,
  },

  /* Preview */
  previewModalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" },
  closePreviewButton: { position: "absolute", top: 40, right: 20, zIndex: 10, padding: 10 },
  fullScreenImage: { width: "100%", height: "100%" },
});
