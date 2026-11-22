export const DEFAULT_PIN_REGION = {
  latitude: -17.7915,
  longitude: -50.9,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

export const PROFILE_BIO_MAX = 220;

export const normalizeCep = (value) => {
  if (typeof value !== "string") return "";
  return value.replace(/\D/g, "").slice(0, 8);
};

export const formatCep = (value) => {
  const digits = normalizeCep(value);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

export const formatValidationTimestamp = (value) => {
  if (!value) return "Nao validado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Nao validado";
  return date.toLocaleString("pt-BR");
};
