import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

export default function Login() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Entre com suas credenciais abaixo.</Text>

      <TextInput placeholder="Email" style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Senha" style={styles.input} secureTextEntry />

      <TouchableOpacity onPress={() => {}} style={styles.forgotPassword}>
        <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text onPress={() => {router.push('/services')}} style={styles.buttonText}>Entrar</Text>
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
  container: { flexGrow: 1, padding: 24, justifyContent: 'center', /*backgroundColor: "#ffffff"*/ },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2A7BD2', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#777', marginBottom: 20 },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
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
  footerText: { textAlign: 'center', fontSize: 14 },
  link: { color: '#2A7BD2', fontWeight: 'bold' },
});
