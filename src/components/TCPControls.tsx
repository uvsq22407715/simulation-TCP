
import React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { 
  ArrowRight, 
  RefreshCw, 
  Play, 
  Pause, 
  Wifi, 
  WifiOff,
  Send,
  Clock,
  Check,
  X,
  Info
} from "lucide-react";
import { ConnectionState, SimulationMode } from "@/types/tcp-types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TCPControlsProps {
  simulationMode: SimulationMode;
  onModeChange: (mode: SimulationMode) => void;
  packetCount: number;
  onPacketCountChange: (count: number) => void;
  rcvWindow: number;
  onRcvWindowChange: (window: number) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  isSimulationRunning: boolean;
  onStartSimulation: () => void;
  onResetSimulation: () => void;
  connectionState: ConnectionState;
}

const TCPControls: React.FC<TCPControlsProps> = ({
  simulationMode,
  onModeChange,
  packetCount,
  onPacketCountChange,
  rcvWindow,
  onRcvWindowChange,
  speed,
  onSpeedChange,
  isSimulationRunning,
  onStartSimulation,
  onResetSimulation,
  connectionState
}) => {
  // Obtenir la classe du bouton de mode en fonction de l'état actif
  const getModeButtonClass = (mode: SimulationMode): string => {
    return simulationMode === mode 
      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
      : "bg-secondary text-secondary-foreground hover:bg-secondary/80";
  };

  // Afficher un texte d'aide différent selon le mode sélectionné
  const getModeHelp = (): string => {
    switch (simulationMode) {
      case "connection":
        return "Simulation du processus d'établissement de connexion à 3 phases (three-way handshake)";
      case "data":
        return "Simulation du transfert de données avec fenêtre glissante et gestion des paquets perdus";
      case "closing":
        return "Simulation de la fermeture de connexion à 4 phases";
      default:
        return "";
    }
  };

  // Vérifier si la simulation peut être lancée en fonction de l'état actuel
  const canStartSimulation = (): boolean => {
    if (isSimulationRunning) return false;
    
    switch (simulationMode) {
      case "connection":
        // On peut établir une connexion uniquement si l'état est idle ou closed
        return connectionState === "idle" || connectionState === "closed";
      case "data":
        // Le transfert de données nécessite une connexion établie
        return connectionState === "established";
      case "closing":
        // La fermeture nécessite une connexion établie
        return connectionState === "established";
      default:
        return false;
    }
  };

  // Obtenir un message d'état du bouton en fonction du mode de simulation et de l'état de la connexion
  const getButtonStatusMessage = (): string => {
    if (isSimulationRunning) return "Simulation en cours...";
    
    switch (simulationMode) {
      case "connection":
        if (connectionState === "established") {
          return "Connexion déjà établie";
        } else if (connectionState !== "idle" && connectionState !== "closed") {
          return "Connexion en cours";
        }
        return "Prêt à établir la connexion";
      case "data":
        if (connectionState !== "established") {
          return "La connexion doit être établie";
        }
        return "Prêt à transférer des données";
      case "closing":
        if (connectionState !== "established") {
          return "Impossible de fermer (pas de connexion active)";
        }
        return "Prêt à fermer la connexion";
      default:
        return "";
    }
  };

  // Obtenir le texte et la couleur de l'état de la connexion
  const getConnectionStateInfo = () => {
    let color = "bg-amber-100 text-amber-800";
    let icon = <Info className="h-4 w-4 mr-1" />;
    
    switch (connectionState) {
      case "established":
        color = "bg-green-100 text-green-800";
        icon = <Check className="h-4 w-4 mr-1" />;
        break;
      case "idle":
      case "closed":
        color = "bg-red-100 text-red-800";
        icon = <X className="h-4 w-4 mr-1" />;
        break;
      default:
        color = "bg-amber-100 text-amber-800";
        icon = <Info className="h-4 w-4 mr-1" />;
    }
    
    return {
      color,
      icon,
      label: connectionState.replace(/_/g, " ")
    };
  };

  // Obtenir l'icône du bouton de démarrage en fonction du mode de simulation
  const getStartIcon = () => {
    switch (simulationMode) {
      case "connection":
        return <Wifi className="mr-2 h-4 w-4" />;
      case "data":
        return <Send className="mr-2 h-4 w-4" />;
      case "closing":
        return <WifiOff className="mr-2 h-4 w-4" />;
      default:
        return <Play className="mr-2 h-4 w-4" />;
    }
  };

  // Obtenir les détails de l'état désactivé pour les boutons du mode simulation
  const isModeDisabled = (mode: SimulationMode): boolean => {
    if (isSimulationRunning) return true;
    
    // Empêcher le passage aux modes données/fermeture si la connexion n'est pas établie
    if ((mode === "data" || mode === "closing") && connectionState !== "established") {
      return true;
    }
    
    return false;
  };

  // Informations sur l'état de la connexion
  const stateInfo = getConnectionStateInfo();

  return (
    <div className="space-y-6">
      {/* Indicateur d'état de la connexion */}
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-2">État de la connexion</h2>
        <div className={`flex items-center px-4 py-2 rounded-md ${stateInfo.color}`}>
          {stateInfo.icon}
          <span className="capitalize">{stateInfo.label}</span>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-3">Mode de simulation</h2>
        <div className="flex flex-col space-y-2">
          <Button 
            variant="secondary" 
            className={`justify-start ${getModeButtonClass("connection")}`}
            onClick={() => onModeChange("connection")}
            disabled={isModeDisabled("connection")}
          >
            <Wifi className="mr-2 h-4 w-4" /> 
            Établissement de connexion
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button 
                    variant="secondary" 
                    className={`justify-start w-full ${getModeButtonClass("data")}`}
                    onClick={() => onModeChange("data")}
                    disabled={isModeDisabled("data")}
                  >
                    <Send className="mr-2 h-4 w-4" /> 
                    Transfert de données
                  </Button>
                </div>
              </TooltipTrigger>
              {connectionState !== "established" && (
                <TooltipContent>
                  <p>La connexion doit être établie pour transférer des données</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button 
                    variant="secondary" 
                    className={`justify-start w-full ${getModeButtonClass("closing")}`}
                    onClick={() => onModeChange("closing")}
                    disabled={isModeDisabled("closing")}
                  >
                    <WifiOff className="mr-2 h-4 w-4" /> 
                    Fermeture de connexion
                  </Button>
                </div>
              </TooltipTrigger>
              {connectionState !== "established" && (
                <TooltipContent>
                  <p>La connexion doit être établie pour pouvoir être fermée</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          {getModeHelp()}
        </p>
      </div>

      {simulationMode === "data" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre de paquets (N)
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={packetCount}
                onChange={(e) => onPacketCountChange(parseInt(e.target.value) || 1)}
                min={1}
                max={20}
                className="w-20 text-center"
                disabled={isSimulationRunning}
              />
              <Slider
                value={[packetCount]}
                min={1}
                max={20}
                step={1}
                onValueChange={(value) => onPacketCountChange(value[0])}
                className="flex-1"
                disabled={isSimulationRunning}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Taille de la fenêtre (rcvwindow)
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={rcvWindow}
                onChange={(e) => onRcvWindowChange(parseInt(e.target.value) || 1)}
                min={1}
                max={10}
                className="w-20 text-center"
                disabled={isSimulationRunning}
              />
              <Slider
                value={[rcvWindow]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => onRcvWindowChange(value[0])}
                className="flex-1"
                disabled={isSimulationRunning}
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          Vitesse de simulation
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xs">Lente</span>
          <Slider
            value={[speed]}
            min={0.5}
            max={3}
            step={0.5}
            onValueChange={(value) => onSpeedChange(value[0])}
            className="flex-1"
            disabled={isSimulationRunning}
          />
          <span className="text-xs">Rapide</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex-1">
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={onStartSimulation}
                    disabled={!canStartSimulation()}
                  >
                    {getStartIcon()}
                    {isSimulationRunning ? "En cours..." : "Démarrer"}
                  </Button>
                </div>
              </TooltipTrigger>
              {!canStartSimulation() && !isSimulationRunning && (
                <TooltipContent>
                  <p>{getButtonStatusMessage()}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <Button 
            variant="outline" 
            onClick={onResetSimulation}
            disabled={isSimulationRunning}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-500 text-center">
          {getButtonStatusMessage()}
        </p>
      </div>
    </div>
  );
};

export default TCPControls;
