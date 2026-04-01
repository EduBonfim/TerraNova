import React, { useCallback, useMemo, type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  PanResponder,
  BackHandler,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

// Cabecalho reutilizavel para telas do app com acessorios opcionais e controle de alinhamento.
export type AppHeaderProps = {
  // Titulo principal do cabecalho.
  title: string;
  // Subtitulo opcional abaixo do titulo principal.
  subtitle?: string;
  // Callback do botao voltar. Mantido mesmo com showBackButton=false para consistencia da API.
  onBackPress: () => void;
  // Controla se o botao voltar sera renderizado.
  showBackButton?: boolean;
  // Tokens visuais do cabecalho.
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
  // Slots opcionais para acessorios entre voltar/titulo e apos o container de titulo.
  leftAccessory?: ReactNode;
  rightAccessory?: ReactNode;
  // Alinhamento do titulo dentro do container de texto.
  titleAlign?: "left" | "center";
  // Sobrescritas opcionais de estilo.
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

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

const CURRENT_PLATFORM_UI = Platform.OS === "ios" ? IOS_VISUAL : ANDROID_VISUAL;

// Cabecalho compartilhado do app com espacamento superior ajustado por plataforma.
export function AppHeader({
  title,
  subtitle,
  onBackPress,
  showBackButton = true,
  backgroundColor,
  textColor,
  borderColor = "#E5E7EB",
  leftAccessory,
  rightAccessory,
  titleAlign = "left",
  titleStyle,
  subtitleStyle,
  containerStyle,
}: AppHeaderProps) {
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android" || !showBackButton) {
        return undefined;
      }

      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        onBackPress();
        return true;
      });

      return () => subscription.remove();
    }, [onBackPress, showBackButton]),
  );

  const swipeBackResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          if (Platform.OS !== "ios") return false;
          const horizontalIntent = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
          return horizontalIntent && gestureState.dx > 10;
        },
        onPanResponderRelease: (event, gestureState) => {
          if (Platform.OS !== "ios") return;
          const startedFromLeftEdge = event.nativeEvent.pageX <= 36;
          const shouldGoBack = startedFromLeftEdge && gestureState.dx > 70 && Math.abs(gestureState.dy) < 30;
          if (shouldGoBack) {
            onBackPress();
          }
        },
      }),
    [onBackPress],
  );

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor,
          borderBottomColor: borderColor,
          height: CURRENT_PLATFORM_UI.headerHeight,
          paddingBottom: CURRENT_PLATFORM_UI.headerPaddingBottom,
          paddingTop: CURRENT_PLATFORM_UI.headerPaddingTop,
        },
        containerStyle,
      ]}
      {...(Platform.OS === "ios" ? swipeBackResponder.panHandlers : {})}
    >
      {showBackButton ? (
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Ionicons name="arrow-back" size={22} color={textColor} />
        </TouchableOpacity>
      ) : null}
      {leftAccessory ? (
        <View style={styles.leftAccessory}>{leftAccessory}</View>
      ) : null}
      <View style={styles.headerTextContainer}>
        <Text
          style={[
            styles.headerTitle,
            { color: textColor, textAlign: titleAlign },
            titleStyle,
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.headerSubtitle, { color: textColor }, subtitleStyle]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightAccessory ? (
        <View style={styles.rightAccessory}>{rightAccessory}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    overflow: "hidden",
  },
  backButton: { marginRight: 10, padding: 4 },
  leftAccessory: { marginRight: 12 },
  headerTextContainer: { flex: 1 },
  rightAccessory: { marginLeft: 10 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  headerSubtitle: { fontSize: 14, marginTop: 2 },
});
