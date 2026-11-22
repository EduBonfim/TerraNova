import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfileAvatar } from "./communityStore";
import { addProducerNotification } from "./producerNotificationsStore";
import { get, httpDelete, post } from "./api";
import { getCurrentSession } from "./authStore";
const FOLLOWING_STORAGE_PREFIX = "@terra_nova_following_v3_";
const FOLLOWERS_STORAGE_PREFIX = "@terra_nova_followers_v3_";
let currentUserFollowing = new Set();
let currentUsername = null;
export async function initFollowStore(username) {
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
  const session = await getCurrentSession();
  if (!session?.token) return;
  const response = await get(
    `/api/v1/follows/${encodeURIComponent(username)}/following`
  );
  if (response.success && Array.isArray(response.data)) {
    currentUserFollowing = new Set(
      response.data
        .map((producer) => producer.username)
        .filter((producer) => Boolean(producer))
    );
    await AsyncStorage.setItem(
      FOLLOWING_STORAGE_PREFIX + username,
      JSON.stringify(Array.from(currentUserFollowing))
    );
  }
}
export function isFollowing(producerName) {
  return currentUserFollowing.has(producerName);
}
export async function toggleFollow(producerName, username) {
  const myUsername = username || currentUsername;
  if (!myUsername) return false;
  const isNowFollowing = !currentUserFollowing.has(producerName);
  const session = await getCurrentSession();
  if (session?.token) {
    if (isNowFollowing) {
      const response = await post("/api/v1/follows", {
        followerUsername: myUsername,
        producerUsername: producerName,
      });
      if (!response.success) return currentUserFollowing.has(producerName);
      currentUserFollowing.add(producerName);
    } else {
      const response = await httpDelete(
        `/api/v1/follows/${encodeURIComponent(
          producerName
        )}/${encodeURIComponent(myUsername)}`
      );
      if (!response.success) return currentUserFollowing.has(producerName);
      currentUserFollowing.delete(producerName);
    }
    await AsyncStorage.setItem(
      FOLLOWING_STORAGE_PREFIX + myUsername,
      JSON.stringify(Array.from(currentUserFollowing))
    );
    return isNowFollowing;
  }
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
  await AsyncStorage.setItem(
    FOLLOWING_STORAGE_PREFIX + myUsername,
    JSON.stringify(Array.from(currentUserFollowing))
  );
  // Atualiza quem segue o PRODUTOR (para persistência global simulada)
  const followersRaw = await AsyncStorage.getItem(
    FOLLOWERS_STORAGE_PREFIX + producerName
  );
  let followers = followersRaw ? JSON.parse(followersRaw) : [];
  if (isNowFollowing) {
    if (!followers.includes(myUsername)) followers.push(myUsername);
  } else {
    followers = followers.filter((f) => f !== myUsername);
  }
  await AsyncStorage.setItem(
    FOLLOWERS_STORAGE_PREFIX + producerName,
    JSON.stringify(followers)
  );
  return isNowFollowing;
}
export async function getFollowerCount(producerName) {
  const session = await getCurrentSession();
  if (session?.token) {
    const response = await get(
      `/api/v1/follows/${encodeURIComponent(producerName)}/count`
    );
    if (response.success && typeof response.data?.count === "number") {
      return response.data.count;
    }
  }
  const followersRaw = await AsyncStorage.getItem(
    FOLLOWERS_STORAGE_PREFIX + producerName
  );
  const followers = followersRaw ? JSON.parse(followersRaw) : [];
  return followers.length;
}
export function getFollowingCount(_username) {
  return currentUserFollowing.size;
}
export function getMockFollowers() {
  return [];
}
export async function getRealFollowers(producerName) {
  const session = await getCurrentSession();
  if (session?.token) {
    const response = await get(
      `/api/v1/follows/${encodeURIComponent(producerName)}/followers`
    );
    if (response.success && Array.isArray(response.data)) {
      return response.data.map((user, index) => {
        const name = user.username || user.fullName || `Seguidor ${index + 1}`;
        return {
          id: `rf-${user.username || index}`,
          name,
          type: user.role === "buyer" ? "Consumidor" : "Produtor",
          avatar: user.avatarUri || getProfileAvatar(name),
        };
      });
    }
  }
  const followersRaw = await AsyncStorage.getItem(
    FOLLOWERS_STORAGE_PREFIX + producerName
  );
  const followerNames = followersRaw ? JSON.parse(followersRaw) : [];
  const realFollowers = followerNames.map((name, index) => ({
    id: `rf-${index}`,
    name: name,
    type: "Consumidor",
    avatar: getProfileAvatar(name),
  }));
  return realFollowers;
}
export function getMockFollowing() {
  return Array.from(currentUserFollowing).map((name, index) => ({
    id: `f${index}`,
    name: name,
    type: "Produtor",
    avatar: getProfileAvatar(name),
  }));
}
