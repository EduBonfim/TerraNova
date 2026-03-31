export type MarketplaceOpportunity = {
  id: string;
  produto: string;
  vendedor: string;
  preco: string;
  estoque: string;
  icone: "leaf" | "leaf-outline" | "flask" | "basket";
  foto: string;
};

export const MARKETPLACE_OPPORTUNITIES: MarketplaceOpportunity[] = [
  {
    id: "1",
    produto: "Cama de Frango - Tonelada",
    vendedor: "Fazenda São João",
    preco: "R$ 150,00",
    estoque: "12 toneladas disponíveis",
    icone: "leaf",
    foto: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "2",
    produto: "Esterco Bovino Curtido - Ton",
    vendedor: "Sítio Esperança",
    preco: "R$ 90,00",
    estoque: "2 toneladas Curtido",
    icone: "leaf-outline",
    foto: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "3",
    produto: "Composto Orgânico Premium - 50kg",
    vendedor: "Central Compostagem Comunitária",
    preco: "R$ 45,00",
    estoque: "Retirada imediata",
    icone: "flask",
    foto: "https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "4",
    produto: "Tomate Cereja Orgânico - 15kg",
    vendedor: "Sítio Esperança",
    preco: "R$ 110,00",
    estoque: "Selo Orgânico MAPA",
    icone: "basket",
    foto: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1200&q=80",
  },
];