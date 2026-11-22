import { Platform } from "react-native";
import { API_BASE_URL } from "./api";
import { getCurrentSession } from "./authStore";

const getUploadBaseUrl = () => API_BASE_URL();

const resolveImageFileMeta = (localUri) => {
  const cleanUri = localUri.split("?")[0].toLowerCase();
  if (cleanUri.endsWith(".png")) {
    return { mimeType: "image/png", ext: "png" };
  }
  if (cleanUri.endsWith(".gif")) {
    return { mimeType: "image/gif", ext: "gif" };
  }
  if (cleanUri.endsWith(".webp")) {
    return { mimeType: "image/webp", ext: "webp" };
  }
  if (cleanUri.endsWith(".heic")) {
    return { mimeType: "image/heic", ext: "heic" };
  }
  if (cleanUri.endsWith(".heif")) {
    return { mimeType: "image/heif", ext: "heif" };
  }
  return { mimeType: "image/jpeg", ext: "jpg" };
};

/**
 * Faz upload de uma imagem local para o servidor retornando detalhes de erro
 * @param localUri - URI local da imagem (file://.../...)
 * @returns {{ url: string | null, error: string | null, status: number }}
 */
export async function uploadImageDetailed(localUri) {
  try {
    if (!localUri || typeof localUri !== "string") {
      console.error("URI inválida para upload:", localUri);
      return {
        url: null,
        error: "Arquivo de imagem inválido.",
        status: 0,
      };
    }
    if (localUri.startsWith("http://") || localUri.startsWith("https://")) {
      return { url: localUri, error: null, status: 200 };
    }

    const normalizedUri =
      Platform.OS === "android" && localUri.startsWith("/")
        ? `file://${localUri}`
        : localUri;

    const { mimeType, ext } = resolveImageFileMeta(normalizedUri);

    // Criar FormData para upload — RN usa a URI diretamente
    const formData = new FormData();
    formData.append("file", {
      uri: normalizedUri,
      type: mimeType,
      name: `image_${Date.now()}.${ext}`,
    });

    // Obter token de autenticação — ANTES de montar os headers
    const session = await getCurrentSession();
    // O fetch/RN precisa gerar o boundary automaticamente: multipart/form-data; boundary=---xxx
    const uploadHeaders = {
      "ngrok-skip-browser-warning": "true",
    };
    if (session?.token) {
      uploadHeaders["Authorization"] = `Bearer ${session.token}`;
    }

    // Fazer upload usando fetch
    const baseUrl = getUploadBaseUrl();
    const response = await fetch(`${baseUrl}/api/v1/upload`, {
      method: "POST",
      body: formData,
      headers: uploadHeaders,
    });

    const responseData = await response.json().catch(() => ({}));

    if (response.status === 403) {
      console.error("Erro 403 Forbidden - Verifique autenticação e permissões");
      return {
        url: null,
        error: "Sem permissão para enviar a imagem no servidor (403).",
        status: 403,
      };
    }

    if (response.status === 413) {
      return {
        url: null,
        error:
          responseData.message ||
          responseData.error ||
          "A imagem é muito grande. Tente escolher outra foto.",
        status: 413,
      };
    }

    // Spring Boot pode retornar success como boolean true ou string "true"
    const isSuccess =
      response.ok &&
      (responseData.success === true ||
        responseData.success === "true" ||
        responseData.url);

    if (isSuccess) {
      // Retornar URL completa — pode já ser absoluta ou relativa
      const relativePath = responseData.url || "";
      const fullUrl = relativePath.startsWith("http")
        ? relativePath
        : `${baseUrl}${relativePath}`;
      return { url: fullUrl, error: null, status: response.status };
    }

    const errorMessage =
      responseData.message ||
      responseData.error ||
      `Erro ao enviar imagem (HTTP ${response.status}).`;

    console.error("Erro ao fazer upload:", {
      status: response.status,
      error: errorMessage,
      body: responseData,
    });
    return { url: null, error: errorMessage, status: response.status };
  } catch (error) {
    console.error("Erro ao fazer upload de imagem:", error);
    return {
      url: null,
      error:
        "Não foi possível enviar a foto de perfil. Verifique sua conexão com a internet e tente novamente.",
      status: 0,
    };
  }
}

/**
 * Faz upload de uma imagem local para o servidor
 * @param localUri - URI local da imagem (file://.../...)
 * @returns URL da imagem no servidor ou null se falhar
 */
export async function uploadImage(localUri) {
  const result = await uploadImageDetailed(localUri);
  return result.url;
}
/**
 * Valida se a URI é uma URL remota
 */
export function isRemoteUrl(uri) {
  return uri?.startsWith("http://") || uri?.startsWith("https://");
}
/**
 * Valida se a URI é uma URL local
 */
export function isLocalUrl(uri) {
  return uri?.startsWith("file://");
}
