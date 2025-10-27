import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import api, { LoginResponse } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithCredential } from "firebase/auth";

// Inicializa Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAmfKR2xXeRcV_PUXa4hGbP6HcVgsfV2LY",
  authDomain: "projeto-mobile-unisuam-expo.firebaseapp.com",
  projectId: "projeto-mobile-unisuam-expo",
  storageBucket: "projeto-mobile-unisuam-expo.appspot.com",
  messagingSenderId: "172745544733",
  appId: "1:172745544733:android:302965d795e8325f39a2f4",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Necessário para o Expo Auth Session
WebBrowser.maybeCompleteAuthSession();

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;
type UserType = "aluno" | "universidade";

const LoginScreen: React.FC = () => {
  const [userType, setUserType] = useState<UserType>("aluno");
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();

  // Configuração do Google Auth
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: "172745544733-13jekhqkme2hiilt19r2a1u7uu3mk6u9.apps.googleusercontent.com",
  });

  useEffect(() => {
    const init = async () => {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("tipo");
      const existingToken = await AsyncStorage.getItem("token");
      if (existingToken) navigation.replace("Home");
    };
    init();
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(async (userCredential) => {
          const { email, displayName, uid } = userCredential.user;
          const endpoint = userType === "aluno" ? "/auth/google/aluno" : "/auth/google/universidade";
          const res = await api.post(endpoint, { email, nome: displayName, googleId: uid });

          await AsyncStorage.setItem("token", res.data.token);
          await AsyncStorage.setItem("tipo", res.data.tipo);
          await AsyncStorage.setItem("usuario", JSON.stringify(res.data.usuario));

          navigation.replace("Home");
        })
        .catch((err) => {
          Alert.alert("Erro", "Falha ao autenticar com Google");
          console.error(err);
        });
    }
  }, [response]);

  const handleLogin = async () => {
    if (!login || !senha) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }
    setLoading(true);
    try {
      const endpoint = userType === "aluno" ? "/auth/aluno" : "/auth/universidade";
      const response = await api.post<LoginResponse>(endpoint, { login, senha });
      await AsyncStorage.setItem("token", response.data.token);
      await AsyncStorage.setItem("tipo", response.data.tipo);
      await AsyncStorage.setItem("usuario", JSON.stringify(response.data.usuario));
      navigation.replace("Home");
    } catch (err: any) {
      Alert.alert("Erro", err.response?.data?.error || "Erro ao logar");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    promptAsync();
  };

  const getButtonText = () => (loading ? "Carregando..." : userType === "aluno" ? "Entrar como Aluno" : "Entrar como Universidade");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {/* Seletor de tipo */}
      <View style={styles.selector}>
        <TouchableOpacity style={[styles.option, userType === "aluno" && styles.selectedOption]} onPress={() => setUserType("aluno")}>
          <Text style={userType === "aluno" ? styles.selectedText : styles.optionText}>Aluno</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.option, userType === "universidade" && styles.selectedOption]} onPress={() => setUserType("universidade")}>
          <Text style={userType === "universidade" ? styles.selectedText : styles.optionText}>Universidade</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder={userType === "aluno" ? "CPF ou Email" : "CNPJ ou Email"}
        value={login}
        onChangeText={setLogin}
        maxLength={50}
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

      <TouchableOpacity style={[styles.button, { backgroundColor: "#DB4437" }]} onPress={handleGoogleLogin}>
        <Text style={styles.buttonText}>Entrar com Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate("Cadastro")}>
        <Text style={styles.registerText}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 20, 
    backgroundColor: "#ffffff" // fundo branco
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: 30,
    color: "#1f2937" // cinza escuro
  },
  selector: { 
    flexDirection: "row", 
    justifyContent: "center", 
    marginBottom: 20 
  },
  option: { 
    padding: 10, 
    borderWidth: 1, 
    borderColor: "#9ca3af", // cinza médio
    marginHorizontal: 5, 
    borderRadius: 5,
    backgroundColor: "#f3f4f6" // leve cinza de fundo
  },
  selectedOption: { 
    backgroundColor: "#374151", // cinza escuro
    borderColor: "#374151"
  },
  optionText: { 
    color: "#1f2937" // cinza escuro
  },
  selectedText: { 
    color: "#f9fafb", // quase branco
    fontWeight: "bold" 
  },
  input: { 
    borderWidth: 1, 
    borderColor: "#9ca3af", // cinza médio
    borderRadius: 5, 
    padding: 10, 
    marginBottom: 15, 
    backgroundColor: "#f3f4f6", // leve cinza de fundo
    color: "#111827" // texto escuro
  },
  button: { 
    backgroundColor: "#374151", // cinza escuro
    padding: 15, 
    borderRadius: 5, 
    alignItems: "center", 
    marginBottom: 10 
  },
  buttonText: { 
    color: "#f9fafb", 
    fontWeight: "bold", 
    fontSize: 16 
  },
  registerButton: { 
    alignItems: "center", 
    marginTop: 10 
  },
  registerText: { 
    color: "#374151", // cinza escuro
    fontWeight: "bold" 
  },
});


export default LoginScreen;
