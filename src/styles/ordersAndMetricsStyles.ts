import { appTheme } from "@/theme/appTheme";
import { StyleSheet } from "react-native";

export const ordersStyles = StyleSheet.create({
  // Container base
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: appTheme.colors.primary,
  },

  // Tabs melhorados
  orderTabsContainer: {
    flexDirection: "row",
    backgroundColor: appTheme.colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: appTheme.colors.gray_200,
    gap: 4,
  },
  orderTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
    marginBottom: -11,
  },
  orderTabActive: {
    borderBottomColor: appTheme.colors.primary,
  },
  orderTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: appTheme.colors.gray_500,
  },
  orderTabTextActive: {
    color: appTheme.colors.primary,
  },

  // Orders list
  ordersListContainer: {
    padding: 16,
    paddingBottom: 40,
  },

  // Card melhorado
  orderCard: {
    backgroundColor: appTheme.colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    elevation: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1.5,
    borderColor: appTheme.colors.gray_200,
  },
  orderCardExpanded: {
    borderColor: appTheme.colors.primary,
    borderWidth: 2,
    elevation: 3,
    shadowColor: appTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  // Header do card
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderCardHeaderExpanded: {
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.gray_100,
  },

  orderLeftCol: {
    flex: 1,
    marginRight: 12,
  },
  orderRightCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: 8,
  },

  // Textos do card
  orderCardId: {
    fontSize: 10,
    color: appTheme.colors.gray_500,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  orderCardProduct: {
    fontSize: 14,
    fontWeight: "600",
    color: appTheme.colors.gray_800,
    marginBottom: 6,
  },
  orderCardValue: {
    fontSize: 16,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },

  // Conteúdo expandido
  expandedContent: {
    gap: 0,
  },

  // Details cards
  orderCardDetails: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
    backgroundColor: appTheme.colors.gray_100,
    borderRadius: 12,
    padding: 12,
  },
  orderDetail: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orderDetailText: {
    fontSize: 12,
    color: appTheme.colors.gray_700,
    fontWeight: "500",
  },

  // Lista de itens agrupados
  groupedItemsList: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: appTheme.colors.gray_500 || appTheme.colors.background,
  },
  groupedItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.gray_200,
  },
  groupedItemRow_last: {
    borderBottomWidth: 0,
  },
  groupedItemQtd: {
    width: 50,
    fontSize: 12,
    fontWeight: "600",
    color: appTheme.colors.primary,
    backgroundColor: "rgba(107, 142, 35, 0.08)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    textAlign: "center",
  },
  groupedItemName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: appTheme.colors.gray_700,
    marginLeft: 12,
  },
  groupedItemValue: {
    fontSize: 13,
    fontWeight: "700",
    color: appTheme.colors.gray_800,
    minWidth: 70,
    textAlign: "right",
  },

  // Card footer
  orderCardFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.gray_200,
  },
  orderBuyer: {
    fontSize: 12,
    color: appTheme.colors.gray_600,
    fontWeight: "500",
  },
  orderBuyerBold: {
    fontWeight: "700",
    color: appTheme.colors.gray_800,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: appTheme.colors.gray_700,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: appTheme.colors.gray_500,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});

export const metricsStyles = StyleSheet.create({
  // Container base
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: appTheme.colors.primary,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },

  // Period selector melhorado
  periodSelector: {
    marginBottom: 24,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: appTheme.colors.white,
    borderWidth: 1.5,
    borderColor: appTheme.colors.gray_300,
    marginRight: 10,
    elevation: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  periodButtonActive: {
    backgroundColor: appTheme.colors.primary,
    borderColor: appTheme.colors.primary,
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: appTheme.colors.gray_600,
  },
  periodButtonTextActive: {
    color: appTheme.colors.white,
  },

  // Cards melhorados
  card: {
    backgroundColor: appTheme.colors.white,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  totalSalesCard: {
    backgroundColor: appTheme.colors.primary,
    borderRadius: 18,
  },

  // Card header
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 14,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },
  cardSubValue: {
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },

  // Total sales value
  totalSalesNumber: {
    fontSize: 36,
    fontWeight: "800",
    color: appTheme.colors.white,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  badgeText: {
    fontSize: 11,
    color: appTheme.colors.white,
    fontWeight: "700",
  },

  // Stat boxes
  statRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: appTheme.colors.white,
    borderRadius: 14,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  statBoxLabel: {
    fontSize: 11,
    color: appTheme.colors.gray_500,
    marginBottom: 6,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statBoxValue: {
    fontSize: 20,
    fontWeight: "800",
    color: appTheme.colors.gray_800,
    letterSpacing: -0.3,
  },

  // Card title
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: appTheme.colors.gray_800,
    marginBottom: 20,
    letterSpacing: -0.2,
  },

  // Chart
  chartContainer: {
    gap: 14,
  },
  chartBar: {
    marginBottom: 4,
  },
  chartBarLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chartBarName: {
    fontSize: 13,
    fontWeight: "700",
    color: appTheme.colors.gray_700,
  },
  chartBarStats: {
    fontSize: 11,
    color: appTheme.colors.gray_500,
    fontWeight: "500",
  },
  barFillContainer: {
    height: 12,
    backgroundColor: appTheme.colors.gray_200,
    borderRadius: 6,
    overflow: "hidden",
    elevation: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  barFill: {
    height: "100%",
    borderRadius: 6,
  },

  // Section
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: appTheme.colors.gray_800,
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 13,
    color: appTheme.colors.primary,
    fontWeight: "700",
  },

  // Activities
  activitiesContainer: {
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.gray_200,
    paddingTop: 12,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.gray_100,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(107, 142, 35, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityClient: {
    fontSize: 13,
    fontWeight: "700",
    color: appTheme.colors.gray_800,
  },
  activityTime: {
    fontSize: 11,
    color: appTheme.colors.gray_500,
    marginTop: 2,
  },
  activityValue: {
    fontSize: 13,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },

  // Export button
  exportButton: {
    flexDirection: "row",
    backgroundColor: appTheme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    elevation: 3,
    shadowColor: appTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  exportButtonText: {
    color: appTheme.colors.white,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});
