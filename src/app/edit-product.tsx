import { AppHeader } from "@/components/AppHeader";
import { getMarketplaceItem, updateMarketplaceItem } from "@/services/marketplaceStore";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
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

export default function EditProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [form, setForm] = useState({
    produto: "",
    preco: "",
    estoqueValor: "",
    foto: "",
    categoria: "",
    subcategoria: "",
    descricao: "",
  });

  useEffect(() => {
    const loadProduct = async () => {
      const product = await getMarketplaceItem(id);
      if (product) {
        setForm({
          produto: product.produto,
          preco: product.preco,
          estoqueValor: product.estoqueValor.toString(),
          foto: product.foto,
          categoria: product.categoria,
          subcategoria: product.subcategoria || "",
          descricao: product.descricao || "",
        });
      }
    };
    loadProduct();
  }, [id]);

  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso à sua galeria para alterar a foto."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setForm((prev) => ({ ...prev, foto: result.assets[0].uri }));
    }
  };

  const handleSave = () => {
    const quantity = parseInt(form.estoqueValor, 10);

    if (!form.produto.trim()) {
      Alert.alert("Erro", "O nome do produto não pode estar vazio.");
      return;
    }
    if (!form.preco.trim()) {
      Alert.alert("Erro", "O preço não pode estar vazio.");
      return;
    }
    if (isNaN(quantity) || quantity < 0) {
      Alert.alert("Erro", "Insira uma quantidade válida (número inteiro).");
      return;
    }

    const doSave = async () => {
      const success = await updateMarketplaceItem(id, {
        produto: form.produto.trim(),
        preco: form.preco.trim(),
        estoqueValor: quantity,
        foto: form.foto,
        descricao: form.descricao.trim(),
      });

      if (success) {
        Alert.alert("Sucesso!", "Anúncio atualizado com sucesso.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Erro", "Não foi possível salvar as alterações.");
      }
    };

    doSave();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="Editar Anúncio"
        subtitle="Altere as informações do produto"
        onBackPress={() => router.back()}
        showBackButton
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.primary}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Foto */}
          <TouchableOpacity style={styles.imageContainer} onPress={handlePickImage} activeOpacity={0.8}>
            {form.foto ? (
              <Image source={{ uri: form.foto }} style={styles.productImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={40} color={theme.colors.gray_400} />
              </View>
            )}
            <View style={styles.imageOverlay}>
              <Ionicons name="camera" size={22} color={theme.colors.white} />
              <Text style={styles.imageOverlayText}>Alterar Foto</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.imageHint}>Toque na imagem para alterar a foto</Text>

          {/* Formulário */}
          <View style={styles.formSection}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nome do Produto</Text>
              <TextInput
                style={styles.input}
                value={form.produto}
                onChangeText={(text) => setForm((p) => ({ ...p, produto: text }))}
                placeholder="Ex: Tomate Orgânico - 5kg"
                placeholderTextColor={theme.colors.gray_400}
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Preço</Text>
              <View style={styles.inputWithIcon}>
                <Text style={styles.currencyPrefix}>R$</Text>
                <TextInput
                  style={[styles.input, styles.inputCurrency]}
                  value={form.preco.replace("R$ ", "").replace("R$", "")}
                  onChangeText={(text) => setForm((p) => ({ ...p, preco: `R$ ${text}` }))}
                  placeholder="0,00"
                  placeholderTextColor={theme.colors.gray_400}
                  keyboardType="decimal-pad"
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Descrição e Detalhes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.descricao}
                onChangeText={(text) => setForm((p) => ({ ...p, descricao: text }))}
                placeholder="Fale um pouco sobre a qualidade, maturação, etc."
                placeholderTextColor={theme.colors.gray_400}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Quantidade em Estoque</Text>
              <View style={styles.quantityRow}>
                <TouchableOpacity
                  style={styles.quantityBtn}
                  onPress={() => {
                    const val = parseInt(form.estoqueValor || "0", 10);
                    if (val > 0) setForm((p) => ({ ...p, estoqueValor: (val - 1).toString() }));
                  }}
                >
                  <Ionicons name="remove" size={20} color={theme.colors.primary} />
                </TouchableOpacity>

                <TextInput
                  style={styles.quantityInput}
                  value={form.estoqueValor}
                  onChangeText={(text) => setForm((p) => ({ ...p, estoqueValor: text.replace(/[^0-9]/g, "") }))}
                  keyboardType="number-pad"
                  textAlign="center"
                />

                <TouchableOpacity
                  style={styles.quantityBtn}
                  onPress={() => {
                    const val = parseInt(form.estoqueValor || "0", 10);
                    setForm((p) => ({ ...p, estoqueValor: (val + 1).toString() }));
                  }}
                >
                  <Ionicons name="add" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Categoria</Text>
              <View style={styles.readonlyField}>
                <Ionicons name="pricetag-outline" size={16} color={theme.colors.gray_500} />
                <Text style={styles.readonlyText}>{form.categoria} {form.subcategoria ? `→ ${form.subcategoria}` : ""}</Text>
              </View>
              <Text style={styles.hint}>A categoria não pode ser alterada após o cadastro.</Text>
            </View>
          </View>

          {/* Botão Salvar */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
            <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.white} />
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 20,
  },

  // Imagem
  imageContainer: {
    alignSelf: "center",
    width: 140,
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: theme.colors.gray_200,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 12,
    gap: 4,
  },
  imageOverlayText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  imageHint: {
    textAlign: "center",
    fontSize: 12,
    color: theme.colors.gray_500,
    marginBottom: 24,
  },

  // Formulário
  formSection: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 4,
    marginBottom: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.gray_600,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: theme.colors.gray_200,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: theme.colors.gray_800,
    backgroundColor: theme.colors.background,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: theme.colors.gray_200,
    borderRadius: 10,
    backgroundColor: theme.colors.background,
    overflow: "hidden",
  },
  currencyPrefix: {
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.primary,
    borderRightWidth: 1,
    borderRightColor: theme.colors.gray_200,
    paddingVertical: 13,
  },
  inputCurrency: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 0,
  },

  // Quantidade com botões
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "rgba(107, 142, 35, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  quantityInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: theme.colors.gray_200,
    borderRadius: 10,
    paddingVertical: 11,
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.gray_800,
    backgroundColor: theme.colors.background,
  },

  // Campo readonly
  readonlyField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.gray_100,
    borderRadius: 10,
    padding: 13,
    borderWidth: 1.5,
    borderColor: theme.colors.gray_200,
  },
  readonlyText: {
    fontSize: 14,
    color: theme.colors.gray_600,
    fontWeight: "500",
  },
  hint: {
    fontSize: 11,
    color: theme.colors.gray_400,
    marginTop: 6,
  },

  // Botão Salvar
  saveButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    elevation: 3,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
