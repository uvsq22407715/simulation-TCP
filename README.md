# 🌐 Simulation du protocole TCP

Projet TER de Master M1 – Université Paris-Saclay  
Encadrant : M. Mourad GUEROUI (📧 mourad.gueroui@uvsq.fr)

Une application web interactive permettant de **simuler un échange de paquets TCP entre un client et un serveur**, conformément au scénario pédagogique défini dans le sujet TER.

🔗 Accédez au site du projet ici : <Lien vers le site>

---

## 📘 Description du projet

Ce projet simule étape par étape le fonctionnement du **protocole TCP**, conformément aux recommandations suivantes :

### 1. Ouverture de connexion (3-Way Handshake)

- Le client envoie un paquet SYN et déclenche un temporisateur (timeout).
- Le serveur répond avec un paquet SYN+ACK.
- Le client confirme avec un ACK.

### 2. Transfert de données

- Le client demande un nombre variable de paquets `N`.
- Il précise sa capacité de réception (`rcvwindow`).
- Le serveur envoie les paquets en respectant cette capacité.
- Le client acquitte les paquets (ACK positif ou négatif).
- En cas d’ACK négatif, les paquets erronés sont retransmis.

### 3. Fermeture de la connexion

- Le client envoie un paquet FIN.
- Le serveur répond par un ACK (connexion en cours de fermeture).
- Le client déclenche un temporisateur de 30 secondes avant fermeture complète.

---

## 🚀 Fonctionnalités principales

- 🔁 Animation complète de l’ouverture de connexion (3-way handshake)
- 📦 Transfert de paquets configurable (nombre `N`, `rcvwindow`)
- ❌ Fermeture de connexion avec gestion du timeout de 30s
- 🔄 Retransmission des paquets en cas d’erreur (ACK négatif)
- 👀 Interface graphique interactive
- ⚙️ Développement moderne basé sur Vite + React + TypeScript

---

## ⚙️ Technologies utilisées

- TypeScript
- React
- Vite

---

## 🛠️ Instructions d’installation

### Étape 1 : Cloner le dépôt Git

```bash
git clone https://github.com/uvsq22407715/simulationTCP.git
```

### Étape 2 : Se déplacer dans le dossier du projet

```bash
cd simulationTCP
```

### Étape 3 : Installer les dépendances nécessaires

```bash
npm install
```

### Étape 4 : Lancer le serveur de développement avec rechargement automatique

```bash
npm run dev
```

---

## 👨‍🎓 Réalisé par

- **Ziad SOUALAH MOHAMMED**
- **Islam TEBAIBIA**