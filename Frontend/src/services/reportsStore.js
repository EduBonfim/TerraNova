import AsyncStorage from "@react-native-async-storage/async-storage";
import { banUserAccount } from "./authStore";
import { get, post, patch } from "./api";

const REPORTS_KEY = "@terra_nova/reports";
const WARNINGS_KEY = "@terra_nova/warnings";
const BLOCKS_KEY = "@terra_nova/blocks";
const REPORTS_QUEUE_KEY = "@terra_nova/reports_queue";
const ACTIONS_QUEUE_KEY = "@terra_nova/reports_actions_queue";

// Estados em memória
let inMemoryReports = [];
let inMemoryWarnings = [];
let inMemoryBlocks = [];
let syncQueue = [];
let actionQueue = [];
let isInitialized = false;

// Helper para despachar notificações para ambos os stores
function addNotification(notification) {
  // TODO: Implementar integração com buyers e producers notification stores
  console.log("[Reports] Notification:", notification);
}

export async function initReportsStore() {
  if (isInitialized) return;
  try {
    const [rep, warn, block, queue, acts] = await Promise.all([
      AsyncStorage.getItem(REPORTS_KEY),
      AsyncStorage.getItem(WARNINGS_KEY),
      AsyncStorage.getItem(BLOCKS_KEY),
      AsyncStorage.getItem(REPORTS_QUEUE_KEY),
      AsyncStorage.getItem(ACTIONS_QUEUE_KEY),
    ]);
    if (rep) inMemoryReports = JSON.parse(rep);
    if (warn) inMemoryWarnings = JSON.parse(warn);
    if (block) inMemoryBlocks = JSON.parse(block);
    if (queue) syncQueue = JSON.parse(queue);
    if (acts) actionQueue = JSON.parse(acts);
  } catch (e) {
    console.error("Failed to init reports store", e);
  }
  isInitialized = true;
  await syncPendingReports();
}

async function persist() {
  try {
    await Promise.all([
      AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(inMemoryReports)),
      AsyncStorage.setItem(WARNINGS_KEY, JSON.stringify(inMemoryWarnings)),
      AsyncStorage.setItem(BLOCKS_KEY, JSON.stringify(inMemoryBlocks)),
      AsyncStorage.setItem(REPORTS_QUEUE_KEY, JSON.stringify(syncQueue)),
      AsyncStorage.setItem(ACTIONS_QUEUE_KEY, JSON.stringify(actionQueue)),
    ]);
  } catch (e) {
    console.error("Failed to persist reports data", e);
  }
}

export async function syncPendingReports() {
  if (syncQueue.length > 0) {
    const queueCopy = [...syncQueue];
    for (const report of queueCopy) {
      try {
        // Correção: Removido o < any >
        const res = await post("/api/v1/denuncias", {
          reportedUser: report.reportedUser,
          category: report.category,
          reason: report.reason,
          description: report.description,
          evidenceImageUri: report.evidenceImageUri,
        });
        if (res.success) {
          syncQueue = syncQueue.filter((r) => r.localId !== report.localId);
        }
      } catch (_e) {}
    }
    await persist();
  }
  if (actionQueue.length > 0) {
    const actsCopy = [...actionQueue];
    for (const act of actsCopy) {
      try {
        const payload = act.actionPayload
          ? { status: act.status, action: act.actionPayload }
          : { status: act.status };
        await patch(`/api/v1/denuncias/${act.reportId}/status`, payload);
        actionQueue = actionQueue.filter(
          (a) => a.reportId !== act.reportId || a.status !== act.status
        );
      } catch (_e) {}
    }
    await persist();
  }
}

export async function getReports(filter) {
  await initReportsStore();
  try {
    // Correção: Removido o < any[] >
    const res = await get("/api/v1/denuncias");
    if (res.success && res.data) {
      inMemoryReports = res.data.map((d) => ({
        id: d.id,
        reportedUser: d.reportedUser,
        reporter: d.reporter,
        category: d.category,
        reason: d.reason,
        description: d.description,
        evidenceImageUri: d.evidenceImageUri,
        data: d.data,
        status: d.status,
        analyzedAt: d.analyzedAt,
        analyzedBy: d.analyzedBy,
        action: d.action,
      }));
      await persist();
    }
  } catch (e) {
    console.error("Failed to get reports from API, returning cached", e);
  }
  let reports = inMemoryReports;
  if (filter?.status) {
    reports = reports.filter((r) => r.status === filter.status);
  }
  if (filter?.reportedUser) {
    reports = reports.filter((r) => r.reportedUser === filter.reportedUser);
  }
  return reports;
}

export async function getReportsByUser(username) {
  const all = await getReports();
  return all.filter(
    (r) => r.reporter === username || r.reportedUser === username
  );
}

export async function getReportById(reportId) {
  const all = await getReports();
  return all.find((r) => r.id === reportId) ?? null;
}

export async function addReport(report) {
  try {
    // Correção: Removido o < any >
    const res = await post("/api/v1/denuncias", {
      reportedUser: report.reportedUser,
      category: report.category,
      reason: report.reason,
      description: report.description,
      evidenceImageUri: report.evidenceImageUri,
    });
    if (res.success && res.data) {
      return res.data;
    } else {
      throw new Error();
    }
  } catch (_e) {
    console.warn("Failed to add report via API, queueing offline");
    syncQueue.push({ ...report, localId: `r-${Date.now()}` });
    await persist();
  }
}

export async function updateReportStatus(reportId, newStatus, _analyzedBy) {
  try {
    const res = await patch(`/api/v1/denuncias/${reportId}/status`, {
      status: newStatus,
    });
    if (!res.success) throw new Error();
  } catch (_e) {
    console.warn("Failed to update report status via API, queueing");
    actionQueue.push({ reportId, status: newStatus });
    await persist();
  }
}

export async function applyActionToReport(reportId, action, analyzedBy) {
  const report = await getReportById(reportId);
  if (!report) return;
  if (action?.type === "aviso") {
    await addWarningToUser(report.reportedUser, action.details, analyzedBy);
  } else if (
    action?.type === "bloqueio" ||
    action?.type === "bloqueio_temporario"
  ) {
    const expiresAt = action.blockDays
      ? new Date(
          Date.now() + action.blockDays * 24 * 60 * 60 * 1000
        ).toISOString()
      : undefined;
    await blockUser(report.reportedUser, action.details, analyzedBy, expiresAt);
    if (action.type === "bloqueio") {
      try {
        await banUserAccount(report.reportedUser);
      } catch (e) {
        console.error("Erro ao aplicar banimento no backend", e);
      }
    }
  }
  try {
    const res = await patch(`/api/v1/denuncias/${reportId}/status`, {
      status: "resolvido",
      action,
    });
    if (!res.success) throw new Error();
  } catch (_e) {
    console.warn("Failed to apply action to report via API, queueing");
    actionQueue.push({ reportId, status: "resolvido", actionPayload: action });
    await persist();
  }
  addNotification({
    title: "Aviso de Moderação",
    description: `Sua conta recebeu uma ação disciplinar (${
      action?.type === "aviso" ? "Aviso" : "Bloqueio"
    }). Clique para ver os detalhes.`,
    time: "Agora",
    route: "/warning-details",
    targetItemId: report.id,
    category: "alerta",
    targetUser: report.reportedUser,
  });
  addNotification({
    title: "Denúncia Atendida",
    description:
      "A denúncia que você enviou foi analisada e as medidas necessárias foram tomadas.",
    time: "Agora",
    route: "/home",
    category: "alerta",
    targetUser: report.reporter,
  });
}

export async function archiveReport(reportId) {
  const report = await getReportById(reportId);
  if (!report) return;
  try {
    const res = await patch(`/api/v1/denuncias/${reportId}/status`, {
      status: "resolvido",
    });
    if (!res.success) throw new Error();
  } catch (_e) {
    console.warn("Failed to archive report via API, queueing");
    actionQueue.push({ reportId, status: "resolvido" });
    await persist();
  }
  addNotification({
    title: "Denúncia Arquivada",
    description:
      "A denúncia em que você estava envolvido foi analisada e arquivada pela moderação.",
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
export async function addWarningToUser(username, reason, issuedBy) {
  const warning = {
    id: `warn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    username,
    reason,
    issuedAt: new Date().toISOString(),
    issuedBy,
    status: "ativo",
  };
  inMemoryWarnings.push(warning);
  await persist();
  return warning;
}

export async function getUserWarnings(username) {
  return inMemoryWarnings.filter(
    (w) => w.username === username && w.status === "ativo"
  );
}

// ─── BLOCKS ────────────────────────────────────────────────────────────────
export async function blockUser(username, reason, blockedBy, expiresAt) {
  const block = {
    id: `block-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    username,
    reason,
    blockedAt: new Date().toISOString(),
    blockedBy,
    expiresAt,
    status: "ativo",
  };
  inMemoryBlocks.push(block);
  await persist();
  return block;
}

export async function getUserBlock(username) {
  const block = inMemoryBlocks.find(
    (b) => b.username === username && b.status === "ativo"
  );
  if (!block) return null;
  // Verificar se expirou
  if (block.expiresAt && new Date(block.expiresAt) < new Date()) {
    await removeBlock(block.id);
    return null;
  }
  return block;
}

export async function isUserBlocked(username) {
  const block = await getUserBlock(username);
  if (block !== null) return true;

  try {
    const all = await getReports();
    const blocks = all.filter(
      (r) =>
        r.reportedUser?.toLowerCase() === username.toLowerCase() &&
        r.status === "resolvido" &&
        (r.action?.type === "bloqueio" ||
          r.action?.type === "bloqueio_temporario")
    );

    for (const report of blocks) {
      let isActive = false;
      if (report.action.type === "bloqueio") {
        isActive = true; // Bloqueio permanente
      } else if (report.action.blockDays && report.analyzedAt) {
        // Bloqueio temporário
        const analyzedDate = new Date(report.analyzedAt);
        const expirationDate = new Date(
          analyzedDate.getTime() + report.action.blockDays * 24 * 60 * 60 * 1000
        );
        if (expirationDate > new Date()) {
          isActive = true; // Bloqueio ainda ativo
        }
      }

      if (isActive) {
        const acknowledged = await AsyncStorage.getItem(
          `@terra_nova/acknowledged_warning_${report.id}`
        );
        if (acknowledged === "true") {
          return true; // Só bloqueia o login/acesso efetivo se o usuário já tiver clicado em "Ok" no aviso da Home
        }
      }
    }
  } catch (e) {
    console.warn("Erro ao verificar bloqueios remotos no reportsStore:", e);
  }

  return false;
}

export async function getUnacknowledgedWarnings(username) {
  if (!username) return [];
  try {
    const all = await getReports();
    const warnings = all.filter(
      (r) =>
        r.reportedUser?.toLowerCase() === username.toLowerCase() &&
        r.status === "resolvido" &&
        (r.action?.type === "aviso" ||
          r.action?.type === "bloqueio" ||
          r.action?.type === "bloqueio_temporario")
    );

    const activeWarnings = [];
    for (const warn of warnings) {
      let isWarningActive = true;
      if (
        warn.action.type === "bloqueio_temporario" &&
        warn.action.blockDays &&
        warn.analyzedAt
      ) {
        const analyzedDate = new Date(warn.analyzedAt);
        const expirationDate = new Date(
          analyzedDate.getTime() + warn.action.blockDays * 24 * 60 * 60 * 1000
        );
        if (expirationDate <= new Date()) {
          isWarningActive = false; // Bloqueio temporário expirado
        }
      }

      if (isWarningActive) {
        const acknowledged = await AsyncStorage.getItem(
          `@terra_nova/acknowledged_warning_${warn.id}`
        );
        if (acknowledged !== "true") {
          activeWarnings.push(warn);
        }
      }
    }
    return activeWarnings;
  } catch (e) {
    console.error("Erro ao obter avisos não confirmados:", e);
    return [];
  }
}

export async function acknowledgeWarning(warningId) {
  try {
    await AsyncStorage.setItem(
      `@terra_nova/acknowledged_warning_${warningId}`,
      "true"
    );
  } catch (e) {
    console.error("Erro ao confirmar aviso/bloqueio:", e);
  }
}

export async function getUserActiveBanDetails(username) {
  if (!username) return null;
  const block = await getUserBlock(username);
  if (block !== null) {
    return {
      type: "bloqueio",
      reason: block.reason || "Violação dos termos de uso",
      details: "Suspensão local de acesso ativa",
      expiresAt: block.expiresAt || null,
    };
  }

  try {
    const all = await getReports();
    const blocks = all.filter(
      (r) =>
        r.reportedUser?.toLowerCase() === username.toLowerCase() &&
        r.status === "resolvido" &&
        (r.action?.type === "bloqueio" ||
          r.action?.type === "bloqueio_temporario")
    );

    for (const report of blocks) {
      let isActive = false;
      let expiresAt = null;
      if (report.action.type === "bloqueio") {
        isActive = true; // Bloqueio permanente
      } else if (report.action.blockDays && report.analyzedAt) {
        // Bloqueio temporário
        const analyzedDate = new Date(report.analyzedAt);
        const expirationDate = new Date(
          analyzedDate.getTime() + report.action.blockDays * 24 * 60 * 60 * 1000
        );
        if (expirationDate > new Date()) {
          isActive = true; // Bloqueio ainda ativo
          expiresAt = expirationDate.toISOString();
        }
      }

      if (isActive) {
        return {
          id: report.id,
          type: report.action.type,
          reason: report.reason,
          details: report.action.details,
          expiresAt: expiresAt,
        };
      }
    }
  } catch (e) {
    console.warn("Erro ao obter detalhes do bloqueio:", e);
  }

  return null;
}

export function formatRemainingTime(expiresAtString) {
  if (!expiresAtString) return "";
  const now = new Date();
  const expiresAt = new Date(expiresAtString);
  const diffMs = expiresAt - now;

  if (diffMs <= 0) return "Expirado";

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(
    (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let timeString = "";
  if (diffDays > 0) {
    timeString += `${diffDays} dia${diffDays > 1 ? "s" : ""}`;
    if (diffHours > 0) {
      timeString += ` e ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
    }
  } else if (diffHours > 0) {
    timeString += `${diffHours} hora${diffHours > 1 ? "s" : ""}`;
    if (diffMinutes > 0) {
      timeString += ` e ${diffMinutes} minuto${diffMinutes > 1 ? "s" : ""}`;
    }
  } else {
    timeString += `${diffMinutes} minuto${diffMinutes > 1 ? "s" : ""}`;
  }

  return timeString;
}

export async function getAllBlocks() {
  return inMemoryBlocks.filter((b) => b.status === "ativo");
}

export async function removeBlock(blockId) {
  inMemoryBlocks = inMemoryBlocks.map((b) =>
    b.id === blockId ? { ...b, status: "removido" } : b
  );
  await persist();
}
