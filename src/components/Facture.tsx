import { useRef } from "react";
import type { Commande, Client } from "../types";
import { formatDate, formatPrix, CLASSES } from "../utils/pricing";

interface Props {
  commande: Commande;
  client:   Client | null;
  onBack:   () => void;
}

export default function Facture({ commande, client, onBack }: Props) {
  const factureRef = useRef<HTMLDivElement>(null);

  const handlePrint = (): void => {
    const content = factureRef.current?.innerHTML ?? "";
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head>
        <meta charset="UTF-8"/>
        <title>Facture Pressing Élite</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:Georgia,serif;color:#1a1a1a;padding:40px}
          .facture-wrapper{max-width:700px;margin:0 auto}
          .fact-header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #8b6f47;padding-bottom:20px;margin-bottom:30px}
          .fact-logo{font-size:28px;font-weight:bold;letter-spacing:3px;color:#8b6f47}
          .fact-logo small{display:block;font-size:12px;letter-spacing:6px;color:#999;font-weight:normal}
          .fact-num{text-align:right}
          .fact-num h2{font-size:14px;color:#999;letter-spacing:2px}
          .fact-num p{font-size:22px;font-weight:bold}
          .fact-parties{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-bottom:30px}
          .fact-party h4{font-size:11px;letter-spacing:2px;color:#8b6f47;text-transform:uppercase;margin-bottom:8px}
          .fact-party p{font-size:14px;line-height:1.8}
          .classe-badge-print{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;color:#fff;margin-bottom:10px}
          .fact-dates{display:grid;grid-template-columns:1fr 1fr;gap:20px;background:#f9f6f0;padding:20px;border-radius:8px;margin-bottom:30px}
          .fact-date-item span{font-size:11px;letter-spacing:1px;color:#999;text-transform:uppercase}
          .fact-date-item p{font-size:14px;font-weight:bold;margin-top:4px}
          table{width:100%;border-collapse:collapse;margin-bottom:20px}
          th{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8b6f47;border-bottom:1px solid #e0d5c5;padding:10px 8px;text-align:left}
          td{padding:12px 8px;border-bottom:1px solid #f0ebe0;font-size:14px}
          .fact-total-section{border-top:2px solid #8b6f47;padding-top:15px;text-align:right}
          .fact-total-row{display:flex;justify-content:space-between;padding:5px 0;font-size:14px}
          .fact-total-final{display:flex;justify-content:space-between;padding:10px 0 0;font-size:20px;font-weight:bold;color:#8b6f47}
          .fact-footer{margin-top:50px;text-align:center;font-size:12px;color:#aaa;border-top:1px solid #e0d5c5;padding-top:20px}
          .vet-img{width:50px;height:50px;object-fit:cover;border-radius:4px}
        </style>
      </head><body>
        <div class="facture-wrapper">${content}</div>
        <script>window.onload=()=>{window.print();window.close()}<\/script>
      </body></html>
    `);
    win.document.close();
  };

  if (!client) {
    return (
      <div className="form-page">
        <p>Client introuvable.</p>
        <button className="btn-secondary" onClick={onBack}>← Retour</button>
      </div>
    );
  }

  const classeInfo        = CLASSES[commande.classe];
  const baseTotal         = commande.vetements.reduce(
    (s, v) => s + v.prix * v.quantite, 0
  );
  const majorationMontant = commande.total - baseTotal;

  return (
    <div className="form-page">
      <div className="page-header">
        <h1>Facture</h1>
        <div className="facture-toolbar">
          <button className="btn-secondary" onClick={onBack}>← Retour</button>
          <button className="btn-primary" onClick={handlePrint}>⬇ Télécharger PDF</button>
        </div>
      </div>

      <div className="facture-wrapper" ref={factureRef}>
        <div className="fact-header">
          <div className="fact-logo">PRESSING<br /><small>ÉLITE</small></div>
          <div className="fact-num">
            <h2>FACTURE N°</h2>
            <p>#{commande.id.slice(-6).toUpperCase()}</p>
          </div>
        </div>

        <div className="fact-parties">
          <div className="fact-party">
            <h4>Pressing</h4>
            <p><strong>Pressing Élite</strong><br />Service de nettoyage professionnel</p>
          </div>
          <div className="fact-party">
            <h4>Client</h4>
            <p>
              <strong>{client.nom}</strong><br />
              {client.adresse}<br />
              Tél : {client.telephone}
            </p>
          </div>
        </div>

        <div
          className="classe-badge-print"
          style={{ background: classeInfo.color }}
        >
          Classe {classeInfo.label} — Délai :{" "}
          {classeInfo.delai === 1 ? "lendemain" : `${classeInfo.delai} jours`}
        </div>

        <div className="fact-dates">
          <div className="fact-date-item">
            <span>Date de dépôt</span>
            <p>{formatDate(commande.dateDepot)}</p>
          </div>
          <div className="fact-date-item">
            <span>Date de retrait prévue</span>
            <p>{formatDate(commande.dateRetrait)}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Photo</th>
              <th>Article</th>
              <th>Prix unitaire</th>
              <th>Qté</th>
              <th>Sous-total</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {commande.vetements.map((v, i) => (
              <tr key={i}>
                <td>
                  {v.image ? (
                    <img src={v.image} alt={v.nom} className="vet-img" />
                  ) : (
                    <span style={{ fontSize: "24px" }}>{v.emoji}</span>
                  )}
                </td>
                <td>{v.nom}</td>
                <td>{formatPrix(v.prix)}</td>
                <td>{v.quantite}</td>
                <td>{formatPrix(v.prix * v.quantite)}</td>
                <td>
                  <span className={`status-badge status-${v.statut.replace(" ", "-")}`}>
                    {v.statut}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="fact-total-section">
          <div className="fact-total-row">
            <span>Sous-total</span>
            <span>{formatPrix(baseTotal)}</span>
          </div>
          {majorationMontant > 0 && (
            <div className="fact-total-row">
              <span>
                Majoration {classeInfo.label} (+{classeInfo.majoration * 100}%)
              </span>
              <span>+{formatPrix(majorationMontant)}</span>
            </div>
          )}
          <div className="fact-total-final">
            <span>TOTAL</span>
            <span>{formatPrix(commande.total)}</span>
          </div>
        </div>

        <div className="fact-footer">
          Merci de votre confiance — Pressing Élite • Service haut de gamme
        </div>
      </div>
    </div>
  );
}
