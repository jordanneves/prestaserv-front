import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

export default function Register() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <Text style={styles.subtitle}>Por favor insira os detalhes para o registro.</Text>

      <TextInput placeholder="Nome" style={styles.input} />
      <TextInput placeholder="Email" style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Telefone" style={styles.input} keyboardType="phone-pad" />
      <TextInput placeholder="Senha" style={styles.input} secureTextEntry />
      <TextInput placeholder="Confirmar senha" style={styles.input} secureTextEntry />

      <TouchableOpacity style={styles.button}>
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
