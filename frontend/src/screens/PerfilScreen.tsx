import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import api from "../services/api";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

type PerfilScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Perfil">;
type PerfilScreenRouteProp = RouteProp<RootStackParamList, "Perfil">;

interface User {
  id: number;
    uid: string; 
  nome: string;
  cpf?: string;
  cnpj?: string;
  email: string;
  cep?: string;
  endereco?: string;
  bairro?: string;
  estado?: string;
}

interface PerfilScreenProps {
  navigation: PerfilScreenNavigationProp;
  route: PerfilScreenRouteProp;
}

const PerfilScreen: React.FC<PerfilScreenProps> = ({ route }) => {
  const { userType, userId } = route.params;
  const navigation = useNavigation<PerfilScreenNavigationProp>();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [estado, setEstado] = useState("");

  const [userTypeStored, setUserTypeStored] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const endpoint = userType === "aluno" ? `/alunos/${userId}` : `/universidades/${userId}`;
        const response = await api.get(endpoint);

        const data = response.data;
        setUser(data);
        setNome(data.nome);
        setEmail(data.email);
        setCpfCnpj(userType === "aluno" ? data.cpf : data.cnpj);
        setCep(data.cep || "");
        setEndereco(data.endereco || "");
        setBairro(data.bairro || "");
        setEstado(data.estado || "");

        const tipo = await AsyncStorage.getItem("tipo");
        setUserTypeStored(tipo);
      } catch (err: any) {
        Alert.alert("Erro", "Não foi possível carregar os dados do perfil.");
      }
    };
    fetchUser();
  }, [userType, userId]);

  // 🔎 Busca o endereço pelo CEP usando ViaCEP
  const buscarEnderecoPorCep = async (cepDigitado: string) => {
    const cepLimpo = cepDigitado.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      Alert.alert("CEP inválido", "Digite um CEP com 8 dígitos.");
      return;
    }

    try {
      const { data } = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);

      if (data.erro) {
        Alert.alert("CEP não encontrado", "Verifique o CEP digitado.");
        return;
      }

      setEndereco(data.logradouro || "");
      setBairro(data.bairro || "");
      setEstado(data.uf || "");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível buscar o endereço pelo CEP.");
    }
  };

  // 💾 Atualizar perfil
const handleAtualizar = async () => {
  setLoading(true);
  try {
    const endpoint =
      userType === "aluno"
        ? `/alunos/atualizarCampos/${userId}`
        : `/universidades/atualizarCampos/${userId}`;

    let uidToSend = user?.uid;
    if (!uidToSend) {
      const storedUser = await AsyncStorage.getItem("usuario");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        uidToSend = parsedUser.uid;
      }
    }

    if (!uidToSend) {
      throw new Error("UID do usuário não encontrado. Atualização não pode ser feita.");
    }

    const payload: any = {
      uid: uidToSend,
      nome,
      email,
      cep: cep.replace(/\D/g, ""),
      endereco,
      bairro,
      estado,
    };

    if (userType === "aluno") payload.cpf = cpfCnpj;
    else payload.cnpj = cpfCnpj;

    console.log("🔹 Payload enviado:", payload);

    const response = await api.put(endpoint, payload, {
      headers: { "Content-Type": "application/json" },
    });

    const updatedUser = response.data;
    setUser(updatedUser);

    // Atualiza AsyncStorage
    const storedUser = await AsyncStorage.getItem("usuario");
    const token = await AsyncStorage.getItem("token");

    if (storedUser) {
      const oldUser = JSON.parse(storedUser);
      const mergedUser = { ...oldUser, ...updatedUser, uid: uidToSend };
      await AsyncStorage.setItem("usuario", JSON.stringify(mergedUser));
    } else {
      await AsyncStorage.setItem("usuario", JSON.stringify({ ...updatedUser, uid: uidToSend }));
    }

    await AsyncStorage.setItem("tipo", userType);
    if (token) await AsyncStorage.setItem("token", token);

    // Navega para Home passando o usuário atualizado
    Alert.alert("Sucesso", "Perfil atualizado!", [
      {
        text: "OK",
        onPress: () =>
          navigation.navigate("Home", {
            usuarioAtualizado: { ...updatedUser, uid: uidToSend },
          }),
      },
    ]);
  } catch (err: any) {
    console.error("Erro ao atualizar:", err.response?.data || err.message);
    Alert.alert("Erro", "Não foi possível atualizar o perfil.");
  } finally {
    setLoading(false);
  }
};



  // 🗑️ Excluir conta
const handleExcluirConta = () => {
  Alert.alert(
    "Confirmação",
    "Você realmente deseja excluir sua conta? Essa ação não pode ser desfeita.",
    [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            const endpoint =
              userType === "aluno"
                ? `/alunos/${userId}`
                : `/universidades/${userId}`;

            const storedUser = await AsyncStorage.getItem("usuario");
            const userData = storedUser ? JSON.parse(storedUser) : null;
            const uid = userData?.uid;

            if (!uid) {
              Alert.alert("Erro", "UID do usuário não encontrado.");
              return;
            }

            // 🔹 Envia o UID junto na requisição DELETE
            await api.delete(endpoint, {
              data: { uid },
            });

            await AsyncStorage.clear();

            Alert.alert("Sucesso", "Conta excluída com sucesso!");
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          } catch (err: any) {
            console.error("Erro ao excluir conta:", err.response?.data || err.message);
            Alert.alert("Erro", "Não foi possível excluir a conta.");
          }
        },
      },
    ]
  );
};

  if (!user) return <Text>Carregando...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>

      {userTypeStored && (
        <Text style={styles.tipoPerfil}>
          {userTypeStored === "aluno" ? "Aluno" : "Universidade"}
        </Text>
      )}

      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder={userType === "aluno" ? "Nome Completo" : "Nome da Instituição"}
        placeholderTextColor="#999"
      />

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        placeholderTextColor="#999"
      />

      {/* CPF ou CNPJ */}
      {userType === "universidade" ? (
        <TextInput
          style={styles.input}
          value={cpfCnpj}
          onChangeText={(text) => {
            const max = 14;
            if (text.length <= max) setCpfCnpj(text);
          }}
          placeholder="CNPJ"
          keyboardType="numeric"
        />
      ) : (
        <Text style={[styles.input, { backgroundColor: "#f0f0f0" }]}>
          CPF: {cpfCnpj}
        </Text>
      )}

      {/* CEP e Endereço */}
<TextInput
  style={styles.input}
  value={cep}
  onChangeText={(text) => {
    // Remove tudo que não é número
    let cepLimpo = text.replace(/\D/g, "");

    // Limita a 8 dígitos
    if (cepLimpo.length > 8) cepLimpo = cepLimpo.slice(0, 8);

    // Formata: 12345-678
    if (cepLimpo.length > 5) {
      cepLimpo = cepLimpo.slice(0, 5) + "-" + cepLimpo.slice(5);
    }

    setCep(cepLimpo);
  }}
  placeholder="CEP"
  keyboardType="numeric"
  maxLength={9}
  onBlur={() => buscarEnderecoPorCep(cep)}
  placeholderTextColor="#999"
/>

{/* Endereço */}
<TextInput
  style={styles.input}
  value={endereco}
  onChangeText={(text) => {
    if (text.length <= 100) setEndereco(text); // limite de 100 caracteres
  }}
  placeholder="Endereço"
  placeholderTextColor="#999"
/>

{/* Bairro */}
<TextInput
  style={styles.input}
  value={bairro}
  onChangeText={(text) => {
    if (text.length <= 50) setBairro(text); // limite de 50 caracteres
  }}
  placeholder="Bairro"
  placeholderTextColor="#999"
/>

{/* Estado */}
<TextInput
  style={styles.input}
  value={estado}
  onChangeText={(text) => {
    if (text.length <= 2) setEstado(text.toUpperCase()); // limite de 2 caracteres e maiúsculo
  }}
  placeholder="Estado"
  placeholderTextColor="#999"
/>


      <TouchableOpacity style={styles.button} onPress={handleAtualizar} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Atualizando..." : "Atualizar Perfil"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#e53935", marginTop: 20 }]}
        onPress={handleExcluirConta}
      >
        <Text style={styles.buttonText}>Excluir Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  input: { width: "100%", borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 12, marginBottom: 15 },
  button: { backgroundColor: "#4f46e5", padding: 15, borderRadius: 5, alignItems: "center", width: "100%" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  tipoPerfil: { fontSize: 16, fontStyle: "italic", color: "#555", marginBottom: 15 },
});

export default PerfilScreen;
