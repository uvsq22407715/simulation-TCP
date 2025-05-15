// Types pour la simulation TCP

// Statuts des paquets
export type PacketStatus = "sending" | "delivered" | "lost";

// Types de paquets TCP
export interface TCPPacket {
  id: string;
  type: string;
  from: "client" | "server";
  to: "client" | "server";
  content: string;
  status: PacketStatus;
  sequenceNumber?: number;
  ackNumber?: number;
}

// États de la connexion
export type ConnectionState = 
  | "idle"               // État initial
  | "syn_sent"           // SYN envoyé par le client
  | "syn_received"       // SYN reçu par le serveur, SYN+ACK envoyé
  | "established"        // Connexion établie
  | "fin_wait_1"         // FIN envoyé par le client
  | "close_wait"         // FIN reçu par le serveur, ACK envoyé
  | "last_ack"           // FIN envoyé par le serveur
  | "time_wait"          // Client en attente du timeout de 30s
  | "closed";            // Connexion complètement fermée

// Modes de simulation
export type SimulationMode = "connection" | "data" | "closing";
