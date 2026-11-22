import { http } from "./api";
import { getUsers } from "./authStore";
export const CONVERSAS_INICIAIS = [];
async function getContactIdByUsername(username) {
  const users = await getUsers();
  const user = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  return user?.id || null;
}
export async function getConversations(currentUserUsername, currentUserId) {
  if (!currentUserId || !currentUserUsername) return [];
  const response = await http(`/api/v1/mensagens/usuario/${currentUserId}`);
  if (!response.success || !response.data) return [];
  const msgs = response.data;
  const groups = {};
  msgs.forEach((msg) => {
    const isMe = msg.remetenteId === currentUserId;
    const contactUsername = isMe ? msg.destinatarioNome : msg.remetenteNome;
    const contactKey = contactUsername.toLowerCase();
    if (!groups[contactKey]) {
      groups[contactKey] = {
        id: contactKey,
        participants: [currentUserUsername, contactUsername],
        nome: contactUsername,
        status: "Online",
        unread: 0,
        mensagens: [],
      };
    }
    if (!msg.lida && !isMe) {
      groups[contactKey].unread += 1;
    }
    groups[contactKey].mensagens.push({
      id: msg.id,
      texto: msg.conteudo,
      remetente: msg.remetenteNome,
      hora: new Date(msg.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  });
  Object.values(groups).forEach((g) => {
    g.mensagens.reverse();
  });
  return Object.values(groups);
}
export async function saveMessageToBackend(
  conteudo,
  currentUserId,
  contactUsername
) {
  const contactId = await getContactIdByUsername(contactUsername);
  if (!contactId) return null;
  const response = await http(`/api/v1/mensagens`, {
    method: "POST",
    body: {
      remetenteId: currentUserId,
      destinatarioId: contactId,
      conteudo: conteudo,
    },
  });
  if (response.success && response.data) {
    const msg = response.data;
    return {
      id: msg.id,
      texto: msg.conteudo,
      remetente: msg.remetenteNome,
      hora: new Date(msg.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }
  return null;
}
export async function saveConversations(_conversas, _currentUserUsername) {
  // Este endpoint é apenas um placeholder, pois as mensagens são salvas individualmente via saveMessageToBackend
}
export async function deleteConversation(contactUsername, currentUserId) {
  const contactId = await getContactIdByUsername(contactUsername);
  if (!contactId) return;
  await http(
    `/api/v1/mensagens/conversa/${contactId}?usuarioId=${currentUserId}`,
    {
      method: "DELETE",
    }
  );
}
