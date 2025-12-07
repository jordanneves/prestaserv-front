import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import client from '../src/api/client';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ServicosContratados() {
  const [servicos, setServicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchServicos = async () => {
      setLoading(true);
      setErro('');
      try {
  const usuarioStr = await AsyncStorage.getItem('usuario');
  if (!usuarioStr) throw new Error('Usuário não encontrado');
  const usuario = JSON.parse(usuarioStr);
  const data = await client.get(`/contratos?clienteId=${usuario?.id}`);
  setServicos(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setErro(e.message || 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };
    fetchServicos();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Serviços Contratados</Text>
      {loading && <ActivityIndicator size="large" color="#2A7BD2" />}
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
      {!loading && !erro && (
        <FlatList
          data={servicos}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.servicoBox}>
              <Text style={styles.servicoNome}>{item.servico?.nome || 'Serviço'}</Text>
              <Text style={styles.servicoInfo}>Fornecedor: {item.fornecedor?.nome || '-'}</Text>
              <Text style={styles.servicoInfo}>Data: {item.data ? new Date(item.data).toLocaleDateString() : '-'}</Text>
              <Text style={styles.servicoInfo}>Status: {item.status || '-'}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.vazio}>Nenhum serviço contratado.</Text>}
        />
      )}

      <TouchableOpacity
        style={styles.botaoVoltar}
        onPress={() => router.back()}
      >
        <Text style={styles.botaoTexto}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2A7BD2', marginBottom: 20, textAlign: 'center' },
  erro: { color: 'red', textAlign: 'center', marginVertical: 10 },
  servicoBox: {
    backgroundColor: '#F2F6FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  servicoNome: { fontWeight: 'bold', fontSize: 18, color: '#2A7BD2' },
  servicoInfo: { fontSize: 15, color: '#333', marginTop: 2 },
  vazio: { textAlign: 'center', color: '#777', marginTop: 40 },
  botaoVoltar: {
    backgroundColor: '#6c757d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
