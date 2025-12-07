import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createUsuario } from '../../src/api/registerApi';

export default function Register() {
  const router = useRouter();
  const [tipoUsuario, setTipoUsuario] = useState<'cliente' | 'fornecedor'>('cliente');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [endereco, setEndereco] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const handleRegister = async () => {
    if (!nome || !email || !telefone || !cpf || !endereco || !senha || !confirmarSenha) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }
    try {
      await createUsuario({
        nome,
        email,
        telefone,
        cpf,
        endereco,
        senha,
        tipo: tipoUsuario,
      });
      Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
      router.push('/(auth)/login');
    } catch (error: any) {
      let errorMessage = 'Erro ao cadastrar usuário';
      if (error?.response?.data?.message) {
        errorMessage = Array.isArray(error.response.data.message)
          ? error.response.data.message.join('\n')
          : error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      Alert.alert('Erro', errorMessage);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <Text style={styles.subtitle}>Por favor insira os detalhes para o registro.</Text>

      <TextInput placeholder="Nome" style={styles.input} value={nome} onChangeText={setNome} />
      <TextInput placeholder="Email" style={styles.input} keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Telefone" style={styles.input} keyboardType="phone-pad" value={telefone} onChangeText={setTelefone} />
      <TextInput placeholder="CPF/CNPJ" style={styles.input} value={cpf} onChangeText={setCpf} />
      <TextInput placeholder="Endereço" style={styles.input} value={endereco} onChangeText={setEndereco} />
      <TextInput placeholder="Senha" style={styles.input} secureTextEntry value={senha} onChangeText={setSenha} />
      <TextInput placeholder="Confirmar senha" style={styles.input} secureTextEntry value={confirmarSenha} onChangeText={setConfirmarSenha} />

      <Text style={styles.inputLabel}>Tipo de Usuário</Text>
      <View style={styles.tipoUsuarioContainer}>
        <TouchableOpacity
          style={[styles.tipoUsuarioButton, tipoUsuario === 'cliente' && styles.tipoUsuarioButtonAtivo]}
          onPress={() => setTipoUsuario('cliente')}
        >
          <Text style={tipoUsuario === 'cliente' ? styles.tipoUsuarioTextAtivo : styles.tipoUsuarioText}>Cliente</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tipoUsuarioButton, tipoUsuario === 'fornecedor' && styles.tipoUsuarioButtonAtivo]}
          onPress={() => setTipoUsuario('fornecedor')}
        >
          <Text style={tipoUsuario === 'fornecedor' ? styles.tipoUsuarioTextAtivo : styles.tipoUsuarioText}>Fornecedor</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrar</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Já tem uma conta?{' '}
        <Text style={styles.link} onPress={() => router.push('/(auth)/login')}>
          Login
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center', backgroundColor: '#dadef5' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2A7BD2', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#777', marginBottom: 20 },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  tipoUsuarioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tipoUsuarioButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2A7BD2',
    borderRadius: 6,
    marginHorizontal: 5,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  tipoUsuarioButtonAtivo: {
    backgroundColor: '#2A7BD2',
  },
  tipoUsuarioText: {
    color: '#2A7BD2',
    fontWeight: 'bold',
  },
  tipoUsuarioTextAtivo: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#2A7BD2',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footerText: { textAlign: 'center', fontSize: 14 },
  link: { color: '#2A7BD2', fontWeight: 'bold' },
});
