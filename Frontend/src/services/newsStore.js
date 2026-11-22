import AsyncStorage from "@react-native-async-storage/async-storage";
import { get } from "./api";

const NEWS_AGRO_KEY = "@terra_nova/news_agro";
const NEWS_CONSUMER_KEY = "@terra_nova/news_consumer";

let agroNewsCache = [];
let consumerNewsCache = [];

export async function fetchAgroNews() {
  try {
    const cached = await AsyncStorage.getItem(NEWS_AGRO_KEY);
    if (cached) agroNewsCache = JSON.parse(cached);
  } catch (_e) {}

  try {
    const res = await get("/api/v1/noticias/agro");
    if (res.success && res.data && res.data.length > 0) {
      agroNewsCache = res.data.map((n) => ({
        id: n.id,
        title: n.titulo,
        source: n.fonte,
        link: n.link,
        imageUrl: n.imagemUrl,
        date: n.dataPublicacao,
      }));
      await AsyncStorage.setItem(NEWS_AGRO_KEY, JSON.stringify(agroNewsCache));
    }
  } catch (_e) {
    console.warn("Using offline cache for Agro News");
  }
  return agroNewsCache;
}

export async function fetchConsumerNews() {
  try {
    const cached = await AsyncStorage.getItem(NEWS_CONSUMER_KEY);
    if (cached) consumerNewsCache = JSON.parse(cached);
  } catch (_e) {}

  try {
    const res = await get("/api/v1/noticias/consumidor");
    if (res.success && res.data && res.data.length > 0) {
      consumerNewsCache = res.data.map((n) => ({
        id: n.id,
        title: n.titulo,
        source: n.fonte,
        link: n.link,
        imageUrl: n.imagemUrl,
        date: n.dataPublicacao,
      }));
      await AsyncStorage.setItem(
        NEWS_CONSUMER_KEY,
        JSON.stringify(consumerNewsCache)
      );
    }
  } catch (_e) {
    console.warn("Using offline cache for Consumer News");
  }
  return consumerNewsCache;
}
