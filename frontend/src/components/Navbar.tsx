// Navbar.tsx
import React, { useEffect, useState } from "react";
import {
  View, Text, Button, StyleSheet, TouchableOpacity,
  Dimensions, TouchableWithoutFeedback, Image
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import Icon from "react-native-vector-icons/Ionicons";

interface NavbarProps {
  onLogout?: () => void;
}

const { width, height } = Dimensions.get("window");

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const [tipo, setTipo] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [usuario, setUsuario] = useState<{ id: number; nome: string; imagem?: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const storedTipo = await AsyncStorage.getItem("tipo");
      setTipo(storedTipo);
      const storedUsuario = await AsyncStorage.getItem("usuario");
      if (storedUsuario) {
        const usuarioObj = JSON.parse(storedUsuario);
        const imagem =
          storedTipo === "aluno"
            ? usuarioObj.imagemPerfil || null
            : storedTipo === "universidade"
            ? usuarioObj.logo || null
            : null;
        setUsuario({ id: usuarioObj.id, nome: usuarioObj.nome, imagem });
      }
    };
    loadData();
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      AsyncStorage.clear().then(() => {
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      });
    }
  };

const renderMenuItems = () => {
  const MenuButton = ({ title, onPress }: { title: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <Text style={styles.menuButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  if (!tipo) {
    return (
      <>
        <MenuButton title="Entrar" onPress={() => { setMenuOpen(false); navigation.navigate("Login"); }} />
        <MenuButton title="Cadastrar" onPress={() => { setMenuOpen(false); navigation.navigate("Cadastro"); }} />
        <MenuButton title="Sobre" onPress={() => { setMenuOpen(false); navigation.navigate("Sobre"); }} />
      </>
    );
  }

  if (tipo === "aluno") {
    return (
      <>
        <MenuButton title="Meus Certificados" onPress={() => { setMenuOpen(false); navigation.navigate("MeusCertificados"); }} />
        <MenuButton
          title="Perfil"
          onPress={() => {
            setMenuOpen(false);
            if (usuario) navigation.navigate("Perfil", { userType: "aluno", userId: usuario.id });
          }}
        />
        <MenuButton title="Sair" onPress={handleLogout} />
      </>
    );
  }

  if (tipo === "universidade") {
    return (
      <>
        <MenuButton title="Registrar Certificado" onPress={() => { setMenuOpen(false); navigation.navigate("RegistraCertificado"); }} />
        <MenuButton
          title="Perfil"
          onPress={() => {
            setMenuOpen(false);
            if (usuario) navigation.navigate("Perfil", { userType: "universidade", userId: usuario.id });
          }}
        />
        <MenuButton title="Sair" onPress={handleLogout} />
      </>
    );
  }
};


  return (
    <View style={styles.container}>
      {/* Header com nome do app e hamburger */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={async () => {
            const token = await AsyncStorage.getItem("token");
            navigation.navigate(token ? "Home" : "BuscaCertificado");
          }}
          style={styles.appRow}
        >
          <Text style={styles.title}>Achievements</Text>
          {/* {usuario && (
            <Image
              source={
                usuario.imagem
                  ? { uri: usuario.imagem }
                  : require("../../assets/logo.png")
              }
              style={styles.profileImage}
            />
          )} */}
        </TouchableOpacity>
        <TouchableOpacity style={styles.hamburger} onPress={() => setMenuOpen(!menuOpen)}>
          <Icon name={menuOpen ? "close" : "menu"} size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Menu flutuante */}
      {menuOpen && (
        <TouchableWithoutFeedback onPress={() => setMenuOpen(false)}>
          <View style={styles.menuOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menu}>{renderMenuItems()}</View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#374151", // cinza escuro
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 5,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { 
    color: "#f9fafb", // quase branco
    fontWeight: "bold", 
    fontSize: 20 
  },
  hamburger: { 
    padding: 5 
  },
  menuOverlay: {
    position: "absolute",
    top: 0, 
    left: 0,
    width, 
    height,
    zIndex: 999,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 60,
    paddingRight: 16,
    backgroundColor: "rgba(0,0,0,0.3)" // overlay semitransparente
  },
  menu: {
    backgroundColor: "#1f2937", // cinza escuro ainda mais forte para o menu
    borderRadius: 8,
    padding: 10,
    flexDirection: "column",
    elevation: 6,
  },
  appRow: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  profileImage: {
    width: 32, 
    height: 32,
    borderRadius: 16,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#f9fafb" // borda quase branca para contraste
  },
menuButton: {
  backgroundColor: "#ffffffff",
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 8,
  marginBottom: 10,
},
menuButtonText: {
  color: "#000000ff",
  fontSize: 16,
  textAlign: "center",
},


});


export default Navbar;
