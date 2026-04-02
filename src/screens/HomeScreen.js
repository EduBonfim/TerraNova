import React from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, Text, StatusBar } from 'react-native';
import CycleCard from '../components/CycleCard'; // Importando o Card que acabamos de criar

// Dados estáticos temporários para vermos o layout funcionando
const DATA = [
  { id: '1', title: 'Ciclo Soja Premium', status: 'Ativo', date: '21/03/2026', type: 'compost' },
  { id: '2', title: 'Recuperação de Solo', status: 'Pendente', date: '25/03/2026', type: 'sync' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerContainer}>
        <Text style={styles.brandText}>Terra Nova</Text>
        <Text style={styles.welcomeText}>Olá, Eduardo</Text>
        <Text style={styles.subtitle}>Gestão de Ciclos Sustentáveis</Text>
      </View>

      <FlatList
        data={DATA}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <CycleCard 
            title={item.title} 
            status={item.status} 
            date={item.date} 
            type={item.type} 
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum ciclo registrado no Terra Nova.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerContainer: {
    padding: 25,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    marginBottom: 15,
  },
  brandText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2e7d32',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 5,
  },
  welcomeText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});