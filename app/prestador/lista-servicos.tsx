import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Servico = {
  id: string;
  descricao: string;
  tipoServico: string;
  valorHora: string;
  mensagem: string;
};

export default function ListaServicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const carregarServicos = async () => {
        setLoading(true);
        try {
          const usuario = await AsyncStorage.getItem('usuario');
          if (!usuario) throw new Error('ID do fornecedor não encontrado');
          const parsedUsuario = JSON.parse(usuario);
          setUsuarioId(parsedUsuario.id);
          const response = await fetch(`http://localhost:3000/usuarios-servicos?usuarioId=${parsedUsuario.id}`);
          if (!response.ok) {
            throw new Error('Erro ao buscar serviços');
          }
          const data = await response.json();
          // Ajusta para o formato esperado pelo componente
          const servicos = (data || []).map((item: any) => ({
            id: item.servico?.id?.toString() || item.id?.toString() || '',
            descricao: item.servico?.descricao || '',
            tipoServico: item.servico?.tipoServico || '',
            valorHora: item.precoPersonalizado || '',
            mensagem: item.descricao || '',
          }));
          setServicos(servicos);
        } catch (error) {
          console.error('Erro ao carregar serviços:', error);
          Alert.alert('Erro', 'Não foi possível carregar os serviços.');
        } finally {
          setLoading(false);
        }
      };

      carregarServicos();
    }, [])
  );

  const renderItem = ({ item }: { item: Servico }) => (
    <View style={styles.card}>
      <Text style={styles.label}>Descrição: <Text style={styles.value}>{item.descricao}</Text></Text>
      <Text style={styles.label}>Tipo: <Text style={styles.value}>{item.tipoServico}</Text></Text>
      <Text style={styles.label}>Valor: <Text style={styles.value}>R$ {item.valorHora}</Text></Text>
      <Text style={styles.label}>Mensagem: <Text style={styles.value}>{item.mensagem}</Text></Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Serviços</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2A7BD2" />
      ) : servicos.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum serviço cadastrado ainda.</Text>
      ) : (
        <FlatList
          data={servicos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <TouchableOpacity
        style={styles.botaoNovoServico}
        onPress={() => router.push('/prestador/lista-todos-servicos')}
      >
        <Text style={styles.botaoTexto}>Novo Serviço</Text>
      </TouchableOpacity>

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
  container: { flex: 1, padding: 24, backgroundColor: '#dadef5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#2A7BD2' },
  card: {
    backgroundColor: '#f4f4f4',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  label: { fontWeight: 'bold', color: '#333', fontSize: 16, marginBottom: 4 },
  value: { fontWeight: 'normal', color: '#555' },
  emptyText: { fontSize: 16, color: '#999', textAlign: 'center', marginTop: 40 },
  botaoNovoServico: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  botaoVoltar: {
    backgroundColor: '#6c757d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
