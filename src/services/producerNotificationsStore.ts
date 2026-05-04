export type NotificationRoute =
  | "/(producer)/profile"
  | "/map"
  | "/scan"
  | "/certificates"
  | "/messages"
  | "/seja-organico"
  | "/(producer)/home"
  | "/post"
  | "/warning-details";

export type NotificationCategory = 
  | "vendas" 
  | "laudo" 
  | "certificado" 
  | "chat"
  | "alerta"
  | "comunidade";

export type AppNotification = {
  id: string;
  title: string;
  description: string;
  time: string;
  isNew: boolean;
  route: NotificationRoute;
  targetItemId?: string;
  category?: NotificationCategory;
};

const INITIAL_PRODUCER_NOTIFICATIONS: AppNotification[] = [
  {
    id: "np-follower",
    title: "Você tem novos seguidores!",
    description: "Clique aqui para ver quem começou a te acompanhar.",
    time: "Agora",
    isNew: true,
    route: "/(producer)/home",
    category: "comunidade",
  },
  {
    id: "np1",
    title: "Nova oferta de bioinsumo",
    description: "Comprador interessado em Cama de Frango - Propriedade próxima.",
    time: "Agora",
    isNew: true,
    route: "/(producer)/profile",
    targetItemId: "1",
    category: "vendas",
  },
  {
    id: "np2",
    title: "Alerta de proximidade",
    description: "Novo comprador encontrado a 5 km do seu endereço.",
    time: "10 min",
    isNew: true,
    route: "/(producer)/map",
    category: "vendas",
  },
  {
    id: "np3",
    title: "Diagnóstico salvo",
    description: "Seu último laudo foi salvo com sucesso.",
    time: "35 min",
    isNew: false,
    route: "/scan",
    category: "laudo",
  },
  {
    id: "np4",
    title: "Certificado em análise",
    description: "Seu certificado MAPA entrou na fila de validação.",
    time: "1 h",
    isNew: false,
    route: "/certificates",
    category: "certificado",
  },
  {
    id: "np5",
    title: "Novo comentário no chat",
    description: "Você recebeu uma nova mensagem em uma negociação.",
    time: "2 h",
    isNew: false,
    route: "/messages",
    category: "chat",
  },
  {
    id: "np6",
    title: "Dica agroecológica do dia",
    description: "Veja técnicas para elevar matéria orgânica no solo.",
    time: "Ontem",
    isNew: false,
    route: "/seja-organico",
  },
  {
    id: "np7",
    title: "Atualização de marketplace",
    description: "Novos compradores cadastrados na sua região.",
    time: "2 dias",
    isNew: false,
    route: "/(producer)/profile",
    category: "vendas",
  },
];

let producerNotificationsState: AppNotification[] = INITIAL_PRODUCER_NOTIFICATIONS.map((item) => ({ ...item }));
let notificationsHistory: AppNotification[] = [];

export function getProducerNotifications(): AppNotification[] {
  return producerNotificationsState.map((item) => ({ ...item }));
}

export function getNotificationsHistory(): AppNotification[] {
  return notificationsHistory.map((item) => ({ ...item }));
}

export function markProducerNotificationAsRead(id: string): AppNotification[] {
  producerNotificationsState = producerNotificationsState.map((item) =>
    item.id === id ? { ...item, isNew: false } : item,
  );
  return getProducerNotifications();
}

export function markAllProducerNotificationsAsRead(): AppNotification[] {
  producerNotificationsState = producerNotificationsState.map((item) => ({ ...item, isNew: false }));
  return getProducerNotifications();
}

export function addProducerNotification(notification: Omit<AppNotification, "id" | "isNew">) {
  const newNotif: AppNotification = {
    ...notification,
    id: `np-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    isNew: true,
  };
  producerNotificationsState = [newNotif, ...producerNotificationsState];
  return getProducerNotifications();
}

export function removeProducerNotification(id: string): AppNotification[] {
  const notification = producerNotificationsState.find(n => n.id === id);
  if (notification) {
    // Adiciona ao histórico antes de remover da lista ativa
    notificationsHistory = [{ ...notification, isNew: false }, ...notificationsHistory].slice(0, 50); // Limite de 50 itens
  }
  producerNotificationsState = producerNotificationsState.filter((item) => item.id !== id);
  return getProducerNotifications();
}
