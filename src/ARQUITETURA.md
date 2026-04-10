# Arquitetura do Projeto: Modular Híbrida (Feature-Based)

Neste projeto, utilizamos uma **Arquitetura Modular baseada em Features**, uma abordagem excelente para aplicativos React Native/Expo de médio a grande porte. Ela aproveita alguns preceitos do padrão corporativo "Feature-Sliced Design (FSD)", mas simplificados para focar em produtividade.

O princípio central dessa arquitetura é agrupar a maior parte do código com base nos **"domínios de negócio"** (Features) ao invés do seu tipo técnico.

## Como o código está organizado?

O código-fonte do aplicativo reside em `src/` e é dividido da seguinte forma:

```text
src/
 ├── app/         # Camada de Roteamento (Páginas - Expo Router)
 ├── features/    # Blocos independentes de negócio (Módulos)
 ├── components/  # Componentes de UI 100% Genéricos (Botões, Cards Base, Cabeçalhos)
 ├── contexts/    # Contextos Globais (ex: AuthContext)
 ├── services/    # Integrações externas globais e APIs base
 ├── hooks/       # Hooks reutilizáveis globais
 ├── styles/      # Estilos e configurações globais
 ├── theme/       # Design System Global (cores, fontes, espaçamentos)
 └── utils/       # Funções utilitárias puras
```

---

## O Propósito de cada pasta principal

### 1. `app/` (Rotas e Páginas)
Com a utilização do Expo Router, esta pasta funciona apenas como o roteamento.
**Regra de Ouro:** Arquivos aqui devem ser o mais "magros" possível. Eles apenas compõem a tela importando os blocos da pasta `features/`. Lógicas complexas ou formulários imensos NÃO devem existir puros aqui dentro.

### 2. `features/` (O Coração do Negócio)
Aqui ficam as regras de negócios da nossa aplicação. Cada sub-pasta é um domínio do aplicativo. Por exemplo: `account`, `admin`, `marketplace`, `soil-analysis`, etc.
Dentro de cada feature, o código pode se subdividir em:
- `ui/`: Componentes visuais específicos dessa regra de negócio (ex: O card específico do produtor, o scanner de laudo de solo).
- `api/`: As chamadas de backend específicas desse domínio.
- `model/`: O estado e regras de negócio da feature (Stores do Zustand, tipagens, etc.)

**Por que não jogar tudo em `components/`?**
Se colocarmos um `ScanLaudoSolo.tsx` em `components/`, qualquer área do app fatalmente poderá herdar lógicas que na verdade eram exclusivas de um domínio. O foco de estar em `features/soil-analysis/ui/` impede dependências incorretas.

### 3. `components/` (UI Genérica Compartilhada)
Componentes puramente visuais e desconectados das regras de banco de dados do app moram aqui.
**Exemplos:** `SurfaceCard` (Apenas uma View com bordas bonitas), `AppHeader` (Um título com botão voltar genérico), `PrimaryButton`, `TextInput`.

---

## Por que essa separação? ("Como você se desenrola")

Para construir uma nova tela ou dar manutenção, siga este fluxo mental:

1. **Eu vou criar um botão, input novo ou um container bonito?**
   - *R:* Isso é Genérico. Crie em `src/components/`.
   
2. **Eu vou criar um cartão de exibição que mostra dados do banco de dados (ex: Ciclo de Vida do Adubo)?**
   - *R:* Isso pertence a um domínio. Crie dentro de `src/features/nome-do-dominio/ui/`.

3. **Eu preciso criar a tela do aplicativo onde essa informação vai aparecer?**
   - *R:* Você cria o roteamento em `src/app/` (ex: `src/app/ciclos.tsx`), importa o botão padrão do `/components`, o cartão com informações do `/features`, e os renderiza na tela.

Essa abordagem preserva a sanidade da equipe: O código que lida com dados fica perto dos dados (em `features/`) enquanto que os arquivos de roteamento e estilo são enxutos e altamente reutilizáveis!
