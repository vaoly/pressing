import type { DB, Commande, Client, VetementCommande } from "../types";

const DB_KEY = "pressing_index_db";

// ── localStorage ─────────────────────────────────────────────────────────────

export function loadDB(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return { clients: [], commandes: [] };
    return JSON.parse(raw) as DB;
  } catch {
    return { clients: [], commandes: [] };
  }
}

export function saveDB(db: DB): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  writeIndexDB(db).catch(() => {});
}

// ── Génération du contenu index.db ───────────────────────────────────────────

function buildIndexDBContent(db: DB): string {
  const now = new Date().toLocaleString("fr-FR");
  const lines: string[] = [];

  lines.push("# PRESSING ÉLITE — index.db");
  lines.push(`# Dernière mise à jour : ${now}`);
  lines.push(`# Clients : ${db.clients.length} | Commandes : ${db.commandes.length}`);
  lines.push("");
  lines.push("═══════════════════════════════════════════════════════════════");
  lines.push("  ÉTAT DES VÊTEMENTS PAR COMMANDE");
  lines.push("═══════════════════════════════════════════════════════════════");

  if (db.commandes.length === 0) {
    lines.push("");
    lines.push("  (aucune commande enregistrée)");
  }

  for (const cmd of db.commandes) {
    const client: Client | undefined = db.clients.find((c) => c.id === cmd.clientId);
    const nomClient  = client ? client.nom       : "Client supprimé";
    const telephone  = client ? client.telephone : "—";
    const dateDepot  = new Date(cmd.dateDepot).toLocaleDateString("fr-FR");
    const dateRetrait = new Date(cmd.dateRetrait).toLocaleDateString("fr-FR");

    const totalLaves = cmd.vetements.filter((v) => v.statut === "lavé").length;
    const totalVets  = cmd.vetements.length;
    const cmdDone    = totalLaves === totalVets && totalVets > 0;

    lines.push("");
    lines.push(`┌─ COMMANDE #${cmd.id.slice(-6).toUpperCase()}`);
    lines.push(`│  Client    : ${nomClient} (${telephone})`);
    lines.push(`│  Classe    : ${cmd.classe.toUpperCase()}`);
    lines.push(`│  Dépôt     : ${dateDepot}`);
    lines.push(`│  Retrait   : ${dateRetrait}`);
    lines.push(`│  Total     : ${cmd.total.toLocaleString("fr-FR")} FCFA`);
    lines.push(`│  Avancement: ${totalLaves}/${totalVets} vêtement(s) lavé(s)${cmdDone ? " ✓ TERMINÉ" : ""}`);
    lines.push("│");
    lines.push("│  VÊTEMENTS :");

    if (cmd.vetements.length === 0) {
      lines.push("│    (aucun vêtement)");
    } else {
      for (const v of cmd.vetements) {
        const icon =
          v.statut === "lavé"       ? "laver" :
          v.statut === "en lavage"  ? "en cours" : "○";
        lines.push(
          `│    ${icon} ${v.nom.padEnd(12)} ×${v.quantite}  [${v.statut.toUpperCase()}]`
        );
      }
    }

    lines.push("└──────────────────────────────────────────────────────────");
  }

  lines.push("");
  lines.push("═══════════════════════════════════════════════════════════════");
  lines.push("  RÉCAPITULATIF");
  lines.push("═══════════════════════════════════════════════════════════════");

  const enCours  = db.commandes.filter(
    (c) => !c.vetements.every((v) => v.statut === "lavé")
  ).length;
  const terminees = db.commandes.length - enCours;
  const revenu    = db.commandes.reduce((s, c) => s + c.total, 0);

  lines.push(`  Commandes en cours  : ${enCours}`);
  lines.push(`  Commandes terminées : ${terminees}`);
  lines.push(`  Revenu total        : ${revenu.toLocaleString("fr-FR")} FCFA`);
  lines.push("");

  return lines.join("\n");
}

// ── OPFS auto-sync ───────────────────────────────────────────────────────────

async function writeIndexDB(db: DB): Promise<void> {
  if (!navigator.storage?.getDirectory) return;
  const root        = await navigator.storage.getDirectory();
  const fileHandle  = await root.getFileHandle("index.db", { create: true });
  const writable    = await fileHandle.createWritable();
  await writable.write(buildIndexDBContent(db));
  await writable.close();
}

// ── Export manuel ────────────────────────────────────────────────────────────

export function exportIndexDB(db: DB): void {
  const content = buildIndexDBContent(db);
  const blob    = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement("a");
  a.href        = url;
  a.download    = "index.db";
  a.click();
  URL.revokeObjectURL(url);
}
