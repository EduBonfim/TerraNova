import { getReportById, getReports } from "@/services/reportsStore";
import { useEffect, useState } from "react";

export function useAdminReports() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("pendente");

  const loadReports = async () => {
    setIsLoading(true);
    try {
      // Busca as denúncias baseadas no status do filtro
      const data = await getReports({ status: filter });
      setReports(data);
    } catch (error) {
      console.error("Erro ao carregar denúncias:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getReport = async (reportId) => {
    try {
      return await getReportById(reportId);
    } catch (error) {
      console.error("Erro ao carregar denúncia:", error);
      return null;
    }
  };

  useEffect(() => {
    loadReports();
  }, [filter]);

  return {
    reports,
    isLoading,
    filter,
    setFilter,
    loadReports,
    getReport,
  };
}
