import AsyncStorage from "@react-native-async-storage/async-storage";

export type ReportStatus = "pendente" | "em_analise" | "resolvido";

export type AppReport = {
  id: string;
  reportedUser: string; // Username de quem foi denunciado
  reporter: string; // Username de quem denunciou
  reason: string;
  description?: string;
  data: string;
  status: ReportStatus;
};

const REPORTS_STORAGE_KEY = "@terra_nova/reports_vFinal";

const DEFAULT_REPORTS: AppReport[] = [
  {
    id: "rep-01",
    reportedUser: "Sitio2",
    reporter: "Sitio1",
    reason: "Anúncio enganoso sobre certificação",
    data: "2026-04-01T10:00:00Z",
    status: "pendente",
  },
  {
    id: "rep-02",
    reportedUser: "Sitio5",
    reporter: "Sitio3",
    reason: "Agressão verbal no chat",
    data: "2026-04-02T15:30:00Z",
    status: "em_analise",
  },
];

export async function initReportsStore() {
  const existing = await AsyncStorage.getItem(REPORTS_STORAGE_KEY);
  if (!existing) {
    await AsyncStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(DEFAULT_REPORTS));
  }
}

export async function getReports(): Promise<AppReport[]> {
  const raw = await AsyncStorage.getItem(REPORTS_STORAGE_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export async function addReport(report: Omit<AppReport, "id" | "data" | "status">) {
  const raw = await AsyncStorage.getItem(REPORTS_STORAGE_KEY);
  const all: AppReport[] = raw ? JSON.parse(raw) : [];
  
  const newReport: AppReport = {
    ...report,
    id: `REP-${Date.now()}`,
    data: new Date().toISOString(),
    status: "pendente",
  };

  all.push(newReport);
  await AsyncStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(all));
  return newReport;
}

export async function updateReportStatus(reportId: string, newStatus: ReportStatus) {
  const raw = await AsyncStorage.getItem(REPORTS_STORAGE_KEY);
  if (!raw) return;

  let all: AppReport[] = JSON.parse(raw);
  all = all.map(r => r.id === reportId ? { ...r, status: newStatus } : r);
  
  await AsyncStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(all));
}

export async function deleteReport(reportId: string) {
  const raw = await AsyncStorage.getItem(REPORTS_STORAGE_KEY);
  if (!raw) return;

  let all: AppReport[] = JSON.parse(raw);
  all = all.filter(r => r.id !== reportId);
  
  await AsyncStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(all));
}
