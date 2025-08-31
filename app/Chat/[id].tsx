import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import io from "socket.io-client";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { API_URL, SOCKET_OPTIONS, CHAT_DEFAULTS } from "../../config";

interface Message {
  id?: number;
  username: string;
  message?: string;
  text?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
}

interface ChatRoomProps {
  roomId: string;
  roomName?: string;
  user: User; // L'utilisateur connecté avec id et username
}

export default function ChatRoomPage({ roomId, roomName, user }: ChatRoomProps) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [socket, setSocket] = useState<any>(null);

  const name = roomName || CHAT_DEFAULTS.ROOM_NAME;

  useEffect(() => {
    if (!roomId || !name || !user) return;

    const s = io(API_URL, SOCKET_OPTIONS);
    setSocket(s);

    // On rejoint la room
    s.emit("joinRoom", { roomId, roomName: name });

    s.on("joined", (room: { id: number; name: string }) => {
      setMessages((prev) => [
        ...prev,
        { username: "Système", message: `Salon ${room.name} rejoint !` },
      ]);
    });

    s.on("joinError", (errMsg: string) => {
      setMessages((prev) => [...prev, { username: "Système", message: errMsg }]);
    });

    s.on("history", (msgs: Message[]) => setMessages(msgs));

    s.on("message", (msg: Message | string) => {
      if (typeof msg === "string") {
        setMessages((prev) => [...prev, { username: "Système", message: msg }]);
      } else {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => s.disconnect();
  }, [roomId, name, user]);

  const sendMessage = () => {
    if (!text || !socket || !roomId || !user) return;

    // Envoie seulement l'ID utilisateur et le texte
    socket.emit("message", { roomId, userId: user.id, text });
    setText("");
  };

  const KEYBOARD_OFFSET = Platform.OS === "ios" ? 60 + insets.top : 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={KEYBOARD_OFFSET}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Salon : {name} (ID {roomId || "?"})
          </Text>
        </View>

        {/* Messages */}
        <FlatList
          style={styles.messages}
          data={messages}
          keyExtractor={(item, index) => (item.id || index).toString()}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: (insets.bottom || 10) + 56,
          }}
          renderItem={({ item }) => (
            <View style={styles.messageItem}>
              <Text style={styles.username}>{item.username} :</Text>
              <Text style={styles.messageText}>{item.message || item.text}</Text>
            </View>
          )}
        />

        {/* Zone input */}
        <View
          style={[
            styles.inputContainer,
            { paddingBottom: Math.max(insets.bottom, 10) },
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Écrire un message..."
            value={text}
            onChangeText={setText}
          />
          <Button title="Envoyer" onPress={sendMessage} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 60,
    backgroundColor: "#0066cc",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  title: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  messages: { flex: 1, padding: 10 },
  messageItem: { flexDirection: "row", marginVertical: 4 },
  username: { fontWeight: "bold", marginRight: 4 },
  messageText: { flexShrink: 1 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginRight: 8,
  },
});


