import {
    addReview,
    getAverageRating,
    getFarmPhotos,
    getProfileAvatar,
    getReviews
} from "@/services/communityStore";
import { normalizeText } from "@/utils/textUtils";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Keyboard } from "react-native";

export type ChatMessage = {
  id: string;
  texto: string;
  remetente: "me" | "other";
  hora: string;
};

export type ContactConversation = {
  id: string;
  nome: string;
  status: string;
  unread: number;
  mensagens: ChatMessage[];
};

export const CONVERSAS_INICIAIS: ContactConversation[] = [
  {
    id: "c1",
    nome: "Sitio 2 - Maringa",
    status: "Produtora - Online",
    unread: 2,
    mensagens: [
      {
        id: "1",
        texto: "Bom dia, Joao! Vi que voce tem milho amarelo premium. Consegue entregar 20 sacas aqui em Maringa?",
        remetente: "other",
        hora: "09:15",
      },
      {
        id: "2",
        texto: "Bom dia, Maria! Consigo sim. O frete fica por conta do comprador ou podemos rachar se fechar 50 sacas.",
        remetente: "me",
        hora: "09:20",
      },
      {
        id: "3",
        texto: "Vou falar com meu socio e te aviso. O laudo de pureza esta em dia?",
        remetente: "other",
        hora: "09:22",
      },
    ],
  },
  {
    id: "c2",
    nome: "Sitio 3 - Jatai",
    status: "Produtor - Online",
    unread: 0,
    mensagens: [
      {
        id: "1",
        texto: "Jose, voce ainda tem aquele lote de bezerros Nelore?",
        remetente: "me",
        hora: "Ontem",
      },
      {
        id: "2",
        texto: "Tenho sim, Joao. Sao 15 cabeças, todas vacinadas e com GTA.",
        remetente: "other",
        hora: "Ontem",
      },
    ],
  },
  {
    id: "c3",
    nome: "Sitio 4 - Uberlandia",
    status: "Produtora - Offline",
    unread: 1,
    mensagens: [
      {
        id: "1",
        texto: "Joao, preciso de adubo NPK. Vi que voce tem um estoque bom ai no Sitio 1.",
        remetente: "other",
        hora: "08:45",
      },
    ],
  },
];

export function useChatLogic() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sellerName?: string | string[];
    productName?: string | string[];
  }>();

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

  const routeSellerName = Array.isArray(params.sellerName) ? params.sellerName[0] : params.sellerName;
  const routeProductName = Array.isArray(params.productName) ? params.productName[0] : params.productName;

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

  const sellerPhotos = useMemo(() => (sellerName ? getFarmPhotos(sellerName) : []), [sellerName]);
  const sellerAvatarUri = useMemo(() => (sellerName ? getProfileAvatar(sellerName) : null), [sellerName]);
  const sellerHeaderPhotoUri = sellerAvatarUri || sellerPhotos[0] || null;
  const sellerReviews = useMemo(() => (sellerName ? getReviews(sellerName) : []), [sellerName, refresh]);
  const sellerRating = useMemo(() => (sellerName ? getAverageRating(sellerName) : 0), [sellerName, refresh]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setIsKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  useEffect(() => {
    setDealClosed(false);
    if (!conversaAtivaId) setNovaMensagem("");
    if (conversaAtivaId) {
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  }, [conversaAtivaId]);

  useEffect(() => {
    if (!routeSellerName || !routeProductName) return;
    const normalizedSeller = normalizeText(routeSellerName);
    if (!normalizedSeller) return;

    const autoOpenKey = `${normalizedSeller}|${normalizeText(routeProductName)}`;
    if (lastAutoOpenKeyRef.current === autoOpenKey) return;

    const existingConv = conversas.find((item) => normalizeText(item.nome) === normalizedSeller);
    const prefilled = `*${routeProductName}* ainda esta disponivel?`;

    if (existingConv) {
      setConversaAtivaId(existingConv.id);
      setConversas((prev) => prev.map((item) => item.id === existingConv.id ? { ...item, unread: 0 } : item));
      setNovaMensagem(prefilled);
      setNegotiatedItem(routeProductName);
      lastAutoOpenKeyRef.current = autoOpenKey;
      return;
    }

    const newId = `c${Date.now()}`;
    setConversas((prev) => [{ id: newId, nome: routeSellerName, status: "Vendedor - Online", unread: 0, mensagens: [] }, ...prev]);
    setConversaAtivaId(newId);
    setNovaMensagem(prefilled);
    setNegotiatedItem(routeProductName);
    lastAutoOpenKeyRef.current = autoOpenKey;
  }, [routeProductName, routeSellerName]);

  const abrirConversa = (id: string) => {
    setConversaAtivaId(id);
    setConversas((prev) => prev.map((item) => (item.id === id ? { ...item, unread: 0 } : item)));
  };

  const voltarParaLista = () => {
    if (dealClosed) { setDealClosed(false); return; }
    setConversaAtivaId(null);
  };

  // O BackHandler manual foi removido pois agora utilizamos um Stack nativo que gerencia o botão voltar.

  const enviarMensagem = () => {
    if (!conversaAtivaId || novaMensagem.trim() === "") return;
    const msg: ChatMessage = {
      id: Math.random().toString(),
      texto: novaMensagem.trim(),
      remetente: "me",
      hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setConversas((prev) => prev.map((item) => item.id === conversaAtivaId ? { ...item, mensagens: [...item.mensagens, msg] } : item));
    setNovaMensagem("");
  };

  const submitReview = () => {
    if (!sellerName || !comment.trim()) return;
    addReview(sellerName, { author: "Voce", role: "cliente", stars, comment: comment.trim(), ...(negotiatedItem && { negotiatedItem }) });
    setComment(""); setStars(5); setNegotiatedItem(null); setRefresh((p) => p + 1);
    Alert.alert("Sucesso", "Avaliacao publicada!", [{ text: "OK" }]);
    setDealClosed(false);
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
    voltarParaLista,
    enviarMensagem,
    submitReview,
  };
}
