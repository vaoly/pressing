import type { DB } from "../types";
import { formatPrix, formatDateShort, CLASSES } from "../utils/pricing";

interface Props {
  db: DB;
}

export default function Dashboard({ db }: Props) {
  const { clients, commandes } = db;

  const totalRevenu = commandes.reduce((s, c) => s + c.total, 0);
  const enCours     = commandes.filter(
    (c) => !c.vetements.every((v) => v.statut === "lavé")
  ).length;
  const terminees   = commandes.length - enCours;

  const stats = [
    { label: "Clients",           value: String(clients.length),    icon: "◉", color: "#d4a853" },
    { label: "Commandes totales", value: String(commandes.length),  icon: "⬡", color: "#8b6f47" },
    { label: "En cours",          value: String(enCours),           icon: "◷", color: "#c0392b" },
    { label: "Terminées",         value: String(terminees),         icon: "✓", color: "#27ae60" },
    { label: "Revenu total",      value: formatPrix(totalRevenu),   icon: "◈", color: "#2c3e50", wide: true },
  ] as const;

  const recentes = [...commandes]
    .sort((a, b) => new Date(b.dateDepot).getTime() - new Date(a.dateDepot).getTime())
    .slice(0, 5);

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Tableau de bord</h1>
        <p>Vue d'ensemble de votre pressing</p>
      </div>

      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} className={`stat-card ${"wide" in s && s.wide ? "wide" : ""}`}>
            <div className="stat-icon" style={{ color: s.color }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {recentes.length > 0 && (
        <div className="recent-section">
          <h2>Commandes récentes</h2>
          <div className="recent-list">
            {recentes.map((cmd) => {
              const client = db.clients.find((c) => c.id === cmd.clientId);
              const done   = cmd.vetements.every((v) => v.statut === "lavé");
              return (
                <div key={cmd.id} className="recent-item">
                  <div className="recent-info">
                    <strong>{client?.nom ?? "Client supprimé"}</strong>
                    <span>
                      {cmd.vetements.length} vêtement(s) —{" "}
                      {CLASSES[cmd.classe].label}
                    </span>
                  </div>
                  <div className="recent-right">
                    <span className={`badge ${done ? "badge-done" : "badge-pending"}`}>
                      {done ? "Terminé" : "En cours"}
                    </span>
                    <span className="recent-prix">{formatPrix(cmd.total)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {commandes.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">◈</div>
          <p>Aucune commande pour le moment.<br />Ajoutez un client pour commencer.</p>
        </div>
      )}
    </div>
  );
}
