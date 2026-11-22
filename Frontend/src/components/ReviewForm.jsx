import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";
import { TextInput } from "react-native";

/**
 * Componente de formulário de avaliação para compradores e produtores
 */
export const ReviewForm = ({
  _orderId,
  revieweeType = "produtor",
  revieweeName = "Usuário",
  theme,
  onSubmit,
  onCancel,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Avaliação incompleta", "Por favor, selecione uma nota");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment);
      Alert.alert("Sucesso", "Sua avaliação foi enviada!");
      setRating(0);
      setComment("");
      if (onCancel) onCancel();
    } catch (error) {
      Alert.alert("Erro", error.message || "Erro ao enviar avaliação");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReviewLabel = () => {
    if (revieweeType === "produtor") {
      return "Avalie o Produtor";
    }
    return "Avalie o Comprador";
  };

  const getReviewPlaceholder = () => {
    if (revieweeType === "produtor") {
      return "Qualidade do produto, embalagem, pontualidade...";
    }
    return "Comunicação, pontualidade no pagamento...";
  };

  return (
    <LinearGradient
      colors={[theme.colors.white, theme.colors.gray_50]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{ flex: 1, padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: theme.colors.text_primary,
            }}
          >
            {getReviewLabel()}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.text_secondary,
              marginTop: 4,
            }}
          >
            {revieweeName}
          </Text>
        </View>

        {/* Avaliacao com estrelas */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: theme.colors.text_primary,
              marginBottom: 12,
            }}
          >
            Sua nota:
          </Text>
          <View
            style={{ flexDirection: "row", justifyContent: "center", gap: 12 }}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                onPressIn={() => setHoverRating(star)}
                onPressOut={() => setHoverRating(0)}
                style={{ padding: 4 }}
              >
                <MaterialIcons
                  name={
                    star <= (hoverRating || rating) ? "star" : "star-outline"
                  }
                  size={40}
                  color={
                    star <= (hoverRating || rating)
                      ? theme.colors.warning
                      : theme.colors.gray_400
                  }
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text
              style={{
                textAlign: "center",
                marginTop: 8,
                fontSize: 14,
                color: theme.colors.primary,
                fontWeight: "600",
              }}
            >
              {rating} de 5 estrelas
            </Text>
          )}
        </View>

        {/* Sessao de comentario */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: theme.colors.text_primary,
              marginBottom: 8,
            }}
          >
            Comentário (opcional):
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: theme.colors.gray_200,
              borderRadius: 8,
              padding: 12,
              minHeight: 100,
              maxHeight: 150,
              textAlignVertical: "top",
              fontSize: 14,
              color: theme.colors.text_primary,
              backgroundColor: theme.colors.white,
            }}
            placeholder={getReviewPlaceholder()}
            placeholderTextColor={theme.colors.placeholder}
            multiline={true}
            numberOfLines={5}
            value={comment}
            onChangeText={setComment}
            editable={!isSubmitting}
          />
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.text_tertiary,
              marginTop: 4,
            }}
          >
            {comment.length}/500 caracteres
          </Text>
        </View>

        {/* Dicas */}
        <View
          style={{
            backgroundColor: theme.colors.info_light,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.info,
            padding: 12,
            borderRadius: 4,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.info,
              fontWeight: "600",
              marginBottom: 4,
            }}
          >
            Dica: Deixe uma avaliação útil
          </Text>
          <Text style={{ fontSize: 12, color: theme.colors.info }}>
            Suas avaliações honestas ajudam outros compradores e produtores a
            melhorarem
          </Text>
        </View>

        {/* Botões de Ação */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
          <TouchableOpacity
            onPress={onCancel}
            disabled={isSubmitting}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: theme.colors.gray_300,
              borderRadius: 8,
              alignItems: "center",
              backgroundColor: theme.colors.white,
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            <Text
              style={{
                color: theme.colors.text_primary,
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              Cancelar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting || rating === 0}
            style={{
              flex: 1,
              paddingVertical: 12,
              backgroundColor:
                rating === 0 ? theme.colors.gray_300 : theme.colors.primary,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting && (
              <ActivityIndicator
                color={theme.colors.white}
                size="small"
                style={{ marginRight: 8 }}
              />
            )}
            <Text
              style={{
                color: theme.colors.white,
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default ReviewForm;
