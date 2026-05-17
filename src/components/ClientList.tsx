import { useState } from "react";
import type { Client, Commande, StatutVetement } from "../types";
import { formatPrix, formatDateShort, CLASSES } from "../utils/pricing";
import { exportIndexDB } from "../utils/db";
import { envoyerWhatsApp } from "../utils/whatsapp";

interface Props {
  clients:          Client[];
  commandes:        Commande[];
  onEdit:           (client: Client) => void;
  onDelete:         (clientId: string) => void;
  onSelectClient:   (client: Client) => void;
  onViewFacture:    (commande: Commande) => void;
  onUpdateStatus:   (commandeId: string, vetIndex: number, status: StatutVetement) => void;
  onDeleteCommande: (commandeId: string) => void;
}

export default function ClientList({
  clients, commandes, onEdit, onDelete, onSelectClient,
  onViewFacture, onUpdateStatus, onDeleteCommande,
}: Props) {
  const [search, setSearch]     = useState<string>("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = clients.filter(
    (c) =>
      c.nom.toLowerCase().includes(search.toLowerCase()) ||
      c.telephone.includes(search)
  );

  const clientCommandes = (clientId: string): Commande[] =>
    commandes.filter((c) => c.clientId === clientId);

  const estTerminee = (cmd: Commande): boolean =>
    cmd.vetements.length > 0 && cmd.vetements.every((v) => v.statut === "lavé");

  return (
    <div className="client-list-page">
      <div className="page-header">
        <h1>Clients</h1>
        <p>{clients.length} client(s) enregistré(s)</p>
      </div>

      <div className="list-toolbar">
        <input
          className="search-input"
          placeholder="🔍 Rechercher par nom ou téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="btn-outline"
          onClick={() => exportIndexDB({ clients, commandes })}
          title="Exporter index.db"
        >
          ↓ index.db
        </button>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">◉</div>
          <p>Aucun client trouvé.</p>
        </div>
      )}

      <div className="clients-grid">
        {filtered.map((client) => {
          const cmds       = clientCommandes(client.id);
          const isExpanded = expanded === client.id;

          return (
            <div key={client.id} className="client-card">
              <div className="client-card-header">
                <div className="client-avatar">
                  {client.nom[0].toUpperCase()}
                </div>
                <div className="client-info">
                  <h3>{client.nom}</h3>
                  <p>📞 {client.telephone}</p>
                  <p>📍 {client.adresse}</p>
                </div>
                <div className="client-actions">
                  <button
                    className="icon-btn"
                    title="Modifier"
                    onClick={() => onEdit(client)}
                  >Modifier</button>
                  <button
                    className="icon-btn danger"
                    title="Supprimer"
                    onClick={() => onDelete(client.id)}
                  >Supprimer</button>
                </div>
              </div>

              <div className="client-card-footer">
                <button
                  className="btn-sm btn-primary"
                  onClick={() => onSelectClient(client)}
                >
                  + Nouvelle commande
                </button>
                {cmds.length > 0 && (
                  <button
                    className="btn-sm btn-outline"
                    onClick={() =>
                      setExpanded(isExpanded ? null : client.id)
                    }
                  >
                    {isExpanded ? "▲" : "▼"} {cmds.length} commande(s)
                  </button>
                )}
              </div>

              {isExpanded && (
                <div className="commandes-list">
                  {cmds.map((cmd) => {
                    const done      = estTerminee(cmd);
                    const classeInfo = CLASSES[cmd.classe];

                    return (
                      <div key={cmd.id} className="commande-item">
                        <div className="commande-header">
                          <span
                            className="classe-badge"
                            style={{ background: classeInfo.color }}
                          >
                            {classeInfo.label}
                          </span>
                          <span className="commande-date">
                            Dépôt: {formatDateShort(cmd.dateDepot)}
                          </span>
                          <span className="commande-date">
                            Retrait: {formatDateShort(cmd.dateRetrait)}
                          </span>
                          <span className="commande-total">
                            {formatPrix(cmd.total)}
                          </span>
                          <div className="commande-actions">
                            <button
                              className="btn-sm btn-outline"
                              onClick={() => onViewFacture(cmd)}
                            >
                              📄 Facture
                            </button>
                            <button
                              className="btn-sm btn-danger"
                              onClick={() => onDeleteCommande(cmd.id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        {/* Statut de chaque vêtement */}
                        <div className="vetements-status">
                          {cmd.vetements.map((v, i) => (
                            <div key={i} className="vet-status-row">
                              <span className="vet-emoji">{v.emoji}</span>
                              <span className="vet-nom">{v.nom}</span>
                              <span className="vet-qty">×{v.quantite}</span>
                              <select
                                value={v.statut}
                                onChange={(e) =>
                                  onUpdateStatus(
                                    cmd.id,
                                    i,
                                    e.target.value as StatutVetement
                                  )
                                }
                                className={`status-select status-${v.statut.replace(" ", "-")}`}
                              >
                                <option value="en attente">En attente</option>
                                <option value="en lavage">En lavage</option>
                                <option value="lavé">Lavé ✓</option>
                              </select>
                            </div>
                          ))}
                        </div>

                        {/* Barre d'état globale */}
                        <div className={`commande-status-bar ${done ? "done" : "pending"}`}>
                          {done
                            ? "✓ Tous les vêtements sont lavés"
                            : "◷ Lavage en cours..."}
                        </div>

                        {/* Bouton WhatsApp — visible uniquement quand tout est lavé */}
                        {done && (
                          <button
                            className="btn-whatsapp"
                            onClick={() => envoyerWhatsApp(client, cmd)}
                          >
                            <span>💬</span>
                            Notifier le client sur WhatsApp
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
