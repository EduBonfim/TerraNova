import AsyncStorage from "@react-native-async-storage/async-storage";
import { get, put, post, httpDelete } from "@/services/api";
import { getCurrentSession } from "@/services/authStore";
let producerNotificationsState = [];
let notificationsHistory = [];
let syncQueue = [];
const STORAGE_KEY = "@terra_nova/producer_notifications";
const HISTORY_KEY = "@terra_nova/producer_notifications_history";
const QUEUE_KEY = "@terra_nova/producer_notifications_queue";
export async function initProducerNotificationsStore() {
  try {
    const stateStr = await AsyncStorage.getItem(STORAGE_KEY);
    if (stateStr) producerNotificationsState = JSON.parse(stateStr);
    const histStr = await AsyncStorage.getItem(HISTORY_KEY);
    if (histStr) notificationsHistory = JSON.parse(histStr);
    const queueStr = await AsyncStorage.getItem(QUEUE_KEY);
    if (queueStr) syncQueue = JSON.parse(queueStr);
  } catch (e) {
    console.warn("Failed to load producer notifications from storage", e);
  }
}
async function persist() {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(producerNotificationsState)
    );
    await AsyncStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(notificationsHistory)
    );
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(syncQueue));
  } catch (_e) {}
}
export async function syncProducerNotifications(userId) {
  await initProducerNotificationsStore();
  if (syncQueue.length > 0) {
    const queueCopy = [...syncQueue];
    for (const id of queueCopy) {
      try {
        const res = await put(`/api/v1/notificacoes/${id}/marcar-como-lida`);
        if (res.success) {
          syncQueue = syncQueue.filter((qId) => qId !== id);
        }
      } catch (_e) {}
    }
    await persist();
  }
  try {
    const res = await get(`/api/v1/notificacoes/usuario/${userId}`);
    if (res.success && res.data) {
      const serverNotifs = res.data.map((n) => ({
        id: n.id,
        title: n.titulo,
        description: n.descricao || "",
        time: n.criadoEm,
        isNew: !n.lida,
        route: n.rota || "/(producer)/home",
        category: n.categoria,
      }));
      producerNotificationsState = serverNotifs.filter((n) => n.isNew);
      notificationsHistory = serverNotifs.filter((n) => !n.isNew).slice(0, 50);
      await persist();
    }
  } catch (e) {
    console.error("Failed to sync producer notifications", e);
  }
}
export function getProducerNotifications() {
  return producerNotificationsState.map((item) => ({ ...item }));
}
export function getNotificationsHistory() {
  return notificationsHistory.map((item) => ({ ...item }));
}
export function markProducerNotificationAsRead(id) {
  const notif = producerNotificationsState.find((n) => n.id === id);
  if (notif) {
    notif.isNew = false;
    notificationsHistory = [notif, ...notificationsHistory].slice(0, 50);
  }
  producerNotificationsState = producerNotificationsState.filter(
    (item) => item.id !== id
  );
  persist().catch(console.error);
  if (!id.startsWith("np-")) {
    put(`/api/v1/notificacoes/${id}/marcar-como-lida`)
      .then((res) => {
        if (!res.success) {
          syncQueue.push(id);
          persist();
        }
      })
      .catch(() => {
        syncQueue.push(id);
        persist();
      });
  }
  return getProducerNotifications();
}
export function markAllProducerNotificationsAsRead() {
  const idsToMark = producerNotificationsState
    .filter((item) => item.isNew)
    .map((i) => i.id);
  const updated = producerNotificationsState.map((item) => ({
    ...item,
    isNew: false,
  }));
  notificationsHistory = [...updated, ...notificationsHistory].slice(0, 50);
  producerNotificationsState = [];
  persist().catch(console.error);
  idsToMark.forEach((id) => {
    if (!id.startsWith("np-")) {
      put(`/api/v1/notificacoes/${id}/marcar-como-lida`)
        .then((res) => {
          if (!res.success) {
            syncQueue.push(id);
            persist();
          }
        })
        .catch(() => {
          syncQueue.push(id);
          persist();
        });
    }
  });
  return getProducerNotifications();
}
export async function addProducerNotification(notification) {
  const session = await getCurrentSession();
  if (session?.user?.id) {
    try {
      const res = await post("/api/v1/notificacoes", {
        usuarioId: session.user.id,
        titulo: notification.title,
        descricao: notification.description,
        categoria: notification.category,
        rota: notification.route,
      });
      if (res.success && res.data) {
        const n = res.data;
        const newNotif = {
          id: n.id,
          title: n.titulo,
          description: n.descricao || "",
          time: n.criadoEm,
          isNew: !n.lida,
          route: n.rota || "/(producer)/home",
          category: n.categoria,
        };
        producerNotificationsState = [newNotif, ...producerNotificationsState];
        await persist();
        return getProducerNotifications();
      }
    } catch (e) {
      console.error("Failed to create notification on backend", e);
    }
  }
  const newNotif = {
    ...notification,
    id: `np-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    isNew: true,
  };
  producerNotificationsState = [newNotif, ...producerNotificationsState];
  await persist();
  return getProducerNotifications();
}
export function removeProducerNotification(id) {
  producerNotificationsState = producerNotificationsState.filter(
    (item) => item.id !== id
  );
  notificationsHistory = notificationsHistory.filter((item) => item.id !== id);
  persist().catch(console.error);
  if (!id.startsWith("np-")) {
    httpDelete(`/api/v1/notificacoes/${id}`).catch(console.error);
  }
  return getProducerNotifications();
}
