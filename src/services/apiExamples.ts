/**
 * EXEMPLOS DE USO DO API CLIENT
 * 
 * Use este arquivo como referência para integrar o backend
 */

import { get, post, put, httpDelete } from "./api";

/**
 * Exemplo 1: Buscar lista de itens
 */
export async function fetchNotifications() {
  const response = await get("/notifications");
  if (!response.success) {
    console.error("Erro ao buscar notificações:", response.error);
    return null;
  }
  return response.data;
}

/**
 * Exemplo 2: Criar novo item (POST)
 */
export async function createAnnouncement(
  title: string,
  description: string,
  price: string,
) {
  const response = await post("/announcements", {
    title,
    description,
    price,
    createdAt: new Date().toISOString(),
  });

  if (!response.success) {
    console.error("Erro ao criar anúncio:", response.error);
    return null;
  }

  return response.data;
}

/**
 * Exemplo 3: Atualizar item (PUT)
 */
export async function updateProfile(userId: string, bio: string) {
  const response = await put(`/users/${userId}`, {
    bio,
    updatedAt: new Date().toISOString(),
  });

  if (!response.success) {
    console.error("Erro ao atualizar perfil:", response.error);
    return null;
  }

  return response.data;
}

/**
 * Exemplo 4: Deletar item
 */
export async function deleteAnnouncement(announcementId: string) {
  const response = await httpDelete(`/announcements/${announcementId}`);
  if (!response.success) {
    console.error("Erro ao deletar anúncio:", response.error);
    return false;
  }
  return true;
}

/**
 * COMO USAR NAS TELAS:
 * 
 * 1. Importar
 *    import { fetchNotifications } from "../services/apiExamples"
 * 
 * 2. No useEffect
 *    useEffect(() => {
 *      const loadData = async () => {
 *        const data = await fetchNotifications()
 *        setNotifications(data)
 *      }
 *      loadData()
 *    }, [])
 * 
 * 3. Na ação de botão
 *    onPress={async () => {
 *      setIsLoading(true)
 *      await createAnnouncement(title, desc, price)
 *      setIsLoading(false)
 *    }}
 */
