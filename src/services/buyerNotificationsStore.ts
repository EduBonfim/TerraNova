export type NotificationRoute =
  | "/(buyer)/home"
  | "/(buyer)/marketplace"
  | "/messages"
  | "/mundo-organico"
  | "/warning-details";

export type NotificationCategory = 
  | "pedidos" 
  | "ofertas" 
  | "compras" 
  | "produtos" 
  | "chat"
  | "alerta";

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

const INITIAL_BUYER_NOTIFICATIONS: AppNotification[] = [
  {
    id: "nb1",
    title: "Nova oferta disponível",
    description: "Fazenda São João publicou Cama de Frango - Retirada disponível.",
    time: "Agora",
    isNew: true,
    route: "/(buyer)/marketplace",
    targetItemId: "c5",
    category: "ofertas",
  },
  {
    id: "nb2",
    title: "Novo produto em sua região",
    description: "Hortaliças frescas cadastradas a 3 km de distância.",
    time: "10 min",
    isNew: true,
    route: "/(buyer)/marketplace",
    category: "produtos",
  },
  {
    id: "nb3",
    title: "Seu pedido aguarda pagamento",
    description: "Você tem 1 pedido pendente para confirmar o pagamento.",
    time: "35 min",
    isNew: false,
    route: "/(buyer)/home",
    category: "pedidos",
  },
  {
    id: "nb4",
    title: "Oferta especial: Frutas Orgânicas",
    description: "Maçã Gala Premium com 15% de desconto esta semana.",
    time: "1 h",
    isNew: false,
    route: "/(buyer)/marketplace",
    category: "compras",
  },
  {
    id: "nb5",
    title: "Mensagem recebida",
    description: "Novo comentário sobre negociação de Tomate Caqui.",
    time: "2 h",
    isNew: false,
    route: "/messages",
    category: "chat",
  },
];

let buyerNotificationsState: AppNotification[] = INITIAL_BUYER_NOTIFICATIONS.map((item) => ({ ...item }));
let notificationsHistory: AppNotification[] = [];

export function getBuyerNotifications(): AppNotification[] {
  return buyerNotificationsState.map((item) => ({ ...item }));
}

export function getNotificationsHistory(): AppNotification[] {
  return notificationsHistory.map((item) => ({ ...item }));
}

export function markBuyerNotificationAsRead(id: string): AppNotification[] {
  buyerNotificationsState = buyerNotificationsState.map((item) =>
    item.id === id ? { ...item, isNew: false } : item,
  );
  return getBuyerNotifications();
}

export function markAllBuyerNotificationsAsRead(): AppNotification[] {
  buyerNotificationsState = buyerNotificationsState.map((item) => ({ ...item, isNew: false }));
  return getBuyerNotifications();
}

export function addBuyerNotification(notification: Omit<AppNotification, "id" | "isNew">) {
  const newNotif: AppNotification = {
    ...notification,
    id: `nb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    isNew: true,
  };
  buyerNotificationsState = [newNotif, ...buyerNotificationsState];
  return getBuyerNotifications();
}

export function removeBuyerNotification(id: string): AppNotification[] {
  const notification = buyerNotificationsState.find(n => n.id === id);
  if (notification) {
    // Adiciona ao histórico antes de remover da lista ativa
    notificationsHistory = [{ ...notification, isNew: false }, ...notificationsHistory].slice(0, 50);
  }
  buyerNotificationsState = buyerNotificationsState.filter((item) => item.id !== id);
  return getBuyerNotifications();
}
