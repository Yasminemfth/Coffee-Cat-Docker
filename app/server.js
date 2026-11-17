// ---------------------------------------------------------------------------
// Bar à chats - réservation de tables (données fictives)
//
// Ce qu'elle fait :
//   - elle affiche une page web (public/index.html) avec les photos des chats ;
//   - elle se connecte à une base PostgreSQL si on lui dit où la trouver ;
//   - elle liste et enregistre des réservations :
//       Réservation : chats choisis (un ou plusieurs), numéro de table,
//                     nombre de personnes, date
//       Client      : nom, prénom
// ---------------------------------------------------------------------------

const os = require("node:os");
const path = require("node:path");
const express = require("express");
const { Pool } = require("pg");

// Le port sur lequel l'application écoute. 3000 si on ne précise rien.
const PORT = process.env.PORT || 3000;

// La connexion à la base.
// On ne met AUCUN mot de passe ici : la librairie "pg" lit toute seule les
// variables d'environnement PGHOST, PGPORT, PGUSER, PGPASSWORD et PGDATABASE.
// C'est Docker qui les fournira.
const pool = new Pool();

let baseConnectee = false;
let dernierMessage = "";

const CHATS = [
  { nom: "Bobby",    image: "/images/Bobby.jpg" },
  { nom: "Caramel",  image: "/images/Caramel.jpg" },
  { nom: "Chips",    image: "/images/Chips.jpg" },
  { nom: "Jazzon",   image: "/images/Jazzon.jpg" },
  { nom: "Minou",    image: "/images/minou.jpg" },
  { nom: "Neige",    image: "/images/neige.jpg" },
  { nom: "Réglisse", image: "/images/Réglisse.jpg" },
];


// Évite que l'application plante si la base disparaît en cours de route.
pool.on("error", (err) => {
  console.error("Base : connexion perdue (" + err.message + ")");
  baseConnectee = false;
  setTimeout(connecterLaBase, 2000);
});

// Se connecte à la base et crée la table si besoin.
// Si la base n'est pas joignable, on réessaie toutes les 2 secondes
// au lieu de planter : l'application reste utilisable sans base.
async function connecterLaBase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id        serial PRIMARY KEY,
        cat       text[] NOT NULL,     -- un ou plusieurs chats, ex : Minou,Neige etc
        numtable  int    NOT NULL,
        nbrpers   int    NOT NULL,
        date      date   NOT NULL,
        nom       text   NOT NULL,
        prenom    text   NOT NULL,
        cree_le   timestamptz DEFAULT now()
      )
    `);

    baseConnectee = true;
    dernierMessage = "";
    console.log("Base : connectée");
  } catch (err) {
    baseConnectee = false;
    // On n'affiche le message que s'il change, pour ne pas inonder les logs.
    const message = "Base : non connectée (" + err.message + "), nouvel essai toutes les 2 s";
    if (message !== dernierMessage) console.log(message);
    dernierMessage = message;
    setTimeout(connecterLaBase, 2000);
  }
}

const app = express();
app.use(express.json());

// La page web et les images des chats (dossier public/).
app.use(express.static(path.join(__dirname, "public")));

// La liste des chats.
app.get("/api/chats", (req, res) => {
  res.json(CHATS);
});


// L'état de l'application. "conteneur" est le nom de la machine :
// dans Docker, c'est l'identifiant du conteneur.
app.get("/api/sante", (req, res) => {
  res.json({
    api: "ok",
    base: baseConnectee ? "connectée" : "non connectée",
    conteneur: os.hostname(),
  });
});

// La liste des réservations.
app.get("/api/reservations", async (req, res) => {
  if (!baseConnectee) {
    return res.status(503).json({ erreur: "base non connectée" });
  }
  try {
    const { rows } = await pool.query(
      "SELECT id, cat, numtable, nbrpers, to_char(date, 'YYYY-MM-DD') AS date, nom, prenom FROM reservations ORDER BY date, numtable, id"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// Ajouter une réservation.
app.post("/api/reservations", async (req, res) => {
  if (!baseConnectee) {
    return res.status(503).json({ erreur: "base non connectée" });
  }
  const { cat, numtable, nbrpers, date, nom, prenom } = req.body || {};
  if (!Array.isArray(cat) || cat.length === 0 || !numtable || !nbrpers || !date || !nom || !prenom) {
    return res.status(400).json({ erreur: "Le chat (au moins un), le numéro de table, le nombre de personnes, date, nom et prenom sont obligatoires" });
  }
  try {
    const { rows } = await pool.query(
      "INSERT INTO reservations (cat, numtable, nbrpers, date, nom, prenom) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, cat, numtable, nbrpers, to_char(date, 'YYYY-MM-DD') AS date, nom, prenom",
      [cat, numtable, nbrpers, date, nom, prenom]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
});

// On démarre le serveur web tout de suite, puis on tente la base en tâche de fond.
app.listen(PORT, () => {
  console.log("Bar à chats : application démarrée sur le port " + PORT);
  connecterLaBase();
});

// Arrêt propre quand Docker demande au conteneur de s'arrêter (docker stop).
process.on("SIGTERM", () => {
  console.log("Bar à chats : arrêt demandé, au revoir");
  process.exit(0);
});