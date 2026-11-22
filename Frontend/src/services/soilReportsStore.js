import AsyncStorage from "@react-native-async-storage/async-storage";
import { get, httpDelete, post } from "./api";
import { getCurrentSession } from "./authStore";

let inMemorySoilReports = [];

const normalizeMetric = (value) => (value || "").trim().replace(",", ".");
const normalizeDiagnosis = (lines) =>
  [...lines]
    .map((item) => item.trim().toLowerCase())
    .sort()
    .join("|");

function buildSoilReportFingerprint(payload) {
  const metrics = payload.metrics;
  return [
    payload.ownerUsername.trim().toLowerCase(),
    normalizeMetric(metrics.ph),
    normalizeMetric(metrics.materiaOrganica),
    normalizeMetric(metrics.fosforo),
    normalizeMetric(metrics.potassio),
    normalizeMetric(metrics.calcio),
    normalizeMetric(metrics.magnesio),
    normalizeMetric(metrics.aluminio),
    normalizeMetric(metrics.ctc),
    normalizeMetric(metrics.vBase),
    normalizeDiagnosis(payload.diagnosis),
  ].join("::");
}

const SOIL_REPORTS_STORAGE_KEY = "@terra_nova/soil_reports";

async function readAllReports() {
  try {
    const json = await AsyncStorage.getItem(SOIL_REPORTS_STORAGE_KEY);
    if (json) {
      inMemorySoilReports = JSON.parse(json);
    }
  } catch (error) {
    console.warn("Erro ao ler laudos de solo locais", error);
  }
  return inMemorySoilReports;
}

async function persistAllReports(reports) {
  inMemorySoilReports = [...reports];
  try {
    await AsyncStorage.setItem(
      SOIL_REPORTS_STORAGE_KEY,
      JSON.stringify(reports)
    );
  } catch (error) {
    console.warn("Erro ao salvar laudos de solo locais", error);
  }
}

export async function saveSoilReport(payload) {
  const current = await readAllReports();
  let finalId = `sr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  let createdAt = new Date().toISOString();
  try {
    const session = await getCurrentSession();
    if (session?.token && session.user?.id) {
      const dto = {
        usuarioId: session.user.id,
        dataAnalise: createdAt.split("T")[0],
        imagemUri: payload.imageUri || null,
        confianca: payload.confidence,
        ph: parseFloat(payload.metrics.ph?.replace(",", ".")) || null,
        materiaOrganica:
          parseFloat(payload.metrics.materiaOrganica?.replace(",", ".")) ||
          null,
        fosforo: parseFloat(payload.metrics.fosforo?.replace(",", ".")) || null,
        potassio:
          parseFloat(payload.metrics.potassio?.replace(",", ".")) || null,
        calcio: parseFloat(payload.metrics.calcio?.replace(",", ".")) || null,
        magnesio:
          parseFloat(payload.metrics.magnesio?.replace(",", ".")) || null,
        aluminio:
          parseFloat(payload.metrics.aluminio?.replace(",", ".")) || null,
        ctc: parseFloat(payload.metrics.ctc?.replace(",", ".")) || null,
        vBase: parseFloat(payload.metrics.vBase?.replace(",", ".")) || null,
        diagnostico: payload.diagnosis.join("\n") || null,
      };
      const response = await post("/api/v1/relatorios-solo", dto, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (response.success && response.data?.id) {
        finalId = response.data.id;
        if (response.data.createdAt) {
          createdAt = response.data.createdAt;
        }
      }
    }
  } catch (error) {
    console.warn("Falha ao salvar no backend, salvando offline", error);
  }
  const next = {
    ...payload,
    id: finalId,
    createdAt,
  };
  await persistAllReports([next, ...current]);
  return next;
}

export async function getSoilReportsByUser(ownerUsername) {
  let current = await readAllReports();
  try {
    const session = await getCurrentSession();
    if (
      session?.token &&
      session.user?.id &&
      session.user.username === ownerUsername
    ) {
      const response = await get(
        `/api/v1/relatorios-solo/usuario/${session.user.id}`
      );
      if (response.success && response.data) {
        const backendReports = response.data.map((dto) => ({
          id: dto.id,
          createdAt: dto.createdAt || new Date().toISOString(),
          ownerUsername: dto.usuarioNome || ownerUsername,
          imageUri: dto.imagemUri,
          confidence: dto.confianca || 0,
          diagnosis: dto.diagnostico ? dto.diagnostico.split("\n") : [],
          metrics: {
            ph: dto.ph ? String(dto.ph) : "",
            materiaOrganica: dto.materiaOrganica
              ? String(dto.materiaOrganica)
              : "",
            fosforo: dto.fosforo ? String(dto.fosforo) : "",
            potassio: dto.potassio ? String(dto.potassio) : "",
            calcio: dto.calcio ? String(dto.calcio) : "",
            magnesio: dto.magnesio ? String(dto.magnesio) : "",
            aluminio: dto.aluminio ? String(dto.aluminio) : "",
            ctc: dto.ctc ? String(dto.ctc) : "",
            vBase: dto.vBase ? String(dto.vBase) : "",
          },
        }));
        const localOnly = current.filter((r) => r.id.startsWith("sr_"));
        const merged = [...backendReports, ...localOnly];
        const uniqueReports = Array.from(
          new Map(merged.map((item) => [item.id, item])).values()
        );
        current = uniqueReports.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        await persistAllReports(current);
      }
    }
  } catch (error) {
    console.warn(
      "Falha ao buscar relatórios no backend, usando cache local",
      error
    );
  }
  const normalized = ownerUsername.trim().toLowerCase();
  return current.filter(
    (item) => item.ownerUsername.trim().toLowerCase() === normalized
  );
}

export async function findDuplicateSoilReport(payload) {
  const current = await readAllReports();
  const target = buildSoilReportFingerprint(payload);
  const duplicate = current.find(
    (item) =>
      buildSoilReportFingerprint({
        ownerUsername: item.ownerUsername,
        diagnosis: item.diagnosis,
        metrics: item.metrics,
      }) === target
  );
  return duplicate ?? null;
}

export async function deleteSoilReportById(id) {
  const current = await readAllReports();
  const filtered = current.filter((item) => item.id !== id);
  await persistAllReports(filtered);
  if (!id.startsWith("sr_")) {
    try {
      const session = await getCurrentSession();
      if (session?.token) {
        await httpDelete(`/api/v1/relatorios-solo/${id}`);
      }
    } catch (error) {
      console.warn("Falha ao excluir laudo no backend", error);
    }
  }
}

const _DEFAULT_REPORTS = [];

export async function initSoilReportsStore() {
  await readAllReports();
}
