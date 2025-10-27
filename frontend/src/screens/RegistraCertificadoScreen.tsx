import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RegistraCertificadoScreen: React.FC = () => {
  const [nomeAluno, setNomeAluno] = useState("");
  const [cpfAluno, setCpfAluno] = useState("");
  const [matricula, setMatricula] = useState("");
  const [nomeCurso, setNomeCurso] = useState("");
  const [pdfFile, setPdfFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Formata CPF
  const formatCPF = (value: string) => {
    let cpf = value.replace(/\D/g, "");
    if (cpf.length > 3) cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
    if (cpf.length > 6) cpf = cpf.replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
    if (cpf.length > 9) cpf = cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
    return cpf;
  };

  // Seleciona PDF
  const handleSelectPdf = async () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf";
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) setPdfFile(file);
      };
      input.click();
    } else {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: "application/pdf",
          copyToCacheDirectory: true,
          multiple: false,
        });

        if (result.canceled) {
          console.log("Seleção de documento cancelada");
          return;
        }

        const file = result.assets[0];
        setPdfFile(file);
      } catch (err) {
        console.error("Erro ao selecionar PDF:", err);
        Alert.alert("Erro", "Não foi possível selecionar o PDF.");
      }
    }
  };

  const handleSubmit = async () => {
    const nomeTrim = nomeAluno.trim();
    const cpfOnlyNumbers = cpfAluno.replace(/\D/g, "");

    if (!nomeTrim || !cpfAluno || !nomeCurso || !pdfFile) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      return;
    }

    if (cpfOnlyNumbers.length !== 11) {
      Alert.alert("Erro", "O CPF deve conter exatamente 11 dígitos.");
      return;
    }

    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ ]+$/.test(nomeTrim)) {
      Alert.alert("Erro", "O nome do aluno deve conter apenas letras e espaços.");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      // Pega usuário logado para obter universidadeId
      const usuarioStr = await AsyncStorage.getItem("usuario");
      if (!usuarioStr) throw new Error("Usuário não encontrado");
      const usuario = JSON.parse(usuarioStr);
      const universidadeId = usuario.universidadeId || usuario.id;

      const formData = new FormData();
      formData.append("nomeAluno", nomeTrim);
      formData.append("cpfAluno", cpfOnlyNumbers);
      formData.append("matricula", matricula);
      formData.append("nomeCurso", nomeCurso);
      formData.append("universidadeId", universidadeId.toString());

      if (Platform.OS === "web") {
        formData.append(
          "arquivo",
          new File([pdfFile], pdfFile.name, { type: "application/pdf" })
        );
      } else {
        formData.append("arquivo", {
          uri: pdfFile.uri,
          type: pdfFile.mimeType || "application/pdf",
          name: pdfFile.name || "certificado.pdf",
        } as any);
      }

      const response = await api.post("/certificados/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      Alert.alert("Sucesso", "Certificado registrado com sucesso!");
      console.log("Certificado criado:", response.data);

      // Limpa formulário
      setNomeAluno("");
      setCpfAluno("");
      setMatricula("");
      setNomeCurso("");
      setPdfFile(null);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Erro", err.response?.data?.error || "Erro ao registrar certificado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Certificado</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do Aluno"
        value={nomeAluno}
        onChangeText={setNomeAluno}
        maxLength={50}
        placeholderTextColor={"#999"}
      />

      <TextInput
        style={styles.input}
        placeholder="CPF do Aluno"
        keyboardType="numeric"
        value={cpfAluno}
        onChangeText={(text) => setCpfAluno(formatCPF(text))}
        maxLength={14}
        placeholderTextColor={"#999"}
      />

      <TextInput
        style={styles.input}
        placeholder="Matrícula (opcional)"
        value={matricula}
        onChangeText={setMatricula}
        maxLength={15}
        placeholderTextColor={"#999"}

      />

      <TextInput
        style={styles.input}
        placeholder="Nome do Curso"
        value={nomeCurso}
        onChangeText={setNomeCurso}
        maxLength={50}
        placeholderTextColor={"#999"}
      />

      <TouchableOpacity style={styles.uploadBtn} onPress={handleSelectPdf}>
        <Text style={styles.uploadText}>
          {pdfFile ? pdfFile.name : "Selecionar PDF"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.submitBtn, loading && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitText}>{loading ? "Enviando..." : "Registrar"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#ffffff" // fundo branco
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 20,
    color: "#1f2937" // cinza escuro
  },
  input: {
    borderWidth: 1,
    borderColor: "#9ca3af", // cinza médio
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#f3f4f6", // leve cinza de fundo
    color: "#111827" // texto escuro
  },
  uploadBtn: {
    borderWidth: 1,
    borderColor: "#374151", // cinza escuro
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#e5e7eb", // cinza bem claro
    alignItems: "center",
  },
  uploadText: { 
    color: "#374151", // cinza escuro
    fontWeight: "600" 
  },
  submitBtn: {
    backgroundColor: "#374151", // cinza escuro
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: { 
    color: "#f9fafb", // quase branco
    fontWeight: "bold", 
    fontSize: 16 
  },
});


export default RegistraCertificadoScreen;
