import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Home() {
  const [usuario, setUsuario] = useState<{ nome: string; email: string; tipo: string } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUsuario = async () => {
      const usuarioStr = await AsyncStorage.getItem('usuario');
      if (usuarioStr) {
        try {
          const user = JSON.parse(usuarioStr);
          setUsuario({ nome: user.nome, email: user.email, tipo: user.tipo });
        } catch {}
      }
    };
    fetchUsuario();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('usuario');
    setModalVisible(false);
    router.replace('/(auth)/login');
  };
  const renderPrestador = ()=>{
    return <>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/prestador/lista-servicos')}>
        <Text style={styles.buttonText}>Meus serviços</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: '#4CAF50', marginTop: 10 }]} onPress={() => router.push('/prestador/servicos-contratados')}>
        <Text style={styles.buttonText}>Meus agendamentos</Text>
      </TouchableOpacity>
    </>
  }
  const renderCliente = ()=>{
    return <>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/cliente/lista-servicos-cliente')}>
        <Text style={styles.buttonText}>Contratar Serviços</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: '#4CAF50', marginTop: 10 }]} onPress={() => router.push('/cliente/servicos-contratados')}>
        <Text style={styles.buttonText}>Meus Serviços Contratados</Text>
      </TouchableOpacity>
    </>
  }

  return (
    <View style={styles.container}>
        <Image
          source={require('../LogoPrestaservFundo.png')}
          style={styles.logo}
        />
        <TouchableOpacity style={styles.userIcon} onPress={() => setModalVisible(true)}>
          <Text style={styles.userIconText}>👤</Text>
        </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Dados do Usuário</Text>
            {usuario && (
              <>
                <Text style={styles.userLabel}>Nome:</Text>
                <Text style={styles.userValue}>{usuario.nome}</Text>
                <Text style={styles.userLabel}>Email:</Text>
                <Text style={styles.userValue}>{usuario.email}</Text>
              </>
            )}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Sair</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton} onPress={() => setContactModalVisible(true)}>
              <Text style={styles.contactButtonText}>Fale Conosco</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {usuario?.tipo === "fornecedor" ? renderPrestador() : renderCliente()}
      {/* Modal Fale Conosco */}
      <Modal
        visible={contactModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setContactModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Fale Conosco</Text>
            <Text style={{marginBottom: 8, color: '#333'}}>Descreva sua dúvida ou sugestão:</Text>
            <View style={{width: '100%'}}>
              <TextInput
                style={styles.contactInput}
                placeholder="Digite sua mensagem..."
                value={contactMessage}
                onChangeText={text => { setContactMessage(text); if (contactError) setContactError(''); }}
                multiline
                numberOfLines={4}
              />
              {contactError ? (
                <Text style={styles.contactError}>{contactError}</Text>
              ) : null}
            </View>
            <TouchableOpacity style={styles.contactButton} onPress={() => {
              if (!contactMessage.trim()) {
                setContactError('Por favor, preencha a mensagem antes de enviar.');
                return;
              }
              setContactSuccess(true);
            }}>
              <Text style={styles.contactButtonText}>Enviar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setContactModalVisible(false)}>
              <Text style={styles.closeText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Modal de sucesso do contato */}
      <Modal
        visible={contactSuccess}
        transparent
        animationType="fade"
        onRequestClose={() => setContactSuccess(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Envio com Sucesso</Text>
            <Text style={{marginBottom: 16, color: '#333', textAlign: 'center'}}>Sua mensagem foi enviada com sucesso!</Text>
            <TouchableOpacity style={styles.contactButton} onPress={() => {
              setContactSuccess(false);
              setContactModalVisible(false);
              setContactMessage('');
            }}>
              <Text style={styles.contactButtonText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#dadef5' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2A7BD2', marginBottom: 24 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 0,
    marginBottom: 20,
    position: 'relative',
  },
  logo: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  userIcon: {
    position: 'absolute',
    right: 24,
    top: 0,
    backgroundColor: '#E3EFFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  userIconText: { fontSize: 22 },
  userBox: {
    backgroundColor: '#F2F6FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    minWidth: 250,
    paddingTop: 50,
  },
  userLabel: { fontWeight: 'bold', color: '#2A7BD2', fontSize: 16 },
  userValue: { marginBottom: 8, fontSize: 16, color: '#333' },
  button: {
    backgroundColor: '#2A7BD2',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
    minWidth: 260,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
    minWidth: 260,
    elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#2A7BD2', marginBottom: 16 },
  logoutButton: {
    backgroundColor: '#E53935',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
  },
  logoutButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  contactButton: {
    backgroundColor: '#2A7BD2',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 8,
  },
  contactButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  closeText: { color: '#2A7BD2', marginTop: 8, fontSize: 15 },
  contactInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    width: 240,
    marginBottom: 12,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  contactError: {
    color: '#E53935',
    fontSize: 14,
    marginTop: 2,
    marginBottom: 6,
    textAlign: 'left',
    width: '100%',
  },
});
