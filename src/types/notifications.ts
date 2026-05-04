export type NotificationCategory = 
  | "pedidos" 
  | "ofertas" 
  | "compras" 
  | "produtos" 
  | "vendas" 
  | "laudo" 
  | "certificado" 
  | "chat"
  | "alerta"
  | "sistema";

export interface BaseNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  isNew: boolean;
  route: string;
  targetItemId?: string;
  category?: string;
}
