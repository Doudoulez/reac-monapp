import React, { useEffect, useState } from "react";
import { View, FlatList, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { API_URL, ENDPOINTS } from "../config";

type Room = {
  id: number;
  name: string;
  password?: string | null;
};

export default function RoomList() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      const resp = await fetch(`${API_URL}${ENDPOINTS.ROOMS}`);
      const data = await resp.json();
      setRooms(data.rooms || []);
    } catch (err) {
      console.error("Erreur récupération salons :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
        <Text>Chargement des salons...</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={{ paddingVertical: 10 }}
      data={rooms}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.roomCard}
          onPress={() =>
            router.push({ pathname: "/Chat/[roomId]", params: { roomId: item.id, roomName: item.name } })
          }
        >
          <Text style={styles.roomName}>{item.name}</Text>
          {item.password ? <Text style={styles.locked}>🔒</Text> : null}
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  roomCard: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: "#f9f9f9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roomName: { fontSize: 18, fontWeight: "600" },
  locked: { fontSize: 14, color: "red" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});
