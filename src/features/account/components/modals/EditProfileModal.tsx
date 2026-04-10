import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, StyleSheet, Image, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { appTheme as theme } from '@/theme/appTheme';
import { PROFILE_BIO_MAX } from '@/features/account/utils/accountUtils';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  // Fields
  draftDisplayName: string;
  setDraftDisplayName: (text: string) => void;
  draftFarmName: string;
  setDraftFarmName: (text: string) => void;
  draftProducerRole: string;
  setDraftProducerRole: (text: string) => void;
  draftFarmAddress: string;
  setDraftFarmAddress: (text: string) => void;
  draftFarmCep: string;
  onDraftCepChange: (text: string) => void;
  draftProfileBio: string;
  setDraftProfileBio: (text: string) => void;
  
  // Interactions
  isCepResolving: boolean;
  resolveCepAndOpenPin: (cep: string) => void;
  
  // Photos
  profilePhotoUri: string | null;
  onPickProfilePhoto: () => void;
  onTakeProfilePhoto: () => void;
  farmPhotos: string[];
  onPickFarmPhoto: () => void;
  onTakeFarmPhoto: () => void;
  setPreviewPhoto: (uri: string | null) => void;
  onRemovePhoto: (uri: string) => void;
  
  // Submission
  onSaveProfile: () => void;

  // Preview Photo Modal State that was originally adjacent
  previewPhoto: string | null;
}

export function EditProfileModal({
  visible,
  onClose,
  draftDisplayName,
  setDraftDisplayName,
  draftFarmName,
  setDraftFarmName,
  draftProducerRole,
  setDraftProducerRole,
  draftFarmAddress,
  setDraftFarmAddress,
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
  previewPhoto,
}: EditProfileModalProps) {
  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.editModalBackdrop}>
          <View style={styles.editModalCard}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Editar perfil</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={22} color={theme.colors.gray_800} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.editLabel}>Meu nome</Text>
              <TextInput
                style={styles.photoInput}
                placeholder="Seu nome"
                placeholderTextColor={theme.colors.gray_500}
                value={draftDisplayName}
                onChangeText={setDraftDisplayName}
              />

              <Text style={styles.editLabel}>Nome da fazenda</Text>
              <TextInput
                style={styles.photoInput}
                placeholder="Nome da fazenda"
                placeholderTextColor={theme.colors.gray_500}
                value={draftFarmName}
                onChangeText={setDraftFarmName}
              />

              <Text style={styles.editLabel}>Função</Text>
              <TextInput
                style={styles.photoInput}
                placeholder="Ex: Agricultor Familiar"
                placeholderTextColor={theme.colors.gray_500}
                value={draftProducerRole}
                onChangeText={setDraftProducerRole}
              />

              <Text style={styles.editLabel}>Endereço da fazenda</Text>
              <TextInput
                style={styles.photoInput}
                placeholder="Ex: Rio Verde, GO - Bairro/Comunidade"
                placeholderTextColor={theme.colors.gray_500}
                value={draftFarmAddress}
                onChangeText={setDraftFarmAddress}
              />

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
                    <Text style={styles.validateCepButtonText}>Validar CEP e marcar porteira</Text>
                  </>
                )}
              </TouchableOpacity>
              <Text style={styles.cepHelperText}>
                Ao validar o CEP, um mapa abre para voce posicionar o pin exatamente na porteira.
              </Text>

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

              <Text style={styles.editLabel}>Foto de perfil</Text>
              <View style={styles.editAvatarRow}>
                <Image
                  source={
                    profilePhotoUri
                      ? { uri: profilePhotoUri }
                      : require("../../../../assets/perfil.png")
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
                    <Text style={styles.editActionSecondaryText}>Camera</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.editLabel}>Fotos da fazenda ({farmPhotos.length}/5)</Text>
              <TouchableOpacity style={styles.addPhotoGalleryButton} onPress={onPickFarmPhoto}>
                <Ionicons name="images-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.addPhotoGalleryButtonText}>Adicionar da galeria</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.addPhotoCameraButton} onPress={onTakeFarmPhoto}>
                <Ionicons name="camera-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.addPhotoCameraButtonText}>Adicionar da camera</Text>
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

              <TouchableOpacity
                style={styles.editDoneButton}
                onPress={onSaveProfile}
              >
                <Text style={styles.editDoneButtonText}>Concluir edição</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Embedded Preview Photo Modal */}
      <Modal visible={Boolean(previewPhoto)} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalClose} onPress={() => setPreviewPhoto(null)}>
            <Ionicons name="close" size={28} color={theme.colors.white} />
          </Pressable>
          {previewPhoto ? (
            <Image source={{ uri: previewPhoto }} style={styles.fullImage} resizeMode="contain" />
          ) : null}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  editModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.45)",
    justifyContent: "flex-end",
  },
  editModalCard: {
    maxHeight: "94%",
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  editModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  editModalTitle: {
    fontSize: 18,
    color: theme.colors.gray_800,
    fontWeight: "bold",
  },
  editLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 8,
    marginTop: 6,
  },
  editAvatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  editAvatarActionsCol: {
    flex: 1,
    gap: 8,
  },
  editAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  editActionPrimary: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  editActionPrimaryText: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "center",
    width: "100%",
  },
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
  editActionSecondaryText: {
    color: theme.colors.primary,
    fontWeight: "bold",
    fontSize: 13,
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
  profileBioInput: {
    minHeight: 86,
  },
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
  addPhotoGalleryButtonText: {
    color: theme.colors.primary,
    fontWeight: "bold",
    fontSize: 13,
  },
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
  addPhotoCameraButtonText: {
    color: theme.colors.primary,
    fontWeight: "bold",
    fontSize: 13,
  },
  editDoneButton: {
    marginTop: 12,
    backgroundColor: theme.colors.gray_800,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },
  editDoneButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalClose: {
    position: "absolute",
    top: 50,
    right: 18,
    zIndex: 2,
    padding: 6,
  },
  fullImage: { 
    width: "94%", 
    height: "82%" 
  },
  galleryRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 6,
  },
  photoBox: {
    position: "relative",
  },
  farmPhoto: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    padding: 4,
  },
});
