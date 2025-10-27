-- Rodar o backend:
- cd backend
- npm install


-- Rodar o frontend
- cd frontend
- npm install 


Depois disso, você só precisa iniciar cada parte:

Backend: npm run dev ou npx nodemon server.js

Frontend: npm start

Buildar apk para android:
run -> eas build -p android --profile preview




🛠️ Erro: RNDocumentPicker could not be found – React Native / Expo
❌ Mensagem de erro
Invariant Violation: TurboModuleRegistry.getEnforcing(...): 'RNDocumentPicker' could not be found.

📌 Causa

Esse erro ocorre quando você tenta usar o pacote react-native-document-picker em um projeto Expo (Managed Workflow).

react-native-document-picker é uma biblioteca nativa, que não funciona no Expo Go porque exige código nativo não incluído no runtime do Expo.

✅ Solução
🔁 Substituir por expo-document-picker (compatível com Expo)
1. Desinstale o pacote incompatível:
npm uninstall react-native-document-picker
# ou
yarn remove react-native-document-picker

2. Instale o pacote correto:
npx expo install expo-document-picker

3. Importe no seu código:
import * as DocumentPicker from 'expo-document-picker';

4. Use assim:
const pickDocument = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
  });

  if (!result.canceled) {
    console.log('Documento:', result.assets[0]);
  }
};

💡 Dica extra: web vs mobile

No expo-document-picker, não é necessário fazer Platform.OS !== "web" para decidir a lib. Ele já lida com isso internamente.

Se você quiser tratar upload web manualmente, pode usar:

if (Platform.OS === 'web') {
  // Criar input type="file"
} else {
  // Usar DocumentPicker
}

📄 Resumo
Situação	Ação recomendada
Usando Expo Go	✅ Use expo-document-picker
Precisa de react-native-document-picker	❌ Eject do Expo (expo eject) + EAS Build
Quer suportar web	✅ Trate Platform.OS === 'web'


Armazena código para `PerfilScreen.tsx` - Testar em casa.
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Platform,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Tipos para Navigation e Route
type PerfilScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Perfil">;
type PerfilScreenRouteProp = RouteProp<RootStackParamList, "Perfil">;

interface User {
  id: number;
  nome: string;
  cpf?: string;
  cnpj?: string;
  email: string;
  imagemPerfil?: string;
  logo?: string;
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
  const [foto, setFoto] = useState<string | undefined>(undefined);
  const [userTypeStored, setUserTypeStored] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const endpoint =
          userType === "aluno"
            ? `/alunos/${userId}`
            : `/universidades/${userId}`;
        const response = await api.get(endpoint);
        setUser(response.data);
        setNome(response.data.nome);
        setEmail(response.data.email);
        setCpfCnpj(userType === "aluno" ? response.data.cpf : response.data.cnpj);
        setFoto(userType === "aluno" ? response.data.imagemPerfil : response.data.logo);

        const tipo = await AsyncStorage.getItem("tipo");
        setUserTypeStored(tipo);
      } catch (err: any) {
        Alert.alert("Erro", "Não foi possível carregar os dados do perfil.");
      }
    };
    fetchUser();
  }, [userType, userId]);

  // 🔹 Função de exclusão com suporte mobile + web
  const handleExcluirConta = () => {
    const confirmarExclusao = async () => {
      try {
        const endpoint =
          userType === "aluno"
            ? `/alunos/${userId}`
            : `/universidades/${userId}`;

        await api.delete(endpoint);
        await AsyncStorage.clear();

        Alert.alert("Sucesso", "Conta excluída com sucesso!");
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      } catch (err: any) {
        console.error("Erro ao excluir conta:", err.response?.data || err.message);
        Alert.alert(
          "Erro",
          err.response?.data?.error || "Não foi possível excluir a conta."
        );
      }
    };

    if (Platform.OS === "web") {
      // Web → usa o confirm do navegador
      const confirmar = window.confirm(
        "Você realmente deseja excluir sua conta? Essa ação não pode ser desfeita."
      );
      if (confirmar) confirmarExclusao();
    } else {
      // Mobile → usa o modal nativo do React Native
      Alert.alert(
        "Confirmação",
        "Você realmente deseja excluir sua conta? Essa ação não pode ser desfeita.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Excluir", style: "destructive", onPress: confirmarExclusao },
        ]
      );
    }
  };

  const handleAtualizar = async () => {
    setLoading(true);
    try {
      const endpoint =
        userType === "aluno"
          ? `/alunos/atualizarCampos/${userId}`
          : `/universidades/atualizarCampos/${userId}`;

      const payload: any = { nome, email };
      if (userType === "aluno") payload.cpf = cpfCnpj;
      else payload.cnpj = cpfCnpj;

      const response = await api.put(endpoint, payload, {
        headers: { "Content-Type": "application/json" },
      });

      const updatedUser = response.data;

      setUser(updatedUser);
      setNome(updatedUser.nome);
      setEmail(updatedUser.email);
      if (userType === "aluno") setCpfCnpj(updatedUser.cpf || "");
      else setCpfCnpj(updatedUser.cnpj || "");

      const storedUser = await AsyncStorage.getItem("usuario");
      const token = await AsyncStorage.getItem("token");

      if (storedUser) {
        const oldUser = JSON.parse(storedUser);
        const mergedUser = { ...oldUser, ...updatedUser };
        await AsyncStorage.setItem("usuario", JSON.stringify(mergedUser));
      } else {
        await AsyncStorage.setItem("usuario", JSON.stringify(updatedUser));
      }

      await AsyncStorage.setItem("tipo", userType);
      if (token) await AsyncStorage.setItem("token", token);

      Alert.alert("Sucesso", "Perfil atualizado!", [
        { text: "OK", onPress: () => navigation.navigate("Home") },
      ]);
    } catch (err: any) {
      console.error("Erro ao atualizar:", err.response?.data || err.message);
      Alert.alert(
        "Erro",
        err.response?.data?.error || "Não foi possível atualizar o perfil."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Text>Carregando...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>

      <TouchableOpacity disabled>
        <Image
          source={foto ? { uri: foto } : require("../../assets/perfil-logo-default.png")}
          style={styles.foto}
        />
      </TouchableOpacity>

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
        maxLength={50}
      />

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        maxLength={50}
      />

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
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#4f46e5",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  foto: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  tipoPerfil: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#555",
    marginBottom: 15,
  },
});

export default PerfilScreen;

Então, reca´pitulando, o problema não é no meu c´´odigo, mas sim na permissão da nuvem (cloudinary) para acessar os arquivos, correto? 

tmascyjVCF7oTnES