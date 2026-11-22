import React, { forwardRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, View, StyleSheet } from "react-native";

// ── tentativa de carregar o módulo nativo ────────────────────────────────────
let _MapView = null;
let _Marker = null;
let _Polyline = null;
let _Callout = null;
let _PROVIDER_GOOGLE = null;
let _nativeAvailable = false;

try {
  const maps = require("react-native-maps");
  _MapView = maps.default;
  _Marker = maps.Marker;
  _Polyline = maps.Polyline;
  _Callout = maps.Callout;
  _PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
  _nativeAvailable = true;
} catch (__) {
  // módulo nativo ausente (Expo Go) — usa fallback
}

// ── exports derivados ────────────────────────────────────────────────────────
export const PROVIDER_GOOGLE = _PROVIDER_GOOGLE;
export const Marker = _Marker;
export const Polyline = _Polyline;
export const Callout = _Callout;
export const nativeMapsAvailable = _nativeAvailable;

// ── Componente fallback exibido quando o módulo nativo não está presente ─────
function MapFallback({ style }) {
  return (
    <View style={[styles.fallback, style]}>
      <Ionicons name="map-outline" size={40} color="#94A3B8" />
      <Text style={styles.fallbackTitle}>Mapa indisponível</Text>
      <Text style={styles.fallbackText}>
        Este recurso requer um build de desenvolvimento.{"\n"}
        Use <Text style={styles.mono}>npx expo run:android</Text> ou{"\n"}
        <Text style={styles.mono}>npx expo run:ios</Text> para ativá-lo.
      </Text>
    </View>
  );
}

// ── SafeMapView — substitui MapView em todos os arquivos ────────────────────
const SafeMapView = forwardRef(function SafeMapView(
  { style, children, ...props },
  ref
) {
  if (!_nativeAvailable || !_MapView) {
    return <MapFallback style={style} />;
  }
  const NativeMapView = _MapView;
  return (
    <NativeMapView ref={ref} style={style} {...props}>
      {children}
    </NativeMapView>
  );
});

export default SafeMapView;

// ── SafeMarker — substitui Marker ────────────────────────────────────────────
export function SafeMarker(props) {
  if (!_nativeAvailable || !_Marker) return null;
  const NativeMarker = _Marker;
  return <NativeMarker {...props} />;
}

// ── SafePolyline — substitui Polyline ───────────────────────────────────────
export function SafePolyline(props) {
  if (!_nativeAvailable || !_Polyline) return null;
  const NativePolyline = _Polyline;
  return <NativePolyline {...props} />;
}

// ── SafeCallout — substitui Callout ─────────────────────────────────────────
export function SafeCallout(props) {
  if (!_nativeAvailable || !_Callout) return null;
  const NativeCallout = _Callout;
  return <NativeCallout {...props} />;
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 24,
    gap: 12,
  },
  fallbackTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },
  fallbackText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  mono: {
    fontFamily: "monospace",
    backgroundColor: "#E2E8F0",
    color: "#0F172A",
    paddingHorizontal: 4,
    borderRadius: 3,
  },
});
