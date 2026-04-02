import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { AppHeader } from "../components/AppHeader";

// 🎨 TEMA OFICIAL TERRA NOVA
const theme = {
  colors: {
    primary: "#6B8E23",
    lightGreen: "#E8F5E9",
    white: "#FFFFFF",
    background: "#F9FAFB",
    gray_200: "#E5E7EB",
    gray_300: "#D1D5DB",
    gray_500: "#6B7280",
    gray_700: "#374151",
    gray_800: "#1F2937",
    orange_500: "#F59E0B",
    red_500: "#EF4444",
    green_600: "#16A34A",
  },
};

const IOS_VISUAL = {
  keyboardBehavior: "padding" as const,
};

const ANDROID_VISUAL = {
  keyboardBehavior: undefined,
};

const CURRENT_KEYBOARD_BEHAVIOR =
  Platform.OS === "ios" ? IOS_VISUAL.keyboardBehavior : ANDROID_VISUAL.keyboardBehavior;

// 📦 Subcategorias de Insumos e Colheita
const SUBCATEGORIES = {
  insumo: [
    "Adubos e Compostos",
    "Bioestimulantes",
    "Controle Biológico",
    "Sementes e Mudas",
    "Cobertura e Solo",
  ],
  colheita: [
    "Folhas e Hortaliças",
    "Frutas e Legumes",
    "Raízes e Tubérculos",
    "Frutas Orgânicas",
    "Ervas e Temperos",
  ],
};

type AdItem = {
  id: string;
  tipo: "insumo" | "colheita";
  subcategoria: string;
  titulo: string;
  descricao: string;
  quantidade: string;
  preco: string;
  isDoacao: boolean;
  status: "active" | "paused" | "closed";
  foto?: string;
};

export default function PostScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"create" | "myAds">("create");
  const [adStatusFilter, setAdStatusFilter] = useState<"all" | "active" | "paused" | "closed">("all");
  const [editingAdId, setEditingAdId] = useState<string | null>(null);

  // Estados do formulário
  const [tipo, setTipo] = useState<"insumo" | "colheita">("insumo");
  const [subcategoria, setSubcategoria] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [preco, setPreco] = useState("");
  const [isDoacao, setIsDoacao] = useState(false);
  const [myAds, setMyAds] = useState<AdItem[]>([]);
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const resetForm = () => {
    setTipo("insumo");
    setSubcategoria("");
    setTitulo("");
    setDescricao("");
    setQuantidade("");
    setPreco("");
    setIsDoacao(false);
    setFotoUri(null);
    setEditingAdId(null);
  };

  const pickImageFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão negada", "Você precisa permitir acesso à câmera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFotoUri(result.assets[0].uri);
      setShowPhotoModal(false);
    }
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão negada", "Você precisa permitir acesso à galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFotoUri(result.assets[0].uri);
      setShowPhotoModal(false);
    }
  };

  const removePhoto = () => {
    setFotoUri(null);
  };

  const getPriceDisplayText = (ad: AdItem): string => {
    if (ad.isDoacao) return "Doação/Troca";
    const unit = ad.tipo === "insumo" ? "kg" : "un";
    return `${ad.preco}/${unit}`;
  };

  const publicarAnuncio = () => {
    const nextTitle = titulo.trim();
    const nextDescription = descricao.trim();
    const nextQuantity = quantidade.trim();
    const nextPrice = preco.trim();

    if (!nextTitle || !nextDescription || !nextQuantity || (!isDoacao && !nextPrice) || !subcategoria) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha título, quantidade, descrição, categoria e preço (quando não for doação).",
      );
      return;
    }

    if (editingAdId) {
      setMyAds((prev) =>
        prev.map((item) =>
          item.id === editingAdId
            ? {
                ...item,
                tipo,
                subcategoria,
                titulo: nextTitle,
                descricao: nextDescription,
                quantidade: nextQuantity,
                preco: isDoacao ? "Doação/Troca" : nextPrice,
                isDoacao,
                status: "active",
                foto: fotoUri || item.foto,
              }
            : item,
        ),
      );
      Alert.alert("Sucesso", "Anúncio atualizado com sucesso.");
    } else {
      setMyAds((prev) => [
        {
          id: `ad-${Date.now()}`,
          tipo,
          subcategoria,
          titulo: nextTitle,
          descricao: nextDescription,
          quantidade: nextQuantity,
          preco: isDoacao ? "Doação/Troca" : nextPrice,
          isDoacao,
          status: "active",
          foto: fotoUri || undefined,
        },
        ...prev,
      ]);
      Alert.alert("Sucesso", "Anúncio publicado com sucesso no Terra Nova.");
    }

    resetForm();
    setActiveTab("myAds");
  };

  const onEditAd = (ad: AdItem) => {
    setEditingAdId(ad.id);
    setTipo(ad.tipo);
    setSubcategoria(ad.subcategoria);
    setTitulo(ad.titulo);
    setDescricao(ad.descricao);
    setQuantidade(ad.quantidade);
    setPreco(ad.isDoacao ? "" : ad.preco);
    setIsDoacao(ad.isDoacao);
    setFotoUri(ad.foto || null);
    setActiveTab("create");
  };

  const onDeleteAd = (id: string) => {
    Alert.alert("Excluir anúncio", "Deseja excluir este anúncio?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          setMyAds((prev) => prev.filter((item) => item.id !== id));
          if (editingAdId === id) {
            resetForm();
          }
        },
      },
    ]);
  };

  const onChangeAdStatus = (id: string, status: "active" | "paused" | "closed") => {
    setMyAds((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const filteredAds = myAds.filter((item) =>
    adStatusFilter === "all" ? true : item.status === adStatusFilter,
  );

  const getStatusLabel = (status: "active" | "paused" | "closed") => {
    if (status === "active") return "Ativo";
    if (status === "paused") return "Pausado";
    return "Encerrado";
  };

  const getStatusStyle = (status: "active" | "paused" | "closed") => {
    if (status === "active") return styles.badgeActive;
    if (status === "paused") return styles.badgePaused;
    return styles.badgeClosed;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Criar Anúncio"
        onBackPress={() => router.replace("/home")}
        backgroundColor={theme.colors.white}
        textColor={theme.colors.gray_800}
        borderColor={theme.colors.gray_200}
        titleAlign="center"
        rightAccessory={<View style={styles.headerRightSpacer} />}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={CURRENT_KEYBOARD_BEHAVIOR}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <View style={styles.viewTabRow}>
              <TouchableOpacity
                style={[styles.viewTabButton, activeTab === "create" && styles.viewTabButtonActive]}
                onPress={() => setActiveTab("create")}
              >
                <Text style={[styles.viewTabText, activeTab === "create" && styles.viewTabTextActive]}>Criar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewTabButton, activeTab === "myAds" && styles.viewTabButtonActive]}
                onPress={() => setActiveTab("myAds")}
              >
                <Text style={[styles.viewTabText, activeTab === "myAds" && styles.viewTabTextActive]}>Meus anúncios</Text>
              </TouchableOpacity>
            </View>

            {activeTab === "create" ? (
              <>
                {/* Foto do Produto */}
                <TouchableOpacity
                  style={styles.photoUploadArea}
                  onPress={() => setShowPhotoModal(true)}
                >
                  {fotoUri ? (
                    <>
                      <Image source={{ uri: fotoUri }} style={styles.photoPreview} />
                      <View style={styles.photoBadge}>
                        <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                      </View>
                      <TouchableOpacity
                        style={styles.photoRemoveButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          removePhoto();
                        }}
                      >
                        <Ionicons name="close-circle" size={26} color={theme.colors.red_500} />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Ionicons name="camera" size={40} color={theme.colors.gray_300} />
                      <Text style={styles.photoUploadText}>Adicionar Foto do Produto</Text>
                      <Text style={styles.photoUploadSubtext}>(Máximo 1 foto)</Text>
                    </>
                  )}
                </TouchableOpacity>

                <Text style={styles.label}>O que você quer anunciar?</Text>
                <View style={styles.typeSelectorRow}>
                  <TouchableOpacity
                    style={[styles.typeButton, tipo === "insumo" && styles.typeButtonActive]}
                    onPress={() => {
                      setTipo("insumo");
                      setSubcategoria("");
                    }}
                  >
                    <Ionicons
                      name="leaf"
                      size={20}
                      color={tipo === "insumo" ? theme.colors.white : theme.colors.gray_500}
                      style={styles.iconMarginRight}
                    />
                    <Text style={[styles.typeButtonText, tipo === "insumo" && styles.typeButtonTextActive]}>
                      Insumo / Resíduo
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.typeButton, tipo === "colheita" && styles.typeButtonActiveOrange]}
                    onPress={() => {
                      setTipo("colheita");
                      setSubcategoria("");
                    }}
                  >
                    <Ionicons
                      name="basket"
                      size={20}
                      color={tipo === "colheita" ? theme.colors.white : theme.colors.gray_500}
                      style={styles.iconMarginRight}
                    />
                    <Text style={[styles.typeButtonText, tipo === "colheita" && styles.typeButtonTextActive]}>
                      Produção Orgânica
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Categoria</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.subcategoryScroll}
                  >
                    {SUBCATEGORIES[tipo].map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.subcategoryButton,
                          subcategoria === cat && styles.subcategoryButtonActive,
                        ]}
                        onPress={() => setSubcategoria(cat)}
                      >
                        <Text
                          style={[
                            styles.subcategoryText,
                            subcategoria === cat && styles.subcategoryTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Título do Anúncio</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={tipo === "insumo" ? "Ex: Cama de Frango, Palhada..." : "Ex: Tomate Cereja, Alface..."}
                    placeholderTextColor="#6B7280"
                    value={titulo}
                    onChangeText={setTitulo}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Quantidade</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={tipo === "insumo" ? "Ex: 2 Ton, 15 kg" : "Ex: 10 unidades, 5 kg"}
                      placeholderTextColor="#6B7280"
                      value={quantidade}
                      onChangeText={setQuantidade}
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>
                      Preço ({tipo === "insumo" ? "R$/kg" : "R$/un"})
                    </Text>
                    <TextInput
                      style={[styles.input, isDoacao && styles.inputDisabled]}
                      placeholder="0,00"
                      placeholderTextColor="#6B7280"
                      keyboardType="numeric"
                      value={preco}
                      onChangeText={setPreco}
                      editable={!isDoacao}
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsDoacao(!isDoacao)}>
                  <View style={[styles.checkbox, isDoacao && styles.checkboxActive]}>
                    {isDoacao && <Ionicons name="checkmark" size={16} color={theme.colors.white} />}
                  </View>
                  <Text style={styles.checkboxLabel}>Disponibilizar para Doação ou Troca Solidária</Text>
                </TouchableOpacity>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Descrição e Detalhes</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Fale um pouco sobre a qualidade, como pode ser retirado, etc."
                    placeholderTextColor="#6B7280"
                    multiline
                    numberOfLines={4}
                    value={descricao}
                    onChangeText={setDescricao}
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity style={styles.publishButton} onPress={publicarAnuncio}>
                  <Text style={styles.publishButtonText}>
                    {editingAdId ? "Salvar alterações" : "Publicar no Terra Nova"}
                  </Text>
                  <Ionicons
                    name={editingAdId ? "checkmark-circle-outline" : "paper-plane-outline"}
                    size={20}
                    color={theme.colors.white}
                    style={styles.iconMarginLeft}
                  />
                </TouchableOpacity>

                {editingAdId ? (
                  <TouchableOpacity style={styles.cancelEditButton} onPress={resetForm}>
                    <Text style={styles.cancelEditButtonText}>Cancelar edição</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            ) : (
              <>
                <View style={styles.statusFilterRow}>
                  <TouchableOpacity
                    style={[styles.statusFilterButton, adStatusFilter === "all" && styles.statusFilterButtonActive]}
                    onPress={() => setAdStatusFilter("all")}
                  >
                    <Text style={[styles.statusFilterText, adStatusFilter === "all" && styles.statusFilterTextActive]}>
                      Todos
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.statusFilterButton, adStatusFilter === "active" && styles.statusFilterButtonActive]}
                    onPress={() => setAdStatusFilter("active")}
                  >
                    <Text style={[styles.statusFilterText, adStatusFilter === "active" && styles.statusFilterTextActive]}>
                      Ativos
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.statusFilterButton, adStatusFilter === "paused" && styles.statusFilterButtonActive]}
                    onPress={() => setAdStatusFilter("paused")}
                  >
                    <Text style={[styles.statusFilterText, adStatusFilter === "paused" && styles.statusFilterTextActive]}>
                      Pausados
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.statusFilterButton, adStatusFilter === "closed" && styles.statusFilterButtonActive]}
                    onPress={() => setAdStatusFilter("closed")}
                  >
                    <Text style={[styles.statusFilterText, adStatusFilter === "closed" && styles.statusFilterTextActive]}>
                      Encerrados
                    </Text>
                  </TouchableOpacity>
                </View>

                {filteredAds.length === 0 ? (
                  <View style={styles.emptyAdsCard}>
                    <Ionicons name="pricetags-outline" size={22} color={theme.colors.gray_500} />
                    <Text style={styles.emptyAdsTitle}>Você ainda não tem anúncios</Text>
                    <Text style={styles.emptyAdsText}>Nenhum anúncio para o filtro selecionado.</Text>
                  </View>
                ) : (
                  filteredAds.map((ad) => (
                    <View key={ad.id} style={styles.myAdCard}>
                      <View style={styles.myAdIcon}>
                        <Ionicons
                          name={ad.tipo === "insumo" ? "leaf" : "basket"}
                          size={20}
                          color={theme.colors.primary}
                        />
                      </View>
                      <View style={styles.myAdContent}>
                        <View style={styles.myAdTitleRow}>
                          <Text style={styles.myAdTitle}>{ad.titulo}</Text>
                          <View style={[styles.statusBadge, getStatusStyle(ad.status)]}>
                            <Text style={styles.statusBadgeText}>{getStatusLabel(ad.status)}</Text>
                          </View>
                        </View>
                        <Text style={styles.myAdCategory}>{ad.subcategoria}</Text>
                        <Text style={styles.myAdMeta}>{ad.quantidade} • {getPriceDisplayText(ad)}</Text>
                        <Text style={styles.myAdDesc} numberOfLines={2}>{ad.descricao}</Text>
                        <View style={styles.inlineActionRow}>
                          {ad.status === "active" ? (
                            <TouchableOpacity style={styles.inlineActionButton} onPress={() => onChangeAdStatus(ad.id, "paused")}>
                              <Text style={styles.inlineActionText}>Pausar</Text>
                            </TouchableOpacity>
                          ) : null}
                          {ad.status === "paused" ? (
                            <TouchableOpacity style={styles.inlineActionButton} onPress={() => onChangeAdStatus(ad.id, "active")}>
                              <Text style={styles.inlineActionText}>Reativar</Text>
                            </TouchableOpacity>
                          ) : null}
                          {ad.status !== "closed" ? (
                            <TouchableOpacity style={styles.inlineActionButton} onPress={() => onChangeAdStatus(ad.id, "closed")}>
                              <Text style={styles.inlineActionText}>Encerrar</Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      </View>
                      <View style={styles.myAdActions}>
                        <TouchableOpacity onPress={() => onEditAd(ad)}>
                          <Ionicons name="pencil" size={18} color={theme.colors.gray_500} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDeleteAd(ad.id)}>
                          <Ionicons name="trash-outline" size={18} color={theme.colors.gray_500} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Seleção de Foto */}
      <Modal
        visible={showPhotoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <View style={styles.photoModalContainer}>
          <View style={styles.photoModalContent}>
            <View style={styles.photoModalHeader}>
              <Text style={styles.photoModalTitle}>Adicionar Foto</Text>
              <TouchableOpacity onPress={() => setShowPhotoModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.gray_800} />
              </TouchableOpacity>
            </View>

            <View style={styles.photoModalOptions}>
              <TouchableOpacity style={styles.photoModalButton} onPress={pickImageFromCamera}>
                <View style={[styles.photoModalIcon, { backgroundColor: theme.colors.primary }]}>
                  <Ionicons name="camera" size={24} color={theme.colors.white} />
                </View>
                <View style={styles.photoModalButtonText}>
                  <Text style={styles.photoModalButtonTitle}>Câmera</Text>
                  <Text style={styles.photoModalButtonSubtitle}>Tirar uma foto agora</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.photoModalButton} onPress={pickImageFromGallery}>
                <View style={[styles.photoModalIcon, { backgroundColor: theme.colors.orange_500 }]}>
                  <Ionicons name="image" size={24} color={theme.colors.white} />
                </View>
                <View style={styles.photoModalButtonText}>
                  <Text style={styles.photoModalButtonTitle}>Galeria</Text>
                  <Text style={styles.photoModalButtonSubtitle}>Escolher da galeria</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// 💅 ESTILOS
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.white },
  headerRightSpacer: { width: 40 },
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },

  // Foto
  photoUploadArea: {
    height: 160,
    backgroundColor: theme.colors.lightGreen,
    margin: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  photoUploadText: {
    marginTop: 12,
    color: theme.colors.primary,
    fontWeight: "bold",
    fontSize: 16,
  },
  photoUploadSubtext: {
    marginTop: 4,
    color: theme.colors.gray_500,
    fontSize: 12,
  },
  photoPreview: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
  },
  photoBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 2,
  },
  photoRemoveButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
  },
  photoModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  photoModalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  photoModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  photoModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  photoModalOptions: {
    gap: 12,
  },
  photoModalButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
    borderRadius: 12,
    padding: 16,
  },
  photoModalIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  photoModalButtonText: {
    flex: 1,
  },
  photoModalButtonTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  photoModalButtonSubtitle: {
    fontSize: 14,
    color: theme.colors.gray_500,
    marginTop: 4,
  },

  // Subcategoria
  subcategoryScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  subcategoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    marginRight: 8,
    marginBottom: 4,
  },
  subcategoryButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  subcategoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.gray_700,
  },
  subcategoryTextActive: {
    color: theme.colors.white,
  },

  // Formulário
  formContainer: { paddingHorizontal: 20 },
  viewTabRow: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    padding: 4,
    marginBottom: 16,
  },
  viewTabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
  },
  viewTabButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  viewTabText: {
    color: theme.colors.gray_500,
    fontWeight: "700",
    fontSize: 13,
  },
  viewTabTextActive: {
    color: theme.colors.white,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 8,
  },

  // Seletor
  iconMarginRight: { marginRight: 8 },
  iconMarginLeft: { marginLeft: 8 },
  typeSelectorRow: { flexDirection: "row", marginBottom: 20 },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeButtonActiveOrange: {
    backgroundColor: theme.colors.orange_500,
    borderColor: theme.colors.orange_500,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_500,
  },
  typeButtonTextActive: { color: theme.colors.white },

  // Inputs
  inputGroup: { marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  input: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  inputDisabled: { backgroundColor: theme.colors.gray_200, color: "#374151" },
  textArea: { height: 100 },

  // Checkbox
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: theme.colors.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.gray_300,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: theme.colors.gray_800,
    flex: 1,
    fontWeight: "500",
  },

  // Botão
  publishButton: {
    flexDirection: "row",
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    elevation: 2,
  },
  publishButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelEditButton: {
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  cancelEditButtonText: {
    color: theme.colors.gray_500,
    fontWeight: "700",
  },
  emptyAdsCard: {
    marginTop: 8,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
    padding: 18,
    alignItems: "center",
  },
  emptyAdsTitle: {
    marginTop: 8,
    color: theme.colors.gray_800,
    fontWeight: "700",
  },
  emptyAdsText: {
    marginTop: 4,
    color: theme.colors.gray_500,
    fontSize: 13,
  },
  statusFilterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
    flexWrap: "wrap",
  },
  statusFilterButton: {
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: theme.colors.white,
  },
  statusFilterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  statusFilterText: {
    color: theme.colors.gray_500,
    fontSize: 12,
    fontWeight: "700",
  },
  statusFilterTextActive: {
    color: theme.colors.white,
  },
  myAdCard: {
    marginTop: 10,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  myAdIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  myAdContent: { flex: 1 },
  myAdTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  myAdTitle: { color: theme.colors.gray_800, fontWeight: "700", fontSize: 14 },
  myAdCategory: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusBadgeText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  badgeActive: { backgroundColor: theme.colors.green_600 },
  badgePaused: { backgroundColor: theme.colors.orange_500 },
  badgeClosed: { backgroundColor: theme.colors.red_500 },
  myAdMeta: { color: theme.colors.gray_500, marginTop: 2, fontSize: 12 },
  myAdDesc: { color: theme.colors.gray_500, marginTop: 4, fontSize: 12 },
  inlineActionRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
    flexWrap: "wrap",
  },
  inlineActionButton: {
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: theme.colors.white,
  },
  inlineActionText: {
    color: theme.colors.gray_800,
    fontSize: 11,
    fontWeight: "700",
  },
  myAdActions: {
    flexDirection: "row",
    gap: 12,
    marginLeft: 10,
  },
});
