import AsyncStorage from "@react-native-async-storage/async-storage";

export type ChatMessage = {
  id: string;
  texto: string;
  remetente: string; // Alterado para armazenar o username do remetente
  hora: string;
};

export type ContactConversation = {
  id: string;
  participants: string[]; // usernames dos participantes [meu_username, outro_username]
  nome: string; // Nome de exibição da OUTRA pessoa
  status: string;
  unread: number;
  mensagens: ChatMessage[];
};

const CHAT_STORAGE_KEY = "@terra_nova/chat_conversations_v2";

export const CONVERSAS_INICIAIS: ContactConversation[] = [
  // Removido conversas iniciais globais para evitar vazamento de dados entre usuários
];

export async function getConversations(currentUserUsername?: string): Promise<ContactConversation[]> {
  if (!currentUserUsername) return [];

  const raw = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
  if (!raw) {
    return [];
  }
  
  const allConversations: ContactConversation[] = JSON.parse(raw);
  
  // Filtra apenas as conversas onde o usuário atual é participante
  return allConversations.filter(c => 
    c.participants.includes(currentUserUsername)
  );
}

export async function saveConversations(conversas: ContactConversation[], currentUserUsername: string) {
  if (!currentUserUsername) return;

  const raw = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
  let allConversations: ContactConversation[] = raw ? JSON.parse(raw) : [];

  // Atualiza ou adiciona as conversas fornecidas no repositório global
  conversas.forEach(conv => {
    const index = allConversations.findIndex(c => c.id === conv.id);
    if (index >= 0) {
      allConversations[index] = conv;
    } else {
      allConversations.push(conv);
    }
  });

  await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(allConversations));
}

export async function updateConversationMessages(conversationId: string, messages: ChatMessage[]) {
  const raw = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
  if (!raw) return;

  const allConversations: ContactConversation[] = JSON.parse(raw);
  const updated = allConversations.map(c => 
    c.id === conversationId ? { ...c, mensagens: messages } : c
  );
  await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
}
export async function deleteConversation(conversationId: string) {
  const raw = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
  if (!raw) return;

  const allConversations: ContactConversation[] = JSON.parse(raw);
  const updated = allConversations.filter(c => c.id !== conversationId);
  await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
}
