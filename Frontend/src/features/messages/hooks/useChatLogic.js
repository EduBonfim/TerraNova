import { useAuth } from "@/contexts/AuthContext";
import {
  getConversations,
  saveConversations,
  saveMessageToBackend,
} from "@/services/chatStore";
import {
  addReview,
  getAverageRating,
  getFarmPhotos,
  getProfile,
  getProfileAvatar,
  getReviews,
} from "@/services/communityStore";
import {
  canSendMessage,
  getBlockedMessageNotification,
} from "@/services/messageBlockStore";
import { normalizeText } from "@/utils/textUtils";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Keyboard } from "react-native";

export function useChatLogic() {
  const router = useRouter();

  const params = useLocalSearchParams();

  const { user } = useAuth();
  const [conversas, setConversas] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [conversaAtivaId, setConversaAtivaId] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [novaMensagem, setNovaMensagem] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [dealClosed, setDealClosed] = useState(false);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showConfirmCloseModal, setShowConfirmCloseModal] = useState(false);
  const [negotiatedItem, setNegotiatedItem] = useState(null);
  const [isReceiverBlockingMessages, setIsReceiverBlockingMessages] =
    useState(false);
  const lastAutoOpenKeyRef = useRef(null);

  const routeSellerName = Array.isArray(params.sellerName)
    ? params.sellerName[0]
    : params.sellerName;
  const routeProductName = Array.isArray(params.productName)
    ? params.productName[0]
    : params.productName;

  const targetUsername = useMemo(() => {
    if (!routeSellerName) return null;
    const profile = getProfile(routeSellerName);
    return profile.username || routeSellerName;
  }, [routeSellerName]);

  const normalizedSeller = normalizeText(targetUsername);
  const normalizedCurrentUser = normalizeText(user?.username || "");
  const isSelfTarget = Boolean(
    targetUsername &&
      normalizedSeller &&
      normalizedCurrentUser &&
      normalizedSeller === normalizedCurrentUser
  );

  const conversaAtual = useMemo(() => {
    if (!conversaAtivaId) return null;
    return conversas.find((item) => item.id === conversaAtivaId) ?? null;
  }, [conversas, conversaAtivaId]);

  const otherUsername = useMemo(() => {
    if (conversaAtual) {
      return conversaAtual.participants.find(
        (p) => p.toLowerCase() !== user?.username?.toLowerCase()
      );
    }
    return targetUsername;
  }, [conversaAtual, targetUsername, user?.username]);

  const sellerName = useMemo(() => {
    if (otherUsername) {
      const profile = getProfile(otherUsername);
      return profile.displayName || otherUsername;
    }
    return conversaAtual?.nome || "";
  }, [otherUsername, conversaAtual]);

  const mensagens = conversaAtual?.mensagens ?? [];

  const conversasFiltradas = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return conversas;
    return conversas.filter((item) => {
      const contactUid = item.participants.find(
        (p) => p.toLowerCase() !== user?.username?.toLowerCase()
      );
      const profile = contactUid ? getProfile(contactUid) : null;
      const displayName = profile?.displayName || item.nome;

      const lastMessage =
        item.mensagens[item.mensagens.length - 1]?.texto ?? "";
      return (
        displayName.toLowerCase().includes(query) ||
        lastMessage.toLowerCase().includes(query)
      );
    });
  }, [conversas, searchQuery, user?.username]);

  const sellerPhotos = useMemo(
    () => (otherUsername ? getFarmPhotos(otherUsername) : []),
    [otherUsername]
  );
  const sellerAvatarUri = useMemo(
    () => (otherUsername ? getProfileAvatar(otherUsername) : null),
    [otherUsername]
  );
  const sellerHeaderPhotoUri = sellerAvatarUri || sellerPhotos[0] || null;
  const sellerReviews = useMemo(
    () => (otherUsername ? getReviews(otherUsername) : []),
    [otherUsername, refresh]
  );
  const sellerRating = useMemo(
    () => (otherUsername ? getAverageRating(otherUsername) : 0),
    [otherUsername, refresh]
  );

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (user?.username && user?.id) {
      getConversations(user.username, user.id).then((data) => {
        setConversas(data);
        setIsLoaded(true);
      });
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && user?.username) {
      saveConversations(conversas, user.username);
    }
  }, [conversas, isLoaded, user]);

  useEffect(() => {
    setDealClosed(false);
    if (!conversaAtivaId) setNovaMensagem("");
    if (conversaAtivaId) {
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  }, [conversaAtivaId]);

  useEffect(() => {
    const checkReceiverBlockStatus = async () => {
      if (!targetUsername) {
        setIsReceiverBlockingMessages(false);
        return;
      }
      const { canSend } = await canSendMessage(targetUsername);
      setIsReceiverBlockingMessages(!canSend);
    };
    checkReceiverBlockStatus();
  }, [targetUsername]);

  useEffect(() => {
    if (!isLoaded || !targetUsername) return;

    if (isSelfTarget) {
      Alert.alert(
        "Conversa bloqueada",
        "O produtor não pode enviar mensagem para o próprio perfil.",
        [{ text: "OK", onPress: () => router.back() }]
      );
      return;
    }

    const autoOpenKey = routeProductName
      ? `${normalizedSeller}|${normalizeText(routeProductName)}`
      : normalizedSeller;
    if (lastAutoOpenKeyRef.current === autoOpenKey) return;

    const existingConv = conversas.find((item) => {
      const normParticipants = item.participants.map((p) => normalizeText(p));
      const normMe = normalizeText(user?.username || "");
      return (
        normParticipants.includes(normalizedSeller) &&
        normParticipants.includes(normMe)
      );
    });

    const prefilled = routeProductName
      ? `*${routeProductName}* ainda esta disponivel?`
      : "";

    if (existingConv) {
      setConversaAtivaId(existingConv.id);
      setConversas((prev) =>
        prev.map((item) =>
          item.id === existingConv.id ? { ...item, unread: 0 } : item
        )
      );
      setNovaMensagem(prefilled);
      setNegotiatedItem(routeProductName || null);
      lastAutoOpenKeyRef.current = autoOpenKey;
      return;
    }

    const newId = `c${Date.now()}`;
    const myUsername = user?.username || "me";
    const finalTarget = targetUsername || routeSellerName || "Contato";

    setConversas((prev) => [
      {
        id: newId,
        participants: [myUsername, finalTarget],
        nome: finalTarget,
        status: "Online",
        unread: 0,
        mensagens: [],
      },
      ...prev,
    ]);
    setConversaAtivaId(newId);
    setNovaMensagem(prefilled);
    setNegotiatedItem(routeProductName || null);
    lastAutoOpenKeyRef.current = autoOpenKey;
  }, [
    routeProductName,
    targetUsername,
    routeSellerName,
    isLoaded,
    conversas,
    user,
    normalizedSeller,
  ]);

  const abrirConversa = (id) => {
    setConversaAtivaId(id);
    setConversas((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: 0 } : item))
    );
  };

  const voltarParaLista = () => {
    if (dealClosed) {
      setDealClosed(false);
      return;
    }
    setConversaAtivaId(null);
  };

  const enviarMensagem = async () => {
    if (!conversaAtivaId || novaMensagem.trim() === "") return;

    if (isSelfTarget) {
      Alert.alert(
        "Mensagem bloqueada",
        "O produtor não pode enviar mensagem para si mesmo.",
        [{ text: "OK" }]
      );
      return;
    }

    const { canSend, reason: _reason } = await canSendMessage(sellerName);

    if (!canSend) {
      Alert.alert(
        "Mensagem Bloqueada",
        getBlockedMessageNotification(sellerName),
        [{ text: "OK" }]
      );
      return;
    }

    const myUsername = user?.username || "me";
    const myId = user?.id;
    const activeConv = conversas.find((c) => c.id === conversaAtivaId);
    const contactUsername =
      activeConv?.participants.find((p) => p !== myUsername) ||
      targetUsername ||
      routeSellerName ||
      "Contato";

    if (!myId) return;

    const msg = await saveMessageToBackend(
      novaMensagem.trim(),
      myId,
      contactUsername
    );

    if (msg) {
      setConversas((prev) => {
        return prev.map((item) =>
          item.id === conversaAtivaId
            ? { ...item, mensagens: [...item.mensagens, msg] }
            : item
        );
      });
    }
    setNovaMensagem("");
  };

  const submitReview = async () => {
    const targetForReview = otherUsername || sellerName;
    if (!targetForReview || !comment.trim()) return;

    if (
      user?.role === "producer" &&
      otherUsername &&
      user.username.toLowerCase() === otherUsername.toLowerCase()
    ) {
      Alert.alert(
        "Avaliação bloqueada",
        "O produtor não pode avaliar o próprio perfil."
      );
      return;
    }

    await addReview(targetForReview, {
      authorName: user?.fullName || "Você",
      authorUsername: user?.username,
      role: "cliente",
      stars,
      comment: comment.trim(),
      ...(negotiatedItem && { negotiatedItem }),
    });

    setComment("");
    setStars(5);
    setNegotiatedItem(null);
    setRefresh((p) => p + 1);
    Alert.alert("Sucesso", "Avaliacao publicada!", [{ text: "OK" }]);
    setDealClosed(false);
  };

  const removerConversa = (id) => {
    Alert.alert(
      "Ocultar Conversa",
      "Esta conversa desaparecerá do seu dispositivo, mas o registro permanecerá seguro no servidor caso você precise futuramente.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Ocultar",
          style: "destructive",
          onPress: async () => {
            setConversas((prev) => prev.filter((c) => c.id !== id));
            if (user?.id) {
              const { deleteConversation } = await import(
                "@/services/chatStore"
              );
              await deleteConversation(id, user.id);
            }
            if (conversaAtivaId === id) {
              setConversaAtivaId(null);
            }
          },
        },
      ]
    );
  };

  return {
    conversas,
    conversaAtivaId,
    setConversaAtivaId,
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
    conversasFiltradas,
    sellerPhotos,
    sellerHeaderPhotoUri,
    sellerReviews,
    sellerRating,
    abrirConversa,
    removerConversa,
    voltarParaLista,
    enviarMensagem,
    submitReview,
    isReceiverBlockingMessages,
    currentUser: user,
    targetUsername,
    otherUsername,
  };
}
