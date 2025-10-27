import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { FontAwesome } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";

export default function MeusCertificadosScreen() {
  const [certificados, setCertificados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // const BASE_URL = "http://192.168.1.74:3000";
// const BASE_URL = "http://1.0.11.21:3000"; // Ip do backend no mac no trabalho
// const BASE_URL = "https://projeto-mobile-unisuam.onrender.com";

  const fetchCertificados = async () => {
    try {
      // Sempre pega o usuário atualizado do AsyncStorage
      const usuarioStr = await AsyncStorage.getItem("usuario");
      if (!usuarioStr) return;
      const usuario = JSON.parse(usuarioStr);

      const documento = usuario.cpf_cnpj?.replace(/\D/g, "");
      if (!documento) return;

      const certificadosRes = await api.get(`/certificados/aluno/${documento}`);
      const certificadosData = certificadosRes.data;

      const universidadesRes = await api.get(`/universidades`);
      const universidadesData = universidadesRes.data;

      const certificadosComCnpj = certificadosData.map((cert: any) => {
        const uni = universidadesData.find((u: any) => u.id === cert.universidadeId);
        return {
          ...cert,
          universidade: {
            nome: uni?.nome || "Desconhecida",
            cnpj: uni?.cnpj || "N/A",
          },
        };
      });

      setCertificados(certificadosComCnpj);
    } catch (err) {
      console.error("Erro ao buscar certificados:", err);
      Alert.alert("Erro", "Não foi possível carregar os certificados.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true); // garante loading ao entrar na tela
      fetchCertificados();
    }, [])
  );

  const togglePrivacidade = async (certificado: any) => {
    try {
      const response = await api.patch(`/certificados/${certificado.id}/privacidade`, {
        publico: !certificado.publico,
      });
      setCertificados((prev) =>
        prev.map((c) => (c.id === certificado.id ? { ...c, publico: response.data.publico } : c))
      );
    } catch (err) {
      console.error("Erro ao atualizar privacidade:", err);
      Alert.alert("Erro", "Não foi possível atualizar a privacidade.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (certificados.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Nenhum certificado encontrado.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={certificados}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.curso}>{item.nomeCurso}</Text>
          <Text style={styles.data}>
            Emitido em: {new Date(item.dataEmissao).toLocaleDateString("pt-BR")}
          </Text>
          <Text style={styles.universidade}>Universidade: {item.universidade.nome}</Text>
          <Text style={styles.universidade}>CNPJ: {item.universidade.cnpj}</Text>

{item.arquivo && (
  <TouchableOpacity
    style={styles.botao}
    onPress={() => Linking.openURL(item.arquivo)}
  >
  {/* {item.arquivo && (
  <TouchableOpacity
    style={styles.botao}
    onPress={() => Linking.openURL(`${BASE_URL}${item.arquivo}`)}
  > */}
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <FontAwesome5 name="file-alt" size={16} color="#fff" />
      <Text style={styles.botaoTexto}>Ver Certificado</Text>
    </View>
  </TouchableOpacity>
)}

          <TouchableOpacity
            style={styles.visibilityBtn}
            onPress={() => togglePrivacidade(item)}
          >
            <FontAwesome
              name={item.publico ? "eye" : "eye-slash"}
              size={20}
              color={item.publico ? "#4f46e5" : "#999"}
            />
            <Text style={styles.visibilityText}>{item.publico ? "Público" : "Privado"}</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  emptyText: { 
    fontSize: 16, 
    color: "#9ca3af" // cinza médio para texto vazio
  },
  list: { 
    padding: 16 
  },
  card: {
    backgroundColor: "#f3f4f6", // leve cinza de fundo
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  curso: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#1f2937" // cinza escuro
  },
  data: { 
    fontSize: 14, 
    color: "#4b5563", // cinza médio escuro
    marginTop: 4 
  },
  universidade: { 
    fontSize: 14, 
    color: "#4b5563" 
  },
  botao: {
    marginTop: 10,
    backgroundColor: "#374151", // cinza escuro
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  botaoTexto: { 
    color: "#f9fafb", // quase branco
    fontWeight: "bold" 
  },
  visibilityBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  visibilityText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#4b5563" // cinza médio escuro
  },
});
