import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export type Servico = {
  id: string;
  descricao: string;
  tipoServico: string;
  valorHora: string;
  mensagem: string;
};

export type Fornecedor = {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  endereco: string;
  tipo: string;
  email: string;
};

export type Cliente = {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  endereco: string;
  tipo: string;
  email: string;
};

export type Contrato = {
  id: string;
  servico: Servico;
  fornecedor: Fornecedor;
  cliente: Cliente;
  data: string;
  dataConclusao: string | null;
  notaPrazo: number | null;
  notaQualidade: number | null;
  notaPreco: number | null;
  comentario: string | null;
};

export default function ServicosContratadosCliente() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(false);

  // useFocusEffect(
  //   useCallback(() => {
  //     const carregarContratos = async () => {
  //       setLoading(true);
  //       try {
  //         const usuario = await AsyncStorage.getItem('usuario');
  //         if (!usuario) throw new Error('ID do cliente não encontrado');
  //         const parsedUsuario = JSON.parse(usuario);

  //         const response = await fetch(`http://localhost:3000/contratos?fornecedorId=${parsedUsuario?.id}`);
  //         const data = await response.json();
  //         setContratos(data);
  //       } catch (error) {
  //         console.error('Erro ao carregar contratos:', error);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     carregarContratos();
  //   }, [])
  // );
  const carregarContratos = useCallback(async () => {
    setLoading(true);
    try {
      const usuario = await AsyncStorage.getItem('usuario');
      if (!usuario) throw new Error('ID do cliente não encontrado');
      const parsedUsuario = JSON.parse(usuario);

      const response = await fetch(`http://localhost:3000/contratos?fornecedorId=${parsedUsuario?.id}`);
      const data = await response.json();
      setContratos(data);
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      carregarContratos();
    }, [])
  );

  const encerrarContrato = async (id: string) => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const resposta = await fetch(`http://localhost:3000/contratos/${id}/encerrar`, {
        method: 'PATCH',
      });

      if (!resposta.ok) throw new Error('Erro ao encerrar contrato.');

      setContratos((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, dataConclusao: hoje } : c
        )
      );
      carregarContratos();
    } catch (error) {
      console.error('Erro ao encerrar contrato:', error);
    }
  };

  const renderItem = ({ item }: { item: Contrato }) => {
    const statusAberto = !item.dataConclusao;

    return (
      <View style={styles.card}>
        <View style={styles.statusTagContainer}>
          <View style={[
            styles.statusTag,
            { backgroundColor: statusAberto ? '#dc3545' : '#28a745' }
          ]}>
            <Text style={styles.statusTexto}>
              {statusAberto ? 'Aberto' : `Concluído em ${new Date(item.dataConclusao!).toLocaleDateString()}`}
            </Text>
          </View>
        </View>
        <Text style={styles.label}>Serviço: <Text style={styles.value}>{item.servico.descricao}</Text></Text>
        <Text style={styles.label}>Tipo: <Text style={styles.value}>{item.servico.tipoServico}</Text></Text>
        <Text style={styles.label}>Valor: <Text style={styles.value}>R$ {item.servico.valorHora}</Text></Text>
        <Text style={styles.label}>Descrição: <Text style={styles.value}>{item.servico.mensagem}</Text></Text>
        <Text style={styles.label}>Cliente: <Text style={styles.value}>{item.cliente.nome}</Text></Text>
        {item.data && (
          <Text style={styles.label}>Data: <Text style={styles.value}>{new Date(item.data).toLocaleDateString()}</Text></Text>
        )}

        {statusAberto && (
          <TouchableOpacity
            style={styles.botaoEncerrar}
            onPress={() => encerrarContrato(item.id)}
          >
            <Text style={styles.botaoTexto}>Encerrar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agendamentos</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2A7BD2" />
      ) : contratos.length === 0 ? (
        <Text style={styles.emptyText}>Você ainda não tem agendamentos.</Text>
      ) : (
        <FlatList
          data={contratos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1,
  padding: 24,
  backgroundColor: '#fff',
  width: '100%',  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#2A7BD2' },
  card: {
    backgroundColor: '#f4f4f4',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    position: 'relative'
  },
  label: { fontWeight: 'bold', color: '#333', fontSize: 16, marginBottom: 4 },
  value: { fontWeight: 'normal', color: '#555' },
  emptyText: { fontSize: 16, color: '#999', textAlign: 'center', marginTop: 40 },
  statusTag: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusTagContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  statusTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  botaoEncerrar: {
    marginTop: 12,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
