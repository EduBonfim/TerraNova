/**
 * EXEMPLO DE USO DO useAsync HOOK
 * 
 * Este arquivo mostra como usar o hook em componentes
 */

/**
 * EXEMPLO 1: Componente de Home com loading + error
 * 
 * import { useAsync } from "../hooks/useAsync"
 * import { fetchNotifications } from "../services/apiExamples"
 * 
 * export default function HomeScreen() {
 *   const { data: notifications, isLoading, error, execute } = useAsync(fetchNotifications)
 * 
 *   useEffect(() => {
 *     execute() // Executar ao montar
 *   }, [])
 * 
 *   if (isLoading) {
 *     return <ActivityIndicator />
 *   }
 * 
 *   if (error) {
 *     return (
 *       <View>
 *         <Text>Erro: {error}</Text>
 *         <TouchableOpacity onPress={execute}>
 *           <Text>Tentar de novo</Text>
 *         </TouchableOpacity>
 *       </View>
 *     )
 *   }
 * 
 *   return (
 *     <FlatList
 *       data={notifications}
 *       renderItem={...}
 *     />
 *   )
 * }
 */

/**
 * EXEMPLO 2: Botão com loading durante requisição
 * 
 * import { useAsync } from "../hooks/useAsync"
 * import { createAnnouncement } from "../services/apiExamples"
 * 
 * export default function PostScreen() {
 *   const { isLoading, execute: publishAd } = useAsync(
 *     () => createAnnouncement(title, description, price),
 *     (error) => Alert.alert("Erro ao publicar", error)
 *   )
 * 
 *   return (
 *     <TouchableOpacity 
 *       onPress={publishAd}
 *       disabled={isLoading}
 *     >
 *       <Text>{isLoading ? "Publicando..." : "Publicar"}</Text>
 *     </TouchableOpacity>
 *   )
 * }
 */

/**
 * EXEMPLO 3: Com retry automático
 * 
 * import { useAsyncWithRetry } from "../hooks/useAsync"
 * 
 * export default function MarketplaceScreen() {
 *   const { data: products, isLoading, retryCount, execute } = useAsyncWithRetry(
 *     () => fetchMarketplaceProducts(),
 *     3 // Máximo 3 tentativas
 *   )
 * 
 *   useEffect(() => {
 *     execute()
 *   }, [])
 * 
 *   if (retryCount > 0) {
 *     console.log(`Tentativa ${retryCount} de buscar produtos`)
 *   }
 * 
 *   return ...
 * }
 */
