import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
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

export default function ListaServicosCliente() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null);
  const [modalFeedback, setModalFeedback] = useState(false);
  const [mensagemFeedback, setMensagemFeedback] = useState('');
  const [tipoFeedback, setTipoFeedback] = useState<'sucesso' | 'erro'>('sucesso');

  useFocusEffect(
    useCallback(() => {
      const carregarServicos = async () => {
        setLoading(true);
        try {
          const response = await fetch(`${process.env.API_URL}/servicos`);
          const data = await response.json();
          setServicos(data);
        } catch (error) {
          console.error('Erro ao carregar serviços:', error);
        } finally {
          setLoading(false);
        }
      };

      carregarServicos();
    }, [])
  );

  const abrirModalConfirmacao = (servico: Servico) => {
    setServicoSelecionado(servico);
    setModalVisible(true);
  };

  const confirmarContratacao = async () => {
    if (!servicoSelecionado) return;
    setModalVisible(false);

    try {
      const resposta = await fetch(`${process.env.API_URL}/contratos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ servicoId: servicoSelecionado.id }),
      });

      if (!resposta.ok) throw new Error('Erro ao contratar');

      setMensagemFeedback(`Serviço "${servicoSelecionado.descricao}" contratado com sucesso!`);
      setTipoFeedback('sucesso');
    } catch (err) {
      console.error(err);
      setMensagemFeedback('Erro ao contratar serviço');
      setTipoFeedback('erro');
    } finally {
      setModalFeedback(true);
      setTimeout(() => setModalFeedback(false), 3000);
    }
  };

  const renderItem = ({ item }: { item: Servico }) => (
    <View style={styles.card}>
      <Text style={styles.label}>Nome: <Text style={styles.value}>{item.descricao}</Text></Text>
      <Text style={styles.label}>Tipo: <Text style={styles.value}>{item.tipoServico}</Text></Text>
      <Text style={styles.label}>Valor: <Text style={styles.value}>R$ {item.valorHora}</Text></Text>
      <Text style={styles.label}>Mensagem: <Text style={styles.value}>{item.mensagem}</Text></Text>

      <TouchableOpacity
        style={styles.botaoContratar}
        onPress={() => abrirModalConfirmacao(item)}
      >
        <Text style={styles.botaoTexto}>Contratar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Serviços Disponíveis</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2A7BD2" />
      ) : servicos.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum serviço disponível no momento.</Text>
      ) : (
        <FlatList
          data={servicos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
      <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => router.back()}
      >
          <Text style={styles.textoBotaoVoltar}>Voltar</Text>
      </TouchableOpacity>

      {/* Modal de confirmação */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Confirmar contratação</Text>
            <Text style={styles.modalMensagem}>
              Deseja contratar o serviço "{servicoSelecionado?.descricao}"?
            </Text>
            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={[styles.modalBotao, { backgroundColor: '#6c757d' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.botaoTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBotao, { backgroundColor: '#28a745' }]}
                onPress={confirmarContratacao}
              >
                <Text style={styles.botaoTexto}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        transparent
        visible={modalFeedback}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalFeedback,
            { backgroundColor: tipoFeedback === 'sucesso' ? '#28a745' : '#dc3545' }
          ]}>
            <Text style={styles.modalFeedbackTexto}>{mensagemFeedback}</Text>
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
  },
  label: { fontWeight: 'bold', color: '#333', fontSize: 16, marginBottom: 4 },
  value: { fontWeight: 'normal', color: '#555' },
  emptyText: { fontSize: 16, color: '#999', textAlign: 'center', marginTop: 40 },
  botaoContratar: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  modalMensagem: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  modalBotoes: { flexDirection: 'row', gap: 12 },
  modalBotao: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  modalFeedback: {
  padding: 16,
  borderRadius: 8,
  minWidth: '70%',
  alignItems: 'center',
  justifyContent: 'center',
  },
  modalFeedbackTexto: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  botaoVoltar: {
    backgroundColor: '#6c757d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  textoBotaoVoltar: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
