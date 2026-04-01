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
  {
    id: "5",
    produto: "Composto Orgânico Peneirado - 50kg",
    vendedor: "Sítio Boa Terra",
    preco: "R$ 52,00",
    estoque: "24 sacos disponíveis",
    icone: "flask",
    foto: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "6",
    produto: "Cama de Aviário Curtida - Ton",
    vendedor: "Sítio Vale Azul",
    preco: "R$ 135,00",
    estoque: "9 toneladas disponíveis",
    icone: "leaf",
    foto: "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "7",
    produto: "Húmus de Minhoca - 25kg",
    vendedor: "Sítio Nova Raiz",
    preco: "R$ 40,00",
    estoque: "18 sacos prontos para retirada",
    icone: "leaf-outline",
    foto: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80",
  },
];