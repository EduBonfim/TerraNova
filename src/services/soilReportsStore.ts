import AsyncStorage from "@react-native-async-storage/async-storage";

const SOIL_REPORTS_STORAGE_KEY = "@terra_nova/soil_reports";

export type SoilReport = {
  id: string;
  ownerUsername: string;
  createdAt: string;
  imageUri?: string;
  confidence: number;
  diagnosis: string[];
  metrics: {
    ph: string;
    materiaOrganica: string;
    fosforo: string;
    potassio: string;
    calcio: string;
    magnesio: string;
    aluminio: string;
    ctc: string;
    vBase: string;
  };
};

type SoilReportComparable = {
  ownerUsername: string;
  diagnosis: string[];
  metrics: SoilReport["metrics"];
};

const normalizeMetric = (value: string) => (value || "").trim().replace(",", ".");

const normalizeDiagnosis = (lines: string[]) =>
  [...lines].map((item) => item.trim().toLowerCase()).sort().join("|");

function buildSoilReportFingerprint(payload: SoilReportComparable): string {
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

async function readAllReports(): Promise<SoilReport[]> {
  try {
    const raw = await AsyncStorage.getItem(SOIL_REPORTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SoilReport[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function persistAllReports(reports: SoilReport[]): Promise<void> {
  try {
    await AsyncStorage.setItem(SOIL_REPORTS_STORAGE_KEY, JSON.stringify(reports));
  } catch {
    // Keep app usable if storage is unavailable.
  }
}

export async function saveSoilReport(
  payload: Omit<SoilReport, "id" | "createdAt">,
): Promise<SoilReport> {
  const current = await readAllReports();

  const next: SoilReport = {
    ...payload,
    id: `sr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };

  await persistAllReports([next, ...current]);
  return next;
}

export async function getSoilReportsByUser(ownerUsername: string): Promise<SoilReport[]> {
  const current = await readAllReports();
  const normalized = ownerUsername.trim().toLowerCase();
  return current.filter((item) => item.ownerUsername.trim().toLowerCase() === normalized);
}

export async function findDuplicateSoilReport(
  payload: SoilReportComparable,
): Promise<SoilReport | null> {
  const current = await readAllReports();
  const target = buildSoilReportFingerprint(payload);

  const duplicate = current.find(
    (item) =>
      buildSoilReportFingerprint({
        ownerUsername: item.ownerUsername,
        diagnosis: item.diagnosis,
        metrics: item.metrics,
      }) === target,
  );

  return duplicate ?? null;
}

export async function deleteSoilReportById(id: string): Promise<void> {
  const current = await readAllReports();
  const filtered = current.filter((item) => item.id !== id);
  await persistAllReports(filtered);
}

const DEFAULT_REPORTS: SoilReport[] = [
  {
    id: "sr_default_1",
    ownerUsername: "Sitio2",
    createdAt: "2026-03-15T10:00:00Z",
    confidence: 0.95,
    diagnosis: ["Necessidade de Calagem", "Fosforo Baixo"],
    metrics: {
      ph: "5.2",
      materiaOrganica: "2.5",
      fosforo: "8.0",
      potassio: "0.15",
      calcio: "2.1",
      magnesio: "0.8",
      aluminio: "0.5",
      ctc: "7.5",
      vBase: "45%",
    },
  },
  {
    id: "sr_default_2",
    ownerUsername: "Sitio2",
    createdAt: "2026-04-01T14:30:00Z",
    confidence: 0.98,
    diagnosis: ["Solo Equilibrado"],
    metrics: {
      ph: "6.5",
      materiaOrganica: "3.2",
      fosforo: "25.0",
      potassio: "0.45",
      calcio: "4.5",
      magnesio: "1.5",
      aluminio: "0.0",
      ctc: "12.0",
      vBase: "75%",
    },
  },
];

export async function initSoilReportsStore() {
  const existing = await AsyncStorage.getItem(SOIL_REPORTS_STORAGE_KEY);
  if (!existing) {
    await AsyncStorage.setItem(SOIL_REPORTS_STORAGE_KEY, JSON.stringify(DEFAULT_REPORTS));
  }
}
