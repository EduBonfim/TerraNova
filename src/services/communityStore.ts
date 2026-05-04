import AsyncStorage from "@react-native-async-storage/async-storage";

export type ReviewRole = 'cliente' | 'vendedor';
export type CertificateStatus = 'pending' | 'approved';

export type Certificate = {
  id: string;
  title: string;
  number: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  verification: string;
  status: CertificateStatus;
};

export type Review = {
  id: string;
  authorName: string;
  author?: string;
  role: ReviewRole;
  stars: number;
  comment: string;
  date: string;
  negotiatedItem?: string;
};

type CommunityProfile = {
  username: string; // ID único vinculado ao Auth
  displayName: string;
  farmName: string;
  producerRole: string;
  farmAddress: string;
  farmAddressNumber: string;
  farmAddressReference: string;
  farmCep: string;
  gateLatitude?: number;
  gateLongitude?: number;
  isCepValidated: boolean;
  isGatePinConfirmed: boolean;
  locationValidatedAt?: string;
  bio: string;
  avatarUri?: string;
  phone?: string;
  gender?: string;
  farmPhotos: string[];
  reviews: Review[];
  listings: Array<{ id: string; title: string; type: 'venda' | 'doacao'; price?: string }>;
  insumos: Array<{ id: string; title: string; amount: string }>;
  certificates: Certificate[];
};

// ─── MOCKS ISOLADOS ───
const PRODUCER_REVIEWS_MOCK: Review[] = [
  { id: 'p1', authorName: 'Ricardo Mendes', role: 'cliente', stars: 5, comment: 'Os tomates orgânicos são excelentes. Sabor de verdade!', date: '2026-04-28' },
  { id: 'p2', authorName: 'Sítio Vale Azul', role: 'vendedor', stars: 4, comment: 'Ótimo parceiro. Solo muito bem cuidado e manejo exemplar.', date: '2026-04-29' },
  { id: 'p3', authorName: 'Ana Paula Silva', role: 'cliente', stars: 5, comment: 'O esterco bovino chegou bem curtido. Recomendo!', date: '2026-05-01' },
];

const BUYER_REVIEWS_MOCK: Review[] = [
  { id: 'b1', authorName: 'Fazenda Esperança', role: 'vendedor', stars: 5, comment: 'Comprador muito pontual e pagamento imediato.', date: '2026-04-25' },
  { id: 'b2', authorName: 'João da Horta', role: 'vendedor', stars: 5, comment: 'Excelente comunicação e negociação justa.', date: '2026-04-27' },
];

const profiles: Record<string, CommunityProfile> = {
  'Pedro Paulo': {
    username: 'pedropaulo',
    displayName: 'Pedro Paulo',
    farmName: 'Sitio Esperanca',
    producerRole: 'Agricultor Familiar',
    farmAddress: 'Rio Verde, GO',
    farmAddressNumber: '123',
    farmAddressReference: '',
    farmCep: '75903080',
    isCepValidated: true,
    isGatePinConfirmed: true,
    bio: 'Agricultor familiar com foco em manejo orgânico.',
    avatarUri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
    farmPhotos: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'],
    reviews: [...PRODUCER_REVIEWS_MOCK],
    listings: [{ id: 'lp1', title: 'Tomate orgânico - caixa 15kg', type: 'venda', price: 'R$ 110,00' }],
    insumos: [],
    certificates: [],
  },
  'Sitio': {
    username: 'Sitio',
    displayName: 'Produtor Sitio',
    farmName: 'Sitio Principal',
    producerRole: 'Agricultor Familiar',
    farmAddress: 'Rio Verde, GO',
    farmAddressNumber: '123',
    farmAddressReference: '',
    farmCep: '75903080',
    isCepValidated: true,
    isGatePinConfirmed: true,
    bio: 'Agricultor familiar focado em cestas orgânicas.',
    avatarUri: undefined, // Deixamos undefined para o usuário poder subir a sua própria
    farmPhotos: [],
    reviews: [...PRODUCER_REVIEWS_MOCK],
    listings: [{ id: 'teste_sitio_1', title: 'Cesta Orgânica Completa - Teste', type: 'venda', price: 'R$ 85,00' }],
    insumos: [],
    certificates: [],
  },
  'Sitio Principal': {
    username: 'Sitio',
    displayName: 'Sitio Principal',
    farmName: 'Sitio Principal',
    producerRole: 'Agricultor Familiar',
    farmAddress: 'Rio Verde, GO',
    farmAddressNumber: '123',
    farmAddressReference: '',
    farmCep: '75903080',
    isCepValidated: true,
    isGatePinConfirmed: true,
    bio: 'Agricultor familiar focado em cestas orgânicas.',
    avatarUri: undefined,
    farmPhotos: [],
    reviews: [...PRODUCER_REVIEWS_MOCK],
    listings: [{ id: 'teste_sitio_1', title: 'Cesta Orgânica Completa - Teste', type: 'venda', price: 'R$ 85,00' }],
    insumos: [],
    certificates: [],
  }
};

const COMMUNITY_STORAGE_KEY = '@terra_nova/community_profiles';
let isCommunityStoreInitialized = false;

const persistCommunityStore = async () => {
  try {
    await AsyncStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(profiles));
  } catch { }
};

const normalizeText = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

const resolveProfileKey = (name: string): string | null => {
  const target = normalizeText(name);
  for (const key of Object.keys(profiles)) {
    if (normalizeText(key) === target) return key;
  }
  for (const [key, profile] of Object.entries(profiles)) {
    if (normalizeText(profile.displayName) === target || normalizeText(profile.farmName) === target) {
      return key;
    }
  }
  return null;
};

export const initCommunityStore = async () => {
  if (isCommunityStoreInitialized) return;
  await refreshCommunityStore();
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
    Object.entries(parsed).forEach(([key, value]: [string, any]) => {
      if (profiles[key]) {
        profiles[key] = { ...profiles[key], ...value };
      } else {
        profiles[key] = value;
      }
    });
  } catch { }
  isCommunityStoreInitialized = true;
};

export const getProfile = (name: string, role?: 'producer' | 'buyer'): CommunityProfile => {
  const resolvedKey = resolveProfileKey(name);
  if (resolvedKey) return profiles[resolvedKey];

  profiles[name] = {
    username: name, // Usamos o próprio nome como username padrão se não houver
    displayName: name,
    farmName: 'Minha Fazenda',
    producerRole: 'Produtor Rural',
    farmAddress: 'Endereco nao informado',
    farmAddressNumber: '',
    farmAddressReference: '',
    farmCep: '',
    isCepValidated: false,
    isGatePinConfirmed: false,
    bio: 'Participante da comunidade Terra Nova.',
    farmPhotos: [],
    reviews: role === 'buyer' ? [...BUYER_REVIEWS_MOCK] : [...PRODUCER_REVIEWS_MOCK],
    listings: [],
    insumos: [],
    certificates: [],
  };
  return profiles[name];
};

export const getReviews = (name: string, role?: 'producer' | 'buyer') => {
  const profile = getProfile(name, role);
  if (profile.reviews.length === 0) {
    profile.reviews = role === 'buyer' ? [...BUYER_REVIEWS_MOCK] : [...PRODUCER_REVIEWS_MOCK];
  }
  return [...profile.reviews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getAverageRating = (name: string, role?: 'producer' | 'buyer') => {
  const reviews = getReviews(name, role);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, item) => acc + item.stars, 0);
  return Number((sum / reviews.length).toFixed(1));
};

export const getFarmPhotos = (name: string) => [...getProfile(name).farmPhotos];
export const getProfileAvatar = (name: string) => getProfile(name).avatarUri ?? null;
export const getProfileSummary = (name: string) => getProfile(name);

export const updateProfileSummary = async (name: string, payload: Partial<CommunityProfile>) => {
  const profile = getProfile(name);
  Object.assign(profile, payload);
  await persistCommunityStore();
};

export const setProfileAvatar = async (name: string, uri: string) => {
  const profile = getProfile(name);
  profile.avatarUri = uri;
  await persistCommunityStore();
};

export const addFarmPhoto = (name: string, uri: string): { ok: boolean; reason?: string } => {
  const profile = getProfile(name);
  if (profile.farmPhotos.length >= 5) return { ok: false, reason: 'max' };
  profile.farmPhotos.push(uri);
  void persistCommunityStore();
  return { ok: true };
};

export const removeFarmPhoto = (name: string, uri: string) => {
  const profile = getProfile(name);
  profile.farmPhotos = profile.farmPhotos.filter((item) => item !== uri);
  void persistCommunityStore();
};

export const addReview = (targetName: string, payload: Omit<Review, 'id' | 'date'>) => {
  const profile = getProfile(targetName);
  profile.reviews.unshift({ ...payload, id: Math.random().toString(36).slice(2), date: new Date().toISOString().slice(0, 10) });
  void persistCommunityStore();
};

export const getCertificates = (name: string, status?: CertificateStatus) => {
  const certificates = getProfile(name).certificates;
  return status ? certificates.filter((item) => item.status === status) : [...certificates];
};

export const addCertificate = (name: string, payload: Omit<Certificate, 'id'>) => {
  const profile = getProfile(name);
  profile.certificates.unshift({ ...payload, id: Math.random().toString(36).slice(2) });
  void persistCommunityStore();
};
