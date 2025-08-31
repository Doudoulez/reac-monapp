import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Modal, FlatList } from "react-native";
import RoomList from "./RoomList";
import ProfilePage from "./ProfilePage";
import SettingsPage from "./SettingsPage";
import CreateRoom from "./CreateRoom";

interface GeneralLayoutProps {
  topTitle?: string;
}

type PageKey = "Salons" | "Créer un salon" | "Profil" | "Paramètres";

const MENU_ITEMS: PageKey[] = ["Salons", "Créer un salon", "Profil", "Paramètres"];

export default function GeneralLayout({ topTitle = "Mon App" }: GeneralLayoutProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageKey>("Salons");

  const handleMenuItemPress = (page: PageKey) => {
    setMenuVisible(false);
    setCurrentPage(page);
  };

  const renderContent = () => {
    switch (currentPage) {
      case "Salons":
        return <RoomList />;
      case "Créer un salon":
        return <CreateRoom />;
      case "Profil":
        return <ProfilePage />;
      case "Paramètres":
        return <SettingsPage />;
      default:
        return <RoomList />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{topTitle}</Text>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
          <Text style={styles.menuText}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Contenu dynamique */}
      <View style={styles.content}>{renderContent()}</View>

      {/* Menu déroulant */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}
        >
          <View style={styles.menu}>
            <FlatList
              data={MENU_ITEMS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress(item)}>
                  <Text style={styles.menuItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 60,
    backgroundColor: "#0066cc",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  title: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  menuButton: { padding: 8 },
  menuText: { color: "#fff", fontSize: 24 },
  content: { flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  menu: {
    backgroundColor: "#fff",
    marginTop: 60,
    marginRight: 10,
    borderRadius: 6,
    paddingVertical: 8,
    width: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: { paddingVertical: 12, paddingHorizontal: 16 },
  menuItemText: { fontSize: 16 },
});
