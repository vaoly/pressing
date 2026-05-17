import type { Client, Commande } from "../types";


const INDICATIF_PAYS = "237";


export function envoyerWhatsApp(client: Client, commande: Commande): void {
  const numero = INDICATIF_PAYS + client.telephone;

  const listeVetements = commande.vetements
    .map((v) => `   • ${v.quantite} ${v.nom}`)
    .join("\n");

  const dateRetrait = new Date(commande.dateRetrait).toLocaleDateString("fr-FR");

  const message =
    `Bonjour ${client.nom} 👋\n\n` +
    `✅ Vos vêtements sont prêts à être récupérés au pressing !\n\n` +
    ` *Détail de votre commande :*\n${listeVetements}\n\n` +
    ` Date de retrait prévue : *${dateRetrait}*\n` +
    ` Montant total : *${commande.total.toLocaleString("fr-FR")} FCFA*\n\n` +
    `Merci de votre confiance — *Pressing Élite* 🌟`;

  const url = `https://wa.me/${numero}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}
