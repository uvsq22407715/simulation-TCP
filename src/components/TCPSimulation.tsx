import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, ArrowLeft, Clock, Wifi, X, Check, Scroll } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import NetworkVisualization from "@/components/NetworkVisualization";
import TCPControls from "@/components/TCPControls";
import { TCPPacket, ConnectionState, SimulationMode } from "@/types/tcp-types";
import { toast } from "@/components/ui/use-toast";

const TCPSimulation: React.FC = () => {
  const [simulationMode, setSimulationMode] = useState<SimulationMode>("connection");
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [packets, setPackets] = useState<TCPPacket[]>([]);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [packetCount, setPacketCount] = useState(5);
  const [rcvWindow, setRcvWindow] = useState(3);
  const [speed, setSpeed] = useState(1);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("visualization");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Effacer tout délai d'attente actif lorsque le composant est démonté
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Ajouter un message de journal avec l'horodatage
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prevLogs) => [...prevLogs, `[${timestamp}] ${message}`]);
  };

  // Valider si une action peut être effectuée dans l'état actuel
  const validateStateForAction = (action: "connect" | "data" | "close"): boolean => {
    switch (action) {
      case "connect":
        if (connectionState !== "idle" && connectionState !== "closed") {
          toast({
            title: "Action non autorisée",
            description: "Une connexion est déjà en cours ou établie",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case "data":
        if (connectionState !== "established") {
          toast({
            title: "Action non autorisée",
            description: "Impossible de transférer des données - la connexion doit être établie",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case "close":
        if (connectionState !== "established") {
          toast({
            title: "Action non autorisée",
            description: "Impossible de fermer une connexion qui n'est pas établie",
            variant: "destructive"
          });
          return false;
        }
        return true;
      default:
        return false;
    }
  };

  // Réinitialisation de la simulation
  const resetSimulation = () => {
    setConnectionState("idle");
    setPackets([]);
    setIsSimulationRunning(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    addLog("Simulation réinitialisée");
  };

  // Démarrer la phase d'établissement de la connexion
  const startConnectionEstablishment = () => {
    if (!validateStateForAction("connect")) return;
    
    resetSimulation();
    setConnectionState("syn_sent");
    setIsSimulationRunning(true);

    addLog("Client: Envoi d'un paquet SYN, début du handshake");
    
    // Ajouter un paquet SYN
    const synPacket: TCPPacket = {
      id: "syn-1",
      type: "SYN",
      from: "client",
      to: "server",
      content: "SYN",
      status: "sending"
    };
    setPackets([synPacket]);

    // Simuler la réponse du serveur après un délai
    timeoutRef.current = setTimeout(() => {
      addLog("Serveur: Réception du SYN, envoi SYN+ACK");
      
      // Mise à jour de l'état des paquets SYN
      setPackets(prev => 
        prev.map(p => p.id === "syn-1" ? {...p, status: "delivered"} : p)
      );
      
      // Ajouter le paquet SYN+ACK
      const synAckPacket: TCPPacket = {
        id: "syn-ack-1",
        type: "SYN-ACK",
        from: "server",
        to: "client",
        content: "SYN-ACK",
        status: "sending"
      };
      setPackets(prev => [...prev, synAckPacket]);
      setConnectionState("syn_received");

      // Simulation de l'ACK du client après un délai
      timeoutRef.current = setTimeout(() => {
        addLog("Client: Réception du SYN+ACK, envoi ACK final");
        
        // Mise à jour du statut du paquet SYN+ACK
        setPackets(prev => 
          prev.map(p => p.id === "syn-ack-1" ? {...p, status: "delivered"} : p)
        );
        
        // Ajouter le paquet ACK
        const ackPacket: TCPPacket = {
          id: "ack-1",
          type: "ACK",
          from: "client",
          to: "server",
          content: "ACK",
          status: "sending"
        };
        setPackets(prev => [...prev, ackPacket]);

        // Finaliser la connexion après un délai
        timeoutRef.current = setTimeout(() => {
          // Cette partie est cruciale - mise à jour du statut du paquet ACK ET de l'état de connexion
          setPackets(prev => 
            prev.map(p => p.id === "ack-1" ? {...p, status: "delivered"} : p)
          );
          
          // Correction ici: on s'assure de bien mettre à jour l'état de la connexion à "established"
          setConnectionState("established");
          setIsSimulationRunning(false);
          
          addLog("Connexion TCP établie! Prêt pour le transfert de données");
          
          toast({
            title: "Connexion établie",
            description: "La connexion TCP est maintenant prête pour le transfert de données",
            variant: "default"
          });
        }, 1000 / speed);
      }, 1000 / speed);
    }, 1000 / speed);
  };

  // Démarrer la phase de transfert de données
  const startDataTransfer = () => {
    // Vérification stricte que la connexion est bien établie avant de permettre le transfert
    if (!validateStateForAction("data")) return;
    
    setIsSimulationRunning(true);
    addLog(`Client: Demande de ${packetCount} paquets avec fenêtre de réception ${rcvWindow}`);

    // Initialiser les compteurs pour le transfert de données
    let sentCount = 0;
    let acknowledgedCount = 0;
    let batchSize = Math.min(packetCount, rcvWindow);
    let currentBatch = 1;

    const sendDataBatch = () => {
      addLog(`Serveur: Envoi du lot ${currentBatch} (${batchSize} paquets)`);
      
      const newPackets = [];
      for (let i = 0; i < batchSize; i++) {
        const packetId = `data-${sentCount + 1}`;
        newPackets.push({
          id: packetId,
          type: "DATA",
          from: "server",
          to: "client",
          content: `DATA-${sentCount + 1}`,
          status: "sending",
          sequenceNumber: sentCount + 1
        });
        sentCount++;
      }
      
      setPackets(prev => [...prev, ...newPackets]);

      // Simuler la livraison et l'accusé de réception après un délai
      timeoutRef.current = setTimeout(() => {
        // Marquer les paquets comme livrés
        setPackets(prev => 
          prev.map(p => 
            newPackets.some(np => np.id === p.id) ? {...p, status: "delivered"} : p
          )
        );
        
        // Simuler une perte de paquet aléatoire (20% de chance)
        const lostPacketIndex = Math.random() < 0.2 ? Math.floor(Math.random() * newPackets.length) : -1;
        
        if (lostPacketIndex >= 0) {
          const lostPacket = newPackets[lostPacketIndex];
          addLog(`Client: Paquet ${lostPacket.sequenceNumber} perdu, envoi NACK`);
          
          // Ajouter un paquet NACK
          const nackPacket: TCPPacket = {
            id: `nack-${lostPacket.sequenceNumber}`,
            type: "NACK",
            from: "client",
            to: "server",
            content: `NACK-${lostPacket.sequenceNumber}`,
            status: "sending",
            ackNumber: lostPacket.sequenceNumber
          };
          setPackets(prev => [...prev, nackPacket]);
          
          // Simuler la retransmission après un délai
          timeoutRef.current = setTimeout(() => {
            // Marquer le NACK comme livré
            setPackets(prev => 
              prev.map(p => p.id === nackPacket.id ? {...p, status: "delivered"} : p)
            );
            
            addLog(`Serveur: Retransmission du paquet ${lostPacket.sequenceNumber}`);
            
            // Ajouter le paquet retransmis
            const retransmittedPacket: TCPPacket = {
              id: `retransmit-${lostPacket.sequenceNumber}`,
              type: "DATA",
              from: "server",
              to: "client",
              content: `RETX-${lostPacket.sequenceNumber}`,
              status: "sending",
              sequenceNumber: lostPacket.sequenceNumber
            };
            setPackets(prev => [...prev, retransmittedPacket]);
            
            // Finaliser la retransmission après un délai
            timeoutRef.current = setTimeout(() => {
              // Marquer la retransmission comme livrée
              setPackets(prev => 
                prev.map(p => p.id === retransmittedPacket.id ? {...p, status: "delivered"} : p)
              );
              
              sendAckForBatch();
            }, 1000 / speed);
          }, 1000 / speed);
        } else {
          sendAckForBatch();
        }
      }, 1000 / speed);
    };
    
    const sendAckForBatch = () => {
      addLog(`Client: Envoi ACK pour le lot ${currentBatch}`);
      
      // Ajouter un paquet ACK pour le lot
      const ackPacket: TCPPacket = {
        id: `ack-batch-${currentBatch}`,
        type: "ACK",
        from: "client",
        to: "server",
        content: `ACK-BATCH-${currentBatch}`,
        status: "sending"
      };
      setPackets(prev => [...prev, ackPacket]);
      
      // Traiter l'ACK après un délai
      timeoutRef.current = setTimeout(() => {
        // Marquer l'ACK comme livré
        setPackets(prev => 
          prev.map(p => p.id === ackPacket.id ? {...p, status: "delivered"} : p)
        );
        
        acknowledgedCount += batchSize;
        currentBatch++;
        
        if (acknowledgedCount < packetCount) {
          // Calculer la taille du prochain lot
          batchSize = Math.min(packetCount - acknowledgedCount, rcvWindow);
          sendDataBatch();
        } else {
          addLog("Transfert de données terminé avec succès!");
          toast({
            title: "Transfert terminé",
            description: `${packetCount} paquets ont été transmis avec succès`,
            variant: "default"
          });
          setIsSimulationRunning(false);
        }
      }, 1000 / speed);
    };
    
    // Démarrer le premier lot
    sendDataBatch();
  };

  // Démarrer la phase de terminaison de la connexion
  const startConnectionTermination = () => {
    // Vérification stricte que la connexion est bien établie avant de permettre la fermeture
    if (!validateStateForAction("close")) return;

    setIsSimulationRunning(true);
    setConnectionState("fin_wait_1");
    addLog("Client: Envoi d'un paquet FIN pour fermer la connexion");
    
    // Ajouter un paquet FIN
    const finPacket: TCPPacket = {
      id: "fin-1",
      type: "FIN",
      from: "client",
      to: "server",
      content: "FIN",
      status: "sending"
    };
    setPackets([finPacket]);

    // Simuler l'ACK du serveur après un délai
    timeoutRef.current = setTimeout(() => {
      addLog("Serveur: Réception du FIN, envoi ACK");
      
      // Mise à jour du statut du paquet FIN
      setPackets(prev => 
        prev.map(p => p.id === "fin-1" ? {...p, status: "delivered"} : p)
      );
      
      // Ajouter le paquet ACK
      const ackPacket: TCPPacket = {
        id: "ack-fin-1",
        type: "ACK",
        from: "server",
        to: "client",
        content: "ACK-FIN",
        status: "sending"
      };
      setPackets(prev => [...prev, ackPacket]);
      setConnectionState("close_wait");

      // Traiter l'ACK du serveur après un délai
      timeoutRef.current = setTimeout(() => {
        // Mise à jour du statut du paquet ACK
        setPackets(prev => 
          prev.map(p => p.id === "ack-fin-1" ? {...p, status: "delivered"} : p)
        );
        
        addLog("Serveur: Envoi FIN pour signaler la fermeture complète");
        
        // Ajouter le paquet FIN du serveur
        const serverFinPacket: TCPPacket = {
          id: "fin-2",
          type: "FIN",
          from: "server",
          to: "client",
          content: "FIN",
          status: "sending"
        };
        setPackets(prev => [...prev, serverFinPacket]);
        setConnectionState("last_ack");

        // Traiter l'ACK final du client après un délai
        timeoutRef.current = setTimeout(() => {
          // Mise à jour du statut du paquet FIN du serveur
          setPackets(prev => 
            prev.map(p => p.id === "fin-2" ? {...p, status: "delivered"} : p)
          );
          
          addLog("Client: Réception du FIN serveur, envoi ACK final");
          
          // Ajouter le paquet ACK final
          const finalAckPacket: TCPPacket = {
            id: "ack-fin-2",
            type: "ACK",
            from: "client",
            to: "server",
            content: "ACK-FIN",
            status: "sending"
          };
          setPackets(prev => [...prev, finalAckPacket]);
          
          // Traiter l'ACK final après un délai
          timeoutRef.current = setTimeout(() => {
            // Mise à jour du statut du paquet ACK final
            setPackets(prev => 
              prev.map(p => p.id === "ack-fin-2" ? {...p, status: "delivered"} : p)
            );
            
            addLog("Connexion fermée. Attente du timeout de 30 secondes...");
            setConnectionState("time_wait");
            
            // Simuler le timeout TIME_WAIT
            timeoutRef.current = setTimeout(() => {
              addLog("Timeout de 30 secondes écoulé. Connexion complètement terminée.");
              setConnectionState("closed");
              setIsSimulationRunning(false);
              toast({
                title: "Connexion fermée",
                description: "La connexion TCP a été fermée correctement",
                variant: "default"
              });
            }, 3000 / speed); // Utilisation de 3 secondes pour représenter 30 secondes
          }, 1000 / speed);
        }, 1000 / speed);
      }, 1000 / speed);
    }, 1000 / speed);
  };

  // Gérer les changements de mode de simulation
  const handleModeChange = (mode: SimulationMode) => {
    // Ne pas réinitialiser la simulation lorsqu'on change de mode
    // On garde l'état de connexion actuel
    setSimulationMode(mode);
    
    // Réinitialiser uniquement les paquets, pas l'état de connexion
    setPackets([]);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsSimulationRunning(false);
    
    addLog(`Mode de simulation changé pour: ${mode}`);
  };

  // Démarrer le mode de simulation sélectionné
  const startSimulation = () => {
    switch (simulationMode) {
      case "connection":
        startConnectionEstablishment();
        break;
      case "data":
        startDataTransfer();
        break;
      case "closing":
        startConnectionTermination();
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="visualization" className="flex items-center gap-2">
                  <Scroll className="h-4 w-4" /> Visualisation
                </TabsTrigger>
                <TabsTrigger value="logs" className="flex items-center gap-2">
                  <Scroll className="h-4 w-4" /> Logs
                </TabsTrigger>
              </TabsList>
              <TabsContent value="visualization" className="mt-6">
                <ScrollArea className="h-[400px] rounded-md border">
                  <NetworkVisualization 
                    packets={packets}
                    connectionState={connectionState}
                  />
                </ScrollArea>
              </TabsContent>
              <TabsContent value="logs" className="mt-6">
                <ScrollArea className="h-[400px] rounded-md">
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm">
                    {logs.length > 0 ? (
                      logs.map((log, index) => (
                        <div key={index} className="mb-1">
                          {log}
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400 italic">Aucun log pour le moment</div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <TCPControls
              simulationMode={simulationMode}
              onModeChange={handleModeChange}
              packetCount={packetCount}
              onPacketCountChange={setPacketCount}
              rcvWindow={rcvWindow}
              onRcvWindowChange={setRcvWindow}
              speed={speed}
              onSpeedChange={setSpeed}
              isSimulationRunning={isSimulationRunning}
              onStartSimulation={startSimulation}
              onResetSimulation={resetSimulation}
              connectionState={connectionState}
            />
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">État actuel de la connexion</h2>
        <div className="flex flex-wrap gap-3">
          <div className="bg-slate-100 px-4 py-2 rounded-md">
            <span className="font-semibold">État:</span>{" "}
            <span className={`capitalize ${connectionState === "idle" || connectionState === "closed" ? "text-red-500" : connectionState === "established" ? "text-green-500" : "text-amber-500"}`}>
              {connectionState.replace("_", " ")}
            </span>
          </div>
          <div className="bg-slate-100 px-4 py-2 rounded-md">
            <span className="font-semibold">Mode:</span>{" "}
            <span className="capitalize">{simulationMode.replace("_", " ")}</span>
          </div>
          <div className="bg-slate-100 px-4 py-2 rounded-md">
            <span className="font-semibold">Paquets:</span> {packets.length}
          </div>
          <div className="bg-slate-100 px-4 py-2 rounded-md">
            <span className="font-semibold">Fenêtre de réception:</span> {rcvWindow}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TCPSimulation;
