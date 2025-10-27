// App.tsx
import React from "react";
import { StatusBar, StyleSheet } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Configuração global da barra de status */}
      <StatusBar
        translucent={false}        
        backgroundColor="#4f46e5"  
        barStyle="light-content"   
      />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
