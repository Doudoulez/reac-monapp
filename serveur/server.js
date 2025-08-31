const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

// --- CONFIGURATION MariaDB ---
const dbConfig = {
  host: "localhost",
  user: "Alix",
  password: "********",
  database: "chat_db"
};

// --- Middleware Express ---
app.use(express.json());
app.use(cors());

// --- Transporteur mail (Nodemailer) ---
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: { user: "tonemail@gmail.com", pass: "tonpassword" }
});

// --- ROUTES AUTHENTIFICATION ---
// (inchangé)
app.post("/register", async (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password)
    return res.status(400).json({ error: "Champs manquants" });

  try {
    const conn = await mysql.createConnection(dbConfig);
    const hash = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");

    await conn.execute(
      "INSERT INTO users (email, username, password_hash, verified, age_verified, verify_token) VALUES (?, ?, ?, 0, 0, ?)",
      [email, username, hash, verifyToken]
    );
    await conn.end();

    const verifyLink = `http://192.168.1.106:3000/verify-age/${verifyToken}`;
    await transporter.sendMail({
      from: '"Chat App" <tonemail@gmail.com>',
      to: email,
      subject: "Vérification d'âge",
      html: `Clique ici pour vérifier ton âge: <a href="${verifyLink}">${verifyLink}</a>`
    });

    res.json({ message: "Utilisateur créé ! Vérifie ton âge via le mail envoyé." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Vérification âge via lien (inchangé)
app.get("/verify-age/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute("SELECT * FROM users WHERE verify_token = ?", [token]);

    if (rows.length === 0) {
      await conn.end();
      return res.status(400).send("Lien invalide ou expiré");
    }

    const user = rows[0];
    const ageVerifyUrl = `https://ageverify.example.com?callback=http://192.168.1.106:3000/age-verify-callback?userId=${user.id}`;
    res.redirect(ageVerifyUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

// Callback après vérification (inchangé)
app.get("/age-verify-callback", async (req, res) => {
  const { userId, verified } = req.query;
  if (!userId) return res.status(400).send("Utilisateur non défini");

  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      "UPDATE users SET age_verified = ?, verified = ? WHERE id = ?",
      [verified === "true" ? 1 : 0, verified === "true" ? 1 : 0, userId]
    );
    await conn.end();
    res.send("Vérification d'âge enregistrée !");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

// Login (inchangé)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Champs manquants" });

  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute("SELECT * FROM users WHERE email = ?", [email]);
    await conn.end();

    if (rows.length === 0) return res.status(400).json({ error: "Utilisateur non trouvé" });

    const user = rows[0];
    if (!user.age_verified) return res.status(403).json({ error: "Vérifie ton âge avant de te connecter" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Mot de passe incorrect" });

    res.json({ message: "Connexion réussie", user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- CRUD SALONS ---
app.get("/rooms", async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute("SELECT * FROM rooms");
    await conn.end();
    res.json({ rooms: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible de récupérer les salons" });
  }
});

app.post("/rooms", async (req, res) => {
  const { name, password } = req.body;
  if (!name) return res.status(400).json({ error: "Nom du salon requis" });

  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute("INSERT INTO rooms (name, password) VALUES (?, ?)", [name, password || null]);
    await conn.end();
    res.json({ message: "Salon créé", name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible de créer le salon" });
  }
});

// --- Récupérer l'historique des messages ---
app.get("/messages", async (req, res) => {
  const { roomId } = req.query;
  if (!roomId) return res.status(400).json({ error: "roomId manquant" });

  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      "SELECT id, username, message FROM messages WHERE room_id = ? ORDER BY id ASC",
      [roomId]
    );
    await conn.end();
    res.json({ messages: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible de récupérer les messages" });
  }
});

// --- SOCKET.IO ---
io.on("connection", (socket) => {
  console.log("🔌 Utilisateur connecté :", socket.id);

  socket.on("joinRoom", async ({ roomName, password }) => {
    try {
      const conn = await mysql.createConnection(dbConfig);
      const [rows] = await conn.execute("SELECT * FROM rooms WHERE name = ?", [roomName]);

      if (rows.length === 0) {
        await conn.end();
        return socket.emit("joinError", "Salon inexistant");
      }

      const room = rows[0];

      if (room.password && room.password !== (password || "")) {
        await conn.end();
        return socket.emit("joinError", "Mot de passe incorrect");
      }

      socket.join(room.id);

      // 🔥 Historique messages envoyé au client
      const [messages] = await conn.execute(
        "SELECT id, username, message FROM messages WHERE room_id = ? ORDER BY id ASC",
        [room.id]
      );
      socket.emit("history", messages);

      await conn.end();

      // Message de bienvenue dans la room
      io.to(room.id).emit("message", {
        username: "Système",
        text: `Un utilisateur a rejoint ${room.name}`
      });

      // 🔥 On renvoie l’ID réel de la room au client
      socket.emit("joined", { id: room.id, name: room.name });

    } catch (err) {
      console.error(err);
      socket.emit("joinError", "Erreur serveur");
    }
  });

  socket.on("message", async ({ roomId, username, text }) => {
    if (!roomId) return console.error("roomId undefined !");

    try {
      const conn = await mysql.createConnection(dbConfig);
      await conn.execute(
        "INSERT INTO messages (room_id, username, message) VALUES (?, ?, ?)",
        [roomId, username ?? "Inconnu", text ?? ""]
      );
      await conn.end();

      io.to(roomId).emit("message", { username, text });
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Utilisateur déconnecté :", socket.id);
  });
});

// --- Lancer le serveur ---
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});

