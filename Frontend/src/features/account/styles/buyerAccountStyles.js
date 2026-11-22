import { appTheme as theme } from "@/theme/appTheme";
import { StyleSheet } from "react-native";

export const buyerAccountStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },

  statusSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.white,
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray_200,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  statusGrid: { flexDirection: "row", justifyContent: "space-between", gap: 2 },

  // Modal
  modalContainer: { flex: 1, backgroundColor: theme.colors.background },
  dragHandleContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.gray_300,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  modalTitle: { fontSize: 17, fontWeight: "700", color: theme.colors.gray_800 },
  modalSubtitle: { fontSize: 12, color: theme.colors.gray_500, marginTop: 2 },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.gray_100,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 8,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.gray_100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: theme.colors.gray_700 },
  emptyText: {
    fontSize: 13,
    color: theme.colors.gray_500,
    textAlign: "center",
  },
  listContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },

  seeAllButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#FFF8E1",
    borderWidth: 1,
    borderColor: theme.colors.orange_500 + "30",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.orange_500,
  },
});
