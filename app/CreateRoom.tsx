import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
import Toast from "./components/Toast"; // ton composant Toast maison
import { API_URL, ENDPOINTS } from "../config";

export default function CreateRoom() {
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000); // 2 secondes
  };

  const handleCreateRoom = async () => {
    if (!roomName) {
      showToast("Le nom du salon est requis");
      return;
    }

    try {
      const resp = await fetch(`${API_URL}${ENDPOINTS.ROOMS}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName, password }),
      });

      const data = await resp.json();

      if (resp.ok) {
        showToast(`Salon "${roomName}" créé avec succès !`);
        setRoomName("");
        setPassword("");
      } else {
        showToast(data.error || "Impossible de créer le salon");
      }
    } catch (err) {
      showToast("Erreur réseau");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nom du salon"
        value={roomName}
        onChangeText={setRoomName}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe (facultatif)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Créer" onPress={handleCreateRoom} />
      <Toast message={toastMessage} visible={toastVisible} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginVertical: 6,
  },
});
