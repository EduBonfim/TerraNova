/**
 * Message Block Store
 * Gerencia o bloqueio de mensagens por usuário
 */

import { getUserBlockStatus } from "@/services/authStore";

/**
 * Verifica se um usuário (por nome) tem bloqueio de mensagens ativado
 * @param username - Nome do usuário/produtor/comprador a verificar
 * @returns true se o usuário bloqueou mensagens, false caso contrário
 */
export const isUserBlockingMessages = async (
  username: string,
): Promise<boolean> => {
  try {
    const blocked = await getUserBlockStatus(username);
    return blocked;
  } catch (error) {
    console.error("Erro ao verificar bloqueio de mensagens:", error);
    return false; // Padrão: permitir mensagens se houver erro
  }
};

/**
 * Tenta enviar uma mensagem para um usuário
 * @param receiverUsername - Nome do usuário que receberá a mensagem
 * @returns Objeto com { canSend: boolean, reason?: string }
 */
export const canSendMessage = async (
  receiverUsername: string,
): Promise<{
  canSend: boolean;
  reason?: string;
}> => {
  try {
    const isBlocked = await isUserBlockingMessages(receiverUsername);

    if (isBlocked) {
      return {
        canSend: false,
        reason: `${receiverUsername} não está recebendo mensagens diretas no momento.`,
      };
    }

    return { canSend: true };
  } catch (error) {
    console.error("Erro ao verificar permissão de envio:", error);
    return { canSend: true }; // Padrão seguro: permitir se houver erro
  }
};

/**
 * Obtém uma mensagem de aviso para exibir ao tentar enviar mensagem para usuário bloqueado
 */
export const getBlockedMessageNotification = (username: string): string => {
  return `⚠️ ${username} não está recebendo mensagens diretas.\n\nEle pode reativar isso em Configurações > Configurações de Privacidade.`;
};
