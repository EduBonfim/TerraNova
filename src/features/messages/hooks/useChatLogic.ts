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
import { useAuth } from "@/contexts/AuthContext";
import { 
  getConversations, 
  saveConversations, 
  type ChatMessage, 
  type ContactConversation 
} from "@/services/chatStore";

export function useChatLogic() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sellerName?: string | string[];
    productName?: string | string[];
  }>();

  const { user } = useAuth();
  const [conversas, setConversas] = useState<ContactConversation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
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
  const [isReceiverBlockingMessages, setIsReceiverBlockingMessages] =
    useState(false);
  const lastAutoOpenKeyRef = useRef<string | null>(null);

  const routeSellerName = Array.isArray(params.sellerName)
    ? params.sellerName[0]
    : params.sellerName;
  const routeProductName = Array.isArray(params.productName)
    ? params.productName[0]
    : params.productName;

  // Resolve o nome recebido da rota para um username único (ID)
  const targetUsername = useMemo(() => {
    if (!routeSellerName) return null;
    const profile = getProfile(routeSellerName);
    return profile.username || routeSellerName;
  }, [routeSellerName]);

  const normalizedSeller = normalizeText(targetUsername);

  const conversaAtual = useMemo(() => {
    if (!conversaAtivaId) return null;
    return conversas.find((item) => item.id === conversaAtivaId) ?? null;
  }, [conversas, conversaAtivaId]);

  // Identificador único da OUTRA pessoa na conversa
  const otherUsername = useMemo(() => {
    if (conversaAtual) {
      return conversaAtual.participants.find(p => 
        p.toLowerCase() !== user?.username?.toLowerCase()
      );
    }
    return targetUsername;
  }, [conversaAtual, targetUsername, user?.username]);

  // Nome exibido na conversa (sempre o da OUTRA pessoa)
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
      const contactUid = item.participants.find(p => 
        p.toLowerCase() !== user?.username?.toLowerCase()
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
    [otherUsername],
  );
  const sellerAvatarUri = useMemo(
    () => (otherUsername ? getProfileAvatar(otherUsername) : null),
    [otherUsername],
  );
  const sellerHeaderPhotoUri = sellerAvatarUri || sellerPhotos[0] || null;
  const sellerReviews = useMemo(
    () => (otherUsername ? getReviews(otherUsername) : []),
    [otherUsername, refresh],
  );
  const sellerRating = useMemo(
    () => (otherUsername ? getAverageRating(otherUsername) : 0),
    [otherUsername, refresh],
  );

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setIsKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setIsKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (user?.username) {
      getConversations(user.username).then((data) => {
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

  // Verificar se o receptor tem bloqueio de mensagens ativado
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
    
    const autoOpenKey = routeProductName 
      ? `${normalizedSeller}|${normalizeText(routeProductName)}`
      : normalizedSeller;
    if (lastAutoOpenKeyRef.current === autoOpenKey) return;

    const existingConv = conversas.find((item) => {
      const normParticipants = item.participants.map(p => normalizeText(p));
      const normMe = normalizeText(user?.username || "");
      return normParticipants.includes(normalizedSeller) && normParticipants.includes(normMe);
    });
    
    const prefilled = routeProductName 
      ? `*${routeProductName}* ainda esta disponivel?`
      : "";

    if (existingConv) {
      setConversaAtivaId(existingConv.id);
      setConversas((prev) =>
        prev.map((item) =>
          item.id === existingConv.id ? { ...item, unread: 0 } : item,
        ),
      );
      setNovaMensagem(prefilled);
      setNegotiatedItem(routeProductName || null);
      lastAutoOpenKeyRef.current = autoOpenKey;
      return;
    }

    const newId = `c${Date.now()}`;
    const myUsername = (user?.username || "me") as string;
    const finalTarget = (targetUsername || routeSellerName || "Contato") as string;
    
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
  }, [routeProductName, targetUsername, routeSellerName, isLoaded, conversas, user, normalizedSeller]);

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

  // O BackHandler manual foi removido pois agora utilizamos um Stack nativo que gerencia o botão voltar.

  const enviarMensagem = async () => {
    if (!conversaAtivaId || novaMensagem.trim() === "") return;

    // Verificar se o receptor tem bloqueio de mensagens ativado
    const { canSend, reason } = await canSendMessage(sellerName);

    if (!canSend) {
      Alert.alert(
        "Mensagem Bloqueada",
        getBlockedMessageNotification(sellerName),
        [{ text: "OK" }],
      );
      return;
    }

    const myUsername = user?.username || "me";
    const msg: ChatMessage = {
      id: Math.random().toString(),
      texto: novaMensagem.trim(),
      remetente: myUsername,
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
    // Usamos o otherUsername (ID único) se disponível, senão o sellerName (nome de exibição)
    const targetForReview = otherUsername || sellerName;
    if (!targetForReview || !comment.trim()) return;

    addReview(targetForReview, {
      authorName: user?.fullName || "Você",
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

  const removerConversa = (id: string) => {
    Alert.alert(
      "Excluir Conversa",
      "Tem certeza que deseja excluir esta conversa permanentemente?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setConversas((prev) => prev.filter((c) => c.id !== id));
            const { deleteConversation } = await import("@/services/chatStore");
            await deleteConversation(id);
            if (conversaAtivaId === id) {
              setConversaAtivaId(null);
            }
          },
        },
      ],
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
  };
}
