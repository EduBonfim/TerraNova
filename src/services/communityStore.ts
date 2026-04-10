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
  negotiatedItem?: string;
};

type CommunityProfile = {
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
    farmAddressNumber: '123',
    farmAddressReference: 'Próximo ao rio',
    farmCep: '75903080',
    gateLatitude: -17.7915,
    gateLongitude: -50.9002,
    isCepValidated: true,
    isGatePinConfirmed: true,
    locationValidatedAt: '2026-03-30T10:10:00.000Z',
    bio: 'Agricultor familiar com foco em manejo orgânico e compostagem.',
    avatarUri:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
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
      {
        id: 'r1b',
        author: 'Fazenda São João',
        role: 'vendedor',
        stars: 4,
        comment: 'Negociação objetiva e retirada organizada.',
        date: '2026-03-26',
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
    farmAddressNumber: 'KM 20',
    farmAddressReference: '',
    farmCep: '75800000',
    gateLatitude: -17.8205,
    gateLongitude: -50.8878,
    isCepValidated: true,
    isGatePinConfirmed: true,
    locationValidatedAt: '2026-03-29T15:40:00.000Z',
    bio: 'Produtor de bioinsumos e parceiro local para logística rural.',
    avatarUri:
      'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=900&q=80',
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
  'Sitio Esperanca': {
    displayName: 'Sítio Esperança',
    farmName: 'Sitio Esperanca',
    producerRole: 'Produtor Rural',
    farmAddress: 'Rio Verde, GO',
    farmAddressNumber: '456',
    farmAddressReference: 'Próximo ao rio Verde',
    farmCep: '75915020',
    gateLatitude: -17.7681,
    gateLongitude: -50.9523,
    isCepValidated: true,
    isGatePinConfirmed: true,
    locationValidatedAt: '2026-03-28T09:00:00.000Z',
    bio: 'Produtor parceiro com foco em esterco bovino curtido e trocas locais.',
    avatarUri:
      'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=900&q=80',
    farmPhotos: [
      'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=80',
    ],
    reviews: [
      {
        id: 'r4',
        author: 'Comprador da região',
        role: 'cliente',
        stars: 5,
        comment: 'Atendimento rápido e material conforme combinado.',
        date: '2026-03-24',
      },
      {
        id: 'r4b',
        author: 'Cooperativa Local',
        role: 'cliente',
        stars: 4,
        comment: 'Produto consistente e bom custo-benefício.',
        date: '2026-03-27',
      },
    ],
    listings: [
      { id: 'ls1', title: 'Ovos caipira - bandeja 30 unidades', type: 'venda', price: 'R$ 25,00' },
      { id: 'ls2', title: 'Abóbora orgânica - unidade', type: 'venda', price: 'R$ 18,00' },
    ],
    insumos: [
      { id: 'is1', title: 'Esterco bovino curtido', amount: '2 toneladas' },
    ],
    certificates: [],
  },
  'Central Compostagem': {
    displayName: 'Central Compostagem',
    farmName: 'Central Compostagem',
    producerRole: 'Cooperativa',
    farmAddress: 'Jatai, GO',
    farmAddressNumber: 'S/N',
    farmAddressReference: '',
    farmCep: '75801590',
    gateLatitude: -17.7915,
    gateLongitude: -50.9201,
    isCepValidated: true,
    isGatePinConfirmed: true,
    locationValidatedAt: '2026-03-30T08:30:00.000Z',
    bio: 'Cooperativa regional para compostagem e logística de bioinsumos.',
    avatarUri:
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80',
    farmPhotos: [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=80',
    ],
    reviews: [
      {
        id: 'r5',
        author: 'Produtor local',
        role: 'cliente',
        stars: 4,
        comment: 'Boa disponibilidade e atendimento técnico.',
        date: '2026-03-22',
      },
    ],
    listings: [
      { id: 'lc1', title: 'Composto orgânico premium - 1m³', type: 'venda', price: 'R$ 210,00' },
    ],
    insumos: [
      { id: 'ic1', title: 'Composto orgânico', amount: '4 toneladas' },
      { id: 'ic2', title: 'Biofertilizante líquido', amount: '800 litros' },
    ],
    certificates: [],
  },
  'Central Compostagem Comunitaria': {
    displayName: 'Central Compostagem Comunitária',
    farmName: 'Central Compostagem Comunitaria',
    producerRole: 'Cooperativa',
    farmAddress: 'Jatai, GO',
    farmAddressNumber: 'S/N',
    farmAddressReference: '',
    farmCep: '75801590',
    gateLatitude: -17.7915,
    gateLongitude: -50.9201,
    isCepValidated: true,
    isGatePinConfirmed: true,
    locationValidatedAt: '2026-03-30T08:30:00.000Z',
    bio: 'Cooperativa regional para compostagem e logística de bioinsumos.',
    avatarUri:
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80',
    farmPhotos: [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=80',
    ],
    reviews: [
      {
        id: 'r6',
        author: 'Produtor local',
        role: 'cliente',
        stars: 4,
        comment: 'Coleta e entrega dentro do combinado.',
        date: '2026-03-25',
      },
    ],
    listings: [
      { id: 'lcc1', title: 'Composto orgânico premium - 1m3', type: 'venda', price: 'R$ 210,00' },
    ],
    insumos: [
      { id: 'icc1', title: 'Composto orgânico', amount: '4 toneladas' },
    ],
    certificates: [],
  },
  'Sitio Boa Terra': {
    displayName: 'Sítio Boa Terra',
    farmName: 'Sitio Boa Terra',
    producerRole: 'Produtor Agroecológico',
    farmAddress: 'Montes Claros, MG',
    farmAddressNumber: '505',
    farmAddressReference: '',
    farmCep: '39400000',
    gateLatitude: -16.7334,
    gateLongitude: -43.8619,
    isCepValidated: true,
    isGatePinConfirmed: true,
    locationValidatedAt: '2026-03-28T14:20:00.000Z',
    bio: 'Sítio familiar com foco em horticultura orgânica, compostagem termofílica e adubação verde.',
    avatarUri:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
    farmPhotos: [
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595351298020-038700609878?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=1200&q=80',
    ],
    reviews: [
      {
        id: 'r_bt_1',
        author: 'Chácara Horizonte',
        role: 'cliente',
        stars: 5,
        comment: 'Composto muito homogêneo e atendimento excelente.',
        date: '2026-03-18',
      },
      {
        id: 'r_bt_2',
        author: 'Coop Norte Verde',
        role: 'cliente',
        stars: 4,
        comment: 'Entrega dentro do prazo, material com ótima umidade.',
        date: '2026-03-23',
      },
      {
        id: 'r_bt_3',
        author: 'Sítio Esperança',
        role: 'vendedor',
        stars: 5,
        comment: 'Negociação justa e comunicação rápida.',
        date: '2026-03-27',
      },
    ],
    listings: [
      { id: 'l_bt_1', title: 'Alface americana orgânica - 40 unidades', type: 'venda', price: 'R$ 2,50/un' },
      { id: 'l_bt_2', title: 'Couve manteiga orgânica - maço', type: 'venda', price: 'R$ 3,50' },
    ],
    insumos: [
      { id: 'i_bt_1', title: 'Composto orgânico peneirado', amount: '1,2 toneladas' },
      { id: 'i_bt_2', title: 'Biofertilizante líquido', amount: '300 litros' },
    ],
    certificates: [
      {
        id: 'c_bt_1',
        title: 'Cadastro de Produtor Orgânico',
        number: 'OPAC-MG-2026-117',
        issuer: 'OPAC Regional MG',
        issueDate: '10/02/2026',
        expiryDate: '10/02/2028',
        verification: 'https://www.gov.br/agricultura',
        status: 'approved',
      },
    ],
  },
  'Sitio Vale Azul': {
    displayName: 'Sítio Vale Azul',
    farmName: 'Sitio Vale Azul',
    producerRole: 'Produtor Rural',
    farmAddress: 'Cascavel, PR',
    farmAddressNumber: '606',
    farmAddressReference: '',
    farmCep: '85800000',
    gateLatitude: -24.9555,
    gateLongitude: -53.4552,
    isCepValidated: true,
    isGatePinConfirmed: true,
    locationValidatedAt: '2026-03-26T09:45:00.000Z',
    bio: 'Produção integrada de grãos e pecuária com reaproveitamento de resíduos orgânicos.',
    avatarUri:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
    farmPhotos: [
      'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511131341194-24e2eeeebb09?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80',
    ],
    reviews: [
      {
        id: 'r_va_1',
        author: 'Fazenda São João',
        role: 'cliente',
        stars: 5,
        comment: 'Cama de aviário bem curtida, sem impurezas.',
        date: '2026-03-14',
      },
      {
        id: 'r_va_2',
        author: 'Produtor parceiro',
        role: 'cliente',
        stars: 4,
        comment: 'Retirada organizada e carregamento rápido.',
        date: '2026-03-19',
      },
      {
        id: 'r_va_3',
        author: 'Central Compostagem',
        role: 'vendedor',
        stars: 4,
        comment: 'Volume entregue conforme combinado.',
        date: '2026-03-25',
      },
    ],
    listings: [
      { id: 'l_va_1', title: 'Milho orgânico - saco 60kg', type: 'venda', price: 'R$ 142,00' },
      { id: 'l_va_2', title: 'Abóbora cabotiá orgânica - caixa', type: 'venda', price: 'R$ 85,00' },
    ],
    insumos: [
      { id: 'i_va_1', title: 'Cama de aviário curtida', amount: '9 toneladas' },
      { id: 'i_va_2', title: 'Palhada de cobertura', amount: '2,5 toneladas' },
    ],
    certificates: [
      {
        id: 'c_va_1',
        title: 'Registro de Estabelecimento Agropecuário',
        number: 'MAPA-PR-558302',
        issuer: 'MAPA',
        issueDate: '22/11/2025',
        expiryDate: '22/11/2027',
        verification: 'https://www.gov.br/agricultura',
        status: 'approved',
      },
    ],
  },
  'Sitio Nova Raiz': {
    displayName: 'Sítio Nova Raiz',
    farmName: 'Sitio Nova Raiz',
    producerRole: 'Agricultor Familiar',
    farmAddress: 'Anápolis, GO',
    farmAddressNumber: '707',
    farmAddressReference: '',
    farmCep: '75000000',
    gateLatitude: -16.3281,
    gateLongitude: -48.9534,
    isCepValidated: true,
    isGatePinConfirmed: false,
    locationValidatedAt: '2026-03-20T16:15:00.000Z',
    bio: 'Transição agroecológica com foco em hortaliças e bioinsumos de baixo impacto.',
    avatarUri:
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80',
    farmPhotos: [
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=80',
    ],
    reviews: [
      {
        id: 'r_nr_1',
        author: 'Mercado Local',
        role: 'cliente',
        stars: 5,
        comment: 'Produtos frescos e ótima embalagem.',
        date: '2026-03-11',
      },
      {
        id: 'r_nr_2',
        author: 'Sítio Boa Terra',
        role: 'cliente',
        stars: 4,
        comment: 'Composto com ótima textura para canteiro.',
        date: '2026-03-16',
      },
      {
        id: 'r_nr_3',
        author: 'Comprador urbano',
        role: 'cliente',
        stars: 5,
        comment: 'Entrega pontual e negociação transparente.',
        date: '2026-03-29',
      },
    ],
    listings: [
      { id: 'l_nr_1', title: 'Rúcula orgânica - maço', type: 'venda', price: 'R$ 4,00' },
      { id: 'l_nr_2', title: 'Mudas de alface - bandeja', type: 'doacao' },
    ],
    insumos: [
      { id: 'i_nr_1', title: 'Composto orgânico maturado', amount: '700 kg' },
      { id: 'i_nr_2', title: 'Húmus de minhoca', amount: '150 kg' },
    ],
    certificates: [
      {
        id: 'c_nr_1',
        title: 'Cadastro SIPEAGRO',
        number: 'SIPEAGRO-GO-9912',
        issuer: 'MAPA / SIPEAGRO',
        issueDate: '03/01/2026',
        expiryDate: 'Em análise',
        verification: 'https://www.gov.br/agricultura/pt-br/assuntos/insumos-agropecuarios/sipeagro',
        status: 'pending',
      },
    ],
  },
  'Sitio1': {
    displayName: 'Joao do Sitio 1',
    farmName: 'Sitio 1 - Rio Verde',
    producerRole: 'Produtor de Grãos',
    farmAddress: 'Rio Verde, GO',
    farmAddressNumber: '101',
    farmAddressReference: '',
    farmCep: '75901000',
    gateLatitude: -17.7915,
    gateLongitude: -50.9201,
    isCepValidated: true,
    isGatePinConfirmed: true,
    locationValidatedAt: '2026-04-01T08:00:00.000Z',
    bio: 'Foco em soja e milho com rotação de culturas e manejo de precisão.',
    avatarUri: 'https://images.unsplash.com/photo-1542838132-92bd5172811e?auto=format&fit=crop&w=150&q=80',
    farmPhotos: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80',
    ],
    reviews: [
      { id: 'rs1_1', author: 'Sitio2', role: 'vendedor', stars: 5, comment: 'Excelente parceria na safra passada.', date: '2026-03-30' }
    ],
    listings: [
      { id: 'ls1_1', title: 'Soja em grão - Ton', type: 'venda', price: 'R$ 1.850,00' }
    ],
    insumos: [{ id: 'is1_1', title: 'Adubo NPK', amount: '5 toneladas' }],
    certificates: [
      {
        id: 'cs1_1',
        title: 'Certificado de Produção Sustentável',
        number: 'SUS-99128',
        issuer: 'Abrapa',
        issueDate: '01/01/2026',
        expiryDate: '01/01/2028',
        verification: 'https://abrapa.com.br',
        status: 'approved'
      },
      {
        id: 'cs1_2',
        title: 'Protocolo de Baixo Carbono',
        number: 'CARB-2026',
        issuer: 'Embrapa',
        issueDate: '15/03/2026',
        expiryDate: 'Em análise',
        verification: 'https://embrapa.br',
        status: 'pending'
      }
    ]
  },
  'Sitio2': {
    displayName: 'Maria do Sitio 2',
    farmName: 'Sitio 2 - Maringa',
    producerRole: 'Horticultora Orgânica',
    farmAddress: 'Maringá, PR',
    farmAddressNumber: '202',
    farmAddressReference: '',
    farmCep: '87010000',
    gateLatitude: -23.4209,
    gateLongitude: -51.9331,
    isCepValidated: true,
    isGatePinConfirmed: true,
    locationValidatedAt: '2026-04-02T10:00:00.000Z',
    bio: 'Especialista em folhosas e legumes orgânicos certificados para o mercado regional.',
    avatarUri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    farmPhotos: [
      'https://images.unsplash.com/photo-1599599810694-f3e2ba41eb38?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=80',
    ],
    reviews: [
      { id: 'rs2_1', author: 'Sitio3', role: 'cliente', stars: 4, comment: 'Produtos muito frescos.', date: '2026-04-01' }
    ],
    listings: [
      { id: 'ls2_1', title: 'Caixa de Tomate Orgânico', type: 'venda', price: 'R$ 80,00' }
    ],
    insumos: [{ id: 'is2_1', title: 'Sementes Variadas', amount: '200 pacotes' }],
    certificates: []
  },
  'Sitio3': {
    displayName: 'Jose do Sitio 3',
    farmName: 'Sitio 3 - Jatai',
    producerRole: 'Produtor Rural',
    farmAddress: 'Jataí, GO',
    farmAddressNumber: '303',
    farmAddressReference: '',
    farmCep: '75800000',
    gateLatitude: -17.8814,
    gateLongitude: -51.7144,
    isCepValidated: true,
    isGatePinConfirmed: true,
    locationValidatedAt: '2026-03-25T14:00:00.000Z',
    bio: 'Produção diversificada com foco em gado de corte e integração lavoura-pecuária.',
    avatarUri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    farmPhotos: [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
    ],
    reviews: [],
    listings: [
      { id: 'ls3_1', title: 'Bezerros Nelore', type: 'venda', price: 'Sob consulta' }
    ],
    insumos: [],
    certificates: []
  },
  'Sitio4': {
    displayName: 'Ana do Sitio 4',
    farmName: 'Sitio 4 - Uberlandia',
    producerRole: 'Fruticultora',
    farmAddress: 'Uberlândia, MG',
    farmAddressNumber: '404',
    farmAddressReference: '',
    farmCep: '38400000',
    gateLatitude: -18.9113,
    gateLongitude: -48.2622,
    isCepValidated: true,
    isGatePinConfirmed: true,
    locationValidatedAt: '2026-03-28T16:00:00.000Z',
    bio: 'Pomar de frutas tropicais atendendo cooperativas locais.',
    avatarUri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    farmPhotos: [
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80',
    ],
    reviews: [],
    listings: [
      { id: 'ls4_1', title: 'Laranja Pera - Caixa', type: 'venda', price: 'R$ 45,00' }
    ],
    insumos: [],
    certificates: []
  },
  'Sitio5': {
    displayName: 'Carlos do Sitio 5',
    farmName: 'Sitio 5 - Sorriso',
    producerRole: 'Grande Produtor',
    farmAddress: 'Sorriso, MT',
    farmAddressNumber: '808',
    farmAddressReference: '',
    farmCep: '78890000',
    gateLatitude: -12.5507,
    gateLongitude: -55.7158,
    isCepValidated: true,
    isGatePinConfirmed: true,
    locationValidatedAt: '2026-03-30T09:00:00.000Z',
    bio: 'Operação mecanizada em larga escala no coração do Mato Grosso.',
    avatarUri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    farmPhotos: [
      'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=1200&q=80',
    ],
    reviews: [],
    listings: [
      { id: 'ls5_1', title: 'Milho Safrinha - Ton', type: 'venda', price: 'R$ 1.200,00' }
    ],
    insumos: [],
    certificates: []
  },
  'Sitio': {
    displayName: 'Produtor Sitio',
    farmName: 'Minha Fazenda',
    producerRole: 'Agricultor Familiar',
    farmAddress: 'Rio Verde, GO',
    farmAddressNumber: '123',
    farmAddressReference: 'Próximo ao rio',
    farmCep: '75903080',
    gateLatitude: -17.7915,
    gateLongitude: -50.9002,
    isCepValidated: true,
    isGatePinConfirmed: true,
    locationValidatedAt: '2026-03-30T10:10:00.000Z',
    bio: 'Agricultor familiar com foco em manejo orgânico.',
    avatarUri:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
    farmPhotos: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    ],
    reviews: [],
    listings: [
      { id: 'ls_sitio_1', title: 'Tomate orgânico - caixa 15kg', type: 'venda', price: 'R$ 110,00' },
    ],
    insumos: [
      { id: 'is_1', title: 'Esterco bovino curtido', amount: '2 toneladas' },
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
        farmAddressNumber: '',
        farmAddressReference: '',
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
        farmAddressNumber: value.farmAddressNumber ?? current.farmAddressNumber,
        farmAddressReference: value.farmAddressReference ?? current.farmAddressReference,
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

/**
 * Force reload community store from AsyncStorage (bypassing the init flag)
 * Use this when you need to refresh data after making changes elsewhere
 */
export const refreshCommunityStore = async () => {
  try {
    const raw = await AsyncStorage.getItem(COMMUNITY_STORAGE_KEY);

    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw) as Record<string, Partial<CommunityProfile>>;

    Object.entries(parsed).forEach(([key, value]) => {
      const current = profiles[key] ?? {
        displayName: key,
        farmName: 'Minha Fazenda',
        producerRole: 'Produtor Rural',
        farmAddress: 'Endereco nao informado',
        farmAddressNumber: '',
        farmAddressReference: '',
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
        farmAddressNumber: value.farmAddressNumber ?? current.farmAddressNumber,
        farmAddressReference: value.farmAddressReference ?? current.farmAddressReference,
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
  } catch (error) {
    // Fall back silently if storage is unavailable or malformed
  }
};

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

export const normalizeProfileName = (name: string) => normalizeText(name);

const resolveProfileKey = (name: string): string | null => {
  const target = normalizeText(name);

  for (const key of Object.keys(profiles)) {
    if (normalizeText(key) === target) {
      return key;
    }
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

export const getProfile = (name: string): CommunityProfile => {
  const resolvedKey = resolveProfileKey(name);
  
  if (resolvedKey) {
    return profiles[resolvedKey];
  }

  profiles[name] = {
      displayName: name,
      farmName: 'Minha Fazenda',
      producerRole: 'Produtor Rural',
      farmAddress: 'Endereco nao informado',
      farmAddressNumber: '',
      farmAddressReference: '',
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

  return profiles[name];
};

export const getFarmPhotos = (name: string) => [...getProfile(name).farmPhotos];

export const getProfileAvatar = (name: string) => getProfile(name).avatarUri ?? null;

export const getProfileSummary = (name: string): CommunityProfile => {
  const profile = getProfile(name);
  const summary = { ...profile };
  // Return a new object reference to ensure React detects changes
  return summary;
};

export const updateProfileSummary = async (
  name: string,
  payload: {
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
  },
) => {
  const profile = getProfile(name);
  profile.displayName = payload.displayName;
  profile.farmName = payload.farmName;
  profile.producerRole = payload.producerRole;
  profile.farmAddress = payload.farmAddress;
  profile.farmAddressNumber = payload.farmAddressNumber;
  profile.farmAddressReference = payload.farmAddressReference;
  profile.farmCep = payload.farmCep;
  profile.gateLatitude = payload.gateLatitude;
  profile.gateLongitude = payload.gateLongitude;
  profile.isCepValidated = payload.isCepValidated;
  profile.isGatePinConfirmed = payload.isGatePinConfirmed;
  profile.locationValidatedAt = payload.locationValidatedAt;
  profile.bio = payload.bio;
  
  await persistCommunityStore();
};

export const setProfileAvatar = async (name: string, uri: string) => {
  const profile = getProfile(name);
  profile.avatarUri = uri;
  await persistCommunityStore();
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
