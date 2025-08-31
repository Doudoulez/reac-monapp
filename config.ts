// config.ts

/* -------------------------
   URL DU SERVEUR
------------------------- */
export const API_URL = "http://192.168.1.106:3000";
export const SOCKET_URL = "http://192.168.1.106:3000";

/* -------------------------
   ENDPOINTS DE L'API
------------------------- */
export const ENDPOINTS = {
  LOGIN: "/login",
  REGISTER: "/register",
  ROOMS: "/rooms",
  MESSAGES: "/messages",
  PRIVATE_MESSAGE: "/private-message",

  // Endpoints dynamiques
  USER_UPDATE: (id: number | string) => `/users/${id}`,
  MESSAGE_UPDATE: (id: number | string) => `/messages/${id}`,
  PRIVATE_MESSAGE_UPDATE: (id: number | string) => `/private-messages/${id}`,
};

/* -------------------------
   OPTIONS SOCKET.IO
------------------------- */
export const SOCKET_OPTIONS = {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
};

/* -------------------------
   MESSAGES ET ALERTES
------------------------- */
export const MESSAGES = {
  ERROR_FILL_FIELDS: "Remplis tous les champs.",
  ERROR_LOGIN_FAILED: "Connexion échouée : email ou mot de passe incorrect",
  ERROR_REGISTER_FAILED: "Inscription échouée : vérifie tes informations",
  SUCCESS_REGISTER: "Inscription réussie !",
  NETWORK_ERROR: "Erreur réseau, réessayez",
  ROOM_CREATE_SUCCESS: "Salon créé avec succès !",
  ROOM_CREATE_FAILED: "Impossible de créer le salon",
  JOIN_ROOM_FAILED: "Impossible de rejoindre le salon",
  AGE_NOT_VERIFIED: "Vérifie ton âge avant de te connecter",
  MESSAGE_UPDATE_SUCCESS: "Message modifié avec succès !",
  MESSAGE_UPDATE_FAILED: "Impossible de modifier le message",
};

/* -------------------------
   VALEURS PAR DÉFAUT CHAT
------------------------- */
export const CHAT_DEFAULTS = {
  ROOM_NAME: "SalonTest",
  ROOM_PASSWORD: "", // mot de passe par défaut vide
};

