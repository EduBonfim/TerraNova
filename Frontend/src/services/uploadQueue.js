import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, isBackendTemporarilyUnavailable } from "./api";
import { getCurrentSession } from "./authStore";
const QUEUE_KEY = "@terra_nova/upload_queue";
async function readQueue() {
  const str = await AsyncStorage.getItem(QUEUE_KEY);
  return str ? JSON.parse(str) : [];
}
async function writeQueue(queue) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}
export async function enqueueUpload(uri, name, mime = "image/jpeg") {
  const queue = await readQueue();
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    uri,
    name,
    mime,
    attempts: 0,
    createdAt: Date.now(),
  };
  queue.push(item);
  await writeQueue(queue);
  return item.id;
}
export async function getQueue() {
  return readQueue();
}
export async function removeFromQueue(id) {
  const queue = await readQueue();
  const remaining = queue.filter((q) => q.id !== id);
  await writeQueue(remaining);
}
async function attemptUpload(item) {
  try {
    const session = await getCurrentSession();
    const headers = {
      "ngrok-skip-browser-warning": "true",
    };
    if (session?.token) headers["Authorization"] = `Bearer ${session.token}`;
    const formData = new FormData();
    formData.append("file", {
      uri: item.uri,
      type: item.mime,
      name: item.name,
    });
    const base = API_BASE_URL();
    const response = await fetch(`${base}/api/v1/upload`, {
      method: "POST",
      body: formData,
      headers,
    });
    if (!response.ok) return false;
    const body = await response.json().catch(() => ({}));
    return Boolean(body && (body.success === true || body.success === "true"));
  } catch (_e) {
    return false;
  }
}
export async function processQueue() {
  if (isBackendTemporarilyUnavailable()) return;
  const queue = await readQueue();
  if (!queue.length) return;
  for (const item of queue.slice()) {
    const ok = await attemptUpload(item);
    if (ok) {
      await removeFromQueue(item.id);
    } else {
      // Se falhou, incrementar tentativas. Se muitas falhas, remover para evitar bloqueio permanente.
      item.attempts = (item.attempts || 0) + 1;
      if (item.attempts >= 5) {
        await removeFromQueue(item.id);
      } else {
        // Atualizar item com nova contagem de tentativas
        const q = await readQueue();
        const idx = q.findIndex((x) => x.id === item.id);
        if (idx >= 0) {
          q[idx] = item;
          await writeQueue(q);
        }
      }
    }
  }
}
export default {
  enqueueUpload,
  getQueue,
  removeFromQueue,
  processQueue,
};
