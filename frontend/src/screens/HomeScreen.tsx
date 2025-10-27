import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen: React.FC = () => {
  const [usuario, setUsuario] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      const carregarUsuario = async () => {
        try {
          const usuarioStr = await AsyncStorage.getItem("usuario");
          if (usuarioStr) {
            setUsuario(JSON.parse(usuarioStr));
          }
        } catch (err) {
          console.log("Erro ao carregar usuário:", err);
        }
      };
      carregarUsuario();
    }, [])
  );

  if (!usuario) {
    return (
      <View style={styles.container}>
        <Text>Carregando usuário...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Bem-vindo, {usuario.nome} 👋</Text>
      <Text>Email: {usuario.email}</Text>
      <Text>
        {usuario.cpf_cnpj?.length === 11 ? "CPF" : "CNPJ"}: {usuario.cpf_cnpj}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
});

export default HomeScreen;
