import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { createServico } from '../servicesApi';

interface ServiceFormData {
  serviceName: string;
  serviceType: string;
  serviceValue: string;
  serviceMessage: string;
}

export default function ServicesScreen(){
  const [serviceName, setServiceName] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('');
  const [serviceValue, setServiceValue] = useState<string>('');
  const [serviceMessage, setServiceMessage] = useState<string>('');

  const handleSave = async (): Promise<void> => {
    try {
      await createServico({
        descricao: serviceName,
        tipoServico: serviceType,
        valorHora: Number(serviceValue),
        mensagem: serviceMessage,
      });
      Alert.alert('Sucesso', 'Serviço salvo com sucesso!');
      setServiceName('');
      setServiceType('');
      setServiceValue('');
      setServiceMessage('');
      router.push("/prestador/lista-servicos")
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao salvar serviço');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="menu" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CADASTRO DE SERVIÇO</Text>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="person-circle-outline" size={28} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Nome do Serviço</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o nome do serviço"
            value={serviceName}
            onChangeText={setServiceName}
            keyboardType="default"
          />

          <Text style={styles.inputLabel}>Tipo de serviço</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o tipo de serviço"
            value={serviceType}
            onChangeText={setServiceType}
            keyboardType="default"
          />

          <Text style={styles.inputLabel}>Valor</Text>
          <TextInput
            style={styles.input}
            placeholder="Valor da hora do serviço"
            keyboardType="numeric"
            value={serviceValue}
            onChangeText={setServiceValue}
          />

          <Text style={styles.inputLabel}>Mensagem</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mensagem complementar do serviço"
            multiline
            numberOfLines={4}
            value={serviceMessage}
            onChangeText={setServiceMessage}
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerIcon: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});