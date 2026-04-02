import { Platform } from 'react-native';

export const appTheme = {
  colors: {
    primary: '#6B8E23',
    lightGreen: '#E8F5E9',
    white: '#FFFFFF',
    background: '#F5F5F5',
    gray_200: '#E5E7EB',
    gray_300: '#D1D5DB',
    gray_500: '#6B7280',
    gray_800: '#1F2937',
    gray_900: '#111827',
    orange_500: '#F9A825',
    red_500: '#EF4444',
  },
};

const selectPlatform = <T,>(iosValue: T, androidValue: T): T => {
  return Platform.OS === 'ios' ? iosValue : androidValue;
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
