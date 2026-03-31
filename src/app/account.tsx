import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  Alert,
  Modal,
  Pressable,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { AppHeader } from "../components/AppHeader";
import {
  addFarmPhoto,
  getFarmPhotos,
  getProfileAvatar,
  removeFarmPhoto,
  setProfileAvatar,
} from "../services/communityStore";

const theme = {
  colors: {
    primary: "#6B8E23",
    lightGreen: "#E8F5E9",
    white: "#FFFFFF",
    background: "#F5F5F5",
    gray_200: "#E5E7EB",
    gray_300: "#D1D5DB",
    gray_500: "#6B7280",
    gray_800: "#1F2937",
    orange_500: "#F9A825",
    red_500: "#EF4444",
  },
};

const IOS_VISUAL = {
  modalCloseTop: 58,
  logoutBottomSpacer: 120,
};

const ANDROID_VISUAL = {
  modalCloseTop: 32,
  logoutBottomSpacer: 100,
};

const CURRENT_PLATFORM_UI = Platform.OS === "ios" ? IOS_VISUAL : ANDROID_VISUAL;
const PROFILE_BIO_MAX = 220;

type MyAd = {
  id: string;
  icon: "leaf" | "basket";
  title: string;
  subtitle: string;
  details: string;
  photos: string[];
};

const parseAdSubtitle = (subtitle: string) => {
  const [quantity = "", price = ""] = subtitle.split("•").map((part) => part.trim());
  return { quantity, price };
};

export default function AccountScreen() {
  const profileName = "Pedro Paulo";
  const [displayName, setDisplayName] = useState("Pedro Paulo");
  const [farmName, setFarmName] = useState("Sítio Esperança");
  const [producerRole, setProducerRole] = useState("Agricultor Familiar");
  const [profileBio, setProfileBio] = useState(
    "Produtor de economia circular com foco em solo saudável e compostagem.",
  );

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditAdOpen, setIsEditAdOpen] = useState(false);
  const [draftDisplayName, setDraftDisplayName] = useState(displayName);
  const [draftFarmName, setDraftFarmName] = useState(farmName);
  const [draftProducerRole, setDraftProducerRole] = useState(producerRole);
  const [draftProfileBio, setDraftProfileBio] = useState(profileBio);

  const [farmPhotos, setFarmPhotos] = useState<string[]>(getFarmPhotos(profileName));
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(
    getProfileAvatar(profileName),
  );
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const [ads, setAds] = useState<MyAd[]>([
    {
      id: "a1",
      icon: "leaf",
      title: "Esterco Bovino Curtido",
      subtitle: "2 Toneladas • R$ 90,00/ton",
      details: "Material curtido, pronto para retirada imediata no sítio.",
      photos: [
        "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      id: "a2",
      icon: "basket",
      title: "Tomate Cereja Orgânico",
      subtitle: "Caixa 15kg • R$ 110,00",
      details: "Colheita do dia, ideal para feira e consumo direto.",
      photos: [
        "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  ]);

  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [editingAdType, setEditingAdType] = useState<"leaf" | "basket">("leaf");
  const [editingAdTitle, setEditingAdTitle] = useState("");
  const [editingAdQuantity, setEditingAdQuantity] = useState("");
  const [editingAdPrice, setEditingAdPrice] = useState("");
  const [editingAdDetails, setEditingAdDetails] = useState("");
  const [editingAdPhotos, setEditingAdPhotos] = useState<string[]>([]);

  const openGalleryPicker = async (): Promise<string | null> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissao necessaria",
        "Ative a permissao da galeria para selecionar fotos.",
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) {
      return null;
    }

    return result.assets[0].uri;
  };

  const openCameraPicker = async (): Promise<string | null> => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissao necessaria", "Ative a permissao da camera para tirar fotos.");
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) {
      return null;
    }

    return result.assets[0].uri;
  };

  const onPickProfilePhoto = async () => {
    const uri = await openGalleryPicker();
    if (!uri) return;

    setProfileAvatar(profileName, uri);
    setProfilePhotoUri(uri);
  };

  const onTakeProfilePhoto = async () => {
    const uri = await openCameraPicker();
    if (!uri) return;

    setProfileAvatar(profileName, uri);
    setProfilePhotoUri(uri);
  };

  const onPickFarmPhoto = async () => {
    const uri = await openGalleryPicker();
    if (!uri) return;

    const result = addFarmPhoto(profileName, uri);
    if (!result.ok) {
      Alert.alert(
        "Limite atingido",
        "Você pode adicionar no máximo 5 fotos por perfil.",
      );
      return;
    }

    setFarmPhotos(getFarmPhotos(profileName));
  };

  const onTakeFarmPhoto = async () => {
    const uri = await openCameraPicker();
    if (!uri) return;

    const result = addFarmPhoto(profileName, uri);
    if (!result.ok) {
      Alert.alert(
        "Limite atingido",
        "Você pode adicionar no máximo 5 fotos por perfil.",
      );
      return;
    }

    setFarmPhotos(getFarmPhotos(profileName));
  };

  const onRemovePhoto = (uri: string) => {
    removeFarmPhoto(profileName, uri);
    setFarmPhotos(getFarmPhotos(profileName));
  };

  const openEditProfile = () => {
    setDraftDisplayName(displayName);
    setDraftFarmName(farmName);
    setDraftProducerRole(producerRole);
    setDraftProfileBio(profileBio);
    setIsEditProfileOpen(true);
  };

  const closeEditProfile = () => {
    setIsEditProfileOpen(false);
  };

  const onSaveProfile = () => {
    const nextName = draftDisplayName.trim();
    const nextFarm = draftFarmName.trim();
    const nextRole = draftProducerRole.trim();
    const nextBio = draftProfileBio.trim();

    if (!nextName || !nextFarm || !nextRole || !nextBio) {
      Alert.alert("Campos obrigatórios", "Preencha nome, fazenda, função e descrição.");
      return;
    }

    if (nextBio.length > PROFILE_BIO_MAX) {
      Alert.alert("Bio muito longa", `Use no máximo ${PROFILE_BIO_MAX} caracteres.`);
      return;
    }

    setDisplayName(nextName);
    setFarmName(nextFarm);
    setProducerRole(nextRole);
    setProfileBio(nextBio);
    closeEditProfile();
  };

  const openAdEditor = (ad: MyAd) => {
    const parsed = parseAdSubtitle(ad.subtitle);

    setEditingAdId(ad.id);
    setEditingAdType(ad.icon);
    setEditingAdTitle(ad.title);
    setEditingAdQuantity(parsed.quantity);
    setEditingAdPrice(parsed.price);
    setEditingAdDetails(ad.details || "");
    setEditingAdPhotos(ad.photos || []);
    setIsEditAdOpen(true);
  };

  const closeAdEditor = () => {
    setIsEditAdOpen(false);
    setEditingAdId(null);
    setEditingAdType("leaf");
    setEditingAdTitle("");
    setEditingAdQuantity("");
    setEditingAdPrice("");
    setEditingAdDetails("");
    setEditingAdPhotos([]);
  };

  const onSaveAd = () => {
    const title = editingAdTitle.trim();
    const quantity = editingAdQuantity.trim();
    const price = editingAdPrice.trim();
    const details = editingAdDetails.trim();

    if (!editingAdId || !title || !quantity || !price || !details) {
      Alert.alert("Campos obrigatórios", "Preencha título, quantidade, preço e descrição.");
      return;
    }

    setAds((prev) =>
      prev.map((item) =>
        item.id === editingAdId
          ? {
              ...item,
              icon: editingAdType,
              title,
              subtitle: `${quantity} • ${price}`,
              details,
              photos: editingAdPhotos,
            }
          : item,
      ),
    );

    closeAdEditor();
  };

  const onDeleteAd = () => {
    if (!editingAdId) return;

    Alert.alert(
      "Excluir anúncio",
      "Tem certeza que deseja excluir este anúncio?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            setAds((prev) => prev.filter((item) => item.id !== editingAdId));
            closeAdEditor();
          },
        },
      ],
    );
  };

  const onPickAdPhoto = async () => {
    const uri = await openGalleryPicker();
    if (!uri) return;

    if (editingAdPhotos.length >= 5) {
      Alert.alert("Limite atingido", "Você pode adicionar no máximo 5 fotos por anúncio.");
      return;
    }

    setEditingAdPhotos((prev) => [...prev, uri]);
  };

  const onTakeAdPhoto = async () => {
    const uri = await openCameraPicker();
    if (!uri) return;

    if (editingAdPhotos.length >= 5) {
      Alert.alert("Limite atingido", "Você pode adicionar no máximo 5 fotos por anúncio.");
      return;
    }

    setEditingAdPhotos((prev) => [...prev, uri]);
  };

  const onRemoveAdPhoto = (uri: string) => {
    setEditingAdPhotos((prev) => prev.filter((item) => item !== uri));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="Meu Perfil"
        onBackPress={() => router.replace("/home")}
        showBackButton={false}
        titleAlign="center"
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.gray_200}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarWrap}>
            <Image
              source={
                profilePhotoUri
                  ? { uri: profilePhotoUri }
                  : require("../assets/perfil.png")
              }
              style={styles.avatarLarge}
            />
            <TouchableOpacity
              style={styles.avatarEditButton}
              onPress={openEditProfile}
            >
              <Ionicons name="image-outline" size={16} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userRole}>{producerRole} • {farmName}</Text>
          <Text style={styles.userBio}>{profileBio}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.9</Text>
              <Text style={styles.statLabel}>
                <Ionicons name="star" size={12} color={theme.colors.orange_500} /> Avaliação
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{ads.length}</Text>
              <Text style={styles.statLabel}>Anúncios Ativos</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={openEditProfile}
          >
            <Ionicons name="create-outline" size={16} color={theme.colors.white} />
            <Text style={styles.editProfileButtonText}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.galleryHeaderRow}>
            <View style={styles.gallerySideSpacer} />
            <Text style={[styles.sectionTitle, styles.sectionTitleCentered]}>Fotos da Fazenda</Text>
            <Text style={styles.galleryCount}>{farmPhotos.length}/5</Text>
          </View>

          <Text style={styles.galleryHelperText}>
            Toque em editar perfil para adicionar ou remover fotos.
          </Text>

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
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.actionButtonsContainer}>
          <Text style={[styles.sectionTitle, styles.sectionTitleCentered]}>O que deseja anunciar?</Text>
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.primaryActionButton} onPress={() => router.push("/post")}>
              <Ionicons
                name="leaf"
                size={24}
                color={theme.colors.white}
                style={styles.actionIconSpacing}
              />
              <Text style={styles.actionButtonText}>Insumo/Resíduo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryActionButton, { backgroundColor: theme.colors.orange_500 }]}
              onPress={() => router.push("/post")}
            >
              <Ionicons
                name="basket"
                size={24}
                color={theme.colors.white}
                style={styles.actionIconSpacing}
              />
              <Text style={styles.actionButtonText}>Vender Produção</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.sectionTitleCentered]}>Meus Anúncios</Text>

          {ads.map((ad) => (
            <View key={ad.id} style={styles.myAdCard}>
              <View style={styles.myAdIcon}>
                <Ionicons name={ad.icon} size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.myAdContent}>
                <Text style={styles.myAdTitle}>{ad.title}</Text>
                <Text style={styles.myAdSubtitle}>{ad.subtitle}</Text>
                <Text style={styles.myAdDetails} numberOfLines={2}>{ad.details}</Text>
                {ad.photos.length > 0 ? (
                  <Image source={{ uri: ad.photos[0] }} style={styles.myAdThumb} />
                ) : null}
              </View>
              <TouchableOpacity onPress={() => openAdEditor(ad)}>
                <Ionicons name="pencil" size={20} color={theme.colors.gray_500} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Definições</Text>

          <TouchableOpacity style={styles.settingsRow}>
            <Ionicons
              name="document-text-outline"
              size={22}
              color={theme.colors.gray_800}
            />
            <Text style={styles.settingsText}>Meus Laudos de Solo</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.gray_500}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => router.push("/certificates")}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color={theme.colors.gray_800}
            />
            <Text style={styles.settingsText}>Certificados MAPA</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.gray_500}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => router.push("/transport")}
          >
            <Ionicons
              name="car-outline"
              size={22}
              color={theme.colors.gray_800}
            />
            <Text style={styles.settingsText}>Regras de Transporte e Frete</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.gray_500}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => router.push("/organic")}
          >
            <Ionicons
              name="leaf-outline"
              size={22}
              color={theme.colors.gray_800}
            />
            <Text style={styles.settingsText}>Seja Orgânico!</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.gray_500}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace("/")}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.red_500} />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

        <View style={styles.logoutSpacer} />
      </ScrollView>

      <Modal
        visible={isEditProfileOpen}
        transparent
        animationType="slide"
        onRequestClose={closeEditProfile}
      >
        <View style={styles.editModalBackdrop}>
          <View style={styles.editModalCard}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Editar perfil</Text>
              <TouchableOpacity onPress={closeEditProfile}>
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
                      : require("../assets/perfil.png")
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

      <Modal
        visible={isEditAdOpen}
        transparent
        animationType="fade"
        onRequestClose={closeAdEditor}
      >
        <View style={styles.editAdBackdrop}>
          <View style={styles.editAdCard}>
            <View style={styles.editAdHeader}>
              <Text style={styles.editAdTitle}>Editar anúncio</Text>
              <TouchableOpacity onPress={closeAdEditor}>
                <Ionicons name="close" size={20} color={theme.colors.gray_800} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.editAdBody}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.editAdBodyContent}
            >
              <Text style={styles.editAdLabel}>Tipo de anúncio</Text>
              <View style={styles.editAdTypeRow}>
                <TouchableOpacity
                  style={[
                    styles.editAdTypeButton,
                    editingAdType === "leaf" ? styles.editAdTypeButtonActive : null,
                  ]}
                  onPress={() => setEditingAdType("leaf")}
                >
                  <Ionicons
                    name="leaf"
                    size={18}
                    color={editingAdType === "leaf" ? theme.colors.white : theme.colors.gray_500}
                  />
                  <Text
                    style={[
                      styles.editAdTypeText,
                      editingAdType === "leaf" ? styles.editAdTypeTextActive : null,
                    ]}
                  >
                    Insumo / Resíduo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.editAdTypeButton,
                    editingAdType === "basket" ? styles.editAdTypeButtonActiveOrange : null,
                  ]}
                  onPress={() => setEditingAdType("basket")}
                >
                  <Ionicons
                    name="basket"
                    size={18}
                    color={editingAdType === "basket" ? theme.colors.white : theme.colors.gray_500}
                  />
                  <Text
                    style={[
                      styles.editAdTypeText,
                      editingAdType === "basket" ? styles.editAdTypeTextActive : null,
                    ]}
                  >
                    Produção Orgânica
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.editAdLabel}>Título do anúncio</Text>
              <TextInput
                style={styles.editAdInput}
                placeholder="Ex: Cama de frango, tomate orgânico..."
                placeholderTextColor={theme.colors.gray_500}
                value={editingAdTitle}
                onChangeText={setEditingAdTitle}
              />

              <View style={styles.editAdInlineRow}>
                <View style={styles.editAdInlineCol}>
                  <Text style={styles.editAdLabel}>Quantidade</Text>
                  <TextInput
                    style={styles.editAdInput}
                    placeholder="Ex: 2 toneladas"
                    placeholderTextColor={theme.colors.gray_500}
                    value={editingAdQuantity}
                    onChangeText={setEditingAdQuantity}
                  />
                </View>

                <View style={styles.editAdInlineCol}>
                  <Text style={styles.editAdLabel}>Preço</Text>
                  <TextInput
                    style={styles.editAdInput}
                    placeholder="Ex: R$ 90,00/ton"
                    placeholderTextColor={theme.colors.gray_500}
                    value={editingAdPrice}
                    onChangeText={setEditingAdPrice}
                  />
                </View>
              </View>

              <Text style={styles.editAdLabel}>Descrição e detalhes</Text>
              <TextInput
                style={[styles.editAdInput, styles.editAdInputTextArea]}
                placeholder="Ex: qualidade, condições de retirada, observações"
                placeholderTextColor={theme.colors.gray_500}
                value={editingAdDetails}
                onChangeText={setEditingAdDetails}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <View style={styles.editAdPhotosHeaderRow}>
                <Text style={styles.editAdLabel}>Fotos do anúncio</Text>
                <Text style={styles.editAdPhotosCount}>{editingAdPhotos.length}/5</Text>
              </View>
              <TouchableOpacity style={styles.addPhotoGalleryButton} onPress={onPickAdPhoto}>
                <Ionicons name="images-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.addPhotoGalleryButtonText}>Adicionar da galeria</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.addPhotoCameraButton} onPress={onTakeAdPhoto}>
                <Ionicons name="camera-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.addPhotoCameraButtonText}>Adicionar da camera</Text>
              </TouchableOpacity>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryRow}
              >
                {editingAdPhotos.map((uri) => (
                  <View key={uri} style={styles.photoBox}>
                    <TouchableOpacity onPress={() => setPreviewPhoto(uri)}>
                      <Image source={{ uri }} style={styles.farmPhoto} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.removePhotoButton} onPress={() => onRemoveAdPhoto(uri)}>
                      <Ionicons name="close" size={12} color={theme.colors.white} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity style={styles.editAdSaveMainButton} onPress={onSaveAd}>
                <Text style={styles.editAdSaveMainText}>Salvar alterações</Text>
                <Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.white} />
              </TouchableOpacity>

              <View style={styles.editAdActions}>
                <TouchableOpacity style={styles.editAdDeleteButton} onPress={onDeleteAd}>
                  <Text style={styles.editAdDeleteText}>Excluir</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editAdCancelButton} onPress={closeAdEditor}>
                  <Text style={styles.editAdCancelText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  profileSection: {
    backgroundColor: theme.colors.white,
    alignItems: "center",
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  avatarWrap: {
    position: "relative",
    marginBottom: 12,
  },
  avatarLarge: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  avatarEditButton: {
    position: "absolute",
    right: -2,
    bottom: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  userName: { fontSize: 22, fontWeight: "bold", color: theme.colors.gray_800 },
  userRole: { fontSize: 14, color: theme.colors.gray_500, marginTop: 4 },
  userBio: {
    fontSize: 12,
    color: theme.colors.gray_500,
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 22,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 16,
    backgroundColor: theme.colors.background,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  statItem: { alignItems: "center", paddingHorizontal: 16 },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  statLabel: { fontSize: 12, color: theme.colors.gray_500, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: theme.colors.gray_300 },

  editProfileButton: {
    marginTop: 14,
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  editProfileButtonText: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: "bold",
  },

  actionButtonsContainer: { padding: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 12,
  },
  sectionTitleCentered: {
    textAlign: "center",
    flex: 1,
  },
  section: { paddingHorizontal: 20, marginBottom: 24 },

  galleryHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gallerySideSpacer: {
    width: 34,
  },
  galleryCount: {
    fontSize: 12,
    color: theme.colors.gray_500,
    fontWeight: "bold",
  },
  galleryHelperText: {
    fontSize: 13,
    color: theme.colors.gray_500,
    marginBottom: 10,
  },
  galleryRow: { paddingRight: 10 },
  photoBox: { marginRight: 10, position: "relative" },
  farmPhoto: { width: 110, height: 90, borderRadius: 10 },
  removePhotoButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonsRow: { flexDirection: "row", justifyContent: "space-between" },
  primaryActionButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  actionIconSpacing: { marginBottom: 4 },

  myAdCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  myAdIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.lightGreen,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  myAdContent: { flex: 1 },
  myAdTitle: { fontSize: 15, fontWeight: "bold", color: theme.colors.gray_800 },
  myAdSubtitle: { fontSize: 13, color: theme.colors.gray_500, marginTop: 2 },
  myAdDetails: { fontSize: 12, color: theme.colors.gray_500, marginTop: 4 },
  myAdThumb: {
    width: 72,
    height: 56,
    borderRadius: 8,
    marginTop: 8,
  },

  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingsText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.gray_800,
    marginLeft: 12,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginTop: 10,
  },
  logoutText: {
    color: theme.colors.red_500,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  logoutSpacer: { height: CURRENT_PLATFORM_UI.logoutBottomSpacer },

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

  editAdBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.45)",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  editAdCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 16,
    maxHeight: "88%",
  },
  editAdBody: {
    maxHeight: "100%",
  },
  editAdBodyContent: {
    paddingBottom: 4,
  },
  editAdHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  editAdTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  editAdLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 8,
  },
  editAdPhotosHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editAdPhotosCount: {
    fontSize: 12,
    color: theme.colors.gray_500,
    fontWeight: "bold",
  },
  editAdTypeRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  editAdTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    borderRadius: 8,
    paddingVertical: 10,
  },
  editAdTypeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  editAdTypeButtonActiveOrange: {
    backgroundColor: theme.colors.orange_500,
    borderColor: theme.colors.orange_500,
  },
  editAdTypeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.colors.gray_500,
  },
  editAdTypeTextActive: {
    color: theme.colors.white,
  },
  editAdInlineRow: {
    flexDirection: "row",
    gap: 8,
  },
  editAdInlineCol: {
    flex: 1,
  },
  editAdInput: {
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.gray_800,
    marginBottom: 10,
    backgroundColor: theme.colors.white,
  },
  editAdInputTextArea: {
    minHeight: 90,
  },
  editAdSaveMainButton: {
    flexDirection: "row",
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 10,
    gap: 8,
    elevation: 2,
  },
  editAdSaveMainText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: "bold",
  },
  editAdActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  editAdDeleteButton: {
    borderWidth: 1,
    borderColor: theme.colors.red_500,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  editAdDeleteText: {
    color: theme.colors.red_500,
    fontWeight: "700",
  },
  editAdCancelButton: {
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  editAdCancelText: {
    color: theme.colors.gray_800,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalClose: {
    position: "absolute",
    top: CURRENT_PLATFORM_UI.modalCloseTop,
    right: 18,
    zIndex: 2,
    padding: 6,
  },
  fullImage: { width: "94%", height: "82%" },
});
