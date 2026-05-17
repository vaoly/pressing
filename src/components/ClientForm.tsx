import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import type { Client } from "../types";
import type { ClientFormData } from "../types";
import { clientSchema } from "../utils/validation";

interface Props {
  onSubmit: (data: Omit<Client, "id">) => void;
  initial:  Client | null;
  onCancel: () => void;
}

export default function ClientForm({ onSubmit, initial, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: yupResolver(clientSchema),
    defaultValues: { nom: "", adresse: "", telephone: "" },
  });

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (initial) {
      reset({ nom: initial.nom, adresse: initial.adresse, telephone: initial.telephone });
    } else {
      reset({ nom: "", adresse: "", telephone: "" });
    }
  }, [initial, reset]);

  const onValid = (data: ClientFormData): void => {
    onSubmit(data);
  };

  return (
    <div className="form-page">
      <div className="page-header">
        <h1>{initial ? "Modifier le client" : "Nouveau client"}</h1>
        <p>Renseignez les informations du client</p>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit(onValid)} noValidate>

          {/* Nom */}
          <div className="form-group">
            <label htmlFor="nom">Nom complet</label>
            <input
              id="nom"
              type="text"
              
              className={errors.nom ? "error" : ""}
              {...register("nom")}
            />
            {errors.nom && (
              <span className="error-msg">{errors.nom.message}</span>
            )}
          </div>

          {/* Adresse */}
          <div className="form-group">
            <label htmlFor="adresse">Adresse</label>
            <input
              id="adresse"
              type="text"
              
              className={errors.adresse ? "error" : ""}
              {...register("adresse")}
            />
            {errors.adresse && (
              <span className="error-msg">{errors.adresse.message}</span>
            )}
          </div>

          {/* Téléphone */}
          <div className="form-group">
            <label htmlFor="telephone">Numéro de téléphone (9 chiffres)</label>
            <input
              id="telephone"
              type="tel"
              
              maxLength={9}
              className={errors.telephone ? "error" : ""}
              {...register("telephone")}
            />
            {errors.telephone && (
              <span className="error-msg">{errors.telephone.message}</span>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {initial ? "Enregistrer" : "Ajouter le client"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
