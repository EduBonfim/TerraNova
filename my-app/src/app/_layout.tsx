import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AppLayout() {
  return (
    <Tabs 
      screenOptions={{
        headerShown: false, 
        tabBarActiveTintColor: '#F9A825', 
        tabBarInactiveTintColor: '#dfdfdf', 
        tabBarStyle: {
          backgroundColor: '#6B8E23',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        }
      }}
    >
      {/* 👇 0. TELA DE BOAS-VINDAS (Agora é o index, a 1ª tela do app. Fica oculta do menu) 👇 */}
      <Tabs.Screen 
        name="index" 
        options={{ 
          href: null, 
          tabBarStyle: { display: 'none' } 
        }} 
      />

      {/* 👇 1. ABA INICIAL / PAINEL (Agora se chama 'home') 👇 */}
      <Tabs.Screen 
        name="home" 
        options={{ 
          title: 'Início',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />
        }} 
      />

      {/* 2. Aba do Mapa */}
      <Tabs.Screen 
        name="map" 
        options={{ 
          title: 'Mapa',
          tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} />
        }} 
      />

      {/* 3. Aba do Marketplace */}
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Mercado',
          tabBarIcon: ({ color, size }) => <Ionicons name="storefront" size={size} color={color} />
        }} 
      />

      {/* 4. Aba da Trilha Orgânica */}
      <Tabs.Screen 
        name="organic" 
        options={{ 
          href: null,
          tabBarStyle: { display: 'none' }
        }} 
      />

      {/* 5. Aba de Mensagens (Chat) */}
      <Tabs.Screen 
        name="messages" 
        options={{ 
          title: 'Chat',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} />
        }} 
      />

      {/* 6. Aba de Perfil */}
      <Tabs.Screen 
        name="account" 
        options={{ 
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />
        }} 
      />

      {/* --- TELAS OCULTAS DO MENU --- */}
      <Tabs.Screen 
        name="scan" 
        options={{ 
          href: null, 
          tabBarStyle: { display: 'none' } 
        }} 
      />

      <Tabs.Screen 
        name="post" 
        options={{ 
          href: null, 
          tabBarStyle: { display: 'none' } 
        }} 
      />

      <Tabs.Screen 
        name="login" 
        options={{ 
          href: null, 
          tabBarStyle: { display: 'none' } 
        }} 
      />

      <Tabs.Screen 
        name="register" 
        options={{ 
          href: null, 
          tabBarStyle: { display: 'none' } 
        }} 
      />

      <Tabs.Screen
        name="transport"
        options={{
          href: null,
          tabBarStyle: { display: 'none' }
        }}
      />

      <Tabs.Screen
        name="user-profile"
        options={{
          href: null,
          tabBarStyle: { display: 'none' }
        }}
      />

      <Tabs.Screen
        name="certificates"
        options={{
          href: null,
          tabBarStyle: { display: 'none' }
        }}
      />
      
    </Tabs>
  );
}