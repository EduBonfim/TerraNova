/**
 * Constantes de Status do Pedido
 * Define os status possíveis para um pedido e as transições válidas entre eles.
 */
export const ORDER_STATUS = {
  AGUARDANDO: "aguardando", // Aguardando confirmação do vendedor
  TRANSPORTE: "transporte", // Em trânsito
  FINALIZADO: "finalizado", // Entregue/Concluído
  CANCELADO: "cancelado", // Cancelado
};

/**
 * Transições de status válidas
 * Define quais status podem transicionar para quais
 */
export const VALID_TRANSITIONS = {
  aguardando: ["transporte", "cancelado"], // De AGUARDANDO: pode ir para TRANSPORTE ou CANCELADO
  transporte: ["finalizado"], // De TRANSPORTE: pode ir para FINALIZADO
  finalizado: [], // De FINALIZADO: sem transições (estado terminal)
  cancelado: [], // De CANCELADO: sem transições (estado terminal)
};

/**
 * Rótulos de exibição de status (para UI)
 */
export const STATUS_LABELS = {
  aguardando: "Aguardando Confirmação",
  transporte: "Em Transporte",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

/**
 * Função auxiliar: Verificar se uma transição é válida
 * @param {string} fromStatus - status atual
 * @param {string} toStatus - status alvo
 * @returns {boolean} true se a transição é válida
 */
export function isValidTransition(fromStatus, toStatus) {
  if (!VALID_TRANSITIONS[fromStatus]) {
    console.warn(`Status inválido: ${fromStatus}`);
    return false;
  }
  return VALID_TRANSITIONS[fromStatus].includes(toStatus);
}

/**
 * Função auxiliar: Validar um único status
 * @param {string} status - status a validar
 * @returns {boolean} true se o status é válido
 */
export function isValidStatus(status) {
  return Object.values(ORDER_STATUS).includes(status);
}
