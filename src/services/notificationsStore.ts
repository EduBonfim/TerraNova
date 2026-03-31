export type NotificationRoute =
  | "/profile"
  | "/map"
  | "/scan"
  | "/certificates"
  | "/messages"
  | "/organic"
  | "/home";

export type AppNotification = {
  id: string;
  title: string;
  description: string;
  time: string;
  isNew: boolean;
  route: NotificationRoute;
  targetItemId?: string;
};

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    title: "Nova oferta de bioinsumo",
    description: "Fazenda Sao Joao publicou cama de frango com retirada imediata.",
    time: "Agora",
    isNew: true,
    route: "/profile",
    targetItemId: "1",
  },
  {
    id: "n2",
    title: "Alerta de proximidade",
    description: "Novo anuncio encontrado a 5 km do seu endereco.",
    time: "10 min",
    isNew: true,
    route: "/map",
  },
  {
    id: "n3",
    title: "Diagnostico salvo",
    description: "Seu ultimo laudo foi salvo com sucesso.",
    time: "35 min",
    isNew: false,
    route: "/scan",
  },
  {
    id: "n4",
    title: "Certificado em analise",
    description: "Seu certificado MAPA entrou na fila de validacao.",
    time: "1 h",
    isNew: false,
    route: "/certificates",
  },
  {
    id: "n5",
    title: "Novo comentario no chat",
    description: "Voce recebeu uma nova mensagem em uma negociacao.",
    time: "2 h",
    isNew: false,
    route: "/messages",
  },
  {
    id: "n6",
    title: "Dica agroecologica do dia",
    description: "Veja tecnicas para elevar materia organica no solo.",
    time: "Ontem",
    isNew: false,
    route: "/organic",
  },
  {
    id: "n7",
    title: "Atualizacao de marketplace",
    description: "Novos produtores cadastrados na sua regiao.",
    time: "2 dias",
    isNew: false,
    route: "/profile",
  },
];

let notificationsState: AppNotification[] = INITIAL_NOTIFICATIONS.map((item) => ({ ...item }));

export function getNotifications(): AppNotification[] {
  return notificationsState.map((item) => ({ ...item }));
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
