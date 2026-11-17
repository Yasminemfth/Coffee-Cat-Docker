# 🐾 Nom du Projet : Café à Chats

Bienvenue sur le dépôt GitHub de notre plateforme de réservation pour notre **café à chats** ! ☕🐱

On choisit un ou plusieurs chats, puis on réserve une table (numéro de table, nombre de personnes, date, nom, prénom). Les réservations sont enregistrées dans une base PostgreSQL et restent sauvegardées grâce à un volume Docker.

---

## 👥 Équipe 

Le projet a été réalisé en collaboration  :

* **Clara** et **Yasmine** : 
  * `compose` (Configuration Docker Compose)
  * `index` (Page d'accueil / Interface principale)
  * `adminer` (Gestion de la base de données) 
  * `dockerfile` (Configuration de l'image de l'application)
  * `dockerignore` (Fichiers exclus du conteneur)
  * `.env` (Variables d'environnement)
  * `server.js` (Logique du serveur / Backend)

---

##  Lancer le projet

Il faut seulement avoir **Docker Desktop** installé.

Pour lancer l'application en local à l'aide de Docker, suivez ces étapes :

1. Cloner le dépôt sur votre machine :
   ```bash
   git clone https://github.com/Yasminemfth/Coffee-Cat-Docker
   cd Coffee-Cat-Docker
   ```

2. Créer le `.env` : on a mis un fichier `.env.example` dans le dépôt. Il faut le copier en `.env` et remplir les valeurs

3. Lancer le compose :
   ```bash
   docker compose up --build -d
   ```

4. Ouvrir dans le navigateur :
   * l'application : http://localhost:3000
   * Adminer : http://localhost:8080

---

## Se connecter à Adminer

* **Système** : PostgreSQL
* **Serveur** : `db_coffee`
* **Utilisateur**, **Mot de passe**, **Base de données** : les valeurs `USER`, `PASSWORD` et `DB` du `.env`
