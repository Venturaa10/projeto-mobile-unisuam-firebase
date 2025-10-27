// AppNavigator.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import CadastroScreen from "../screens/CadastroScreen";
import BuscaCertificadoScreen from "../screens/BuscaCertificadoScreen";
import PerfilScreen from "../screens/PerfilScreen";
import Navbar from "../components/Navbar";
import RegistraCertificadoScreen from "../screens/RegistraCertificadoScreen";
import MeusCertificadosScreen from "../screens/MeusCertificadosScreen";
import SobreScreen from "../screens/SobreScreen";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Cadastro: undefined;
  BuscaCertificado: undefined;
  Perfil: { userType: "aluno" | "universidade"; userId: number };
  RegistraCertificado: undefined;
  MeusCertificados: undefined;
  Sobre: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Wrapper que envolve todas as telas
const ScreenWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SafeAreaView style={styles.wrapper}>
      <Navbar />
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
};

export default function AppNavigator() {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>("Login");

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");
      setInitialRoute(token ? "Home" : "BuscaCertificado");
      setLoading(false);
    };
    checkLogin();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="BuscaCertificado">
          {() => (
            <ScreenWrapper>
              <BuscaCertificadoScreen />
            </ScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="Login">
          {() => (
            <ScreenWrapper>
              <LoginScreen />
            </ScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="Home">
          {() => (
            <ScreenWrapper>
              <HomeScreen />
            </ScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="Cadastro">
          {() => (
            <ScreenWrapper>
              <CadastroScreen />
            </ScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="Perfil">
          {({ navigation, route }) => (
            <ScreenWrapper>
              <PerfilScreen navigation={navigation} route={route} />
            </ScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="RegistraCertificado">
          {() => (
            <ScreenWrapper>
              <RegistraCertificadoScreen />
            </ScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="MeusCertificados">
          {() => (
            <ScreenWrapper>
              <MeusCertificadosScreen />
            </ScreenWrapper>
          )}
        </Stack.Screen>
                <Stack.Screen name="Sobre">
          {() => (
            <ScreenWrapper>
              <SobreScreen />
            </ScreenWrapper>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1 },
});
