import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

const SobreScreen: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Sobre o Achievements</Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <FontAwesome5 name="bullseye" size={20} color="#4F8EF7" />
          <Text style={styles.cardTitulo}>Por que criamos o Achievements</Text>
        </View>
        <Text style={styles.cardTexto}>
          Criamos o Achievements para ajudar estudantes a organizar e compartilhar suas conquistas acadêmicas. 
          Com ele, você pode mostrar cursos e certificações que realmente concluiu, criando um portfólio confiável e visível para qualquer pessoa interessada em conhecer suas habilidades.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <FontAwesome5 name="users" size={20} color="#4F8EF7" />
          <Text style={styles.cardTitulo}>Quem pode se beneficiar</Text>
        </View>
        <Text style={styles.cardSubTitulo}>Universidades</Text>
        <Text style={styles.cardTexto}>
          - Registrar certificados de seus alunos de forma segura{"\n"}
          - Garantir que os certificados sejam válidos e facilmente consultáveis
        </Text>
        <Text style={styles.cardSubTitulo}>Alunos</Text>
        <Text style={styles.cardTexto}>
          - Receber certificados digitais diretamente no app{"\n"}
          - Construir um portfólio público mostrando suas conquistas{"\n"}
          - Facilitar que outras pessoas verifiquem suas qualificações
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <FontAwesome5 name="rocket" size={20} color="#4F8EF7" />
          <Text style={styles.cardTitulo}>Como o Achievements funciona</Text>
        </View>
        <Text style={styles.cardTexto}>
          1. Universidades registram certificados no sistema{"\n"}
          2. Alunos recebem automaticamente seus certificados no perfil{"\n"}
          3. Alunos podem tornar seus certificados públicos{"\n"}
          4. Qualquer pessoa pode consultar certificados públicos pelo CPF, conferindo suas qualificações de forma simples e segura
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <FontAwesome5 name="lightbulb" size={20} color="#4F8EF7" />
          <Text style={styles.cardTitulo}>Como isso pode ajudar você</Text>
        </View>
        <Text style={styles.cardTexto}>
          - Organize todos os seus certificados em um único lugar{"\n"}
          - Compartilhe seu portfólio com oportunidades acadêmicas e profissionais{"\n"}
          - Comprove de forma confiável os cursos e especializações que você concluiu
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  cardTitulo: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardSubTitulo: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 5,
  },
  cardTexto: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default SobreScreen;
