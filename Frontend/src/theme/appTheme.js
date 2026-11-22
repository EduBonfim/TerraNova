import { Platform } from "react-native";

export const appTheme = {
  colors: {
    primary: "#6B8E23",
    lightGreen: "#E8F5E9",
    white: "#FFFFFF",
    background: "#F5F5F5",
    gray_100: "#F3F4F6",
    gray_200: "#E5E7EB",
    gray_300: "#D1D5DB",
    gray_400: "#9CA3AF",
    gray_500: "#6B7280",
    gray_600: "#4B5563",
    gray_700: "#374151",
    gray_800: "#1F2937",
    gray_900: "#111827",
    placeholder: "rgba(31, 41, 55, 0.35)",
    orange_500: "#F9A825",
    red_500: "#EF4444",
    brown_500: "#8B6F47",
    green_500: "#22C55E",
    accent: "#22C55E",
  },
};

const selectPlatform = (iosValue, androidValue) => {
  return Platform.OS === "ios" ? iosValue : androidValue;
};

export const platformMetrics = {
  homeHeader: selectPlatform(
    {
      headerHeight: 76,
      headerPaddingBottom: 16,
      headerPaddingTop: 16,
    },
    {
      headerHeight: 76,
      headerPaddingBottom: 16,
      headerPaddingTop: 20,
    }
  ),
  accountScreen: selectPlatform(
    {
      headerHeight: 70,
      headerPaddingBottom: 16,
      headerPaddingTop: 16,
      modalCloseTop: 58,
      logoutBottomSpacer: 120,
    },
    {
      headerHeight: 70,
      headerPaddingBottom: 12,
      headerPaddingTop: 20,
      modalCloseTop: 32,
      logoutBottomSpacer: 100,
    }
  ),
  marketplaceScreen: selectPlatform(
    {
      headerHeight: 76,
      headerPaddingBottom: 16,
      headerPaddingTop: 16,
      modalCloseTop: 58,
    },
    {
      headerHeight: 76,
      headerPaddingBottom: 16,
      headerPaddingTop: 20,
      modalCloseTop: 32,
    }
  ),
};
