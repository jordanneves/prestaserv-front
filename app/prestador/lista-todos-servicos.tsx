import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import client from '../../src/api/client';
import {
    ActivityIndicator, Alert, Modal, SafeAreaView,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity, View
} from 'react-native';


// Tipo do serviço
interface Servico {
  id: string;
  descricao: string;
  tipoServico: string;
  valorHora: string;
}

export default function ListaTodosServicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null);
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [usuarioId, setUsuarioId] = useState<string | null>(null);

  useEffect(() => {
    const carregarServicos = async () => {
      setLoading(true);
      try {
        const usuario = await AsyncStorage.getItem('usuario');
        if (usuario) {
          const parsed = JSON.parse(usuario);
          setUsuarioId(parsed.id);
        }
  const data = await client.get('/servicos');
  setServicos(Array.isArray(data) ? data : []);
      } catch (error) {
        setServicos([]);
      } finally {
        setLoading(false);
      }
    };
    carregarServicos();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Todos os Serviços Cadastrados</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#2A7BD2" />
        ) : servicos.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum serviço cadastrado.</Text>
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {servicos.map((servico) => (
              <View key={servico.id} style={styles.card}>
                <Text style={styles.label}>Descrição: <Text style={styles.value}>{servico.descricao}</Text></Text>
                <Text style={styles.label}>Tipo: <Text style={styles.value}>{servico.tipoServico}</Text></Text>
                <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
                  <Text style={styles.addButton} onPress={() => {
                    setServicoSelecionado(servico);
                    setPreco(servico.valorHora || '');
                    setDescricao('');
                    setModalVisible(true);
                  }}>Adicionar</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
        {/* Modal de adicionar serviço ao usuário */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Adicionar Serviço</Text>
              <Text style={styles.label}>Descrição:</Text>
              <TextInput style={[styles.input, { backgroundColor: '#eee' }]} value={servicoSelecionado?.descricao || ''} editable={false} />
              <Text style={styles.label}>Tipo:</Text>
              <TextInput style={[styles.input, { backgroundColor: '#eee' }]} value={servicoSelecionado?.tipoServico || ''} editable={false} />
              <Text style={styles.label}>Preço personalizado:</Text>
              <TextInput
                style={styles.input}
                value={preco}
                onChangeText={setPreco}
                keyboardType="numeric"
                placeholder="Digite o valor"
              />
              <Text style={styles.label}>Mensagem:</Text>
              <TextInput
                style={[styles.input, { height: 60 }]}
                value={descricao}
                onChangeText={setDescricao}
                multiline
                placeholder="Mensagem complementar"
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                <TouchableOpacity
                  style={styles.botaoSalvar}
                  onPress={async () => {
                    if (!usuarioId || !servicoSelecionado) return;
                      try {
                      setLoading(true);
                      await client.post('/usuarios-servicos', {
                          usuario: { id: usuarioId },
                          servico: { id: servicoSelecionado.id },
                          precoPersonalizado: preco,
                          descricao: descricao,
                      });
                      Alert.alert('Sucesso', 'Serviço adicionado ao usuário!');
                      setModalVisible(false);
                    } catch (error) {
                      Alert.alert('Erro', 'Não foi possível adicionar o serviço.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <Text style={styles.botaoTexto}>Adicionar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalVisible(false)}>
                  <Text style={styles.botaoTexto}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  addButton: {
    color: '#fff',
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: 16,
    overflow: 'hidden',
    textAlign: 'center',
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
    borderRadius: 12,
    width: '85%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2A7BD2',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  botaoSalvar: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  botaoCancelar: {
    backgroundColor: '#dc3545',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
});
