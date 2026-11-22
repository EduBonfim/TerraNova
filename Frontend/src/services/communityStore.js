import AsyncStorage from "@react-native-async-storage/async-storage";
import { get, http, post } from "./api";
import { getCurrentSession } from "./authStore";

const profiles = {};
const COMMUNITY_STORAGE_KEY = "@terra_nova/community_profiles";
let isCommunityStoreInitialized = false;

const persistCommunityStore = async () => {
  try {
    await AsyncStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(profiles));
  } catch {}
};

const normalizeText = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const resolveProfileKey = (name) => {
  const target = normalizeText(name);
  for (const key of Object.keys(profiles)) {
    if (normalizeText(key) === target) return key;
  }
  for (const [key, profile] of Object.entries(profiles)) {
    if (
      normalizeText(profile.displayName) === target ||
      normalizeText(profile.farmName) === target
    ) {
      return key;
    }
  }
  return null;
};

export const initCommunityStore = async () => {
  if (isCommunityStoreInitialized) return;
  await refreshCommunityStore();
  fetchAllProfiles().catch((e) =>
    console.log("[CommunityStore] Erro na sincronização em background:", e)
  );
};

export const refreshCommunityStore = async () => {
  try {
    const raw = await AsyncStorage.getItem(COMMUNITY_STORAGE_KEY);
    if (!raw) {
      await persistCommunityStore();
      isCommunityStoreInitialized = true;
      return;
    }
    const parsed = JSON.parse(raw);
    Object.entries(parsed).forEach(([key, value]) => {
      if (profiles[key]) {
        profiles[key] = { ...profiles[key], ...value };
      } else {
        profiles[key] = value;
      }
    });
  } catch {}
  isCommunityStoreInitialized = true;
};

export const fetchAllProfiles = async () => {
  const session = await getCurrentSession();
  const response = await http("/api/v1/usuarios", {
    method: "GET",
    headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
  });
  if (response.success && Array.isArray(response.data)) {
    response.data.forEach((user) => {
      const username = user.username;
      profiles[username] = {
        username: user.username,
        displayName: user.fullName || user.username,
        farmName: user.farmName || "Fazenda sem nome",
        producerRole:
          user.producerRole ||
          (user.role === "buyer" ? "Comprador" : "Produtor Rural"),
        farmAddress: user.addressStreet || "Endereço não informado",
        farmAddressNumber: user.addressNumber || "",
        farmAddressReference: user.farmAddressReference || "",
        farmCep: user.addressCep || "",
        gateLatitude: user.gateLatitude,
        gateLongitude: user.gateLongitude,
        isCepValidated: !!user.isCepValidated,
        isGatePinConfirmed: !!user.isGatePinConfirmed,
        locationValidatedAt: user.locationValidatedAt,
        bio:
          user.bio ||
          (user.role === "buyer"
            ? "Comprador na comunidade Terra Nova."
            : "Participante da comunidade Terra Nova."),
        avatarUri: user.avatarUri,
        phone: user.phone,
        gender: user.gender,
        farmPhotos: user.farmPhotos || [],
        reviews: (user.reviews || []).map((r) => ({
          id: r.id,
          author: r.avaliadorNome || "Anônimo",
          authorName: r.avaliadorNome,
          stars: r.nota || 0,
          comment: r.comentario || "",
          date: r.createdAt
            ? new Date(r.createdAt).toLocaleDateString()
            : "Recente",
          role: "cliente",
        })),
        listings: user.listings || [],
        insumos: user.insumos || [],
        certificates: [],
      };
    });
    await persistCommunityStore();
  }
};

export const fetchProfile = async (username) => {
  const session = await getCurrentSession();
  const response = await http(`/api/v1/usuarios/username/${username}`, {
    method: "GET",
    headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
  });
  if (response.success && response.data) {
    const user = response.data;
    profiles[username] = {
      username: user.username,
      displayName: user.fullName || user.username,
      farmName: user.farmName || "Fazenda sem nome",
      producerRole: user.producerRole || "Produtor Rural",
      farmAddress: user.addressStreet || "Endereço não informado",
      farmAddressNumber: user.addressNumber || "",
      farmAddressReference: user.farmAddressReference || "",
      farmCep: user.addressCep || "",
      gateLatitude: user.gateLatitude,
      gateLongitude: user.gateLongitude,
      isCepValidated: !!user.isCepValidated,
      isGatePinConfirmed: !!user.isGatePinConfirmed,
      locationValidatedAt: user.locationValidatedAt,
      bio: user.bio || "Participante da comunidade Terra Nova.",
      avatarUri: user.avatarUri,
      phone: user.phone,
      gender: user.gender,
      farmPhotos: user.farmPhotos || [],
      reviews: (user.reviews || []).map((r) => ({
        id: r.id,
        author: r.avaliadorNome || "Anônimo",
        authorName: r.avaliadorNome,
        stars: r.nota || 0,
        comment: r.comentario || "",
        date: r.createdAt
          ? new Date(r.createdAt).toLocaleDateString()
          : "Recente",
        role: "cliente",
      })),
      listings: user.listings || [],
      insumos: user.insumos || [],
      certificates: [],
    };
    await refreshCertificatesRemote(username);
    await persistCommunityStore();
    return profiles[username];
  }
  return null;
};

export const getProfile = (name, _role) => {
  const resolvedKey = resolveProfileKey(name);
  if (resolvedKey) return profiles[resolvedKey];
  profiles[name] = {
    username: name,
    displayName: name,
    farmName: "Minha Fazenda",
    producerRole: "Produtor Rural",
    farmAddress: "Endereco nao informado",
    farmAddressNumber: "",
    farmAddressReference: "",
    farmCep: "",
    isCepValidated: false,
    isGatePinConfirmed: false,
    bio: "Participante da comunidade Terra Nova.",
    farmPhotos: [],
    reviews: [],
    listings: [],
    insumos: [],
    certificates: [],
  };
  return profiles[name];
};

export const getReviews = (name, role) => {
  const profile = getProfile(name, role);
  return [...profile.reviews].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const getAverageRating = (name, role) => {
  const reviews = getReviews(name, role);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, item) => acc + item.stars, 0);
  return Number((sum / reviews.length).toFixed(1));
};

export async function refreshReviewsRemote(username) {
  const session = await getCurrentSession();
  if (!session?.token) return;
  try {
    const userRes = await get(
      `/api/v1/usuarios/username/${encodeURIComponent(username)}`
    );
    if (userRes.success && userRes.data?.id) {
      const response = await get(
        `/api/v1/avaliacoes/avaliado/${userRes.data.id}`
      );
      if (response.success && response.data) {
        const profile = getProfile(username);
        profile.reviews = response.data.map((r) => ({
          id: r.id,
          authorName: r.avaliadorNome || "Anônimo",
          author: r.avaliadorNome,
          stars: r.nota || 0,
          comment: r.comentario || "",
          date: r.createdAt
            ? new Date(r.createdAt).toLocaleDateString()
            : "Recente",
          role: "cliente",
          negotiatedItem: r.produtoNome,
        }));
        await persistCommunityStore();
      }
    }
  } catch (e) {
    console.warn("Failed to fetch remote reviews", e);
  }
}

export const getFarmPhotos = (name) => [...getProfile(name).farmPhotos];

export const getProfileAvatar = (name) => {
  const profile = getProfile(name);
  return (
    profile.avatarUri ||
    `https://i.pravatar.cc/150?u=${encodeURIComponent(profile.username)}`
  );
};

export const getProfileSummary = (name) => getProfile(name);

export const syncProfileFromUser = async (user) => {
  if (!user?.username) return;
  const profile = getProfile(user.username);
  profile.displayName = user.fullName?.trim() || user.username;
  profile.avatarUri = user.avatarUri ?? profile.avatarUri;
  profile.phone = user.phone ?? profile.phone;
  profile.gender = user.gender ?? profile.gender;
  profile.bio = user.bio ?? profile.bio;
  if (user.farmName) profile.farmName = user.farmName;
  if (user.address?.street) profile.farmAddress = user.address.street;
  if (user.address?.number) profile.farmAddressNumber = user.address.number;
  if (user.address?.cep) profile.farmCep = user.address.cep;
  if (user.gateLatitude !== undefined) profile.gateLatitude = user.gateLatitude;
  if (user.gateLongitude !== undefined)
    profile.gateLongitude = user.gateLongitude;
  if (user.isCepValidated !== undefined)
    profile.isCepValidated = user.isCepValidated;
  if (user.isGatePinConfirmed !== undefined)
    profile.isGatePinConfirmed = user.isGatePinConfirmed;
  if (user.locationValidatedAt !== undefined)
    profile.locationValidatedAt = user.locationValidatedAt;
  await persistCommunityStore();
};

export const updateProfileSummary = async (name, payload) => {
  const profile = getProfile(name);
  Object.assign(profile, payload);
  await persistCommunityStore();
};

export const setProfileAvatar = async (name, uri) => {
  const profile = getProfile(name);
  profile.avatarUri = uri;
  await persistCommunityStore();
};

export const addFarmPhoto = (name, uri) => {
  const profile = getProfile(name);
  if (profile.farmPhotos.length >= 5) return { ok: false, reason: "max" };
  profile.farmPhotos.push(uri);
  persistCommunityStore();
  return { ok: true };
};

export const removeFarmPhoto = (name, uri) => {
  const profile = getProfile(name);
  profile.farmPhotos = profile.farmPhotos.filter((item) => item !== uri);
  persistCommunityStore();
};

export const addReview = async (targetName, payload) => {
  const profile = getProfile(targetName);
  const targetUsername = normalizeText(profile.username);
  const authorUsername = normalizeText(
    payload.authorUsername || payload.author || payload.authorName
  );

  if (targetUsername && authorUsername && targetUsername === authorUsername) {
    throw new Error("O produtor não pode avaliar o próprio perfil.");
  }

  const newReview = {
    ...payload,
    id: Math.random().toString(36).slice(2),
    date: new Date().toISOString().slice(0, 10),
  };
  profile.reviews.unshift(newReview);
  await persistCommunityStore();

  try {
    const session = await getCurrentSession();
    if (session?.token) {
      const authorRes = await get(
        `/api/v1/usuarios/username/${encodeURIComponent(authorUsername)}`
      );
      const targetRes = await get(
        `/api/v1/usuarios/username/${encodeURIComponent(targetUsername)}`
      );
      if (
        authorRes.success &&
        targetRes.success &&
        authorRes.data?.id &&
        targetRes.data?.id
      ) {
        await post("/api/v1/avaliacoes", {
          avaliadorId: authorRes.data.id,
          avaliadoId: targetRes.data.id,
          nota: payload.stars,
          comentario: payload.comment,
        });
      }
    }
  } catch (e) {
    console.warn("Failed to sync review to backend", e);
  }
};

export const getCertificates = (name, status) => {
  const certificates = getProfile(name).certificates || [];
  const mappedStatus =
    status === "approved"
      ? "valido"
      : status === "pending"
      ? "em_analise"
      : status;
  return mappedStatus
    ? certificates.filter((item) => item.status === mappedStatus)
    : [...certificates];
};

export const addCertificate = (name, payload) => {
  const profile = getProfile(name);
  profile.certificates = profile.certificates || [];
  profile.certificates.unshift({
    ...payload,
    id: Math.random().toString(36).slice(2),
  });
  persistCommunityStore();
};

export async function refreshCertificatesRemote(username) {
  const session = await getCurrentSession();
  if (!session?.token) return;
  try {
    const userRes = await get(
      `/api/v1/usuarios/username/${encodeURIComponent(username)}`
    );
    if (userRes.success && userRes.data?.id) {
      const response = await get(
        `/api/v1/certificados/usuario/${userRes.data.id}`
      );
      if (response.success && response.data) {
        const profile = getProfile(username);
        profile.certificates = response.data.map((c) => ({
          id: c.id,
          title: c.titulo || "Certificado MAPA",
          number: c.numeroRegistro || "",
          issuer: c.emissor || "",
          issueDate: c.dataEmissao || "",
          expiryDate: c.dataVencimento || "",
          verification: c.urlDocumento || "",
          status: c.status || "em_analise",
          notes: c.notas || "",
        }));
        await persistCommunityStore();
      }
    }
  } catch (e) {
    console.warn("Failed to fetch remote certificates", e);
  }
}

export async function addCertificateRemote(username, payload) {
  const session = await getCurrentSession();
  if (!session?.token) return { ok: false, error: "Sem sessão ativa" };
  try {
    const userRes = await get(
      `/api/v1/usuarios/username/${encodeURIComponent(username)}`
    );
    if (userRes.success && userRes.data?.id) {
      const body = {
        usuarioId: userRes.data.id,
        titulo: payload.title,
        numeroRegistro: payload.number,
        emissor: payload.issuer,
        dataEmissao: payload.issueDate,
        dataVencimento: payload.expiryDate,
        urlDocumento: payload.verification,
        status: payload.status || "em_analise",
        notas: payload.notes || "",
      };
      const response = await post("/api/v1/certificados", body);
      if (response.success && response.data) {
        await refreshCertificatesRemote(username);
        return { ok: true, data: response.data };
      }
      return { ok: false, error: response.error };
    }
    return { ok: false, error: "Usuário não encontrado no backend" };
  } catch (e) {
    console.warn("Failed to save remote certificate", e);
    return { ok: false, error: e.message };
  }
}

export const wipeCommunityProfileLocally = async (username) => {
  const resolvedKey = resolveProfileKey(username);
  if (resolvedKey && profiles[resolvedKey]) {
    delete profiles[resolvedKey];
  }
  if (profiles[username]) {
    delete profiles[username];
  }
  await persistCommunityStore();
};
