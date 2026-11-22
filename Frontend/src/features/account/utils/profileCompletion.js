export const calculateProfileCompletion = (user) => {
  if (!user) return { percentage: 0, steps: [] };

  const isProducer = user.role === "producer";

  const steps = [
    {
      id: "photo",
      label: "Foto de Perfil",
      description: "Adicione uma foto para ser reconhecido na comunidade.",
      weight: 20,
      isCompleted: !!user.avatarUri,
      route: "/edit-profile",
    },
    {
      id: "bio",
      label: "Sua Bio",
      description: "Conte um pouco sobre sua história e produção.",
      weight: 20,
      isCompleted: !!user.bio && user.bio.trim().length > 0,
      route: "/edit-profile",
    },
    {
      id: "phone",
      label: "Telefone de Contato",
      description: "Fundamental para fechar vendas e combinar entregas.",
      weight: 20,
      isCompleted: !!user.phone && user.phone.trim().length > 0,
      route: "/edit-profile",
    },
  ];

  if (isProducer) {
    // Campos específicos para Produtor
    steps.push(
      {
        id: "farmName",
        label: "Nome da Fazenda",
        description: "Dê uma identidade para sua propriedade no mercado.",
        weight: 20,
        isCompleted: !!user.farmName && user.farmName !== "Minha Fazenda",
        route: "/edit-profile",
      },
      {
        id: "address",
        label: "Localização da Porteira",
        description: "Cadastre seu CEP e valide sua localização no mapa.",
        weight: 20,
        isCompleted: !!user.address?.street && !!user.address?.cep,
        route: "/edit-profile",
      }
    );
  } else {
    // Campos específicos para Consumidor
    steps.push({
      id: "address",
      label: "Endereço de Entrega",
      description: "Cadastre onde você deseja receber seus produtos.",
      weight: 40, // Peso maior para compensar a falta do nome da fazenda
      isCompleted: !!user.address?.street && !!user.address?.number,
      route: "/edit-address",
    });
  }

  const totalWeight = steps.reduce((acc, step) => acc + step.weight, 0);
  const completedWeight = steps
    .filter((s) => s.isCompleted)
    .reduce((acc, step) => acc + step.weight, 0);

  const percentage = Math.round((completedWeight / totalWeight) * 100);

  return { percentage, steps };
};
