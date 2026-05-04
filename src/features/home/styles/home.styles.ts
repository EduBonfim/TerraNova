import { Platform, StyleSheet } from "react-native";
import { appTheme as theme } from "@/theme/appTheme";

const IOS_VISUAL = {
  headerHeight: 76,
  headerPaddingBottom: 16,
  headerPaddingTop: 16,
};

const ANDROID_VISUAL = {
  headerHeight: 76,
  headerPaddingBottom: 16,
  headerPaddingTop: 20,
};

export const CURRENT_PLATFORM_UI = Platform.OS === "ios" ? IOS_VISUAL : ANDROID_VISUAL;

export const homeStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  contentContainer: { paddingBottom: 12 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: CURRENT_PLATFORM_UI.headerHeight,
    paddingHorizontal: 16,
    paddingBottom: CURRENT_PLATFORM_UI.headerPaddingBottom,
    paddingTop: CURRENT_PLATFORM_UI.headerPaddingTop,
    backgroundColor: theme.colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
    overflow: "hidden",
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  greeting: { fontSize: 20, fontWeight: "bold", color: theme.colors.white },
  location: { fontSize: 14, color: theme.colors.white, marginTop: 2 },
  notificationIcon: { padding: 8, position: "relative" },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: "red",
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeText: { color: theme.colors.white, fontSize: 10, fontWeight: "bold" },

  // Modal de Notificações
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.35)",
    justifyContent: "flex-start",
    paddingTop: CURRENT_PLATFORM_UI.headerHeight + 8,
    paddingHorizontal: 14,
  },
  notificationsPanel: {
    backgroundColor: theme.colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  notificationsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  notificationsTitle: { fontSize: 16, fontWeight: "bold", color: theme.colors.gray_900 },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  notificationDotWrap: { width: 14, paddingTop: 6 },
  notificationDot: { width: 8, height: 8, borderRadius: 4 },
  notificationDotNew: { backgroundColor: "#EF4444" },
  notificationDotRead: { backgroundColor: "#D1D5DB" },
  notificationContent: { flex: 1, marginRight: 8 },
  notificationItemTitle: { fontSize: 13, fontWeight: "bold", color: theme.colors.gray_900 },
  notificationItemDescription: { fontSize: 12, color: theme.colors.gray_500, marginTop: 2 },
  notificationItemTime: { fontSize: 11, color: theme.colors.gray_500 },
  viewAllNotificationsButton: { paddingVertical: 10, alignItems: "center" },
  viewAllNotificationsText: { fontSize: 13, color: theme.colors.primary, fontWeight: "bold" },
  emptyNotifications: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  emptyNotificationsText: {
    fontSize: 14,
    color: theme.colors.gray_400,
    marginTop: 10,
    textAlign: "center",
    marginBottom: 16,
  },
  historyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.gray_100,
    borderRadius: 8,
  },
  historyButtonText: {
    color: theme.colors.gray_700,
    fontSize: 12,
    fontWeight: "bold",
  },

  // Seções base
  section: { padding: 18, paddingBottom: 0 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 12,
  },

  // Cards Radar / Oportunidades
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  alertTextContainer: { flex: 1 },
  alertTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_900,
  },
  alertDesc: { fontSize: 13, color: theme.colors.gray_500, marginTop: 2 },

  // Ações Rápidas
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.gray_100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 13,
    color: theme.colors.gray_900,
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 18,
  },

  // Notícias
  newsCard: {
    marginBottom: 12,
    flexDirection: "row",
    overflow: "hidden",
    padding: 0,
  },
  newsImagePlaceholder: {
    width: 100,
    backgroundColor: theme.colors.gray_200,
    justifyContent: "center",
    alignItems: "center",
  },
  newsContent: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_900,
    marginBottom: 8,
    lineHeight: 20,
  },
  newsSource: { fontSize: 12, color: theme.colors.gray_500 },

  // Dashboard de KPIs (Carrossel)
  kpiCarouselScroll: {
    marginHorizontal: -16,
  },
  kpiCarouselItem: {
    paddingHorizontal: 8,
  },
  kpiCard: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  kpiCardContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  kpiIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.gray_100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  kpiCarouselValue: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.gray_900,
    marginBottom: 8,
    textAlign: "center",
  },
  kpiCarouselLabel: {
    fontSize: 14,
    color: theme.colors.gray_600,
    fontWeight: "600",
    textAlign: "center",
  },
  kpiDotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  kpiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.gray_300,
  },
  kpiDotActive: {
    backgroundColor: theme.colors.primary,
    width: 20,
  },

  kpiRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  kpiItem: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.gray_900,
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 12,
    color: theme.colors.gray_600,
    fontWeight: "500",
  },

  // Carousel de Últimas Vendas
  salesCarouselScroll: {
    marginHorizontal: -18,
  },
  saleCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    marginHorizontal: 18,
    marginRight: 8,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  saleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  saleInfo: {
    flex: 1,
    marginRight: 12,
  },
  saleProductName: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.gray_900,
    marginBottom: 4,
  },
  saleBuyerName: {
    fontSize: 12,
    color: theme.colors.gray_600,
  },
  saleStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexShrink: 0,
  },
  saleStatusCompleted: {
    backgroundColor: "#D1FAE5",
  },
  saleStatusPending: {
    backgroundColor: "#FEF3C7",
  },
  saleStatusCancelled: {
    backgroundColor: "#FEE2E2",
  },
  saleStatusText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.gray_800,
  },
  saleBody: {
    flexDirection: "row",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: theme.colors.gray_200,
    borderBottomColor: theme.colors.gray_200,
  },
  saleDetail: {
    flex: 1,
    alignItems: "center",
  },
  saleDetailLabel: {
    fontSize: 11,
    color: theme.colors.gray_500,
    marginBottom: 4,
  },
  saleDetailValue: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  saleDivider: {
    width: 1,
    backgroundColor: theme.colors.gray_200,
    marginHorizontal: 12,
  },
  saleFooter: {
    marginTop: 12,
    alignItems: "center",
  },
  saleDateText: {
    fontSize: 11,
    color: theme.colors.gray_500,
    fontStyle: "italic",
  },
});
