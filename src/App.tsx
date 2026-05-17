import { useState, useEffect } from "react";
import type { DB, Client, Commande, StatutVetement } from "./types";
import { loadDB, saveDB } from "./utils/db";
import ClientForm from "./components/ClientForm";
import ClientList from "./components/ClientList";
import VetementForm from "./components/VetementForm";
import Facture from "./components/Facture";
import Dashboard from "./components/Dashboard";
import "./App.css";

type View = "dashboard" | "clients" | "add-client" | "add-vetements" | "facture";

export default function App() {
  const [db, setDb]                       = useState<DB>({ clients: [], commandes: [] });
  const [view, setView]                   = useState<View>("dashboard");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
  const [editClient, setEditClient]       = useState<Client | null>(null);

  useEffect(() => {
    setDb(loadDB());
  }, []);

  const persistDB = (newDb: DB): void => {
    setDb(newDb);
    saveDB(newDb);
  };

  const handleAddClient = (data: Omit<Client, "id">): void => {
    const newDb: DB = {
      ...db,
      clients: editClient
        ? db.clients.map((c) =>
            c.id === editClient.id ? { ...editClient, ...data } : c
          )
        : [...db.clients, { ...data, id: Date.now().toString() }],
    };
    persistDB(newDb);
    setEditClient(null);
    setView("clients");
  };

  const handleDeleteClient = (clientId: string): void => {
    if (!window.confirm("Supprimer ce client et toutes ses commandes ?")) return;
    const newDb: DB = {
      clients:   db.clients.filter((c) => c.id !== clientId),
      commandes: db.commandes.filter((cmd) => cmd.clientId !== clientId),
    };
    persistDB(newDb);
  };

  const handleAddCommande = (commande: Omit<Commande, "id">): void => {
    const newDb: DB = {
      ...db,
      commandes: [...db.commandes, { ...commande, id: Date.now().toString() }],
    };
    persistDB(newDb);
    setView("clients");
    setSelectedClient(null);
  };

  const handleUpdateVetementStatus = (
    commandeId: string,
    vetIndex: number,
    status: StatutVetement
  ): void => {
    const newDb: DB = {
      ...db,
      commandes: db.commandes.map((cmd) => {
        if (cmd.id !== commandeId) return cmd;
        const newVetements = cmd.vetements.map((v, i) =>
          i === vetIndex ? { ...v, statut: status } : v
        );
        return { ...cmd, vetements: newVetements };
      }),
    };
    persistDB(newDb);
  };

  const handleDeleteCommande = (commandeId: string): void => {
    if (!window.confirm("Supprimer cette commande ?")) return;
    const newDb: DB = {
      ...db,
      commandes: db.commandes.filter((c) => c.id !== commandeId),
    };
    persistDB(newDb);
    setSelectedCommande(null);
    setView("clients");
  };

  const navItems: { key: View; icon: string; label: string }[] = [
    { key: "dashboard",   icon: "⬡", label: "Tableau de bord" },
    { key: "clients",     icon: "◉", label: "Clients"          },
    { key: "add-client",  icon: "⊕", label: "Nouveau client"   },
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-icon">◈</span>
          <span className="logo-text">
            PRESSING<br /><small>ÉLITE</small>
          </span>
        </div>

        <nav>
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`nav-btn ${view === item.key ? "active" : ""}`}
              onClick={() => { setView(item.key); setEditClient(null); }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span>v2.0 TypeScript — {new Date().getFullYear()}</span>
        </div>
      </aside>

      <main className="main-content">
        {view === "dashboard" && <Dashboard db={db} />}

        {view === "add-client" && (
          <ClientForm
            onSubmit={handleAddClient}
            initial={editClient}
            onCancel={() => setView("clients")}
          />
        )}

        {view === "clients" && (
          <ClientList
            clients={db.clients}
            commandes={db.commandes}
            onEdit={(c) => { setEditClient(c); setView("add-client"); }}
            onDelete={handleDeleteClient}
            onSelectClient={(c) => { setSelectedClient(c); setView("add-vetements"); }}
            onViewFacture={(cmd) => { setSelectedCommande(cmd); setView("facture"); }}
            onUpdateStatus={handleUpdateVetementStatus}
            onDeleteCommande={handleDeleteCommande}
          />
        )}

        {view === "add-vetements" && selectedClient && (
          <VetementForm
            client={selectedClient}
            onSubmit={handleAddCommande}
            onCancel={() => setView("clients")}
          />
        )}

        {view === "facture" && selectedCommande && (
          <Facture
            commande={selectedCommande}
            client={db.clients.find((c) => c.id === selectedCommande.clientId) ?? null}
            onBack={() => setView("clients")}
          />
        )}
      </main>
    </div>
  );
}
