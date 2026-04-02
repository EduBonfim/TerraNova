import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Keyboard,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { SurfaceCard } from "../components/SurfaceCard";
import {
  addReview,
  getAverageRating,
  getFarmPhotos,
  getProfileAvatar,
  getReviews,
} from "../services/communityStore";

const theme = {
  colors: {
    primary: "#6B8E23",
    lightGreen: "#E8F5E9",
    white: "#FFFFFF",
    background: "#F5F5F5",
    gray_100: "#F3F4F6",
    gray_200: "#E5E7EB",
    gray_300: "#D1D5DB",
    gray_500: "#6B7280",
    gray_800: "#1F2937",
    gray_900: "#111827",
    accent: "#22C55E",
  },
};

const IOS_VISUAL = {
  keyboardBehavior: "padding" as const,
  headerHeight: 76,
  headerPaddingBottom: 16,
  headerPaddingTop: 16,
  modalCloseTop: 58,
  inputBottomOffsetBase: 0,
  inputBottomExtraOffset: 0,
  reviewBottomExtra: 18,
  chatListBottomPadding: 20,
  inputContainerPadding: 12,
  inputPaddingVertical: 14,
  inputMaxHeight: 100,
  sendButtonSize: 44,
  sendButtonRadius: 22,
  sendButtonMarginBottom: 2,
};

const ANDROID_VISUAL = {
  keyboardBehavior: "padding" as const,
  headerHeight: 76,
  headerPaddingBottom: 16,
  headerPaddingTop: 10,
  modalCloseTop: 32,
  inputBottomOffsetBase: 0,
  inputBottomExtraOffset: 0,
  reviewBottomExtra: 18,
  chatListBottomPadding: 20,
  inputContainerPadding: 12,
  inputPaddingVertical: 12,
  inputMaxHeight: 100,
  sendButtonSize: 44,
  sendButtonRadius: 22,
  sendButtonMarginBottom: 2,
};

const CURRENT_PLATFORM_UI = Platform.OS === "ios" ? IOS_VISUAL : ANDROID_VISUAL;

type ChatMessage = {
  id: string;
  texto: string;
  remetente: "me" | "other";
  hora: string;
};

type ContactConversation = {
  id: string;
  nome: string;
  status: string;
  unread: number;
  mensagens: ChatMessage[];
};

const CONVERSAS_INICIAIS: ContactConversation[] = [
  {
    id: "c1",
    nome: "Fazenda Sao Joao",
    status: "Vendedor - Online",
    unread: 2,
    mensagens: [
      {
        id: "1",
        texto:
          "Ola! Vi o anuncio da cama de frango. Tem caminhao para entrega no meu sitio?",
        remetente: "me",
        hora: "10:30",
      },
      {
        id: "2",
        texto:
          "Bom dia! Temos sim. A carrocaria e lonada, conforme exigencia do MAPA.",
        remetente: "other",
        hora: "10:35",
      },
    ],
  },
  {
    id: "c2",
    nome: "Sitio Esperanca",
    status: "Produtor - Online",
    unread: 1,
    mensagens: [
      {
        id: "1",
        texto: "Tenho esterco bovino curtido disponivel essa semana.",
        remetente: "other",
        hora: "09:12",
      },
      {
        id: "2",
        texto: "Otimo. Qual o minimo para retirada?",
        remetente: "me",
        hora: "09:18",
      },
    ],
  },
  {
    id: "c3",
    nome: "Central Compostagem",
    status: "Cooperativa - Offline",
    unread: 0,
    mensagens: [
      {
        id: "1",
        texto: "Seu pedido de composto premium esta reservado ate amanha.",
        remetente: "other",
        hora: "Ontem",
      },
    ],
  },
  {
    id: "c4",
    nome: "Sítio Boa Terra",
    status: "Produtor Agroecológico - Online",
    unread: 1,
    mensagens: [
      {
        id: "1",
        texto: "Tenho composto peneirado pronto para retirada hoje.",
        remetente: "other",
        hora: "11:42",
      },
      {
        id: "2",
        texto: "Perfeito, consegue separar 8 sacos de 50kg?",
        remetente: "me",
        hora: "11:48",
      },
    ],
  },
  {
    id: "c5",
    nome: "Sítio Vale Azul",
    status: "Produtor Rural - Online",
    unread: 0,
    mensagens: [
      {
        id: "1",
        texto: "Cama de aviário curtida disponível, lote com laudo atualizado.",
        remetente: "other",
        hora: "Ontem",
      },
    ],
  },
  {
    id: "c6",
    nome: "Sítio Nova Raiz",
    status: "Agricultor Familiar - Offline",
    unread: 2,
    mensagens: [
      {
        id: "1",
        texto: "Tenho húmus de minhoca e composto maturado para essa semana.",
        remetente: "other",
        hora: "08:15",
      },
      {
        id: "2",
        texto: "Quero fechar 12 sacos. Você entrega em Anápolis?",
        remetente: "me",
        hora: "08:27",
      },
    ],
  },
];

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function MessagesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sellerName?: string | string[];
    productName?: string | string[];
  }>();
  const tabBarHeight = useBottomTabBarHeight();
  const [conversas, setConversas] = useState(CONVERSAS_INICIAIS);
  const [conversaAtivaId, setConversaAtivaId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [novaMensagem, setNovaMensagem] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [dealClosed, setDealClosed] = useState(false);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showConfirmCloseModal, setShowConfirmCloseModal] = useState(false);
  const [negotiatedItem, setNegotiatedItem] = useState<string | null>(null);
  const lastAutoOpenKeyRef = useRef<string | null>(null);

  const routeSellerName = Array.isArray(params.sellerName)
    ? params.sellerName[0]
    : params.sellerName;
  const routeProductName = Array.isArray(params.productName)
    ? params.productName[0]
    : params.productName;

  const conversaAtual = useMemo(() => {
    if (!conversaAtivaId) return null;
    return conversas.find((item) => item.id === conversaAtivaId) ?? null;
  }, [conversas, conversaAtivaId]);

  const sellerName = conversaAtual?.nome ?? "";
  const mensagens = conversaAtual?.mensagens ?? [];

  const conversasFiltradas = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return conversas;

    return conversas.filter((item) => {
      const lastMessage = item.mensagens[item.mensagens.length - 1]?.texto ?? "";
      return (
        item.nome.toLowerCase().includes(query) ||
        lastMessage.toLowerCase().includes(query)
      );
    });
  }, [conversas, searchQuery]);

  const sellerPhotos = sellerName ? getFarmPhotos(sellerName) : [];
  const sellerAvatarUri = sellerName ? getProfileAvatar(sellerName) : null;
  const sellerHeaderPhotoUri = sellerAvatarUri || sellerPhotos[0] || null;
  const sellerReviews = sellerName ? getReviews(sellerName) : [];
  const sellerRating = sellerName ? getAverageRating(sellerName) : 0;

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });

    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    setDealClosed(false);
    if (!conversaAtivaId) {
      setNovaMensagem("");
    }
    if (conversaAtivaId) {
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  }, [conversaAtivaId]);

  useEffect(() => {
    if (!routeSellerName || !routeProductName) {
      return;
    }

    const normalizedSeller = normalizeText(routeSellerName);
    if (!normalizedSeller) {
      return;
    }

    const autoOpenKey = `${normalizedSeller}|${normalizeText(routeProductName)}`;
    if (lastAutoOpenKeyRef.current === autoOpenKey) {
      return;
    }

    const existingConversation = conversas.find(
      (item) => normalizeText(item.nome) === normalizedSeller,
    );

    const prefilledMessage = `*${routeProductName}* ainda esta disponivel?`;

    if (existingConversation) {
      setConversaAtivaId(existingConversation.id);
      setConversas((prev) =>
        prev.map((item) =>
          item.id === existingConversation.id ? { ...item, unread: 0 } : item,
        ),
      );
      setNovaMensagem(prefilledMessage);
      setNegotiatedItem(routeProductName);
      lastAutoOpenKeyRef.current = autoOpenKey;
      return;
    }

    const newConversationId = `c${Date.now()}`;
    const newConversation: ContactConversation = {
      id: newConversationId,
      nome: routeSellerName,
      status: "Vendedor - Online",
      unread: 0,
      mensagens: [],
    };

    setConversas((prev) => [newConversation, ...prev]);
    setConversaAtivaId(newConversationId);
    setNovaMensagem(prefilledMessage);
    setNegotiatedItem(routeProductName);
    lastAutoOpenKeyRef.current = autoOpenKey;
  }, [conversas, routeProductName, routeSellerName]);

  const inputBottomOffset = isKeyboardVisible
    ? 0
    : CURRENT_PLATFORM_UI.inputBottomExtraOffset;

  const abrirConversa = (id: string) => {
    setConversaAtivaId(id);
    setConversas((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: 0 } : item)),
    );
  };

  const voltarParaLista = () => {
    if (dealClosed) {
      setDealClosed(false);
      return;
    }

    setConversaAtivaId(null);
  };

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") {
        return undefined;
      }

      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        if (conversaAtual) {
          voltarParaLista();
        } else {
          router.replace("/home");
        }
        return true;
      });

      return () => subscription.remove();
    }, [conversaAtual, dealClosed, router]),
  );

  const enviarMensagem = () => {
    if (!conversaAtivaId || novaMensagem.trim() === "") return;

    const msg: ChatMessage = {
      id: Math.random().toString(),
      texto: novaMensagem.trim(),
      remetente: "me",
      hora: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setConversas((prev) =>
      prev.map((item) =>
        item.id === conversaAtivaId
          ? { ...item, mensagens: [...item.mensagens, msg] }
          : item,
      ),
    );
    setNovaMensagem("");
  };

  const submitReview = () => {
    if (!sellerName || !comment.trim()) return;

    addReview(sellerName, {
      author: "Voce",
      role: "cliente",
      stars,
      comment: comment.trim(),
      ...(negotiatedItem && { negotiatedItem }),
    });

    setComment("");
    setStars(5);
    setNegotiatedItem(null);
    setRefresh((prev) => prev + 1);
    Alert.alert("Sucesso", "Avaliacao publicada!", [{ text: "OK" }]);
    setDealClosed(false);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.remetente === "me";

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowMe : styles.messageRowOther,
        ]}
      >
        <View
          style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}
        >
          <Text
            style={[
              styles.messageText,
              isMe ? styles.messageTextMe : styles.messageTextOther,
            ]}
          >
            {item.texto}
          </Text>
          <Text
            style={[
              styles.timeText,
              isMe ? styles.timeTextMe : styles.timeTextOther,
            ]}
          >
            {item.hora}
          </Text>
        </View>
      </View>
    );
  };

  const renderConversation = ({ item }: { item: ContactConversation }) => {
    const lastMessage = item.mensagens[item.mensagens.length - 1];
    const contactAvatarUri = getProfileAvatar(item.nome);
    const contactPhotos = getFarmPhotos(item.nome);
    const contactPhoto = contactAvatarUri || contactPhotos[0] || null;

    return (
      <TouchableOpacity
        style={styles.conversationRow}
        onPress={() => abrirConversa(item.id)}
      >
        {contactPhoto ? (
          <Image source={{ uri: contactPhoto }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials(item.nome)}</Text>
          </View>
        )}

        <View style={styles.conversationContent}>
          <View style={styles.conversationTopLine}>
            <Text style={styles.conversationName}>{item.nome}</Text>
            <Text style={styles.conversationTime}>{lastMessage?.hora ?? ""}</Text>
          </View>
          <View style={styles.conversationBottomLine}>
            <Text style={styles.conversationPreview} numberOfLines={1}>
              {lastMessage?.texto ?? "Sem mensagens"}
            </Text>
            {item.unread > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {item.unread > 9 ? "9+" : item.unread}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={CURRENT_PLATFORM_UI.keyboardBehavior}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={conversaAtual ? voltarParaLista : () => router.replace("/home")}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>

          {conversaAtual ? (
            sellerHeaderPhotoUri ? (
              <Image source={{ uri: sellerHeaderPhotoUri }} style={styles.headerAvatarImage} />
            ) : (
              <View style={styles.headerAvatarFallback}>
                <Text style={styles.headerAvatarFallbackText}>{getInitials(conversaAtual.nome)}</Text>
              </View>
            )
          ) : null}

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {conversaAtual ? conversaAtual.nome : "Mensagens"}
            </Text>
            <Text style={styles.headerSubtitle}>
              {conversaAtual
                ? conversaAtual.status
                : "Organize suas conversas por contato"}
            </Text>
          </View>

          {conversaAtual ? (
            <TouchableOpacity
              style={[
                styles.closeDealButton,
                dealClosed && styles.closeDealButtonDisabled,
              ]}
              onPress={() => setShowConfirmCloseModal(true)}
              disabled={dealClosed}
            >
              <Ionicons
                name={
                  dealClosed
                    ? "checkmark-done-circle"
                    : "checkmark-circle-outline"
                }
                size={20}
                color={theme.colors.white}
              />
              <Text style={styles.closeDealButtonText}>
                {dealClosed ? "Compra fechada" : "Fechar compra"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.searchToggleButton}
              onPress={() => {
                if (isSearchOpen) {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                  return;
                }

                setIsSearchOpen(true);
              }}
            >
              <Ionicons
                name={isSearchOpen ? "close" : "search"}
                size={22}
                color={theme.colors.white}
              />
            </TouchableOpacity>
          )}
        </View>

        {!conversaAtual && isSearchOpen ? (
          <View style={styles.searchBarWrap}>
            <Ionicons name="search" size={16} color={theme.colors.gray_500} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar contato ou mensagem"
              placeholderTextColor={theme.colors.gray_500}
              autoFocus
            />
          </View>
        ) : null}

        {!conversaAtual ? (
          <FlatList
            data={conversasFiltradas}
            keyExtractor={(item) => item.id}
            renderItem={renderConversation}
            style={styles.conversationList}
            contentContainerStyle={styles.conversationListContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.emptySearchState}>
                <Text style={styles.emptySearchText}>Nenhuma conversa encontrada</Text>
              </View>
            }
          />
        ) : !dealClosed ? (
          <>
            <TouchableOpacity
              style={styles.profileShortcut}
              onPress={() =>
                router.push({
                  pathname: "/user-profile",
                  params: { name: sellerName },
                })
              }
            >
              <Ionicons name="person-circle-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.profileShortcutText}>Ver perfil do contato</Text>
            </TouchableOpacity>

            <FlatList
              data={mensagens}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              contentContainerStyle={[
                styles.chatContainer,
                { paddingBottom: CURRENT_PLATFORM_UI.chatListBottomPadding },
              ]}
            />

            <View style={[styles.inputContainer, { marginBottom: inputBottomOffset }]}>
              <TextInput
                style={styles.input}
                placeholder="Digite sua mensagem"
                placeholderTextColor={theme.colors.gray_500}
                value={novaMensagem}
                onChangeText={setNovaMensagem}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  novaMensagem.trim() === "" ? styles.sendButtonDisabled : null,
                ]}
                onPress={enviarMensagem}
                disabled={novaMensagem.trim() === ""}
              >
                <Ionicons name="send" size={20} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <ScrollView
            style={styles.container}
            contentContainerStyle={[
              styles.reviewScreenContent,
              {
                paddingBottom: tabBarHeight + CURRENT_PLATFORM_UI.reviewBottomExtra,
              },
            ]}
          >
            <SurfaceCard style={styles.trustCard} key={refresh}>
              <Text style={styles.trustTitle}>Avaliacao da negociacao</Text>
              <Text style={styles.trustRating}>
                <Ionicons name="star" size={14} color={theme.colors.primary} /> Nota atual do
                vendedor: {sellerRating} ({sellerReviews.length} avaliacoes)
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photoRow}
              >
                {sellerPhotos.map((uri) => (
                  <TouchableOpacity key={uri} onPress={() => setPreviewPhoto(uri)}>
                    <Image source={{ uri }} style={styles.sellerPhoto} />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <TouchableOpacity key={value} onPress={() => setStars(value)}>
                    <Ionicons
                      name={value <= stars ? "star" : "star-outline"}
                      size={26}
                      color={theme.colors.primary}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.reviewInput}
                value={comment}
                onChangeText={setComment}
                placeholder="Escreva um comentario da negociacao"
                placeholderTextColor={theme.colors.gray_500}
              />

              <TouchableOpacity style={styles.reviewSubmit} onPress={submitReview}>
                <Text style={styles.reviewSubmitText}>Publicar avaliacao</Text>
              </TouchableOpacity>

              {sellerReviews.slice(0, 3).map((item) => (
                <View key={item.id} style={styles.reviewCard}>
                  <Text style={styles.reviewMeta}>
                    {item.author} - {item.role} - {item.date}
                  </Text>
                  {item.negotiatedItem ? (
                    <Text style={styles.negotiatedItemText}>
                      Negociado: {item.negotiatedItem}
                    </Text>
                  ) : null}
                  <Text style={styles.reviewStars}>
                    {"*".repeat(item.stars)}
                    {".".repeat(5 - item.stars)}
                  </Text>
                  <Text style={styles.reviewComment}>{item.comment}</Text>
                </View>
              ))}
            </SurfaceCard>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

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

      <Modal visible={showConfirmCloseModal} transparent animationType="fade">
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>Fechar negocio?</Text>
            <Text style={styles.confirmModalSubtitle}>
              Voce deseja confirmar e avaliar esta negociacao?
            </Text>
            <View style={styles.confirmModalButtonRow}>
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.confirmModalButtonCancel]}
                onPress={() => setShowConfirmCloseModal(false)}
              >
                <Text style={styles.confirmModalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.confirmModalButtonConfirm]}
                onPress={() => {
                  setShowConfirmCloseModal(false);
                  setDealClosed(true);
                }}
              >
                <Text style={styles.confirmModalButtonTextConfirm}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: CURRENT_PLATFORM_UI.headerHeight,
    paddingHorizontal: 16,
    paddingBottom: CURRENT_PLATFORM_UI.headerPaddingBottom,
    paddingTop: CURRENT_PLATFORM_UI.headerPaddingTop,
    backgroundColor: theme.colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  backButton: { padding: 8, marginRight: 8 },
  headerAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.45)",
  },
  headerAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  headerAvatarFallbackText: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: theme.colors.white },
  headerSubtitle: { fontSize: 12, color: theme.colors.white, opacity: 0.9 },
  closeDealButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },
  closeDealButtonDisabled: { backgroundColor: "rgba(255,255,255,0.30)" },
  closeDealButtonText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: "bold",
  },
  searchToggleButton: {
    padding: 6,
  },
  searchBarWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.gray_800,
    fontSize: 14,
    paddingVertical: 0,
  },

  conversationList: { flex: 1, backgroundColor: theme.colors.white },
  conversationListContent: { paddingVertical: 8 },
  conversationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: theme.colors.white,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.gray_100,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarText: { color: theme.colors.gray_800, fontWeight: "700", fontSize: 14 },
  conversationContent: { flex: 1 },
  conversationTopLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  conversationName: { color: theme.colors.gray_900, fontSize: 15, fontWeight: "600" },
  conversationTime: { color: theme.colors.gray_500, fontSize: 11 },
  conversationBottomLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  conversationPreview: { flex: 1, color: theme.colors.gray_500, fontSize: 13 },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadBadgeText: { color: theme.colors.white, fontSize: 11, fontWeight: "700" },
  separator: { height: 1, backgroundColor: theme.colors.gray_200, marginLeft: 74 },
  emptySearchState: { paddingHorizontal: 20, paddingVertical: 28, alignItems: "center" },
  emptySearchText: { color: theme.colors.gray_500, fontSize: 14 },

  profileShortcut: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
    gap: 8,
  },
  profileShortcutText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },

  chatContainer: { padding: 16, paddingBottom: 20 },
  messageRow: { flexDirection: "row", marginBottom: 12 },
  messageRowMe: { justifyContent: "flex-end" },
  messageRowOther: { justifyContent: "flex-start" },
  bubble: { maxWidth: "82%", padding: 12, borderRadius: 16, elevation: 1 },
  bubbleMe: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: theme.colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
  },
  messageText: { fontSize: 15, lineHeight: 20 },
  messageTextMe: { color: theme.colors.white },
  messageTextOther: { color: theme.colors.gray_800 },
  timeText: { fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
  timeTextMe: { color: theme.colors.lightGreen },
  timeTextOther: { color: theme.colors.gray_500 },

  inputContainer: {
    flexDirection: "row",
    padding: CURRENT_PLATFORM_UI.inputContainerPadding,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray_200,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: CURRENT_PLATFORM_UI.inputPaddingVertical,
    paddingBottom: CURRENT_PLATFORM_UI.inputPaddingVertical,
    maxHeight: CURRENT_PLATFORM_UI.inputMaxHeight,
    fontSize: 15,
    color: theme.colors.gray_800,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    width: CURRENT_PLATFORM_UI.sendButtonSize,
    height: CURRENT_PLATFORM_UI.sendButtonSize,
    borderRadius: CURRENT_PLATFORM_UI.sendButtonRadius,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    marginBottom: CURRENT_PLATFORM_UI.sendButtonMarginBottom,
  },
  sendButtonDisabled: { backgroundColor: theme.colors.gray_300 },

  reviewScreenContent: { padding: 16, paddingBottom: 24 },
  trustCard: {
    padding: 12,
    marginBottom: 14,
  },
  trustTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  trustRating: { fontSize: 13, color: theme.colors.gray_800, marginTop: 4 },
  photoRow: { marginTop: 10, gap: 8 },
  sellerPhoto: { width: 88, height: 68, borderRadius: 8, marginRight: 8 },
  starRow: { flexDirection: "row", gap: 6, marginTop: 10, marginBottom: 8 },
  reviewInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    color: theme.colors.gray_800,
  },
  reviewSubmit: {
    marginTop: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  reviewSubmitText: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: 13,
  },
  reviewCard: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray_200,
    paddingTop: 8,
  },
  reviewMeta: { fontSize: 11, color: theme.colors.gray_500 },
  reviewStars: { fontSize: 12, color: theme.colors.primary, marginTop: 2 },
  reviewComment: { fontSize: 13, color: theme.colors.gray_800, marginTop: 2 },
  negotiatedItemText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: "600",
    marginTop: 6,
    marginBottom: 4,
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

  confirmModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmModalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 300,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.gray_900,
    marginBottom: 8,
  },
  confirmModalSubtitle: {
    fontSize: 14,
    color: theme.colors.gray_500,
    marginBottom: 20,
    lineHeight: 20,
  },
  confirmModalButtonRow: {
    flexDirection: "row",
    gap: 10,
  },
  confirmModalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmModalButtonCancel: {
    backgroundColor: theme.colors.gray_200,
  },
  confirmModalButtonConfirm: {
    backgroundColor: theme.colors.primary,
  },
  confirmModalButtonTextCancel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.gray_800,
  },
  confirmModalButtonTextConfirm: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.white,
  },
});
