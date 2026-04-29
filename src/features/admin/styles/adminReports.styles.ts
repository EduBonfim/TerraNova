import { StyleSheet } from "react-native";

export const theme = {
  colors: {
    primary: "#6B8E23",
    white: "#FFFFFF",
    background: "#F5F5F5",
    gray_200: "#E5E7EB",
    gray_500: "#6B7280",
    gray_800: "#1F2937",
    red_500: "#EF4444",
    amber_500: "#F59E0B",
    green_700: "#15803D",
  },
};

export const adminReportsStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, paddingBottom: 24 },
  cardContainer: { marginBottom: 12 },
  card: { padding: 14 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  user: { color: theme.colors.gray_800, fontWeight: "700" },
  status: { fontWeight: "700", fontSize: 12 },
  reason: { color: theme.colors.gray_500, marginTop: 8, lineHeight: 20 },
  actionRow: { flexDirection: "row", marginTop: 12 },
  actionButton: {
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 6,
    color: theme.colors.gray_800,
    fontWeight: "600",
  },
  reporterLabel: { fontSize: 11, color: theme.colors.gray_500, marginTop: 2 },
  description: {
    fontSize: 13,
    color: theme.colors.gray_500,
    fontStyle: "italic",
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyText: { marginTop: 12, color: theme.colors.gray_500, fontSize: 16 },

  // Detail View
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.gray_800,
  },
  detailContent: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.gray_800,
    marginBottom: 10,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  infoContent: {
    flex: 1,
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.gray_800,
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 12,
    color: theme.colors.gray_500,
  },
  badgeContainer: {
    gap: 8,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(107, 142, 35, 0.15)",
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  reasonText: {
    fontSize: 14,
    color: theme.colors.gray_800,
    fontWeight: "500",
  },
  descriptionBox: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 12,
  },
  descriptionText: {
    fontSize: 13,
    color: theme.colors.gray_500,
    lineHeight: 18,
  },
  evidenceImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  actionBox: {
    backgroundColor: "rgba(107, 142, 35, 0.1)",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  actionType: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary,
    marginBottom: 8,
  },
  actionDetails: {
    fontSize: 13,
    color: theme.colors.gray_500,
  },

  footer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray_200,
  },
  footerButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dismissButton: {
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
    backgroundColor: theme.colors.white,
  },
  dismissButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gray_800,
  },
  footerActionButton: {
    backgroundColor: theme.colors.primary,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.white,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.gray_800,
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gray_800,
    marginBottom: 8,
    marginTop: 12,
  },
  actionOption: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
    backgroundColor: theme.colors.white,
    gap: 10,
    alignItems: "center",
  },
  actionOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(107, 142, 35, 0.08)",
  },
  actionOptionText: {
    fontSize: 13,
    color: theme.colors.gray_800,
    flex: 1,
  },
  actionOptionTextSelected: {
    fontWeight: "600",
    color: theme.colors.primary,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: theme.colors.gray_800,
    backgroundColor: theme.colors.white,
    marginBottom: 12,
  },
  modalTextarea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray_200,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
    backgroundColor: theme.colors.white,
    alignItems: "center",
  },
  modalCancelButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gray_800,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },
  modalConfirmButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.white,
  },
});

export const statusLabel: Record<string, string> = {
  pendente: "Pendente",
  em_analise: "Em analise",
  resolvido: "Resolvido",
};

export const statusColor: Record<string, string> = {
  pendente: theme.colors.red_500,
  em_analise: theme.colors.amber_500,
  resolvido: theme.colors.green_700,
};
