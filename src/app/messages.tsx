import React from "react";
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
  Image,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { SurfaceCard } from "@/components/SurfaceCard";
import { appTheme as theme } from "@/theme/appTheme";
import { getInitials } from "@/utils/textUtils";
import { useChatLogic, ChatMessage, ContactConversation } from "@/features/messages/hooks/useChatLogic";
import { getProfileAvatar, getFarmPhotos } from "@/services/communityStore";

const IOS_VISUAL = {
  keyboardBehavior: "padding" as const,
  headerHeight: 76,
  headerPaddingBottom: 16,
  headerPaddingTop: 16,
  modalCloseTop: 58,
  inputBottomExtraOffset: 0,
  reviewBottomExtra: 18,
  chatListBottomPadding: 20,
};

const ANDROID_VISUAL = {
  keyboardBehavior: "padding" as const,
  headerHeight: 76,
  headerPaddingBottom: 16,
  headerPaddingTop: 10,
  modalCloseTop: 32,
  inputBottomExtraOffset: 0,
  reviewBottomExtra: 18,
  chatListBottomPadding: 20,
};

const CURRENT_PLATFORM_UI = Platform.OS === "ios" ? IOS_VISUAL : ANDROID_VISUAL;

export default function MessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 0; // Chat em modo Stack
  
  const {
    conversasFiltradas,
    conversaAtivaId,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    novaMensagem,
    setNovaMensagem,
    previewPhoto,
    setPreviewPhoto,
    dealClosed,
    setDealClosed,
    stars,
    setStars,
    comment,
    setComment,
    isKeyboardVisible,
    showConfirmCloseModal,
    setShowConfirmCloseModal,
    conversaAtual,
    sellerName,
    mensagens,
    sellerPhotos,
    sellerHeaderPhotoUri,
    sellerReviews,
    sellerRating,
    abrirConversa,
    voltarParaLista,
    enviarMensagem,
    submitReview,
  } = useChatLogic();

  const inputBottomOffset = isKeyboardVisible ? 0 : CURRENT_PLATFORM_UI.inputBottomExtraOffset;

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.remetente === "me";
    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextOther]}>
            {item.texto}
          </Text>
          <Text style={[styles.timeText, isMe ? styles.timeTextMe : styles.timeTextOther]}>
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
      <TouchableOpacity style={styles.conversationRow} onPress={() => abrirConversa(item.id)}>
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
                <Text style={styles.unreadBadgeText}>{item.unread > 9 ? "9+" : item.unread}</Text>
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
      <KeyboardAvoidingView style={styles.container} behavior={CURRENT_PLATFORM_UI.keyboardBehavior}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={conversaAtual ? voltarParaLista : () => router.back()}
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
            <Text style={styles.headerTitle}>{conversaAtual ? conversaAtual.nome : "Mensagens"}</Text>
            <Text style={styles.headerSubtitle}>
              {conversaAtual ? conversaAtual.status : "Organize suas conversas por contato"}
            </Text>
          </View>

          {conversaAtual ? (
            <TouchableOpacity
              style={[styles.closeDealButton, dealClosed && styles.closeDealButtonDisabled]}
              onPress={() => setShowConfirmCloseModal(true)}
              disabled={dealClosed}
            >
              <Ionicons
                name={dealClosed ? "checkmark-done-circle" : "checkmark-circle-outline"}
                size={20}
                color={theme.colors.white}
              />
              <Text style={styles.closeDealButtonText}>{dealClosed ? "Compra fechada" : "Fechar compra"}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.searchToggleButton} onPress={() => {
              if (isSearchOpen) { setIsSearchOpen(false); setSearchQuery(""); return; }
              setIsSearchOpen(true);
            }}>
              <Ionicons name={isSearchOpen ? "close" : "search"} size={22} color={theme.colors.white} />
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
              onPress={() => router.push({ pathname: "/user-profile", params: { name: sellerName } })}
            >
              <Ionicons name="person-circle-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.profileShortcutText}>Ver perfil do contato</Text>
            </TouchableOpacity>

            <FlatList
              data={mensagens}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              contentContainerStyle={[styles.chatContainer, { paddingBottom: CURRENT_PLATFORM_UI.chatListBottomPadding }]}
            />

            <View style={[
              styles.inputContainer,
              { marginBottom: isKeyboardVisible ? 0 : Math.max(insets.bottom, 12) }
            ]}>
              <TextInput
                style={styles.input}
                placeholder="Digite sua mensagem"
                placeholderTextColor={theme.colors.gray_500}
                value={novaMensagem}
                onChangeText={setNovaMensagem}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendButton, novaMensagem.trim() === "" ? styles.sendButtonDisabled : null]}
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
            contentContainerStyle={[styles.reviewScreenContent, { paddingBottom: tabBarHeight + CURRENT_PLATFORM_UI.reviewBottomExtra }]}
          >
            <SurfaceCard style={styles.trustCard}>
              <Text style={styles.trustTitle}>Avaliacao da negociacao</Text>
              <Text style={styles.trustRating}>
                <Ionicons name="star" size={14} color={theme.colors.primary} /> Nota atual do vendedor: {sellerRating} ({sellerReviews.length} avaliacoes)
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
                {sellerPhotos.map((uri) => (
                  <TouchableOpacity key={uri} onPress={() => setPreviewPhoto(uri)}>
                    <Image source={{ uri }} style={styles.sellerPhoto} />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <TouchableOpacity key={value} onPress={() => setStars(value)}>
                    <Ionicons name={value <= stars ? "star" : "star-outline"} size={26} color={theme.colors.primary} />
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
                  <Text style={styles.reviewMeta}>{item.author} - {item.role} - {item.date}</Text>
                  {item.negotiatedItem && <Text style={styles.negotiatedItemText}>Negociado: {item.negotiatedItem}</Text>}
                  <Text style={styles.reviewStars}>{"*".repeat(item.stars)}{".".repeat(5 - item.stars)}</Text>
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
          {previewPhoto && <Image source={{ uri: previewPhoto }} style={styles.fullImage} resizeMode="contain" />}
        </View>
      </Modal>

      <Modal visible={showConfirmCloseModal} transparent animationType="fade">
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>Fechar negocio?</Text>
            <Text style={styles.confirmModalSubtitle}>Voce deseja confirmar e avaliar esta negociacao?</Text>
            <View style={styles.confirmModalButtonRow}>
              <TouchableOpacity style={[styles.confirmModalButton, styles.confirmModalButtonCancel]} onPress={() => setShowConfirmCloseModal(false)}>
                <Text style={styles.confirmModalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmModalButton, styles.confirmModalButtonConfirm]} onPress={() => { setShowConfirmCloseModal(false); setDealClosed(true); }}>
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
  headerAvatarImage: { width: 40, height: 40, borderRadius: 20, marginRight: 10, borderWidth: 2, borderColor: "rgba(255,255,255,0.45)" },
  headerAvatarFallback: { width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.4)" },
  headerAvatarFallbackText: { color: theme.colors.white, fontSize: 14, fontWeight: "bold" },
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: "bold", color: theme.colors.white },
  headerSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  searchToggleButton: { padding: 8 },
  searchBarWrap: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.white, margin: 12, paddingHorizontal: 12, borderRadius: 10, height: 44, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: theme.colors.gray_900 },
  conversationList: { flex: 1 },
  conversationListContent: { paddingVertical: 8 },
  conversationRow: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12, alignItems: "center" },
  avatarImage: { width: 54, height: 54, borderRadius: 27 },
  avatarCircle: { width: 54, height: 54, borderRadius: 27, backgroundColor: theme.colors.lightGreen, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontWeight: "bold", color: theme.colors.primary },
  conversationContent: { flex: 1, marginLeft: 12 },
  conversationTopLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  conversationName: { fontSize: 16, fontWeight: "bold", color: theme.colors.gray_900 },
  conversationTime: { fontSize: 12, color: theme.colors.gray_500 },
  conversationBottomLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  conversationPreview: { fontSize: 14, color: theme.colors.gray_500, flex: 1, marginRight: 8 },
  unreadBadge: { backgroundColor: theme.colors.primary, borderRadius: 10, minWidth: 20, height: 20, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  unreadBadgeText: { color: theme.colors.white, fontSize: 10, fontWeight: "bold" },
  separator: { height: 1, backgroundColor: theme.colors.gray_100, marginLeft: 82 },
  chatContainer: { paddingHorizontal: 16, paddingTop: 16 },
  messageRow: { flexDirection: "row", marginBottom: 16, width: "100%" },
  messageRowMe: { justifyContent: "flex-end" },
  messageRowOther: { justifyContent: "flex-start" },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, maxWidth: "80%" },
  bubbleMe: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: theme.colors.white, borderBottomLeftRadius: 4, elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  messageText: { fontSize: 15, lineHeight: 20 },
  messageTextMe: { color: theme.colors.white },
  messageTextOther: { color: theme.colors.gray_900 },
  timeText: { fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
  timeTextMe: { color: "rgba(255,255,255,0.7)" },
  timeTextOther: { color: theme.colors.gray_500 },
  inputContainer: { flexDirection: "row", alignItems: "center", padding: 12, borderTopWidth: 1, borderTopColor: theme.colors.gray_100, backgroundColor: theme.colors.white },
  input: { flex: 1, backgroundColor: theme.colors.gray_100, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, maxHeight: 100, fontSize: 15, color: theme.colors.gray_900 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center", marginLeft: 8 },
  sendButtonDisabled: { backgroundColor: theme.colors.gray_300 },
  profileShortcut: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, backgroundColor: theme.colors.lightGreen, gap: 6 },
  profileShortcutText: { fontSize: 12, color: theme.colors.primary, fontWeight: "600" },
  reviewScreenContent: { padding: 16 },
  trustCard: { padding: 20 },
  trustTitle: { fontSize: 18, fontWeight: "bold", color: theme.colors.gray_900, marginBottom: 8 },
  trustRating: { fontSize: 14, color: theme.colors.gray_500, marginBottom: 16 },
  photoRow: { gap: 10, marginBottom: 20 },
  sellerPhoto: { width: 80, height: 80, borderRadius: 8 },
  starRow: { flexDirection: "row", gap: 12, marginBottom: 20, justifyContent: "center" },
  reviewInput: { borderWidth: 1, borderColor: theme.colors.gray_300, borderRadius: 12, padding: 15, height: 100, textAlignVertical: "top", marginBottom: 15, color: theme.colors.gray_900 },
  reviewSubmit: { backgroundColor: theme.colors.primary, paddingVertical: 15, borderRadius: 12, alignItems: "center", marginBottom: 30 },
  reviewSubmitText: { color: theme.colors.white, fontSize: 16, fontWeight: "bold" },
  reviewCard: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: theme.colors.gray_100 },
  reviewMeta: { fontSize: 12, color: theme.colors.gray_500, marginBottom: 4 },
  negotiatedItemText: { fontSize: 13, fontWeight: "bold", color: theme.colors.primary, marginBottom: 4 },
  reviewStars: { fontSize: 14, color: theme.colors.orange_500, marginBottom: 6, letterSpacing: 2 },
  reviewComment: { fontSize: 14, color: theme.colors.gray_900, lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" },
  modalClose: { position: "absolute", top: 40, right: 20, zIndex: 10 },
  fullImage: { width: "100%", height: "80%" },
  confirmModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  confirmModalContent: { backgroundColor: theme.colors.white, borderRadius: 20, padding: 24, width: "100%", alignItems: "center" },
  confirmModalTitle: { fontSize: 20, fontWeight: "bold", color: theme.colors.gray_900, marginBottom: 12 },
  confirmModalSubtitle: { fontSize: 16, color: theme.colors.gray_500, textAlign: "center", marginBottom: 24 },
  confirmModalButtonRow: { flexDirection: "row", gap: 12, width: "100%" },
  confirmModalButton: { flex: 1, height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  confirmModalButtonCancel: { backgroundColor: theme.colors.gray_100 },
  confirmModalButtonConfirm: { backgroundColor: theme.colors.primary },
  confirmModalButtonTextCancel: { color: theme.colors.gray_800, fontWeight: "bold" },
  confirmModalButtonTextConfirm: { color: theme.colors.white, fontWeight: "bold" },
  closeDealButton: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6 },
  closeDealButtonDisabled: { backgroundColor: "rgba(255,255,255,0.1)", opacity: 0.7 },
  closeDealButtonText: { color: theme.colors.white, fontSize: 12, fontWeight: "bold" },
  emptySearchState: { paddingVertical: 40, alignItems: "center" },
  emptySearchText: { fontSize: 14, color: theme.colors.gray_500 },
});
