import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { API_URL, ENDPOINTS, MESSAGES } from "../config";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    if (!email || !username || !password) {
      setMessage(MESSAGES.FILL_ALL_FIELDS);
      return;
    }

    try {
      const resp = await fetch(`${API_URL}${ENDPOINTS.REGISTER}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        setMessage(data.error || MESSAGES.REGISTER_FAILED);
        return;
      }

      Alert.alert("Inscription réussie !", "Vérifie ton âge via le mail reçu.");
      router.push("/Login");
    } catch (err) {
      setMessage(MESSAGES.NETWORK_ERROR);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Nom d'utilisateur"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Button title="S'inscrire" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, padding: 10, marginVertical: 6, borderRadius: 6 },
  message: { color: "red", marginVertical: 8 },
});
