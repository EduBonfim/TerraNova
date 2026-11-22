/**
 * Utilitários para normalização e manipulação de strings.
 * Centraliza funções usadas no Marketplace, Mapa e Chat.
 */
/**
 * Remove acentos, caracteres especiais e converte para minúsculo.
 */
export function normalizeText(value) {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
/**
 * Quebra uma string em tokens (palavras) significativos para busca.
 */
export function tokenize(value) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 2);
}
/**
 * Obtém as iniciais de um nome (Ex: "Pedro Paulo" -> "PP").
 */
export function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
/**
 * Palavras comuns que devem ser ignoradas em buscas de contexto (ex: "um", "para").
 */
export const SEARCH_STOPWORDS = new Set([
  "disponivel",
  "disponiveis",
  "para",
  "com",
  "sem",
  "ton",
  "tonelada",
  "toneladas",
  "kg",
  "rica",
  "rico",
  "solo",
  "imediata",
]);
