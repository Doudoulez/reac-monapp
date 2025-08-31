import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { API_URL, ENDPOINTS, MESSAGES } from "../config";

interface LoginResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  error?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage(MESSAGES.FILL_ALL_FIELDS);
      return;
    }

    try {
      const resp = await fetch(`${API_URL}${ENDPOINTS.LOGIN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await resp.json();

      if (!resp.ok) {
        if (data.error === "Vérifie ton âge avant de te connecter") {
          setMessage(MESSAGES.AGE_NOT_VERIFIED);
        } else {
          setMessage(data.error || MESSAGES.LOGIN_FAILED);
        }
        return;
      }

      // Ici tu peux stocker l’utilisateur connecté
      // ex: AsyncStorage.setItem("user", JSON.stringify(data.user));

      router.push("/GeneralLayout");
    } catch (err) {
      console.error("Erreur réseau :", err);
      setMessage(MESSAGES.NETWORK_ERROR);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Button title="Se connecter" onPress={handleLogin} />

      {/* Bouton inscription */}
      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => router.push("/Register")}
      >
        <Text style={styles.registerText}>Pas encore de compte ? S'inscrire</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, padding: 10, marginVertical: 6, borderRadius: 6 },
  message: { color: "red", marginVertical: 8, textAlign: "center" },
  registerButton: { marginTop: 15, alignItems: "center" },
  registerText: { color: "#0066cc", textDecorationLine: "underline" },
});
