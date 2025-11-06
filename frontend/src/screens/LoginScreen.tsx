import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import api, { LoginResponse } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { auth } from "../services/firebase"; // importa do seu firebase.ts
import { signInWithEmailAndPassword } from "firebase/auth";

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;
type UserType = "aluno" | "universidade";

const LoginScreen: React.FC = () => {
  const [userType, setUserType] = useState<UserType>("aluno");
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();

  useEffect(() => {
    const init = async () => {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("tipo");
      const existingToken = await AsyncStorage.getItem("token");
      if (existingToken) navigation.replace("Home");
    };
    init();
  }, []);

const handleLogin = async () => {
  if (!login || !senha) {
    Alert.alert("Erro", "Preencha todos os campos");
    return;
  }

  setLoading(true);
  try {
    // 🔐 Login Firebase
    const userCredential = await signInWithEmailAndPassword(auth, login, senha);
    const idToken = await userCredential.user.getIdToken(); // token Firebase
    const uid = userCredential.user.uid;

    console.log("✅ Firebase UID:", uid);
    console.log("✅ Firebase Token:", idToken);

    // 🔗 Envia token ao backend para gerar JWT interno
    const endpoint = userType === "aluno" ? "/auth/aluno" : "/auth/universidade";
    const response = await api.post<LoginResponse>(endpoint, { tokenFirebase: idToken });

    console.log("✅ Resposta backend:", response.data);

    // 💾 Salva localmente
    await AsyncStorage.setItem("token", response.data.token);
    await AsyncStorage.setItem("tipo", response.data.tipo);

    const usuarioComUid = { ...response.data.usuario, uid };
    console.log("✅ Usuário com UID:", usuarioComUid);

    await AsyncStorage.setItem("usuario", JSON.stringify(usuarioComUid));

    // ✅ Verifica AsyncStorage
    const testeArmazenamento = await AsyncStorage.getItem("usuario");
    console.log("📦 Usuário salvo no AsyncStorage:", testeArmazenamento);

    navigation.replace("Home");
  } catch (err: any) {
    console.error("❌ Erro no login:", err);
    Alert.alert("Erro", err.response?.data?.error || err.message || "Falha ao autenticar usuário");
  } finally {
    setLoading(false);
  }
};

  const getButtonText = () =>
    loading
      ? "Carregando..."
      : userType === "aluno"
      ? "Entrar como Aluno"
      : "Entrar como Universidade";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {/* Seletor de tipo */}
      <View style={styles.selector}>
        <TouchableOpacity
          style={[styles.option, userType === "aluno" && styles.selectedOption]}
          onPress={() => setUserType("aluno")}
        >
          <Text style={userType === "aluno" ? styles.selectedText : styles.optionText}>Aluno</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.option, userType === "universidade" && styles.selectedOption]}
          onPress={() => setUserType("universidade")}
        >
          <Text style={userType === "universidade" ? styles.selectedText : styles.optionText}>
            Universidade
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder={userType === "aluno" ? "Email do aluno" : "Email da universidade"}
        value={login}
        onChangeText={setLogin}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#999"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        maxLength={25}
        placeholderTextColor="#999"
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{getButtonText()}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate("Cadastro")}>
        <Text style={styles.registerText}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#ffffff" },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 30, color: "#1f2937" },
  selector: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  option: { padding: 10, borderWidth: 1, borderColor: "#9ca3af", marginHorizontal: 5, borderRadius: 5, backgroundColor: "#f3f4f6" },
  selectedOption: { backgroundColor: "#374151", borderColor: "#374151" },
  optionText: { color: "#1f2937" },
  selectedText: { color: "#f9fafb", fontWeight: "bold" },
  input: { borderWidth: 1, borderColor: "#9ca3af", borderRadius: 5, padding: 10, marginBottom: 15, backgroundColor: "#f3f4f6", color: "#111827" },
  button: { backgroundColor: "#374151", padding: 15, borderRadius: 5, alignItems: "center", marginBottom: 10 },
  buttonText: { color: "#f9fafb", fontWeight: "bold", fontSize: 16 },
  registerButton: { alignItems: "center", marginTop: 10 },
  registerText: { color: "#374151", fontWeight: "bold" },
});

export default LoginScreen;
