import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { loginUsuario } from '../../src/api/loginApi';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }
    setLoading(true);
    try {
      const res = await loginUsuario({ email, senha });
      await AsyncStorage.setItem('token', res.access_token);
      await AsyncStorage.setItem('usuario', JSON.stringify(res.usuario));
      router.push('/'); // Redireciona para a página inicial após login
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../../LogoPrestaservFundo.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Entre com suas credenciais abaixo.</Text>

      <TextInput placeholder="Email" style={styles.input} keyboardType="email-address" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput placeholder="Senha" style={styles.input} secureTextEntry value={senha} onChangeText={setSenha} />

      <TouchableOpacity onPress={() => {}} style={styles.forgotPassword}>
        <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Não tem uma conta?{' '}
        <Text style={styles.link} onPress={() => router.push('/(auth)/register')}>
          Registre-se
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center', backgroundColor: "#dadef5" },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0b0c0c', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#0b0c0c', marginBottom: 20 },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
    borderRadius: 6,
  },
  forgotPassword: { alignItems: 'flex-end', marginBottom: 24 },
  forgotPasswordText: { color: '#2A7BD2', fontSize: 14 },
  button: {
    backgroundColor: '#2A7BD2',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footerText: { textAlign: 'center', fontSize: 14/*, backgroundColor: '#f2f5f5ff'*/ },
  link: { color: '#2A7BD2', fontWeight: 'bold' },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  logo: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
});
