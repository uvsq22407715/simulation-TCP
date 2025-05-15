
import React from "react";
import { TCPPacket, ConnectionState } from "@/types/tcp-types";

interface NetworkVisualizationProps {
  packets: TCPPacket[];
  connectionState: ConnectionState;
}

const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({
  packets,
  connectionState
}) => {
  // Obtenir la couleur du paquet en fonction du type
  const getPacketColor = (packetType: string): string => {
    switch (packetType) {
      case "SYN":
        return "bg-blue-500";
      case "SYN-ACK":
        return "bg-purple-500";
      case "ACK":
        return "bg-green-500";
      case "DATA":
        return "bg-amber-500";
      case "NACK":
        return "bg-red-500";
      case "FIN":
        return "bg-rose-500";
      default:
        return "bg-gray-500";
    }
  };

  // Obtenir une couleur de surbrillance pour l'état de la connexion
  const getStateHighlight = (state: ConnectionState): string => {
    switch (state) {
      case "established":
        return "border-green-500";
      case "closed":
      case "idle":
        return "border-red-500";
      default:
        return "border-amber-500";
    }
  };

  return (
    <div className="min-h-[400px] relative bg-slate-50 border rounded-lg">
      {/* Titres du client et du serveur */}
      <div className="sticky top-0 left-0 w-full flex justify-between px-8 py-2 bg-slate-200 font-semibold z-10">
        <div>Client</div>
        <div>Serveur</div>
      </div>
      
      {/* Ligne de connexion */}
      <div className="absolute top-10 bottom-10 left-1/2 w-0.5 bg-slate-300"></div>
      
      {/* Boîtes client et serveur */}
      <div className={`absolute top-16 left-8 w-32 h-32 border-2 rounded-lg bg-white ${getStateHighlight(connectionState)}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl mb-2">💻</div>
            <div className="font-medium">Client</div>
          </div>
        </div>
      </div>
      
      <div className={`absolute top-16 right-8 w-32 h-32 border-2 rounded-lg bg-white ${getStateHighlight(connectionState)}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl mb-2">🖥️</div>
            <div className="font-medium">Serveur</div>
          </div>
        </div>
      </div>
      
      {/* Zone d'animation des paquets */}
      <div className="absolute top-52 left-0 right-0 bottom-0 px-8 pb-24">
        {packets.map((packet, index) => {
          // Calculer la position du paquet
          const isClientToServer = packet.from === "client";
          const isDelivered = packet.status === "delivered";
          const offsetY = 30 * (index % 15);
          
          return (
            <div
              key={packet.id}
              className={`absolute h-6 w-36 rounded-md transition-all duration-1000 flex items-center justify-center shadow-md text-white text-xs font-medium
                ${getPacketColor(packet.type)}
                ${isClientToServer 
                  ? (isDelivered ? "left-[calc(50%-4rem)]" : "left-[5rem]") 
                  : (isDelivered ? "left-[calc(50%-4rem)]" : "left-[calc(100%-10rem)]")}
              `}
              style={{ 
                top: `${offsetY}px`,
                transform: `rotate(${isClientToServer ? "25deg" : "-25deg"})`
              }}
            >
              {packet.content}
              {packet.sequenceNumber && ` #${packet.sequenceNumber}`}
            </div>
          );
        })}
      </div>
      
      {/* Indicateur d'état de la connexion */}
      <div className="sticky bottom-4 left-0 w-full text-center bg-slate-50 py-2">
        <div className={`inline-block px-4 py-1 rounded-full text-sm font-medium
          ${connectionState === "established" ? "bg-green-100 text-green-800" :
            connectionState === "idle" || connectionState === "closed" ? "bg-red-100 text-red-800" :
            "bg-amber-100 text-amber-800"}
        `}>
          {connectionState.replace("_", " ")}
        </div>
      </div>
    </div>
  );
};

export default NetworkVisualization;
