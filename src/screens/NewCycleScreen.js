import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, KeyboardAvoidingView, Platform, Alert
} from 'react-native';

export default function NewCycleScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');

  const handleSaveCycle = () => {
    if (!title.trim() || !type.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha o título e o tipo do ciclo.');
      return;
    }

    Alert.alert('Sucesso', 'Ciclo registrado com sucesso no Terra Nova!');
    setTitle('');
    setType('');
    setDescription('');
    
    // Volta para a tela Home após salvar
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Novo Ciclo</Text>
          <Text style={styles.subtitle}>Cadastre uma nova atividade</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nome do Ciclo (Ex: Safra Milho)</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o nome..."
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Tipo de Ciclo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Orgânico, Mineral..."
            value={type}
            onChangeText={setType}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detalhes da operação..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholderTextColor="#999"
          />

          <TouchableOpacity style={styles.button} onPress={handleSaveCycle}>
            <Text style={styles.buttonText}>Registrar Ciclo</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  keyboardView: { flex: 1 },
  header: {
    padding: 25,
    backgroundColor: '#2e7d32',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#e8f5e9', marginTop: 5 },
  form: { paddingHorizontal: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 15 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 10, padding: 15, fontSize: 16, color: '#333',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: {
    backgroundColor: '#2e7d32', padding: 18, borderRadius: 12,
    alignItems: 'center', marginTop: 30, elevation: 2,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase' },
});