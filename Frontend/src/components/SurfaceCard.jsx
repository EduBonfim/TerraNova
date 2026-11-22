import { View, StyleSheet } from "react-native";

// Container de superficie generico usado nas telas para blocos em formato de card.

// Wrapper reutilizavel de card com borda opcional.
export function SurfaceCard({ children, style, bordered = true }) {
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
