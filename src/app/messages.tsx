import { useChatLogic } from "@/features/messages/hooks/useChatLogic";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Image,
    KeyboardAvoidingView,
    Modal,
    Pressable,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

import { ChatConversation } from "@/features/messages/components/ChatConversation";
import { ChatHeader } from "@/features/messages/components/ChatHeader";
import { ConversationList } from "@/features/messages/components/ConversationList";
import { ReviewSellerView } from "@/features/messages/components/ReviewSellerView";
import {
    CURRENT_PLATFORM_UI,
    messagesStyles as styles,
} from "@/features/messages/styles/messages.styles";

export default function MessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    conversasFiltradas,
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
    isReceiverBlockingMessages,
  } = useChatLogic();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={CURRENT_PLATFORM_UI.keyboardBehavior}
      >
        <ChatHeader
          conversaAtual={conversaAtual}
          sellerHeaderPhotoUri={sellerHeaderPhotoUri}
          dealClosed={dealClosed}
          isSearchOpen={isSearchOpen}
          searchQuery={searchQuery}
          onBack={conversaAtual ? voltarParaLista : () => router.back()}
          onToggleSearch={() => {
            if (isSearchOpen) {
              setIsSearchOpen(false);
              setSearchQuery("");
              return;
            }
            setIsSearchOpen(true);
          }}
          onSearchChange={setSearchQuery}
          onCloseDealClick={() => setShowConfirmCloseModal(true)}
        />

        {!conversaAtual ? (
          <ConversationList
            conversations={conversasFiltradas}
            onOpenConversation={abrirConversa}
          />
        ) : !dealClosed ? (
          <ChatConversation
            messages={mensagens}
            sellerName={sellerName}
            isKeyboardVisible={isKeyboardVisible}
            newMessage={novaMensagem}
            insetsBottom={insets.bottom}
            onNewMessageChange={setNovaMensagem}
            onSendMessage={enviarMensagem}
            onViewProfile={() =>
              router.push({
                pathname: "/user-profile",
                params: { name: sellerName },
              })
            }
            isReceiverBlockingMessages={isReceiverBlockingMessages}
          />
        ) : (
          <ReviewSellerView
            sellerRating={sellerRating}
            sellerReviews={sellerReviews}
            sellerPhotos={sellerPhotos}
            stars={stars}
            comment={comment}
            setStars={setStars}
            setComment={setComment}
            setPreviewPhoto={setPreviewPhoto}
            submitReview={submitReview}
          />
        )}
      </KeyboardAvoidingView>

      <Modal visible={Boolean(previewPhoto)} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalClose}
            onPress={() => setPreviewPhoto(null)}
          >
            <Ionicons name="close" size={28} color={theme.colors.white} />
          </Pressable>
          {previewPhoto && (
            <Image
              source={{ uri: previewPhoto }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
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
                style={[
                  styles.confirmModalButton,
                  styles.confirmModalButtonCancel,
                ]}
                onPress={() => setShowConfirmCloseModal(false)}
              >
                <Text style={styles.confirmModalButtonTextCancel}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmModalButton,
                  styles.confirmModalButtonConfirm,
                ]}
                onPress={() => {
                  setShowConfirmCloseModal(false);
                  setDealClosed(true);
                }}
              >
                <Text style={styles.confirmModalButtonTextConfirm}>
                  Confirmar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
