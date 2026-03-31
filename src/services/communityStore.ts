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
  author: string;
  role: ReviewRole;
  stars: number;
  comment: string;
  date: string;
};

type CommunityProfile = {
  displayName: string;
  farmName: string;
  producerRole: string;
  farmAddress: string;
  farmCep: string;
  gateLatitude?: number;
  gateLongitude?: number;
  isCepValidated: boolean;
  isGatePinConfirmed: boolean;
  locationValidatedAt?: string;
  bio: string;
  avatarUri?: string;
  farmPhotos: string[];
  reviews: Review[];
  listings: Array<{ id: string; title: string; type: 'venda' | 'doacao'; price?: string }>;
  insumos: Array<{ id: string; title: string; amount: string }>;
  certificates: Certificate[];
};

const profiles: Record<string, CommunityProfile> = {
  'Pedro Paulo': {
    displayName: 'Pedro Paulo',
    farmName: 'Sitio Esperanca',
    producerRole: 'Agricultor Familiar',
    farmAddress: 'Rio Verde, GO',
    farmCep: '',
    gateLatitude: undefined,
    gateLongitude: undefined,
    isCepValidated: false,
    isGatePinConfirmed: false,
    locationValidatedAt: undefined,
    bio: 'Agricultor familiar com foco em manejo orgânico e compostagem.',
    avatarUri: undefined,
    farmPhotos: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=80',
    ],
    reviews: [
      {
        id: 'r1',
        author: 'Comprador Local',
        role: 'cliente',
        stars: 5,
        comment: 'Produto de qualidade e entrega no prazo.',
        date: '2026-03-20',
      },
    ],
    listings: [
      { id: 'lp1', title: 'Tomate orgânico - caixa 15kg', type: 'venda', price: 'R$ 110,00' },
      { id: 'lp2', title: 'Alface crespa - 30 unidades', type: 'doacao' },
    ],
    insumos: [
      { id: 'ip1', title: 'Esterco bovino curtido', amount: '2 toneladas' },
      { id: 'ip2', title: 'Composto orgânico', amount: '600 kg' },
    ],
    certificates: [
      {
        id: 'cp1',
        title: 'Cadastro de Produtor no SIPEAGRO',
        number: 'PROC-2026-000128',
        issuer: 'MAPA / SIPEAGRO',
        issueDate: '15/03/2026',
        expiryDate: 'Em análise',
        verification: 'https://www.gov.br/agricultura/pt-br/assuntos/insumos-agropecuarios/sipeagro',
        status: 'pending',
      },
      {
        id: 'cp2',
        title: 'Registro de Estabelecimento Agropecuário',
        number: 'MAPA-REG-458921',
        issuer: 'Ministério da Agricultura e Pecuária',
        issueDate: '12/08/2025',
        expiryDate: '12/08/2027',
        verification: 'https://www.gov.br/agricultura',
        status: 'approved',
      },
    ],
  },
  'Fazenda Sao Joao': {
    displayName: 'Fazenda São João',
    farmName: 'Fazenda Sao Joao',
    producerRole: 'Produtor Rural',
    farmAddress: 'Jatai, GO',
    farmCep: '',
    gateLatitude: undefined,
    gateLongitude: undefined,
    isCepValidated: false,
    isGatePinConfirmed: false,
    locationValidatedAt: undefined,
    bio: 'Produtor de bioinsumos e parceiro local para logística rural.',
    avatarUri: undefined,
    farmPhotos: [
      'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
    ],
    reviews: [
      {
        id: 'r2',
        author: 'Sítio Esperança',
        role: 'cliente',
        stars: 5,
        comment: 'Negociação transparente e material conforme anúncio.',
        date: '2026-03-19',
      },
      {
        id: 'r3',
        author: 'Produtor Parceiro',
        role: 'vendedor',
        stars: 4,
        comment: 'Comprador comunicativo e pagamento sem atraso.',
        date: '2026-03-21',
      },
    ],
    listings: [
      { id: 'lf1', title: 'Milho orgânico - saco 60kg', type: 'venda', price: 'R$ 145,00' },
      { id: 'lf2', title: 'Mudas de capim para cobertura', type: 'doacao' },
    ],
    insumos: [
      { id: 'if1', title: 'Cama de frango', amount: '12 toneladas' },
      { id: 'if2', title: 'Biofertilizante líquido', amount: '450 litros' },
    ],
    certificates: [],
  },
};

const COMMUNITY_STORAGE_KEY = '@terra_nova/community_profiles';
let isCommunityStoreInitialized = false;

const persistCommunityStore = async () => {
  try {
    await AsyncStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    // Ignore persistence errors to avoid blocking profile flows.
  }
};

export const initCommunityStore = async () => {
  if (isCommunityStoreInitialized) return;

  try {
    const raw = await AsyncStorage.getItem(COMMUNITY_STORAGE_KEY);

    if (!raw) {
      await persistCommunityStore();
      isCommunityStoreInitialized = true;
      return;
    }

    const parsed = JSON.parse(raw) as Record<string, Partial<CommunityProfile>>;

    Object.entries(parsed).forEach(([key, value]) => {
      const current = profiles[key] ?? {
        displayName: key,
        farmName: 'Minha Fazenda',
        producerRole: 'Produtor Rural',
        farmAddress: 'Endereco nao informado',
        farmCep: '',
        gateLatitude: undefined,
        gateLongitude: undefined,
        isCepValidated: false,
        isGatePinConfirmed: false,
        locationValidatedAt: undefined,
        bio: 'Produtor cadastrado na comunidade Terra Nova.',
        avatarUri: undefined,
        farmPhotos: [],
        reviews: [],
        listings: [],
        insumos: [],
        certificates: [],
      };

      profiles[key] = {
        displayName: value.displayName ?? current.displayName,
        farmName: value.farmName ?? current.farmName,
        producerRole: value.producerRole ?? current.producerRole,
        farmAddress: value.farmAddress ?? current.farmAddress,
        farmCep: value.farmCep ?? current.farmCep,
        gateLatitude:
          typeof value.gateLatitude === 'number' ? value.gateLatitude : current.gateLatitude,
        gateLongitude:
          typeof value.gateLongitude === 'number' ? value.gateLongitude : current.gateLongitude,
        isCepValidated:
          typeof value.isCepValidated === 'boolean'
            ? value.isCepValidated
            : current.isCepValidated,
        isGatePinConfirmed:
          typeof value.isGatePinConfirmed === 'boolean'
            ? value.isGatePinConfirmed
            : current.isGatePinConfirmed,
        locationValidatedAt:
          typeof value.locationValidatedAt === 'string'
            ? value.locationValidatedAt
            : current.locationValidatedAt,
        bio: value.bio ?? current.bio,
        avatarUri: value.avatarUri ?? current.avatarUri,
        farmPhotos: Array.isArray(value.farmPhotos) ? value.farmPhotos : current.farmPhotos,
        reviews: Array.isArray(value.reviews) ? value.reviews : current.reviews,
        listings: Array.isArray(value.listings) ? value.listings : current.listings,
        insumos: Array.isArray(value.insumos) ? value.insumos : current.insumos,
        certificates: Array.isArray(value.certificates)
          ? value.certificates
          : current.certificates,
      };
    });
  } catch {
    // Fall back to in-memory defaults when storage is unavailable or malformed.
  }

  isCommunityStoreInitialized = true;
};

export const normalizeProfileName = (name: string) => name.replace('São', 'Sao');

export const getProfile = (name: string): CommunityProfile => {
  const key = normalizeProfileName(name);
  if (!profiles[key]) {
    profiles[key] = {
      displayName: name,
      farmName: 'Minha Fazenda',
      producerRole: 'Produtor Rural',
      farmAddress: 'Endereco nao informado',
      farmCep: '',
      gateLatitude: undefined,
      gateLongitude: undefined,
      isCepValidated: false,
      isGatePinConfirmed: false,
      locationValidatedAt: undefined,
      bio: 'Produtor cadastrado na comunidade Terra Nova.',
      avatarUri: undefined,
      farmPhotos: [],
      reviews: [],
      listings: [],
      insumos: [],
      certificates: [],
    };
  }
  return profiles[key];
};

export const getFarmPhotos = (name: string) => [...getProfile(name).farmPhotos];

export const getProfileAvatar = (name: string) => getProfile(name).avatarUri ?? null;

export const getProfileSummary = (name: string) => {
  const profile = getProfile(name);
  return {
    displayName: profile.displayName,
    farmName: profile.farmName,
    producerRole: profile.producerRole,
    farmAddress: profile.farmAddress,
    farmCep: profile.farmCep,
    gateLatitude: profile.gateLatitude ?? null,
    gateLongitude: profile.gateLongitude ?? null,
    isCepValidated: profile.isCepValidated,
    isGatePinConfirmed: profile.isGatePinConfirmed,
    locationValidatedAt: profile.locationValidatedAt ?? null,
    bio: profile.bio,
    avatarUri: profile.avatarUri ?? null,
  };
};

export const updateProfileSummary = (
  name: string,
  payload: {
    displayName: string;
    farmName: string;
    producerRole: string;
    farmAddress: string;
    farmCep: string;
    gateLatitude?: number;
    gateLongitude?: number;
    isCepValidated: boolean;
    isGatePinConfirmed: boolean;
    locationValidatedAt?: string;
    bio: string;
  },
) => {
  const profile = getProfile(name);
  profile.displayName = payload.displayName;
  profile.farmName = payload.farmName;
  profile.producerRole = payload.producerRole;
  profile.farmAddress = payload.farmAddress;
  profile.farmCep = payload.farmCep;
  profile.gateLatitude = payload.gateLatitude;
  profile.gateLongitude = payload.gateLongitude;
  profile.isCepValidated = payload.isCepValidated;
  profile.isGatePinConfirmed = payload.isGatePinConfirmed;
  profile.locationValidatedAt = payload.locationValidatedAt;
  profile.bio = payload.bio;
  void persistCommunityStore();
};

export const setProfileAvatar = (name: string, uri: string) => {
  const profile = getProfile(name);
  profile.avatarUri = uri;
  void persistCommunityStore();
};

export const addFarmPhoto = (name: string, uri: string): { ok: boolean; reason?: string } => {
  const profile = getProfile(name);
  if (profile.farmPhotos.length >= 5) {
    return { ok: false, reason: 'max' };
  }
  profile.farmPhotos.push(uri);
  void persistCommunityStore();
  return { ok: true };
};

export const removeFarmPhoto = (name: string, uri: string) => {
  const profile = getProfile(name);
  profile.farmPhotos = profile.farmPhotos.filter((item) => item !== uri);
  void persistCommunityStore();
};

export const addReview = (
  targetName: string,
  payload: Omit<Review, 'id' | 'date'>
) => {
  const profile = getProfile(targetName);
  profile.reviews.unshift({
    ...payload,
    id: Math.random().toString(36).slice(2),
    date: new Date().toISOString().slice(0, 10),
  });
  void persistCommunityStore();
};

export const getReviews = (name: string) => [...getProfile(name).reviews];

export const getAverageRating = (name: string) => {
  const reviews = getProfile(name).reviews;
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, item) => acc + item.stars, 0);
  return Number((sum / reviews.length).toFixed(1));
};

export const getCertificates = (name: string, status?: CertificateStatus) => {
  const certificates = getProfile(name).certificates;
  if (!status) return [...certificates];
  return certificates.filter((item) => item.status === status);
};

export const addCertificate = (
  name: string,
  payload: Omit<Certificate, 'id'>
) => {
  const profile = getProfile(name);
  profile.certificates.unshift({
    ...payload,
    id: Math.random().toString(36).slice(2),
  });
  void persistCommunityStore();
};
