import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import client from '../../src/api/client';
import {
    ActivityIndicator,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';


interface Fornecedor {
  id: string;
  nome: string;
  email: string;
}

interface Servico {
  id: string;
  descricao: string;
  tipoServico: string;
  valorHora: string;
}

interface UsuarioServico {
  id: string;
  precoPersonalizado?: string;
  descricao?: string;
  usuario: Fornecedor;
  servico: Servico;
}


export default function ListaServicosFornecedores() {
  const [vinculos, setVinculos] = useState<UsuarioServico[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalFeedback, setModalFeedback] = useState(false);
  const [mensagemFeedback, setMensagemFeedback] = useState('');
  const [tipoFeedback, setTipoFeedback] = useState<'sucesso' | 'erro'>('sucesso');
  const [vinculoSelecionado, setVinculoSelecionado] = useState<UsuarioServico | null>(null);
  const [tipoFiltro, setTipoFiltro] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const carregarVinculos = async () => {
      setLoading(true);
      try {
  const data = await client.get('/usuarios-servicos');
  setVinculos(Array.isArray(data) ? data : []);
      } catch (error) {
        setVinculos([]);
      } finally {
        setLoading(false);
      }
    };
    carregarVinculos();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Botão de voltar no topo */}
        <TouchableOpacity style={styles.botaoVoltar} onPress={() => router.back()}>
          <Text style={styles.textoBotaoVoltar}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Serviços e Fornecedores</Text>

        {/* Filtro por tipo de serviço */}
        <View style={styles.filtroContainer}>
          <Text style={styles.filtroLabel}>Filtrar por tipo:</Text>
          <Picker
            selectedValue={tipoFiltro}
            style={styles.picker}
            onValueChange={(itemValue) => setTipoFiltro(itemValue)}
          >
            <Picker.Item label="Todos" value="" />
            {[...new Set(vinculos.map(v => v.servico?.tipoServico).filter(Boolean))].map(tipo => (
              <Picker.Item key={tipo} label={tipo} value={tipo} />
            ))}
          </Picker>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2A7BD2" />
        ) : vinculos.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum serviço vinculado encontrado.</Text>
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {vinculos
              .filter(v => !tipoFiltro || v.servico?.tipoServico === tipoFiltro)
              .map((v) => (
                <View key={v.id} style={styles.card}>
                  <Text style={styles.label}>Serviço: <Text style={styles.value}>{v.servico?.descricao}</Text></Text>
                  <Text style={styles.label}>Tipo: <Text style={styles.value}>{v.servico?.tipoServico}</Text></Text>
                  <Text style={styles.label}>Fornecedor: <Text style={styles.value}>{v.usuario?.nome || v.usuario?.email}</Text></Text>
                  <Text style={styles.label}>Preço: <Text style={styles.value}>R$ {v.precoPersonalizado || v.servico?.valorHora}</Text></Text>
                  {v.descricao ? (
                    <Text style={styles.label}>Mensagem: <Text style={styles.value}>{v.descricao}</Text></Text>
                  ) : null}
                  <TouchableOpacity
                    style={styles.botaoContratar}
                    onPress={() => {
                      setVinculoSelecionado(v);
                      setModalVisible(true);
                    }}
                  >
                    <Text style={styles.botaoTexto}>Contratar</Text>
                  </TouchableOpacity>
                </View>
              ))}
          </ScrollView>
        )}
      </View>
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
            Deseja contratar o serviço "{vinculoSelecionado?.servico?.descricao}" com o fornecedor "{vinculoSelecionado?.usuario?.nome || vinculoSelecionado?.usuario?.email}"?
          </Text>
          <View style={styles.modalBotoes}>
            <TouchableOpacity
              style={[styles.modalBotao, { backgroundColor: '#6c757d' }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.botaoTexto}>Não</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBotao, { backgroundColor: '#28a745' }]}
              onPress={async () => {
                setModalVisible(false);
                if (!vinculoSelecionado) return;
                try {
                  const usuarioStr = await AsyncStorage.getItem('usuario');
                  if (!usuarioStr) throw new Error('Usuário não encontrado');
                  const usuario = JSON.parse(usuarioStr);
                  const payload = {
                    clienteId: usuario.id,
                    fornecedorId: Number(vinculoSelecionado.usuario.id),
                    servicoId: Number(vinculoSelecionado.servico.id),
                  };
                  await client.post('/contratos', payload);
                  setMensagemFeedback('Serviço contratado com sucesso!');
                  setTipoFeedback('sucesso');
                } catch (err) {
                  setMensagemFeedback('Erro ao contratar serviço');
                  setTipoFeedback('erro');
                } finally {
                  setModalFeedback(true);
                  setTimeout(() => setModalFeedback(false), 3000);
                }
              }}
            >
              <Text style={styles.botaoTexto}>Sim</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    {/* Modal de feedback */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filtroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  filtroLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#2A7BD2',
  },
  picker: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
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
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  container: {
    flex: 1,
    backgroundColor: '#dadef5',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2A7BD2',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f4f4f4',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  label: { fontWeight: 'bold', color: '#333', fontSize: 16, marginBottom: 4 },
  value: { fontWeight: 'normal', color: '#555' },
  emptyText: { fontSize: 16, color: '#999', textAlign: 'center', marginTop: 40 },
  botaoVoltar: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'flex-start',
    minWidth: 90,
  },
  textoBotaoVoltar: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  botaoContratar: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
