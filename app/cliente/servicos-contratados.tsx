import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
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

  const [modalVisible, setModalVisible] = useState(false);
  const [avaliacao, setAvaliacao] = useState({
    notaPrazo: 0,
    notaQualidade: 0,
    notaPreco: 0,
    comentario: '',
  });
  const [contratoSelecionado, setContratoSelecionado] = useState<Contrato | null>(null);

  const carregarContratos = useCallback(async () => {
    setLoading(true);
    try {
      const usuario = await AsyncStorage.getItem('usuario');
      if (!usuario) throw new Error('ID do cliente não encontrado');
      const parsedUsuario = JSON.parse(usuario);

      const response = await fetch(`http://localhost:3000/contratos?clienteId=${parsedUsuario?.id}`);
      const data = await response.json();
      setContratos(data);
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { carregarContratos(); }, [carregarContratos]));

  const enviarAvaliacao = async () => {
    if (!contratoSelecionado) return;
    try {
      await fetch(`http://localhost:3000/contratos/${contratoSelecionado.id}/avaliar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...avaliacao,
          dataConclusao: contratoSelecionado.dataConclusao
        }),
      });

      setModalVisible(false);
      setAvaliacao({ notaPrazo: 0, notaQualidade: 0, notaPreco: 0, comentario: '' });
      setContratoSelecionado(null);
      carregarContratos();
    } catch (err) {
      console.error('Erro ao avaliar contrato:', err);
    }
  };

  const renderStars = (value: number, onChange: (val: number) => void) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity key={i} onPress={() => onChange(i)}>
            <Text style={{ fontSize: 28, marginRight: 4 }}>{i <= value ? '★' : '☆'}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderItem = ({ item }: { item: Contrato }) => {
    const avaliado = item.notaPrazo !== null;

    return (
      <View style={styles.card}>
        <Text style={styles.label}>Serviço: <Text style={styles.value}>{item.servico.descricao}</Text></Text>
        <Text style={styles.label}>Tipo: <Text style={styles.value}>{item.servico.tipoServico}</Text></Text>
        <Text style={styles.label}>Valor: <Text style={styles.value}>R$ {item.servico.valorHora}</Text></Text>
        <Text style={styles.label}>Descrição: <Text style={styles.value}>{item.servico.mensagem}</Text></Text>
        <Text style={styles.label}>Fornecedor: <Text style={styles.value}>{item.fornecedor.nome}</Text></Text>
        {item.data && (
          <Text style={styles.label}>Data: <Text style={styles.value}>{new Date(item.data).toLocaleDateString()}</Text></Text>
        )}
        {item.dataConclusao && (
          <Text style={[styles.label, { color: 'green' }]}>
            Concluído em {new Date(item.dataConclusao).toLocaleDateString()}
          </Text>
        )}
        {!avaliado && item.dataConclusao && (
          <TouchableOpacity
            style={styles.botaoAvaliar}
            onPress={() => {
              setContratoSelecionado(item);
              setModalVisible(true);
            }}
          >
            <Text style={styles.botaoTexto}>Avaliar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Serviços Contratados</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2A7BD2" />
      ) : contratos.length === 0 ? (
        <Text style={styles.emptyText}>Você ainda não contratou nenhum serviço.</Text>
      ) : (
        <FlatList
          data={contratos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <TouchableOpacity
        style={styles.botaoVoltar}
        onPress={() => router.back()}
      >
        <Text style={styles.botaoTexto}>Voltar</Text>
      </TouchableOpacity>

      {/* Modal de avaliação */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Avaliar Serviço</Text>

            <Text style={styles.label}>Prazo:</Text>
            {renderStars(avaliacao.notaPrazo, (val) => setAvaliacao(prev => ({ ...prev, notaPrazo: val })))}

            <Text style={styles.label}>Qualidade:</Text>
            {renderStars(avaliacao.notaQualidade, (val) => setAvaliacao(prev => ({ ...prev, notaQualidade: val })))}

            <Text style={styles.label}>Preço:</Text>
            {renderStars(avaliacao.notaPreco, (val) => setAvaliacao(prev => ({ ...prev, notaPreco: val })))}

            <Text style={styles.label}>Comentário:</Text>
            <TextInput
              style={styles.input}
              placeholder="Opcional..."
              value={avaliacao.comentario}
              onChangeText={(val) => setAvaliacao(prev => ({ ...prev, comentario: val }))}
              multiline
            />

            <TouchableOpacity style={styles.botaoAvaliar} onPress={enviarAvaliacao}>
              <Text style={styles.botaoTexto}>Enviar Avaliação</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    width: '100%',
  },
  label: { fontWeight: 'bold', color: '#333', fontSize: 16, marginBottom: 4 },
  value: { fontWeight: 'normal', color: '#555' },
  emptyText: { fontSize: 16, color: '#999', textAlign: 'center', marginTop: 40 },
  botaoAvaliar: {
    backgroundColor: '#007bff',
    padding: 12,
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    minHeight: 60,
    textAlignVertical: 'top',
  },
});
