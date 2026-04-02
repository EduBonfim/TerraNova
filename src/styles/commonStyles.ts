import { StyleSheet } from 'react-native';
import { appTheme } from '../theme/appTheme';

export const commonStyles = StyleSheet.create({
  sectionTitlePrimary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appTheme.colors.primary,
    marginBottom: 12,
  },
  sectionTitleDefault: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appTheme.colors.gray_800,
    marginBottom: 12,
  },
  cardShadowSm: {
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardShadowMd: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
