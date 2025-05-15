
import React from "react";
import TCPSimulation from "@/components/TCPSimulation";

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-800 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">Simulation du Protocole TCP</h1>
          <p className="text-center mt-2 text-slate-300">
            Visualisation interactive des échanges client-serveur
          </p>
        </div>
      </header>
      <main className="container mx-auto py-8 px-4">
        <TCPSimulation />
      </main>
      <footer className="bg-slate-800 text-white py-4">
        <div className="mt-4 text-center text-sm text-white-500">
          <p>
            Ce simulateur vous permet de comprendre le fonctionnement du protocole TCP en visualisant
            ses différentes phases et états.
          </p>
          <p className="mt-4">
            Réalisé par : <strong>Ziad SOUALAH MOHAMMED</strong> & <strong>Islam TEBAIBIA</strong>
          </p>
          <p className="mt-4">
            <strong>Master 1 Ingénierie des Réseaux et des Systèmes</strong> 
          </p>
          <p className="mt-4 mb-3">
            <strong>Université Versailles Saint-Quentin-en-Yvelines - Paris Saclay</strong>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
