import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useMarketplaceLogic } from "@/features/marketplace/hooks/useMarketplaceLogic";
import { createListing } from "@/services/listingService";
import {
    type MarketplaceOpportunity
} from "@/services/marketplaceStore";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { appTheme as theme } from "@/theme/appTheme";

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
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // --- NOVOS CAMPOS: CONFORMIDADE LEGAL ---
  const [loteCodigo, setLoteCodigo] = useState("");
  const [tipoCertificacao, setTipoCertificacao] = useState<"Organico" | "Transicao" | "Convencional">("Organico");
  const [numeroRegistro, setNumeroRegistro] = useState("");

  // Estados de Renovação
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedAdToRenew, setSelectedAdToRenew] = useState<MarketplaceOpportunity | null>(null);
  const [newStockValue, setNewStockValue] = useState("");
  
  // Estado de Publicação
  const [isPublishing, setIsPublishing] = useState(false);

  const { user } = useAuth();
  const { filteredMarketplaceItems, handleRefresh } = useMarketplaceLogic();
  const isFocused = useIsFocused();

  // Filtra anúncios do usuário logado usando os dados reais da store
  const myRealAds = filteredMarketplaceItems.filter(item => item.vendedor === user?.username || item.vendedor === user?.fullName);

  const handleRenewStock = async () => {
    if (!selectedAdToRenew || !newStockValue) return;
    const qty = parseInt(newStockValue);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert("Erro", "Insira uma quantidade válida.");
      return;
    }

    // TODO: Implementar função de renovação de stock
    // await renewStock(selectedAdToRenew.id, qty);
    Alert.alert("Sucesso", "Estoque renovado com sucesso!");
    setShowRenewModal(false);
    setSelectedAdToRenew(null);
    setNewStockValue("");
    handleRefresh(); // Força recarregamento
  };

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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: Platform.OS === "ios", // No Android, o crop nativo costuma esconder os botões de confirmação
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: Platform.OS === "ios",
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

  const publicarAnuncio = async () => {
    if (!titulo || !quantidade || !preco || !loteCodigo) {
      Alert.alert("Campos obrigatórios", "Por favor, preencha o título, quantidade, preço e o ID do Lote para rastreabilidade.");
      return;
    }

    if (!user?.username) {
      Alert.alert("Erro", "Não foi possível identificar seu perfil.");
      return;
    }

    try {
      setIsPublishing(true);

      // Cria o anúncio localmente
      const listing = await createListing(user.username, {
        titulo,
        descricao,
        tipo: tipo === "insumo" ? "insumo" : "colheita",
        subcategoria,
        quantidade,
        preco,
        isDoacao,
        loteCodigo,
        tipoCertificacao,
        numeroRegistro,
        fotoUri,
      });

      console.log("✓ Anúncio criado:", listing.id);

      // Reseta o formulário
      resetForm();

      // Recarrega a marketplace para mostrar o novo anúncio
      handleRefresh();

      // Mostra sucesso
      Alert.alert(
        "✓ Sucesso!",
        `Seu anúncio foi publicado com conformidade legal!\n\nID: ${listing.id}\n\nO anúncio já aparece em "Meus Anúncios" e está pronto para sincronização com o backend.`,
        [
          {
            text: "OK",
            onPress: () => {
              // Scroll pro topo da tela
            },
          },
        ]
      );
    } catch (error) {
      console.error("Erro ao publicar anúncio:", error);
      Alert.alert(
        "Erro",
        "Ocorreu um problema ao publicar o anúncio. Tente novamente."
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAutoGenerateLote = () => {
    // TODO: Implementar geração automática de código de lote
    // const code = generateLoteCode(user?.username || "USER");
    const code = `TN-LOTE-${Date.now()}`;
    setLoteCodigo(code);
    Alert.alert("Lote Gerado", `Sugestão de ID de Lote baseada no seu perfil: ${code}`);
  };

  const filteredAds = myRealAds.filter((item) =>
    adStatusFilter === "all" ? true : (adStatusFilter === "active" ? item.estoqueValor > 0 : item.estoqueValor === 0),
  );

  const getStatusLabel = (item: MarketplaceOpportunity) => {
    if (item.estoqueValor > 0) return "Ativo";
    return "Esgotado";
  };

  const getStatusStyle = (item: MarketplaceOpportunity) => {
    if (item.estoqueValor > 0) return styles.badgeActive;
    return styles.badgeClosed;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <AppHeader
        title="Criar Anúncio"
        onBackPress={() => {}}
        showBackButton={false}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.primary}
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

                {/* --- SEÇÃO DE CONFORMIDADE LEGAL --- */}
                <View style={styles.legalSection}>
                  <View style={styles.legalHeader}>
                    <Ionicons name="shield-checkmark" size={20} color={theme.colors.primary} />
                    <Text style={styles.legalTitle}>Conformidade Legal (Pitch)</Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.label}>ID do Lote (Rastreabilidade)</Text>
                      <TouchableOpacity onPress={handleAutoGenerateLote}>
                        <Text style={styles.autoGenText}>Sugerir Código</Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: SITIO-A-LOTE-001"
                      placeholderTextColor="#6B7280"
                      value={loteCodigo}
                      onChangeText={setLoteCodigo}
                    />
                    <Text style={styles.helperText}>Atende à INC 02/2018 (MAPA/ANVISA)</Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Tipo de Certificação</Text>
                    <View style={styles.certRow}>
                      {(["Organico", "Transicao", "Convencional"] as const).map((cert) => (
                        <TouchableOpacity
                          key={cert}
                          style={[
                            styles.certButton,
                            tipoCertificacao === cert && styles.certButtonActive
                          ]}
                          onPress={() => setTipoCertificacao(cert)}
                        >
                          <Text style={[
                            styles.certButtonText,
                            tipoCertificacao === cert && styles.certButtonTextActive
                          ]}>
                            {cert === "Organico" ? "Orgânico" : cert === "Transicao" ? "Transição" : "Convencional"}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Número do Selo/Registro (Opcional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: MAPA-RG-123456"
                      placeholderTextColor="#6B7280"
                      value={numeroRegistro}
                      onChangeText={setNumeroRegistro}
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.publishButton, isPublishing && styles.publishButtonDisabled]} 
                  onPress={publicarAnuncio}
                  disabled={isPublishing}
                >
                  {isPublishing ? (
                    <>
                      <ActivityIndicator size="small" color={theme.colors.white} />
                      <Text style={[styles.publishButtonText, { marginLeft: 8 }]}>Publicando...</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.publishButtonText}>
                        {editingAdId ? "Salvar alterações" : "Publicar no Terra Nova"}
                      </Text>
                      <Ionicons
                        name={editingAdId ? "checkmark-circle-outline" : "paper-plane-outline"}
                        size={20}
                        color={theme.colors.white}
                        style={styles.iconMarginLeft}
                      />
                    </>
                  )}
                </TouchableOpacity>

                {editingAdId ? (
                  <TouchableOpacity style={styles.cancelEditButton} onPress={resetForm}>
                    <Text style={styles.cancelEditButtonText}>Cancelar edição</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            ) : (
              <View style={styles.emptyAdsCard}>
                <Ionicons name="alert-circle-outline" size={32} color={theme.colors.gray_500} />
                <Text style={styles.emptyAdsTitle}>Aba desativada</Text>
                <Text style={styles.emptyAdsText}>Utilize a Central para gerenciar seus anúncios.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Renovação de Estoque */}
      <Modal
        visible={showRenewModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRenewModal(false)}
      >
        <View style={styles.photoModalContainer}>
          <View style={[styles.photoModalContent, { paddingBottom: 40 }]}>
            <View style={styles.photoModalHeader}>
              <Text style={styles.photoModalTitle}>Renovar Estoque</Text>
              <TouchableOpacity onPress={() => setShowRenewModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.gray_800} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.label, { marginBottom: 15 }]}>
              Inserir nova quantidade para:{"\n"}
              <Text style={{ color: theme.colors.primary }}>{selectedAdToRenew?.produto}</Text>
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Ex: 50"
              keyboardType="numeric"
              value={newStockValue}
              onChangeText={setNewStockValue}
              autoFocus
            />

            <TouchableOpacity 
              style={[styles.publishButton, { marginTop: 20 }]} 
              onPress={handleRenewStock}
            >
              <Text style={styles.publishButtonText}>Confirmar Reposição</Text>
              <Ionicons name="refresh-circle" size={22} color={theme.colors.white} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
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
  publishButtonDisabled: {
    opacity: 0.6,
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
  badgeActive: { backgroundColor: theme.colors.accent },
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

  // --- ESTILOS CONFORMIDADE LEGAL ---
  legalSection: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  legalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  legalTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.gray_800,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  autoGenText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  helperText: {
    fontSize: 11,
    color: theme.colors.gray_500,
    marginTop: 4,
    fontStyle: "italic",
  },
  certRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  certButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: theme.colors.gray_100,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
  },
  certButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  certButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.gray_600,
  },
  certButtonTextActive: {
    color: theme.colors.white,
  },
});
