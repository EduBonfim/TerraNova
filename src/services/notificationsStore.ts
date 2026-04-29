export type NotificationRoute =
  | "/profile"
  | "/map"
  | "/scan"
  | "/certificates"
  | "/messages"
  | "/organic"
  | "/home"
  | "/post"
  | "/(buyer)/marketplace"
  | "/warning-details";

export type NotificationCategory = 
  | "pedidos" 
  | "ofertas" 
  | "compras" 
  | "produtos" 
  | "vendas" 
  | "laudo" 
  | "certificado" 
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
  role?: "buyer" | "producer"; // "buyer", "producer", or both if omitted
  targetUser?: string; // Optional username to target a specific user
};

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  // ===== BUYER NOTIFICATIONS =====
  {
    id: "n1",
    title: "Nova oferta disponível",
    description: "Fazenda São João publicou Cama de Frango - Retirada disponível.",
    time: "Agora",
    isNew: true,
    route: "/(buyer)/marketplace",
    targetItemId: "c5",
    category: "ofertas",
    role: "buyer",
  },
  {
    id: "n2",
    title: "Novo produto em sua região",
    description: "Hortaliças frescas cadastradas a 3 km de distância.",
    time: "10 min",
    isNew: true,
    route: "/(buyer)/marketplace",
    category: "produtos",
    role: "buyer",
  },
  {
    id: "n3",
    title: "Seu pedido foi aguardando pagamento",
    description: "Você tem 1 pedido pendente para confirmar o pagamento.",
    time: "35 min",
    isNew: false,
    route: "/home",
    category: "pedidos",
    role: "buyer",
  },
  {
    id: "n4",
    title: "Oferta especial: Frutas Orgânicas",
    description: "Maçã Gala Premium com 15% de desconto esta semana.",
    time: "1 h",
    isNew: false,
    route: "/(buyer)/marketplace",
    category: "compras",
    role: "buyer",
  },
  {
    id: "n5",
    title: "Mensagem recebida",
    description: "Novo comentário sobre negociação de Tomate Caqui.",
    time: "2 h",
    isNew: false,
    route: "/messages",
    category: "chat",
    role: "buyer",
  },

  // ===== PRODUCER NOTIFICATIONS =====
  {
    id: "n6",
    title: "Nova oferta de bioinsumo",
    description: "Comprador interessado em Cama de Frango - Propriedade próxima.",
    time: "Agora",
    isNew: true,
    route: "/profile",
    targetItemId: "1",
    category: "vendas",
    role: "producer",
  },
  {
    id: "n7",
    title: "Alerta de proximidade",
    description: "Novo comprador encontrado a 5 km do seu endereço.",
    time: "10 min",
    isNew: true,
    route: "/map",
    category: "vendas",
    role: "producer",
  },
  {
    id: "n8",
    title: "Diagnóstico salvo",
    description: "Seu último laudo foi salvo com sucesso.",
    time: "35 min",
    isNew: false,
    route: "/scan",
    category: "laudo",
    role: "producer",
  },
  {
    id: "n9",
    title: "Certificado em análise",
    description: "Seu certificado MAPA entrou na fila de validação.",
    time: "1 h",
    isNew: false,
    route: "/certificates",
    category: "certificado",
    role: "producer",
  },
  {
    id: "n10",
    title: "Novo comentário no chat",
    description: "Você recebeu uma nova mensagem em uma negociação.",
    time: "2 h",
    isNew: false,
    route: "/messages",
    category: "chat",
    role: "producer",
  },
  {
    id: "n11",
    title: "Dica agroecológica do dia",
    description: "Veja técnicas para elevar matéria orgânica no solo.",
    time: "Ontem",
    isNew: false,
    route: "/organic",
    role: "producer",
  },
  {
    id: "n12",
    title: "Atualização de marketplace",
    description: "Novos compradores cadastrados na sua região.",
    time: "2 dias",
    isNew: false,
    route: "/profile",
    category: "vendas",
    role: "producer",
  },
];

let notificationsState: AppNotification[] = INITIAL_NOTIFICATIONS.map((item) => ({ ...item }));

export function getNotifications(): AppNotification[] {
  return notificationsState.map((item) => ({ ...item }));
}

export function getNotificationsByRole(role: "buyer" | "producer", username?: string): AppNotification[] {
  return getNotifications().filter((item) => {
    // 1. Role match
    const roleMatch = !item.role || item.role === role;
    if (!roleMatch) return false;
    
    // 2. User match (if targetUser is specified on the notification, it MUST match the current username)
    if (item.targetUser && username && item.targetUser !== username) {
      return false;
    }
    
    return true;
  });
}

export function markAllNotificationsAsRead(): AppNotification[] {
  notificationsState = notificationsState.map((item) => ({ ...item, isNew: false }));
  return getNotifications();
}

export function markNotificationAsRead(id: string): AppNotification[] {
  notificationsState = notificationsState.map((item) =>
    item.id === id ? { ...item, isNew: false } : item,
  );
  return getNotifications();
}

export function addNotification(notification: Omit<AppNotification, "id" | "isNew">) {
  const newNotif: AppNotification = {
    ...notification,
    id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    isNew: true,
  };
  notificationsState = [newNotif, ...notificationsState];
  return getNotifications();
}
