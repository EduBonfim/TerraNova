import React, { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

// Container de superficie generico usado nas telas para blocos em formato de card.
export type SurfaceCardProps = {
  // Conteudo do card.
  children: ReactNode;
  // Sobrescritas opcionais de estilo para layout ou espacamento.
  style?: StyleProp<ViewStyle>;
  // Ativa/desativa a borda nativa quando o design usa apenas sombra.
  bordered?: boolean;
};

// Wrapper reutilizavel de card com borda opcional.
export function SurfaceCard({ children, style, bordered = true }: SurfaceCardProps) {
  return (
    <View style={[styles.card, !bordered && styles.cardNoBorder, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardNoBorder: {
    borderWidth: 0,
  },
});
