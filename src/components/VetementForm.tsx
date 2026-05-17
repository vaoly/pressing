import { useState, useRef } from "react";
import type { Client, Commande, Classe, ArticleSelectionne } from "../types";
import {
  VETEMENTS, CLASSES, calculerPrix, dateRetrait, formatPrix,
} from "../utils/pricing";

interface Props {
  client:   Client;
  onSubmit: (commande: Omit<Commande, "id">) => void;
  onCancel: () => void;
}

export default function VetementForm({ client, onSubmit, onCancel }: Props) {
  const [classe, setClasse] = useState<Classe>("standard");
  const [selection, setSelection] = useState<ArticleSelectionne[]>(
    VETEMENTS.map((v) => ({ ...v, quantite: 0, image: null, imagePreview: null }))
  );
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const updateQty = (i: number, delta: number): void => {
    setSelection((prev) =>
      prev.map((v, idx) =>
        idx === i ? { ...v, quantite: Math.max(0, v.quantite + delta) } : v
      )
    );
  };

  const handleImage = (i: number, file: File): void => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== "string") return;
      setSelection((prev) =>
        prev.map((v, idx) =>
          idx === i ? { ...v, image: result, imagePreview: result } : v
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const vetementsSel = selection.filter((v) => v.quantite > 0);
  const total        = calculerPrix(vetementsSel, classe);
  const dateDepot    = new Date();
  const dateRet      = dateRetrait(dateDepot, classe);

  const handleSubmit = (): void => {
    if (vetementsSel.length === 0) {
      alert("Veuillez sélectionner au moins un vêtement.");
      return;
    }
    onSubmit({
      clientId:    client.id,
      classe,
      dateDepot:   dateDepot.toISOString(),
      dateRetrait: dateRet.toISOString(),
      vetements:   vetementsSel.map((v) => ({
        nom:      v.nom,
        emoji:    v.emoji,
        prix:     v.prix,
        quantite: v.quantite,
        image:    v.image,
        statut:   "en attente",
      })),
      total,
    });
  };

  return (
    <div className="form-page">
      <div className="page-header">
        <h1>Nouvelle commande</h1>
        <p>Client : <strong>{client.nom}</strong></p>
      </div>

      <div className="form-card">
        {/* Classe de service */}
        <div className="form-group">
          <label>Classe de service</label>
          <div className="classe-selector">
            {(Object.entries(CLASSES) as [Classe, typeof CLASSES[Classe]][]).map(
              ([key, val]) => (
                <button
                  key={key}
                  type="button"
                  className={`classe-btn ${classe === key ? "active" : ""}`}
                  style={classe === key ? { background: val.color, color: "#fff" } : {}}
                  onClick={() => setClasse(key)}
                >
                  <strong>{val.label}</strong>
                  <small>
                    {val.delai === 1 ? "Lendemain" : `${val.delai} jours`}
                    {val.majoration > 0 ? ` • +${val.majoration * 100}%` : ""}
                  </small>
                </button>
              )
            )}
          </div>
        </div>

        {/* Sélection des vêtements */}
        <div className="form-group">
          <label>Sélection des vêtements</label>
          <div className="vetements-grid">
            {selection.map((v, i) => (
              <div
                key={v.nom}
                className={`vet-item ${v.quantite > 0 ? "selected" : ""}`}
              >
                <div className="vet-top">
                  <span className="vet-emoji-big">{v.emoji}</span>
                  <div className="vet-details">
                    <span className="vet-name">{v.nom}</span>
                    <span className="vet-price">{formatPrix(v.prix)}</span>
                  </div>
                </div>

                <div className="vet-qty-control">
                  <button
                    type="button"
                    onClick={() => updateQty(i, -1)}
                    disabled={v.quantite === 0}
                  >−</button>
                  <span>{v.quantite}</span>
                  <button type="button" onClick={() => updateQty(i, 1)}>+</button>
                </div>

                {v.quantite > 0 && (
                  <div className="vet-image-upload">
                    <input
                      type="file"
                      accept="image/*"
                      ref={(el) => { fileRefs.current[i] = el; }}
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImage(i, file);
                      }}
                    />
                    {v.imagePreview ? (
                      <img
                        src={v.imagePreview}
                        alt="aperçu"
                        className="vet-preview"
                        onClick={() => fileRefs.current[i]?.click()}
                      />
                    ) : (
                      <button
                        type="button"
                        className="btn-upload"
                        onClick={() => fileRefs.current[i]?.click()}
                      >
                        📷 Photo
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Récapitulatif */}
        {vetementsSel.length > 0 && (
          <div className="recap-box">
            <div className="recap-row">
              <span>Date de dépôt</span>
              <strong>{dateDepot.toLocaleDateString("fr-FR")}</strong>
            </div>
            <div className="recap-row">
              <span>Date de retrait ({CLASSES[classe].label})</span>
              <strong>{dateRet.toLocaleDateString("fr-FR")}</strong>
            </div>
            <div className="recap-row total">
              <span>Total à payer</span>
              <strong>{formatPrix(total)}</strong>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Annuler
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit}>
            Créer la commande
          </button>
        </div>
      </div>
    </div>
  );
}
