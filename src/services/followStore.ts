import AsyncStorage from "@react-native-async-storage/async-storage";
import { addProducerNotification } from "./producerNotificationsStore";
import { getProfileAvatar } from "./communityStore";

const FOLLOWING_STORAGE_PREFIX = "@terra_nova_following_v3_";
const FOLLOWERS_STORAGE_PREFIX = "@terra_nova_followers_v3_";

let currentUserFollowing: Set<string> = new Set();
let currentUsername: string | null = null;

export async function initFollowStore(username?: string) {
  if (!username) {
    currentUserFollowing = new Set();
    currentUsername = null;
    return;
  }
  
  currentUsername = username;
  const data = await AsyncStorage.getItem(FOLLOWING_STORAGE_PREFIX + username);
  if (data) {
    currentUserFollowing = new Set(JSON.parse(data));
  } else {
    currentUserFollowing = new Set();
  }
}

export function isFollowing(producerName: string): boolean {
  return currentUserFollowing.has(producerName);
}

export async function toggleFollow(producerName: string, username?: string): Promise<boolean> {
  const myUsername = username || currentUsername;
  if (!myUsername) return false;

  const isNowFollowing = !currentUserFollowing.has(producerName);

  // Atualiza quem EU sigo
  if (isNowFollowing) {
    currentUserFollowing.add(producerName);
    
    // Dispara notificação para o Produtor (se quem está seguindo for um consumidor)
    addProducerNotification({
      title: "Novo seguidor!",
      description: `${myUsername} começou a seguir sua fazenda.`,
      time: "Agora",
      route: "/(producer)/home", // Redireciona para home ou aba de seguidores
      category: "comunidade",
    });
  } else {
    currentUserFollowing.delete(producerName);
  }
  await AsyncStorage.setItem(FOLLOWING_STORAGE_PREFIX + myUsername, JSON.stringify(Array.from(currentUserFollowing)));

  // Atualiza quem segue o PRODUTOR (para persistência global simulada)
  const followersRaw = await AsyncStorage.getItem(FOLLOWERS_STORAGE_PREFIX + producerName);
  let followers: string[] = followersRaw ? JSON.parse(followersRaw) : [];
  
  if (isNowFollowing) {
    if (!followers.includes(myUsername)) followers.push(myUsername);
  } else {
    followers = followers.filter(f => f !== myUsername);
  }
  await AsyncStorage.setItem(FOLLOWERS_STORAGE_PREFIX + producerName, JSON.stringify(followers));

  return isNowFollowing;
}

export async function getFollowerCount(producerName: string): Promise<number> {
  const followersRaw = await AsyncStorage.getItem(FOLLOWERS_STORAGE_PREFIX + producerName);
  const followers: string[] = followersRaw ? JSON.parse(followersRaw) : [];
  
  // Somamos os seguidores reais salvos + os 3 mocks iniciais para a conta não começar do zero
  return followers.length + 3; 
}

export function getFollowingCount(username: string): number {
  return currentUserFollowing.size;
}

export function getMockFollowers() {
  const baseFollowers = [
    { id: "1", name: "João Silva", type: "Consumidor" },
    { id: "2", name: "Maria Oliveira", type: "Consumidor" },
    { id: "3", name: "Restaurante Central", type: "B2B" },
  ];
  
  return baseFollowers.map(f => ({
    ...f,
    avatar: getProfileAvatar(f.name) || `https://i.pravatar.cc/150?u=${f.name}`
  }));
}

export async function getRealFollowers(producerName: string) {
  const followersRaw = await AsyncStorage.getItem(FOLLOWERS_STORAGE_PREFIX + producerName);
  const followerNames: string[] = followersRaw ? JSON.parse(followersRaw) : [];
  
  const realFollowers = followerNames.map((name, index) => ({
    id: `rf-${index}`,
    name: name,
    type: "Consumidor", // Por enquanto assumimos consumidor para favoritos
    avatar: getProfileAvatar(name) || `https://i.pravatar.cc/150?u=${name}`
  }));

  return [...getMockFollowers(), ...realFollowers];
}

export function getMockFollowing() {
  return Array.from(currentUserFollowing).map((name, index) => ({
    id: `f${index}`,
    name: name,
    type: "Produtor",
    avatar: getProfileAvatar(name) || `https://i.pravatar.cc/150?u=${name}`
  }));
}
