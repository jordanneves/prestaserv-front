import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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



export default function ServicosContratadosPrestador() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(false);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [contratoSelecionado, setContratoSelecionado] = useState<string | null>(null);
  const [modalClienteVisible, setModalClienteVisible] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const router = useRouter();

  const carregarContratos = useCallback(async () => {
    setLoading(true);
    try {
      const usuario = await AsyncStorage.getItem('usuario');
      if (!usuario) throw new Error('ID do fornecedor não encontrado');
      const parsedUsuario = JSON.parse(usuario);
      setUsuarioId(parsedUsuario.id);
      const response = await fetch(`${process.env.API_URL}/contratos?fornecedorId=${parsedUsuario.id}`);
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
      const resposta = await fetch(`${process.env.API_URL}/contratos/${id}/encerrar`, {
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

        {/* Botão ver dados do cliente */}
        <TouchableOpacity
          style={[styles.botaoEncerrar, { backgroundColor: '#17a2b8', marginTop: 8 }]}
          onPress={() => {
            setClienteSelecionado(item.cliente);
            setModalClienteVisible(true);
          }}
        >
          <Text style={styles.botaoTexto}>Ver dados do Cliente</Text>
        </TouchableOpacity>

        {/* Avaliações */}
        {(item.notaPrazo !== null || item.notaQualidade !== null || item.notaPreco !== null) && (
          <View style={{ marginTop: 8, marginBottom: 4 }}>
            <Text style={styles.label}>Avaliações:</Text>
            {item.notaPrazo !== null && (
              <Text style={styles.value}>Prazo: {item.notaPrazo}/5</Text>
            )}
            {item.notaQualidade !== null && (
              <Text style={styles.value}>Qualidade: {item.notaQualidade}/5</Text>
            )}
            {item.notaPreco !== null && (
              <Text style={styles.value}>Preço: {item.notaPreco}/5</Text>
            )}
          </View>
        )}

        {/* Comentário */}
        {item.comentario && (
          <View style={{ marginBottom: 4 }}>
            <Text style={styles.label}>Comentário:</Text>
            <Text style={styles.value}>{item.comentario}</Text>
          </View>
        )}

        {statusAberto && (
          <TouchableOpacity
            style={styles.botaoEncerrar}
            onPress={() => {
              setContratoSelecionado(item.id);
              setModalVisible(true);
            }}
          >
            <Text style={styles.botaoTexto}>Encerrar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Se quiser garantir o filtro mesmo se a API não filtrar corretamente:
  const contratosFiltrados = usuarioId ? contratos.filter(c => c.fornecedor?.id === Number(usuarioId)) : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Serviços Contratados</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#2A7BD2" />
      ) : contratosFiltrados.length === 0 ? (
        <Text style={styles.emptyText}>Você ainda não foi contratado para nenhum serviço.</Text>
      ) : (
        <FlatList
          data={contratosFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Modal de confirmação de encerramento */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 10, width: '80%', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Confirmar encerramento</Text>
            <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
              Tem certeza que deseja encerrar este contrato?
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: '#6c757d', marginHorizontal: 4 }}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.botaoTexto}>Não</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: '#28a745', marginHorizontal: 4 }}
                onPress={async () => {
                  setModalVisible(false);
                  if (contratoSelecionado) {
                    await encerrarContrato(contratoSelecionado);
                    setContratoSelecionado(null);
                  }
                }}
              >
                <Text style={styles.botaoTexto}>Sim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de dados do cliente */}
      <Modal
        transparent
        visible={modalClienteVisible}
        animationType="fade"
        onRequestClose={() => setModalClienteVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 10, width: '80%', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Dados do Cliente</Text>
            {clienteSelecionado && (
              <View style={{ width: '100%' }}>
                <Text style={{ fontSize: 16, marginBottom: 4 }}><Text style={{ fontWeight: 'bold' }}>Nome:</Text> {clienteSelecionado.nome}</Text>
                <Text style={{ fontSize: 16, marginBottom: 4 }}><Text style={{ fontWeight: 'bold' }}>Telefone:</Text> {clienteSelecionado.telefone}</Text>
                <Text style={{ fontSize: 16, marginBottom: 4 }}><Text style={{ fontWeight: 'bold' }}>Endereço:</Text> {clienteSelecionado.endereco}</Text>
                <Text style={{ fontSize: 16, marginBottom: 4 }}><Text style={{ fontWeight: 'bold' }}>Email:</Text> {clienteSelecionado.email}</Text>
              </View>
            )}
            <TouchableOpacity
              style={{ marginTop: 16, backgroundColor: '#6c757d', padding: 12, borderRadius: 8, alignItems: 'center', width: '100%' }}
              onPress={() => setModalClienteVisible(false)}
            >
              <Text style={styles.botaoTexto}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  container: { flex: 1,
  padding: 24,
  backgroundColor: '#dadef5',
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
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  statusTagContainer: {
    alignItems: 'flex-end',
    marginBottom: 4,
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
  botaoVoltar: {
    backgroundColor: '#6c757d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
