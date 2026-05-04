import AsyncStorage from "@react-native-async-storage/async-storage";
import { addBuyerNotification } from "@/services/buyerNotificationsStore";
import { addProducerNotification } from "@/services/producerNotificationsStore";

// Helper para despachar notificações para ambos os stores (o filtro de targetUser garante que só o usuário certo veja)
function addNotification(notification: any) {
  addBuyerNotification(notification);
  addProducerNotification(notification);
}

export type ReportStatus =
  | "pendente"
  | "em_analise"
  | "resolvido"
  | "descartado";
export type ReportCategory =
  | "comportamento"
  | "fraude"
  | "conteudo_inapropriado"
  | "outro";
export type ActionType =
  | "aviso"
  | "bloqueio"
  | "bloqueio_temporario"
  | "nenhum";

export type AppReport = {
  id: string;
  reportedUser: string;
  reporter: string;
  category: ReportCategory;
  reason: string;
  description: string;
  evidenceImageUri?: string;
  data: string;
  status: ReportStatus;
  analyzedAt?: string;
  analyzedBy?: string;
  action?: {
    type: ActionType;
    details: string;
    blockDays?: number;
  };
};

export type UserWarning = {
  id: string;
  username: string;
  reason: string;
  issuedAt: string;
  issuedBy: string;
  status: "ativo" | "removido";
};

export type UserBlock = {
  id: string;
  username: string;
  reason: string;
  blockedAt: string;
  blockedBy: string;
  expiresAt?: string;
  status: "ativo" | "removido";
};

const REPORTS_STORAGE_KEY = "@terra_nova/reports_vFinal";
const WARNINGS_STORAGE_KEY = "@terra_nova/warnings";
const BLOCKS_STORAGE_KEY = "@terra_nova/blocks";

const DEFAULT_REPORTS: AppReport[] = [
  {
    id: "rep-01",
    reportedUser: "Sitio2",
    reporter: "Sitio1",
    category: "fraude",
    reason: "Anúncio enganoso sobre certificação",
    description: "O produtor divulgou certificação orgânica falsa",
    data: "2026-04-01T10:00:00Z",
    status: "pendente",
  },
  {
    id: "rep-02",
    reportedUser: "Sitio5",
    reporter: "Sitio3",
    category: "comportamento",
    reason: "Agressão verbal no chat",
    description: "Insultos e ameaças durante negociação",
    data: "2026-04-02T15:30:00Z",
    status: "em_analise",
  },
];

export async function initReportsStore() {
  const existing = await AsyncStorage.getItem(REPORTS_STORAGE_KEY);
  if (!existing) {
    await AsyncStorage.setItem(
      REPORTS_STORAGE_KEY,
      JSON.stringify(DEFAULT_REPORTS),
    );
  }
}

export async function getReports(filter?: {
  status?: ReportStatus;
  reportedUser?: string;
}): Promise<AppReport[]> {
  const raw = await AsyncStorage.getItem(REPORTS_STORAGE_KEY);
  if (!raw) return [];

  let reports: AppReport[] = JSON.parse(raw);

  if (filter?.status) {
    reports = reports.filter((r) => r.status === filter.status);
  }

  if (filter?.reportedUser) {
    reports = reports.filter((r) => r.reportedUser === filter.reportedUser);
  }

  return reports;
}

export async function getReportsByUser(username: string): Promise<AppReport[]> {
  const raw = await AsyncStorage.getItem(REPORTS_STORAGE_KEY);
  if (!raw) return [];

  const reports: AppReport[] = JSON.parse(raw);
  return reports.filter(
    (r) => r.reporter === username || r.reportedUser === username,
  );
}

export async function getReportById(
  reportId: string,
): Promise<AppReport | null> {
  const raw = await AsyncStorage.getItem(REPORTS_STORAGE_KEY);
  if (!raw) return null;

  const reports: AppReport[] = JSON.parse(raw);
  return reports.find((r) => r.id === reportId) ?? null;
}

export async function addReport(
  report: Omit<
    AppReport,
    "id" | "data" | "status" | "analyzedAt" | "analyzedBy"
  >,
) {
  const raw = await AsyncStorage.getItem(REPORTS_STORAGE_KEY);
  const all: AppReport[] = raw ? JSON.parse(raw) : [];

  const newReport: AppReport = {
    ...report,
    id: `REP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    data: new Date().toISOString(),
    status: "pendente",
  };

  all.push(newReport);
  await AsyncStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(all));
  return newReport;
}

export async function updateReportStatus(
  reportId: string,
  newStatus: ReportStatus,
  analyzedBy?: string,
) {
  const raw = await AsyncStorage.getItem(REPORTS_STORAGE_KEY);
  if (!raw) return;

  let all: AppReport[] = JSON.parse(raw);
  const report = all.find((r) => r.id === reportId);

  all = all.map((r) =>
    r.id === reportId
      ? {
          ...r,
          status: newStatus,
          analyzedAt: new Date().toISOString(),
          analyzedBy: analyzedBy || r.analyzedBy,
        }
      : r,
  );

  await AsyncStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(all));

  await AsyncStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(all));
}

export async function applyActionToReport(
  reportId: string,
  action: AppReport["action"],
  analyzedBy: string,
) {
  const raw = await AsyncStorage.getItem(REPORTS_STORAGE_KEY);
  if (!raw) return;

  let all: AppReport[] = JSON.parse(raw);
  const reportIndex = all.findIndex((r) => r.id === reportId);

  if (reportIndex !== -1) {
    const report = all[reportIndex];

    // Aplicar ações ao usuário denunciado
    if (action?.type === "aviso") {
      await addWarningToUser(report.reportedUser, action.details, analyzedBy);
    } else if (
      action?.type === "bloqueio" ||
      action?.type === "bloqueio_temporario"
    ) {
      const expiresAt = action.blockDays
        ? new Date(
            Date.now() + action.blockDays * 24 * 60 * 60 * 1000,
          ).toISOString()
        : undefined;

      await blockUser(
        report.reportedUser,
        action.details,
        analyzedBy,
        expiresAt,
      );
    }

    all[reportIndex] = {
      ...report,
      status: "resolvido",
      action,
      analyzedAt: new Date().toISOString(),
      analyzedBy,
    };

    await AsyncStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(all));

    // Notificar o usuário denunciado sobre a punição (com link para detalhes)
    addNotification({
      title: "Aviso de Moderação",
      description: `Sua conta recebeu uma ação disciplinar (${action?.type === "aviso" ? "Aviso" : "Bloqueio"}). Clique para ver os detalhes.`,
      time: "Agora",
      route: "/warning-details",
      targetItemId: report.id,
      category: "alerta",
      targetUser: report.reportedUser,
    });

    // Notificar o denunciante que sua denúncia foi atendida
    addNotification({
      title: "Denúncia Atendida",
      description: "A denúncia que você enviou foi analisada e as medidas necessárias foram tomadas.",
      time: "Agora",
      route: "/home",
      category: "alerta",
      targetUser: report.reporter,
    });
  }
}

export async function archiveReport(reportId: string) {
  const raw = await AsyncStorage.getItem(REPORTS_STORAGE_KEY);
  if (!raw) return;

  let all: AppReport[] = JSON.parse(raw);
  const index = all.findIndex((r) => r.id === reportId);
  
  if (index === -1) return;
  
  const report = all[index];
  
  // Em vez de deletar, marcamos como resolvido
  all[index] = {
    ...report,
    status: "resolvido",
    analyzedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(all));

  // Notificar ambos de que o caso foi arquivado/resolvido
  addNotification({
    title: "Denúncia Arquivada",
    description: "A denúncia em que você estava envolvido foi analisada e arquivada pela moderação.",
    time: "Agora",
    route: "/home",
    category: "alerta",
    targetUser: report.reportedUser,
  });
  
  addNotification({
    title: "Caso Resolvido",
    description: "Sua denúncia foi analisada pela moderação e arquivada.",
    time: "Agora",
    route: "/home",
    category: "alerta",
    targetUser: report.reporter,
  });
}

// ─── WARNINGS ──────────────────────────────────────────────────────────────

export async function addWarningToUser(
  username: string,
  reason: string,
  issuedBy: string,
): Promise<UserWarning> {
  const raw = await AsyncStorage.getItem(WARNINGS_STORAGE_KEY);
  const all: UserWarning[] = raw ? JSON.parse(raw) : [];

  const warning: UserWarning = {
    id: `warn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    username,
    reason,
    issuedAt: new Date().toISOString(),
    issuedBy,
    status: "ativo",
  };

  all.push(warning);
  await AsyncStorage.setItem(WARNINGS_STORAGE_KEY, JSON.stringify(all));
  return warning;
}

export async function getUserWarnings(
  username: string,
): Promise<UserWarning[]> {
  const raw = await AsyncStorage.getItem(WARNINGS_STORAGE_KEY);
  if (!raw) return [];

  const all: UserWarning[] = JSON.parse(raw);
  return all.filter((w) => w.username === username && w.status === "ativo");
}

// ─── BLOCKS ────────────────────────────────────────────────────────────────

export async function blockUser(
  username: string,
  reason: string,
  blockedBy: string,
  expiresAt?: string,
): Promise<UserBlock> {
  const raw = await AsyncStorage.getItem(BLOCKS_STORAGE_KEY);
  const all: UserBlock[] = raw ? JSON.parse(raw) : [];

  const block: UserBlock = {
    id: `block-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    username,
    reason,
    blockedAt: new Date().toISOString(),
    blockedBy,
    expiresAt,
    status: "ativo",
  };

  all.push(block);
  await AsyncStorage.setItem(BLOCKS_STORAGE_KEY, JSON.stringify(all));
  return block;
}

export async function getUserBlock(
  username: string,
): Promise<UserBlock | null> {
  const raw = await AsyncStorage.getItem(BLOCKS_STORAGE_KEY);
  if (!raw) return null;

  const all: UserBlock[] = JSON.parse(raw);
  const block = all.find(
    (b) => b.username === username && b.status === "ativo",
  );

  if (!block) return null;

  // Verificar se expirou
  if (block.expiresAt && new Date(block.expiresAt) < new Date()) {
    await removeBlock(block.id);
    return null;
  }

  return block;
}

export async function isUserBlocked(username: string): Promise<boolean> {
  const block = await getUserBlock(username);
  return block !== null;
}

export async function getAllBlocks(): Promise<UserBlock[]> {
  const raw = await AsyncStorage.getItem(BLOCKS_STORAGE_KEY);
  if (!raw) return [];

  const all: UserBlock[] = JSON.parse(raw);
  return all.filter((b) => b.status === "ativo");
}

export async function removeBlock(blockId: string) {
  const raw = await AsyncStorage.getItem(BLOCKS_STORAGE_KEY);
  if (!raw) return;

  let all: UserBlock[] = JSON.parse(raw);
  all = all.map((b) => (b.id === blockId ? { ...b, status: "removido" } : b));

  await AsyncStorage.setItem(BLOCKS_STORAGE_KEY, JSON.stringify(all));
}
