import * as yup from "yup";
import type { ClientFormData } from "../types";


export const clientSchema: yup.ObjectSchema<ClientFormData> = yup.object({
  nom: yup
    .string()
    .required("Le nom est obligatoire")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .defined(),

  adresse: yup
    .string()
    .required("L'adresse est obligatoire")
    .min(5, "L'adresse doit contenir au moins 5 caractères")
    .defined(),

  telephone: yup
    .string()
    .required("Le numéro de téléphone est obligatoire")
    .matches(/^\d{9}$/, "Le numéro doit contenir exactement 9 chiffres")
    .defined(),
});
